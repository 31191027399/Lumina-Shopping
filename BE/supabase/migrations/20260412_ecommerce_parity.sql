alter table if exists public.products
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists inventory_count integer not null default 25,
  add column if not exists is_featured boolean not null default false,
  add column if not exists gallery jsonb not null default '[]'::jsonb;

alter table if exists public.orders
  add column if not exists shipping_recipient text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_address_line1 text,
  add column if not exists shipping_address_line2 text,
  add column if not exists shipping_city text,
  add column if not exists shipping_state text,
  add column if not exists shipping_postal_code text;

update public.products
set
  slug = coalesce(nullif(slug, ''), regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
  short_description = coalesce(nullif(short_description, ''), left(description, 96)),
  inventory_count = coalesce(inventory_count, 25),
  is_featured = coalesce(is_featured, false),
  gallery = case
    when jsonb_typeof(gallery) = 'array' then gallery
    else jsonb_build_array(image)
  end;

create unique index if not exists products_slug_key on public.products(slug);
