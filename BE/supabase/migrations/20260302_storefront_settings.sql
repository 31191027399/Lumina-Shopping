create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.set_updated_at_app_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at_app_settings();

insert into public.app_settings (key, value)
values ('homepage_top_categories_limit', '{"count":3}'::jsonb)
on conflict (key) do nothing;
