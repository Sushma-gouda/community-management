-- ============================================================
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. The label column already exists per your schema (DEFAULT 'Maintenance')
--    Back-fill any NULL labels on existing rows
UPDATE public.billing SET label = 'Maintenance' WHERE label IS NULL;

-- 2. Enable RLS on billing (if not already enabled)
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist
DROP POLICY IF EXISTS "billing_select_admin"  ON public.billing;
DROP POLICY IF EXISTS "billing_insert_admin"  ON public.billing;
DROP POLICY IF EXISTS "billing_update_admin"  ON public.billing;
DROP POLICY IF EXISTS "billing_select_resident" ON public.billing;
DROP POLICY IF EXISTS "billing_update_resident" ON public.billing;

-- 4. Admin can SELECT all billing rows
CREATE POLICY "billing_select_admin"
  ON public.billing FOR SELECT
  USING (public.profile_role() = 'admin');

-- 5. Admin can INSERT new bills
CREATE POLICY "billing_insert_admin"
  ON public.billing FOR INSERT
  WITH CHECK (public.profile_role() = 'admin');

-- 6. Admin can UPDATE (mark overdue, etc.)
CREATE POLICY "billing_update_admin"
  ON public.billing FOR UPDATE
  USING (public.profile_role() = 'admin');

-- 7. Residents can SELECT their own flat's bills
CREATE POLICY "billing_select_resident"
  ON public.billing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.residents r
      WHERE r.flat_id::text = billing.flat_id::text
        AND r.user_id = auth.uid()
    )
  );

-- 8. Residents can UPDATE their own bill (e.g. mark paid)
CREATE POLICY "billing_update_resident"
  ON public.billing FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.residents r
      WHERE r.flat_id::text = billing.flat_id::text
        AND r.user_id = auth.uid()
    )
  );
