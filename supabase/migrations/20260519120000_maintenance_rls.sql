-- =====================================================================
-- 1. Create maintenance table (if not exists)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.maintenance (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asset_name text NOT NULL,
  location text NULL,
  last_service_date date NULL,
  next_due_date date NULL,
  cost numeric NULL,
  vendor_name text NULL,
  vendor_contact text NULL,
  status text NULL,
  CONSTRAINT maintenance_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- =====================================================================
-- 2. Ensure Row Level Security (RLS) is active
-- =====================================================================
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 3. Drop existing policies to prevent naming conflicts
-- =====================================================================
DROP POLICY IF EXISTS "maintenance_select_all" ON public.maintenance;
DROP POLICY IF EXISTS "maintenance_select" ON public.maintenance;
DROP POLICY IF EXISTS "maintenance_write_admin" ON public.maintenance;

-- =====================================================================
-- 4. Create Select Policy: Read access for all authenticated users (residents & admins)
-- =====================================================================
CREATE POLICY "maintenance_select_all"
  ON public.maintenance
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================================
-- 5. Create Admin Write Policy: Full CRUD for administrators
-- =====================================================================
CREATE POLICY "maintenance_write_admin"
  ON public.maintenance
  FOR ALL
  TO authenticated
  USING (public.profile_role() = 'admin')
  WITH CHECK (public.profile_role() = 'admin');

-- =====================================================================
-- 6. Insert initial seed data (Clear and populate fresh records)
-- =====================================================================
TRUNCATE TABLE public.maintenance RESTART IDENTITY CASCADE;

INSERT INTO public.maintenance (
  asset_name, location, last_service_date, next_due_date, cost, vendor_name, vendor_contact, status
) VALUES 
  ('Lift A1', 'Block A', '2026-04-12', '2026-07-12', 500.00, 'Otis Care', '9876543210', 'Healthy'),
  ('Lift B1', 'Block B', '2026-03-08', '2026-06-08', 450.00, 'Otis Care', '9876543210', 'Due Soon'),
  ('Generator', 'Basement', '2026-04-20', '2026-10-20', 1200.00, 'PowerCo', '9876543211', 'Healthy'),
  ('Water Pump', 'Roof', '2026-02-01', '2026-05-01', 300.00, 'Aquaclean', '9876543212', 'Overdue'),
  ('STP Plant', 'Backside', '2026-04-15', '2026-07-15', 850.00, 'EcoClean', '9876543213', 'Healthy'),
  ('CCTV Network', 'Common Area', '2026-03-30', '2026-06-30', 600.00, 'SecureNet', '9876543214', 'Due Soon');

-- =====================================================================
-- 7. Reload PostgREST API Gateway cache
-- =====================================================================
NOTIFY pgrst, 'reload schema';
