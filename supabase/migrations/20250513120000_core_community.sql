-- Core community schema + RLS + resident registration RPC
-- Apply after 20250512120000_profiles.sql

-- ---- Helper: current user's role from profiles --------------------------------
create or replace function public.profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

grant execute on function public.profile_role() to authenticated;

-- ---- Blocks -------------------------------------------------------------------
create table if not exists public.blocks (
  id text primary key,
  name text not null,
  total_flats integer not null default 0
);

alter table public.blocks enable row level security;

drop policy if exists "blocks_select_public" on public.blocks;
create policy "blocks_select_public"
  on public.blocks for select
  using (true);

-- ---- Flats --------------------------------------------------------------------
create table if not exists public.flats (
  id text primary key,
  block_id text not null references public.blocks (id) on delete restrict,
  flat_number text not null,
  floor integer,
  sqft integer,
  type text,
  status text not null default 'vacant'
);

create index if not exists flats_block_id_idx on public.flats (block_id);
create index if not exists flats_status_idx on public.flats (status);

alter table public.flats enable row level security;

drop policy if exists "flats_select_public" on public.flats;
create policy "flats_select_public"
  on public.flats for select
  using (true);

drop policy if exists "flats_update_admin" on public.flats;
create policy "flats_update_admin"
  on public.flats for update
  using (public.profile_role() = 'admin')
  with check (public.profile_role() = 'admin');

-- ---- Residents ---------------------------------------------------------------
create table if not exists public.residents (
  id text primary key,
  flat_id text not null references public.flats (id) on delete restrict,
  name text not null,
  email text,
  phone text,
  family_count integer not null default 1,
  status text not null default 'active',
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists residents_flat_id_idx on public.residents (flat_id);
create index if not exists residents_user_id_idx on public.residents (user_id);

alter table public.residents enable row level security;

drop policy if exists "residents_select" on public.residents;
create policy "residents_select"
  on public.residents for select
  using (
    user_id = auth.uid()
    or public.profile_role() = 'admin'
    or public.profile_role() = 'security'
  );

drop policy if exists "residents_insert_admin" on public.residents;
create policy "residents_insert_admin"
  on public.residents for insert
  with check (public.profile_role() = 'admin');

drop policy if exists "residents_update_admin" on public.residents;
create policy "residents_update_admin"
  on public.residents for update
  using (public.profile_role() = 'admin');

-- ---- Profiles: link to flat ---------------------------------------------------
alter table public.profiles
  add column if not exists flat_id text references public.flats (id);

-- ---- Complaints ---------------------------------------------------------------
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  resident_id text references public.residents (id) on delete set null,
  title text not null,
  body text,
  status text not null default 'open',
  flat_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_resident_idx on public.complaints (resident_id);
create index if not exists complaints_status_idx on public.complaints (status);

alter table public.complaints enable row level security;

drop policy if exists "complaints_select" on public.complaints;
create policy "complaints_select"
  on public.complaints for select
  using (
    public.profile_role() = 'admin'
    or public.profile_role() = 'security'
    or exists (
      select 1 from public.residents r
      where r.id = complaints.resident_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "complaints_insert" on public.complaints;
create policy "complaints_insert"
  on public.complaints for insert
  with check (
    public.profile_role() = 'admin'
    or exists (
      select 1 from public.residents r
      where r.id = complaints.resident_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "complaints_update" on public.complaints;
create policy "complaints_update"
  on public.complaints for update
  using (
    public.profile_role() = 'admin'
    or exists (
      select 1 from public.residents r
      where r.id = complaints.resident_id and r.user_id = auth.uid()
    )
  );

-- ---- Bills --------------------------------------------------------------------
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  resident_id text not null references public.residents (id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null,
  status text not null default 'unpaid',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bills_resident_idx on public.bills (resident_id);

alter table public.bills enable row level security;

drop policy if exists "bills_select" on public.bills;
create policy "bills_select"
  on public.bills for select
  using (
    public.profile_role() = 'admin'
    or exists (
      select 1 from public.residents r
      where r.id = bills.resident_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "bills_insert_admin" on public.bills;
create policy "bills_insert_admin"
  on public.bills for insert
  with check (public.profile_role() = 'admin');

drop policy if exists "bills_update" on public.bills;
create policy "bills_update"
  on public.bills for update
  using (
    public.profile_role() = 'admin'
    or exists (
      select 1 from public.residents r
      where r.id = bills.resident_id and r.user_id = auth.uid()
    )
  );

-- ---- Visitors / gate log ------------------------------------------------------
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  flat_number text,
  host_name text,
  purpose text not null default 'Guest',
  vehicle text,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists visitors_check_out_idx on public.visitors (check_out);

alter table public.visitors enable row level security;

drop policy if exists "visitors_select" on public.visitors;
create policy "visitors_select"
  on public.visitors for select
  using (
    public.profile_role() = 'admin'
    or public.profile_role() = 'security'
  );

drop policy if exists "visitors_insert" on public.visitors;
create policy "visitors_insert"
  on public.visitors for insert
  with check (
    public.profile_role() = 'admin'
    or public.profile_role() = 'security'
  );

drop policy if exists "visitors_update" on public.visitors;
create policy "visitors_update"
  on public.visitors for update
  using (
    public.profile_role() = 'admin'
    or public.profile_role() = 'security'
  );

-- ---- Notices ------------------------------------------------------------------
create table if not exists public.notices (
  id text primary key,
  title text not null,
  body text,
  target_block text not null default 'all',
  tag text,
  pinned boolean not null default false,
  published_at timestamptz not null default now()
);

alter table public.notices enable row level security;

drop policy if exists "notices_select" on public.notices;
create policy "notices_select"
  on public.notices for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists "notices_insert_admin" on public.notices;
create policy "notices_insert_admin"
  on public.notices for insert
  with check (public.profile_role() = 'admin');

drop policy if exists "notices_update_admin" on public.notices;
create policy "notices_update_admin"
  on public.notices for update
  using (public.profile_role() = 'admin');

drop policy if exists "notices_delete_admin" on public.notices;
create policy "notices_delete_admin"
  on public.notices for delete
  using (public.profile_role() = 'admin');

-- ---- Parking slots ------------------------------------------------------------
create table if not exists public.parking_slots (
  id text primary key,
  slot_number text not null,
  level text,
  zone text,
  type text,
  status text not null default 'free',
  flat_id text references public.flats (id) on delete set null
);

alter table public.parking_slots enable row level security;

drop policy if exists "parking_select" on public.parking_slots;
create policy "parking_select"
  on public.parking_slots for select
  using (
    public.profile_role() in ('admin', 'security')
    or exists (
      select 1
      from public.residents r
      where r.user_id = auth.uid()
        and r.flat_id = parking_slots.flat_id
    )
  );

drop policy if exists "parking_write_admin" on public.parking_slots;
create policy "parking_write_admin"
  on public.parking_slots for all
  using (public.profile_role() = 'admin')
  with check (public.profile_role() = 'admin');

-- ---- Maintenance assets (for admin maintenance page) -------------------------
create table if not exists public.maintenance_assets (
  id serial primary key,
  name text not null,
  category text not null,
  location text not null,
  last_service_on date,
  next_service_on date,
  health_score integer not null default 80,
  status text not null default 'Healthy'
);

alter table public.maintenance_assets enable row level security;

drop policy if exists "maintenance_select" on public.maintenance_assets;
create policy "maintenance_select"
  on public.maintenance_assets for select
  using (public.profile_role() = 'admin');

drop policy if exists "maintenance_write_admin" on public.maintenance_assets;
create policy "maintenance_write_admin"
  on public.maintenance_assets for all
  using (public.profile_role() = 'admin')
  with check (public.profile_role() = 'admin');

-- ---- Resident self-registration (post signUp with session) --------------------
create or replace function public.register_resident(
  p_flat_id text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_family_count integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_res_id text;
  f record;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.residents where user_id = v_uid) then
    raise exception 'Resident profile already exists';
  end if;

  select * into strict f from public.flats where id = p_flat_id for update;
  if f.status is distinct from 'vacant' then
    raise exception 'Flat is not available';
  end if;

  v_res_id := 'res-' || replace(gen_random_uuid()::text, '-', '');

  insert into public.residents (id, flat_id, name, email, phone, family_count, status, user_id)
  values (v_res_id, p_flat_id, p_full_name, p_email, p_phone, greatest(1, coalesce(p_family_count, 1)), 'active', v_uid);

  update public.flats
  set status = 'occupied'
  where id = p_flat_id;

  update public.profiles
  set
    full_name = p_full_name,
    phone = p_phone,
    family_count = greatest(1, coalesce(p_family_count, 1)),
    block_id = f.block_id,
    flat_number = f.flat_number,
    flat_id = p_flat_id,
    updated_at = now()
  where id = v_uid;

  return jsonb_build_object('resident_id', v_res_id, 'flat_id', p_flat_id);
end;
$$;

grant execute on function public.register_resident(text, text, text, text, integer) to authenticated;
