-- ============================================================
-- Communa — Supabase Seed Data
-- ============================================================
-- Run this after applying all migrations to populate the
-- database with sample data for development/testing.
-- ============================================================

-- ---- Blocks ----
INSERT INTO blocks (id, name, total_flats) VALUES
  ('block-a', 'Block A', 125),
  ('block-b', 'Block B', 125),
  ('block-c', 'Block C', 125),
  ('block-d', 'Block D', 125)
ON CONFLICT (id) DO NOTHING;

-- ---- Flats ----
INSERT INTO flats (id, block_id, flat_number, floor, sqft, type, status) VALUES
  ('flat-a101', 'block-a', 'A-101', 1, 1240, '2BHK', 'occupied'),
  ('flat-a204', 'block-a', 'A-204', 2, 1450, '3BHK', 'occupied'),
  ('flat-b302', 'block-b', 'B-302', 3, 1620, '3BHK', 'occupied'),
  ('flat-b401', 'block-b', 'B-401', 4, 1620, '3BHK', 'vacant'),
  ('flat-c105', 'block-c', 'C-105', 1, 980,  '2BHK', 'reserved'),
  ('flat-c204', 'block-c', 'C-204', 2, 1240, '2BHK', 'occupied'),
  ('flat-d405', 'block-d', 'D-405', 4, 1820, '4BHK', 'occupied'),
  ('flat-d501', 'block-d', 'D-501', 5, 1820, '4BHK', 'vacant')
ON CONFLICT (id) DO NOTHING;

-- ---- Residents ----
-- Note: auth.users entries must exist before inserting profiles.
-- In production, residents are created via Supabase Auth sign-up.
INSERT INTO residents (id, flat_id, name, email, phone, family_count, status) VALUES
  ('res-001', 'flat-a101', 'Ravi Kumar',   'ravi@mail.com',  '+91 98200 11223', 4, 'active'),
  ('res-002', 'flat-a204', 'Priya Mehta',  'priya@mail.com', '+91 98200 22334', 3, 'active'),
  ('res-003', 'flat-b302', 'Anika Sharma', 'anika@mail.com', '+91 98200 33445', 2, 'active'),
  ('res-004', 'flat-c105', 'Sunil Joshi',  'sunil@mail.com', '+91 98200 44556', 5, 'inactive'),
  ('res-005', 'flat-c204', 'Meera Pillai', 'meera@mail.com', '+91 98200 55667', 3, 'active'),
  ('res-006', 'flat-d405', 'Arjun Rao',    'arjun@mail.com', '+91 98200 66778', 2, 'active')
ON CONFLICT (id) DO NOTHING;

-- ---- Parking Slots ----
INSERT INTO parking_slots (id, slot_number, level, zone, type, status, flat_id) VALUES
  ('park-042', 'P-042', 'Basement Level 1', 'Zone B', 'car',  'occupied', 'flat-b302'),
  ('park-015', 'P-015', 'Basement Level 1', 'Zone A', 'car',  'occupied', 'flat-a204'),
  ('park-078', 'P-078', 'Basement Level 2', 'Zone C', 'ev',   'occupied', 'flat-c204'),
  ('park-033', 'P-033', 'Basement Level 1', 'Zone A', 'bike', 'occupied', 'flat-d405')
ON CONFLICT (id) DO NOTHING;

-- ---- Notices ----
INSERT INTO notices (id, title, body, target_block, tag, pinned, published_at) VALUES
  ('notice-001', 'Water tank cleaning on Sunday',
   'There will be no water supply between 9 AM and 1 PM. Please store water in advance.',
   'all', 'Important', true, NOW() - INTERVAL '2 days'),
  ('notice-002', 'Fire drill scheduled — May 22',
   'Mandatory fire drill at 11 AM. All residents are requested to participate.',
   'all', 'Safety', false, NOW() - INTERVAL '4 days'),
  ('notice-003', 'New gym equipment arrived',
   'Treadmills and dumbbells installed in the community gym. Open from 6 AM to 10 PM.',
   'all', 'Amenity', false, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;
