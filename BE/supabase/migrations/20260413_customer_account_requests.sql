-- Customer account profile fields and order update request workflow

alter table public.profiles
  add column if not exists phone text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists address_city text,
  add column if not exists address_state text,
  add column if not exists address_postal_code text;

create table if not exists public.order_update_requests (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_changes jsonb not null default '{}'::jsonb,
  reason text,
  status text not null default 'Pending',
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists order_update_requests_one_pending_per_order
  on public.order_update_requests(order_id, user_id)
  where status = 'Pending';

create index if not exists order_update_requests_user_id_idx
  on public.order_update_requests(user_id, created_at desc);

create index if not exists order_update_requests_order_id_idx
  on public.order_update_requests(order_id, created_at desc);

alter table public.order_update_requests enable row level security;

drop policy if exists "Users can view own order update requests" on public.order_update_requests;
create policy "Users can view own order update requests"
on public.order_update_requests
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own order update requests" on public.order_update_requests;
create policy "Users can create own order update requests"
on public.order_update_requests
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own order update requests" on public.order_update_requests;
create policy "Users can update own order update requests"
on public.order_update_requests
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
