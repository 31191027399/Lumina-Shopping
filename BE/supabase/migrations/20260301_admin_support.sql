-- Admin support: roles/status and order lifecycle normalization

alter table public.profiles
  add column if not exists role text not null default 'Customer',
  add column if not exists status text not null default 'Active';

alter table public.orders
  alter column status set default 'Processing';

update public.orders
set status = case
  when status = 'PLACED' then 'Processing'
  else status
end;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    case when position('admin' in lower(new.email)) > 0 then 'Admin' else 'Customer' end,
    'Active'
  )
  on conflict (id) do update
  set name = excluded.name,
      email = excluded.email,
      role = excluded.role,
      status = excluded.status;
  return new;
end;
$$;
