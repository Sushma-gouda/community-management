-- ============================================================
-- Parking Management Schema & Policies Migration
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Create or recreate the parking table to match exactly
CREATE TABLE IF NOT EXISTS public.parking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id bigint NOT NULL REFERENCES public.flats(id) ON DELETE CASCADE,
  slot_number text NOT NULL,
  vehicle_type text NOT NULL,
  vehicle_model text,
  plate_number text NOT NULL,
  allocated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add Unique Constraint on slot_number to prevent duplicate parking slot assignments
ALTER TABLE public.parking DROP CONSTRAINT IF EXISTS parking_slot_number_key;
ALTER TABLE public.parking ADD CONSTRAINT parking_slot_number_key UNIQUE (slot_number);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.parking ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies
DROP POLICY IF EXISTS "parking_select_admin" ON public.parking;
DROP POLICY IF EXISTS "parking_insert_admin" ON public.parking;
DROP POLICY IF EXISTS "parking_update_admin" ON public.parking;
DROP POLICY IF EXISTS "parking_delete_admin" ON public.parking;
DROP POLICY IF EXISTS "parking_select_resident" ON public.parking;

-- 5. Admin Policies: Admin has full access to CRUD parking
CREATE POLICY "parking_select_admin"
  ON public.parking FOR SELECT
  USING (public.profile_role() = 'admin');

CREATE POLICY "parking_insert_admin"
  ON public.parking FOR INSERT
  WITH CHECK (public.profile_role() = 'admin');

CREATE POLICY "parking_update_admin"
  ON public.parking FOR UPDATE
  USING (public.profile_role() = 'admin')
  WITH CHECK (public.profile_role() = 'admin');

CREATE POLICY "parking_delete_admin"
  ON public.parking FOR DELETE
  USING (public.profile_role() = 'admin');

-- 6. Resident/Security Policy: Residents can only see their own flat's parking details; Security can see all.
CREATE POLICY "parking_select_resident"
  ON public.parking FOR SELECT
  USING (
    public.profile_role() = 'security'
    OR EXISTS (
      SELECT 1 FROM public.residents r
      WHERE r.flat_id::text = parking.flat_id::text
        AND r.user_id = auth.uid()
    )
  );
