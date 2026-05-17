import { supabase } from "@/services/supabase/client";

export type BlockRow = { id: string; name: string; total_flats: number };

/** Row from `public.flats` (matches core migration). */
export type FlatRow = {
  id: string;
  block_id: string;
  flat_number: string;
  floor: number | null;
  sqft: number | null;
  type: string | null;
  /** `vacant` | `occupied` | `reserved` */
  status: string;
  owner_name?: string | null;
  created_at?: string | null;
};

/** Flat list row with resolved block label for tables. */
export type FlatWithBlockName = FlatRow & { block_name: string };
export type ResidentRow = {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  flat_id: string;
  family_count?: number | null;
  role?: string;
  created_at?: string;
};
export type ComplaintRow = {
  id: number | string; // Handle both BigInt and UUID
  resident_id: string | null;
  title: string;
  description: string | null; // Match actual DB schema
  status: string;
  flat_label: string | null;
  category: string | null;
  priority: string | null;
  created_at: string;
};
/**
 * Matches public.billing schema exactly:
 *   id           bigint generated always as identity  (auto — never pass in insert)
 *   flat_id      bigint (FK → flats.id)
 *   amount       numeric
 *   due_date     date
 *   status       text  CHECK IN ('pending','paid','overdue')  default 'pending'
 *   generated_at timestamp  default now()
 *   paid_at      timestamp
 *   payment_method text
 *   transaction_id text
 *   label        text  default 'Maintenance'
 */
export type BillRow = {
  id: number;                  // bigint → number in JS
  flat_id: number | null;      // bigint FK
  label: string | null;
  amount: number;
  status: "pending" | "paid" | "overdue";
  due_date: string | null;     // date as ISO string
  paid_at: string | null;
  generated_at: string;
  payment_method: string | null;
  transaction_id: string | null;
};
export type VisitorRow = {
  id: string;
  name: string;
  phone: string | null;
  flat_id: string | null;
  purpose: string;
  vehicle_number: string | null;
  entry_time: string;
  exit_time: string | null;
};
export type NoticeRow = {
  id: string;
  title: string;
  body: string | null;
  target_block: string;
  tag: string | null;
  pinned: boolean;
  published_at: string;
};
export type ParkingSlotRow = {
  id: string;
  slot_number: string;
  level: string | null;
  zone: string | null;
  type: string | null;
  status: string;
  flat_id: string | null;
};
export type MaintenanceAssetRow = {
  id: number;
  name: string;
  category: string;
  location: string;
  last_service_on: string | null;
  next_service_on: string | null;
  health_score: number;
  status: string;
};

export async function fetchBlocks(): Promise<BlockRow[]> {
  const { data, error } = await supabase.from("blocks").select("*").order("name");
  return error ? [] : (data as BlockRow[]) || [];
}

export async function fetchVacantFlatsByBlock(blockId: string): Promise<FlatRow[]> {
  const { data, error } = await supabase.from("flats").select("*").eq("block_id", blockId).or("status.ilike.vacant,status.is.null").order("flat_number");
  return error ? [] : (data as FlatRow[]) || [];
}

export async function fetchResidentByUserId(userId: string): Promise<{ resident: ResidentRow; flat: FlatRow; block: BlockRow; } | null> {
  const { data: res, error: e1 } = await supabase.from("residents").select("*").eq("user_id", userId).maybeSingle();
  if (e1 || !res) return null;
  const { data: row, error: e2 } = await supabase.from("flats").select(`*, blocks:block_id ( id, name, total_flats )`).eq("id", res.flat_id).maybeSingle();
  if (e2 || !row) return null;
  const flatData = row as any;
  const block = Array.isArray(flatData.blocks) ? flatData.blocks[0] : (flatData.blocks || { id: flatData.block_id, name: "N/A", total_flats: 0 });
  return { resident: res as ResidentRow, flat: flatData as FlatRow, block };
}

export async function registerResidentRpc(args: { flatId: string; fullName: string; email: string; phone: string; familyCount: number; }): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("register_resident", { p_flat_id: args.flatId, p_full_name: args.fullName, p_email: args.email, p_phone: args.phone, p_family_count: args.familyCount });
  return error ? { error: error.message } : { error: null };
}

export async function adminResidentCount(): Promise<number> {
  const { count, error } = await supabase.from("residents").select("*", { count: "exact", head: true });
  return error ? 0 : count ?? 0;
}

export async function adminFlatsOccupancy(): Promise<{ total: number; occupied: number }> {
  const { data, error } = await supabase.from("flats").select("status");
  if (error || !data) return { total: 0, occupied: 0 };
  return { total: data.length, occupied: data.filter((f) => f.status === "occupied").length };
}

export async function adminComplaintStats(): Promise<{ open: number }> {
  const { data, error } = await supabase.from("complaints").select("status");
  if (error || !data) return { open: 0 };
  return { open: data.filter((c) => c.status === "open" || c.status === "in_progress").length };
}

export async function adminUnpaidBillsTotal(): Promise<number> {
  const { data, error } = await supabase.from("billing").select("amount, status").eq("status", "pending");
  if (error || !data) return 0;
  return data.reduce((s, b) => s + Number(b.amount), 0);
}

export async function adminActiveVisitorCount(): Promise<number> {
  const { count, error } = await supabase.from("visitors").select("*", { count: "exact", head: true }).is("exit_time", null);
  return error ? 0 : count ?? 0;
}

export async function fetchRecentComplaints(limit: number): Promise<ComplaintRow[]> {
  const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(limit);
  return error ? [] : (data as ComplaintRow[]) ?? [];
}

/** Fire-and-forget overdue updater — does NOT block page loads */
function triggerOverdueUpdate(): void {
  const today = new Date().toISOString().split("T")[0];
  supabase
    .from("billing")
    .update({ status: "overdue" })
    .eq("status", "pending")
    .lt("due_date", today)
    .then(
      () => {},
      (err) => console.warn("Failed to silently trigger overdue update:", err)
    );
}

export async function updateOverdueBills(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from("billing").update({ status: "overdue" }).eq("status", "pending").lt("due_date", today);
}

export async function fetchRecentBills(limit: number): Promise<BillRow[]> {
  triggerOverdueUpdate();
  const { data, error } = await supabase.from("billing").select("*").order("generated_at", { ascending: false }).limit(limit);
  return error ? [] : (data as BillRow[]) ?? [];
}

export async function fetchBillsAll(): Promise<BillRow[]> {
  triggerOverdueUpdate();
  const { data, error } = await supabase.from("billing").select("*").order("generated_at", { ascending: false });
  return error ? [] : (data as BillRow[]) ?? [];
}

/** Fetch all bills with joined flat + resident + block info for rich admin display. */
export type BillDetailed = BillRow & {
  flat_number: string;
  block_name: string;
  resident_name: string;
};

export async function fetchBillsAllDetailed(): Promise<BillDetailed[]> {
  // Fire overdue update in background — don't await it
  triggerOverdueUpdate();

  // All three queries run in parallel
  const [billsRes, flatsRes, residentsRes] = await Promise.all([
    supabase
      .from("billing")
      .select("id, flat_id, label, amount, status, due_date, paid_at, generated_at, payment_method, transaction_id")
      .order("generated_at", { ascending: false }),
    supabase
      .from("flats")
      .select("id, flat_number, block_id, owner_name, blocks:block_id(name)"),
    supabase
      .from("residents")
      .select("flat_id, full_name"),
  ]);

  if (billsRes.error) {
    console.error("[billing] SELECT error:", billsRes.error.message, billsRes.error.details);
    return [];
  }

  const bills = (billsRes.data ?? []) as BillRow[];
  const flats  = (flatsRes.data  ?? []) as any[];
  const residents = (residentsRes.data ?? []) as any[];

  // Map keys: convert both sides to string so bigint ↔ text comparison always works
  const flatMap     = new Map<string, any>(flats.map((f)    => [String(f.id),      f]));
  const residentMap = new Map<string, any>(residents.map((r) => [String(r.flat_id), r]));

  return bills.map((b) => {
    const flat     = flatMap.get(String(b.flat_id));
    const resident = residentMap.get(String(b.flat_id));
    return {
      ...b,
      flat_number:   flat?.flat_number       ?? "N/A",
      block_name:    flat?.blocks?.name      ?? "N/A",
      resident_name: resident?.full_name     ?? flat?.owner_name ?? "—",
    };
  });
}

export async function fetchBillsForResident(flatId: number | string): Promise<BillRow[]> {
  triggerOverdueUpdate();
  const { data, error } = await supabase
    .from("billing")
    .select("*")
    .eq("flat_id", Number(flatId))
    .order("generated_at", { ascending: false });
  return error ? [] : (data as BillRow[]) ?? [];
}

export async function createBill(args: {
  flat_id: number | string;
  amount: number;
  due_date: string;
  label?: string;
}): Promise<{ error: string | null }> {
  // Only pass the 5 writeable columns — id & generated_at have DB defaults
  const { error } = await supabase.from("billing").insert({
    flat_id: Number(args.flat_id),
    amount:  args.amount,
    due_date: args.due_date,
    status:  "pending",
    label:   args.label ?? "Maintenance",
  });
  return error ? { error: error.message } : { error: null };
}

export async function createBillsBulk(args: {
  target: "all" | string;
  amount: number;
  due_date: string;
  label?: string;
}): Promise<{ count: number; error: string | null }> {
  // 1. Fetch flats for the target block (or all)
  let query = supabase.from("flats").select("id, block_id, status");
  if (args.target !== "all") query = query.eq("block_id", args.target);
  const { data: allFlats, error: flatErr } = await query;

  if (flatErr) {
    console.error("[billing] flats fetch error:", flatErr.message);
    return { count: 0, error: flatErr.message };
  }

  // 2. Filter occupied flats (case-insensitive — handles 'occupied' or 'Occupied')
  const occupied = (allFlats ?? []).filter(
    (f) => String(f.status).toLowerCase() === "occupied"
  );

  if (occupied.length === 0) {
    return {
      count: 0,
      error: "No occupied flats found for the selected target. Register at least one resident first.",
    };
  }

  // 3. Build insert rows — only the 5 writeable columns the DB accepts
  //    id          → auto (generated always as identity)
  //    generated_at → auto (default now())
  const rows = occupied.map((f) => ({
    flat_id:  Number(f.id),          // bigint FK
    amount:   args.amount,
    due_date: args.due_date,
    status:   "pending" as const,
    label:    args.label ?? "Maintenance",
  }));

  // 4. Insert — plain insert, no chained .select() or .limit() which can cause hangs
  const { error: insertErr } = await supabase.from("billing").insert(rows);

  if (insertErr) {
    console.error("[billing] insert error:", insertErr.message, insertErr.details);
    return { count: 0, error: insertErr.message };
  }

  return { count: rows.length, error: null };
}

export async function payBill(args: { bill_id: number }): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("billing")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: "Simulated",
      transaction_id: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    })
    .eq("id", args.bill_id);
  return error ? { error: error.message } : { error: null };
}

export async function fetchRecentVisitors(limit: number): Promise<VisitorRow[]> {
  const { data, error } = await supabase.from("visitors").select("*").order("entry_time", { ascending: false }).limit(limit);
  return error ? [] : (data as VisitorRow[]) ?? [];
}

export async function fetchVisitorsAll(): Promise<VisitorRow[]> {
  const { data, error } = await supabase.from("visitors").select("*").order("entry_time", { ascending: false });
  return error ? [] : (data as VisitorRow[]) ?? [];
}

export async function fetchNotices(limit: number): Promise<NoticeRow[]> {
  const { data, error } = await supabase.from("notices").select("*").order("published_at", { ascending: false }).limit(limit);
  return error ? [] : (data as NoticeRow[]) ?? [];
}

export async function fetchResidentsDetailed(): Promise<Array<ResidentRow & { flat_number: string; block_name: string }>> {
  const { data, error } = await supabase.from("residents").select(`*, flats:flat_id ( flat_number, blocks:block_id (name) )`).order("full_name");
  if (error) return [];
  return (data as any[]).map(r => ({ ...r, flat_number: r.flats?.flat_number || "N/A", block_name: r.flats?.blocks?.name || "N/A" }));
}

export async function fetchResidentsDirectory(): Promise<Array<ResidentRow & { flat_number: string; block_name: string }>> {
  return fetchResidentsDetailed();
}

export async function fetchFlatsWithBlocks() {
  const { data, error } = await supabase.from("flats").select(`*, blocks:block_id (id, name)`);
  return error ? [] : data;
}

export async function insertFlat(args: { block_id: string; flat_number: string; floor: number | null; sqft: number | null; owner_name?: string | null; type?: string | null; }) {
  const { error } = await supabase.from("flats").insert({ block_id: args.block_id, flat_number: args.flat_number, floor: args.floor, sqft: args.sqft, type: args.type ?? null, status: "vacant", owner_name: args.owner_name ?? null });
  return error ? { error: error.message } : { error: null };
}

export async function updateFlat(id: string, args: Partial<FlatRow>): Promise<{ error: string | null }> {
  const payload: any = { ...args };
  if (payload.status) payload.status = String(payload.status).toLowerCase();
  const { error } = await supabase.from("flats").update(payload).eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function deleteFlat(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("flats").delete().eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function fetchComplaintsAll(): Promise<ComplaintRow[]> {
  const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
  return error ? [] : (data as ComplaintRow[]) ?? [];
}

export async function fetchComplaintsForResident(residentId: string): Promise<ComplaintRow[]> {
  const { data, error } = await supabase.from("complaints").select("*").eq("resident_id", residentId).order("created_at", { ascending: false });
  return error ? [] : (data as ComplaintRow[]) ?? [];
}

export async function createComplaint(args: { resident_id: string; title: string; body: string; priority?: string; category?: string; }): Promise<{ error: string | null }> {
  const { error } = await supabase.from("complaints").insert({ resident_id: args.resident_id, title: args.title, description: args.body, status: "open", category: args.category || "General", priority: (args.priority || "medium").toLowerCase() });
  return error ? { error: error.message } : { error: null };
}

export async function updateComplaintStatus(id: string, status: string): Promise<{ error: string | null }> {
  const dbStatus = status === "pending" ? "open" : status === "in-progress" ? "in_progress" : status;
  const { error } = await supabase.from("complaints").update({ status: dbStatus, updated_at: new Date().toISOString() }).eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function updateComplaintPriority(id: string, priority: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("complaints").update({ priority: priority.toLowerCase(), updated_at: new Date().toISOString() }).eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function fetchMyProfile(): Promise<(ResidentRow & { flat_number: string; block_name: string; floor: number; sqft: number; type: string; owner_name: string }) | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: resident, error } = await supabase.from("residents").select(`*, flats:flat_id ( id, flat_number, floor, sqft, type, owner_name, blocks:block_id (name) )`).eq("user_id", user.id).single();
  if (error || !resident) return null;
  const f = (resident as any).flats;
  return { ...(resident as ResidentRow), flat_number: f?.flat_number ?? "N/A", block_name: f?.blocks?.name ?? "N/A", floor: f?.floor ?? 0, sqft: f?.sqft ?? 0, type: f?.type ?? "Not specified", owner_name: f?.owner_name ?? "—" };
}

export async function updateMyProfile(args: Partial<ResidentRow>): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("residents").update(args).eq("user_id", user.id);
  return error ? { error: error.message } : { error: null };
}

export async function deleteResident(id: string, flatId?: string): Promise<{ error: string | null }> {
  if (flatId) await supabase.from("flats").update({ status: "vacant", owner_name: null }).eq("id", flatId);
  const { error } = await supabase.from("residents").delete().eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function updateResident(id: string, args: Partial<ResidentRow>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("residents").update(args).eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function fetchParkingAll(): Promise<ParkingSlotRow[]> {
  const { data, error } = await supabase.from("parking").select("*");
  return error ? [] : (data as ParkingSlotRow[]) ?? [];
}

export async function fetchMaintenanceAssets(): Promise<MaintenanceAssetRow[]> {
  const { data, error } = await supabase.from("maintenance_assets").select("*").order("id");
  return error ? [] : (data as MaintenanceAssetRow[]) ?? [];
}

export async function checkoutVisitor(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("visitors").update({ exit_time: new Date().toISOString() }).eq("id", id);
  return error ? { error: error.message } : { error: null };
}

export async function insertVisitor(args: { name: string; phone: string; flat_id: string; purpose: string; vehicle_number?: string; }): Promise<{ error: string | null }> {
  const { error } = await supabase.from("visitors").insert({ name: args.name, phone: args.phone, flat_id: args.flat_id, purpose: args.purpose, vehicle_number: args.vehicle_number ?? null, entry_time: new Date().toISOString() });
  return error ? { error: error.message } : { error: null };
}
