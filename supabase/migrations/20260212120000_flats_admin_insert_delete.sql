-- Admin can create and remove flats; optional denormalized owner label for admin UI

alter table public.flats
  add column if not exists owner_name text;

alter table public.flats
  add column if not exists created_at timestamptz not null default now();

drop policy if exists "flats_insert_admin" on public.flats;
create policy "flats_insert_admin"
  on public.flats for insert
  with check (public.profile_role() = 'admin');

drop policy if exists "flats_delete_admin" on public.flats;
create policy "flats_delete_admin"
  on public.flats for delete
  using (public.profile_role() = 'admin');
