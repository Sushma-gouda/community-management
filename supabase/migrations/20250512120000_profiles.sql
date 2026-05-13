-- Profiles linked to auth.users; role drives dashboard routing.
-- Run in Supabase SQL Editor or via supabase db push.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'resident', 'security')),
  full_name text,
  phone text,
  block_id text,
  flat_number text,
  family_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
  fam int;
begin
  r := coalesce(nullif(trim(new.raw_user_meta_data ->> 'role'), ''), 'resident');
  if r not in ('admin', 'resident', 'security') then
    r := 'resident';
  end if;

  begin
    fam := (nullif(trim(new.raw_user_meta_data ->> 'family_count'), ''))::integer;
  exception
    when others then
      fam := null;
  end;

  insert into public.profiles (id, role, full_name, phone, block_id, flat_number, family_count)
  values (
    new.id,
    r,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'block_id'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'flat_number'), ''),
    fam
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    block_id = coalesce(excluded.block_id, public.profiles.block_id),
    flat_number = coalesce(excluded.flat_number, public.profiles.flat_number),
    family_count = coalesce(excluded.family_count, public.profiles.family_count),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
