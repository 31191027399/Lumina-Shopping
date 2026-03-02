-- Lumina schema for Supabase Postgres
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image text not null,
  rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
  reviews int not null default 0 check (reviews >= 0),
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  shipping_address text,
  payment_method text,
  status text not null default 'PLACED',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  product_name text not null,
  product_category text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  total_price numeric(10,2) not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
  set name = excluded.name,
      email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products are public readable
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
on public.products
for select
using (true);

-- Profile ownership
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Cart ownership
drop policy if exists "Users manage own cart" on public.cart_items;
create policy "Users manage own cart"
on public.cart_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Order ownership
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders"
on public.orders
for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders"
on public.orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users view own order items" on public.order_items;
create policy "Users view own order items"
on public.order_items
for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_shipping_address text default null,
  p_payment_method text default 'card'
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(10,2);
  v_shipping numeric(10,2);
  v_total numeric(10,2);
  v_order public.orders;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  select coalesce(sum(p.price * c.quantity), 0)::numeric(10,2)
  into v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = p_user_id;

  if v_subtotal = 0 then
    raise exception 'Cart is empty';
  end if;

  v_shipping := case when v_subtotal > 150 then 0 else 15 end;
  v_total := v_subtotal + v_shipping;

  insert into public.orders (user_id, subtotal, shipping, total, shipping_address, payment_method)
  values (p_user_id, v_subtotal, v_shipping, v_total, p_shipping_address, p_payment_method)
  returning * into v_order;

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    product_category,
    unit_price,
    quantity,
    total_price
  )
  select
    v_order.id,
    p.id,
    p.name,
    p.category,
    p.price,
    c.quantity,
    (p.price * c.quantity)::numeric(10,2)
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = p_user_id;

  delete from public.cart_items where user_id = p_user_id;

  return v_order;
end;
$$;

grant execute on function public.create_order_from_cart(uuid, text, text) to authenticated;

insert into public.products (id, name, price, category, image, rating, reviews, description)
values
  (1, 'Premium Wireless Headphones', 299.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 4.8, 124, 'Experience studio-quality sound with our flagship wireless headphones featuring active noise cancellation.'),
  (2, 'Minimalist Leather Watch', 149.00, 'Accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 4.6, 89, 'A timeless design that complements any outfit. Crafted with genuine Italian leather.'),
  (3, 'Smart Fitness Tracker', 89.99, 'Electronics', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', 4.5, 210, 'Track your steps, heart rate, and sleep quality with 24/7 precision.'),
  (4, 'Eco-Friendly Yoga Mat', 55.00, 'Fitness', 'https://images.unsplash.com/photo-1592432676556-28453d078add?w=800&q=80', 4.9, 56, 'Non-slip surface made from sustainable natural rubber for the perfect flow.'),
  (5, 'Ceramic Coffee Set', 45.00, 'Home', 'https://images.unsplash.com/photo-1517254456976-ee8682099819?w=800&q=80', 4.7, 42, 'Hand-crafted ceramic set including two mugs and a matching pour-over dripper.'),
  (6, 'Canvas Weekend Bag', 120.00, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 4.4, 33, 'Durable water-resistant canvas with leather accents. Perfect for short getaways.'),
  (7, 'Mechanical Gaming Keyboard', 175.00, 'Electronics', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80', 4.8, 156, 'Tactile switches and customizable RGB lighting for the ultimate gaming experience.'),
  (8, 'Organic Cotton Hoodie', 65.00, 'Apparel', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', 4.6, 92, 'Ultra-soft sustainable cotton blend. Designed for comfort and durability.')
on conflict (id) do update
set
  name = excluded.name,
  price = excluded.price,
  category = excluded.category,
  image = excluded.image,
  rating = excluded.rating,
  reviews = excluded.reviews,
  description = excluded.description;
