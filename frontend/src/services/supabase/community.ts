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
  flat_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  family_count: number;
  status: string;
  user_id: string | null;
};
export type ComplaintRow = {
  id: string;
  resident_id: string | null;
  title: string;
  body: string | null;
  status: string;
  flat_label: string | null;
  created_at: string;
};
export type BillRow = {
  id: string;
  resident_id: string;
  label: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};
export type VisitorRow = {
  id: string;
  name: string;
  phone: string | null;
  flat_number: string | null;
  host_name: string | null;
  purpose: string;
  vehicle: string | null;
  check_in: string;
  check_out: string | null;
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
  const { data, error } = await supabase.from("blocks").select("id, name, total_flats").order("name");
  if (error) {
    console.error("[fetchBlocks]", error.message);
    return [];
  }
  return (data as BlockRow[]) ?? [];
}

export async function fetchVacantFlatsByBlock(blockId: string): Promise<FlatRow[]> {
  const { data, error } = await supabase
    .from("flats")
    .select("id, block_id, flat_number, floor, sqft, type, status, owner_name, created_at")
    .eq("block_id", blockId)
    .eq("status", "vacant")
    .order("flat_number");
  if (error) throw error;
  return (data as FlatRow[]) ?? [];
}

export async function fetchResidentByUserId(userId: string): Promise<{
  resident: ResidentRow;
  flat: FlatRow;
  block: BlockRow;
} | null> {
  const { data: res, error: e1 } = await supabase
    .from("residents")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (e1 || !res) return null;

  const { data: row, error: e2 } = await supabase
    .from("flats")
    .select(
      `
      id,
      block_id,
      flat_number,
      floor,
      sqft,
      type,
      status,
      owner_name,
      created_at,
      blocks:block_id ( id, name, total_flats )
    `,
    )
    .eq("id", res.flat_id)
    .maybeSingle();
  if (e2 || !row) return null;

  const flatData = row as any;

  const block =
    Array.isArray(flatData.blocks) && flatData.blocks.length > 0
      ? flatData.blocks[0]
      : {
        id: flatData.block_id,
        name: flatData.block_id,
        total_flats: 0,
      };

  const flat: FlatRow = {
    id: flatData.id,
    block_id: flatData.block_id,
    flat_number: flatData.flat_number,
    floor: flatData.floor,
    sqft: flatData.sqft,
    type: flatData.type,
    status: flatData.status,
    owner_name: flatData.owner_name,
    created_at: flatData.created_at,
  };

  return { resident: res as ResidentRow, flat, block };
}

export async function registerResidentRpc(args: {
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  familyCount: number;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("register_resident", {
    p_flat_id: args.flatId,
    p_full_name: args.fullName,
    p_email: args.email,
    p_phone: args.phone,
    p_family_count: args.familyCount,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function adminResidentCount(): Promise<number> {
  const { count, error } = await supabase
    .from("residents")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function adminFlatsOccupancy(): Promise<{ total: number; occupied: number }> {
  const { data, error } = await supabase.from("flats").select("status");
  if (error || !data) return { total: 0, occupied: 0 };
  const total = data.length;
  const occupied = data.filter((f) => f.status === "occupied").length;
  return { total, occupied };
}

export async function adminComplaintStats(): Promise<{ open: number }> {
  const { data, error } = await supabase.from("complaints").select("status");
  if (error || !data) return { open: 0 };
  const open = data.filter((c) => c.status === "open" || c.status === "in_progress").length;
  return { open };
}

export async function adminUnpaidBillsTotal(): Promise<number> {
  const { data, error } = await supabase
    .from("bills")
    .select("amount, status")
    .eq("status", "unpaid");
  if (error || !data) return 0;
  return data.reduce((s, b) => s + Number(b.amount), 0);
}

export async function adminActiveVisitorCount(): Promise<number> {
  const { count, error } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .is("check_out", null);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchRecentComplaints(limit: number): Promise<ComplaintRow[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("id, resident_id, title, body, status, flat_label, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as ComplaintRow[]) ?? [];
}

export async function fetchRecentBills(limit: number): Promise<BillRow[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("id, resident_id, label, amount, status, due_date, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as BillRow[]) ?? [];
}

export async function fetchRecentVisitors(limit: number): Promise<VisitorRow[]> {
  const { data, error } = await supabase
    .from("visitors")
    .select("id, name, phone, flat_number, host_name, purpose, vehicle, check_in, check_out")
    .order("check_in", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as VisitorRow[]) ?? [];
}

export async function fetchNotices(limit: number): Promise<NoticeRow[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as NoticeRow[]) ?? [];
}

export async function fetchResidentsDirectory(): Promise<
  Array<ResidentRow & { flat_number: string; block_name: string }>
> {
  const { data: residents, error } = await supabase.from("residents").select("*").order("name");
  if (error || !residents?.length) return [];
  const flats = await supabase.from("flats").select("id, flat_number, block_id");
  const blocks = await supabase.from("blocks").select("id, name, total_flats");
  if (flats.error || blocks.error) return [];
  const fmap = new Map(
    (flats.data as Array<Pick<FlatRow, "id" | "flat_number" | "block_id">>).map((f) => [f.id, f]),
  );
  const bmap = new Map((blocks.data as BlockRow[]).map((b) => [b.id, b.name]));
  return (residents as ResidentRow[]).map((r) => {
    const f = fmap.get(r.flat_id);
    return {
      ...r,
      flat_number: f?.flat_number ?? "",
      block_name: f ? (bmap.get(f.block_id) ?? f.block_id) : "",
    };
  });
}

export async function fetchFlatsWithBlocks() {
  const { data, error } = await supabase
    .from("flats")
    .select(`
      id,
      block_id,
      flat_number,
      floor,
      sqft,
      owner_name,
      status,
      blocks!inner (
        id,
        name
      )
    `);

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data;
}



export async function insertFlat(args: {
  block_id: string;
  flat_number: string;
  floor: number | null;
  sqft: number | null;
  owner_name?: string | null;
  type?: string | null;
}) {
  const { error } = await supabase.from("flats").insert({
    block_id: args.block_id,
    flat_number: args.flat_number,
    floor: args.floor,
    sqft: args.sqft,
    type: args.type ?? null,
    status: "vacant",
    owner_name: args.owner_name ?? null,
  });

  if (error) {
    console.error("insertFlat error:", error.message);
    return { error: error.message };
  }

  return { error: null };
}

/** Accepts DB columns; maps legacy `occupancy_status` → `status`. */
export async function updateFlat(
  id: string,
  args: Partial<Pick<FlatRow, "block_id" | "flat_number" | "floor" | "sqft" | "type" | "status" | "owner_name">> & {
    occupancy_status?: string;
  },
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = {};
  if (args.block_id !== undefined) payload.block_id = args.block_id;
  if (args.flat_number !== undefined) payload.flat_number = args.flat_number;
  if (args.floor !== undefined) payload.floor = args.floor;
  if (args.sqft !== undefined) payload.sqft = args.sqft;
  if (args.type !== undefined) payload.type = args.type;
  if (args.owner_name !== undefined) payload.owner_name = args.owner_name;
  if (args.status !== undefined) payload.status = String(args.status).toLowerCase();
  if (args.occupancy_status !== undefined) payload.status = String(args.occupancy_status).toLowerCase();

  const { error } = await supabase.from("flats").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteFlat(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("flats").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchComplaintsAll(): Promise<ComplaintRow[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as ComplaintRow[]) ?? [];
}

export async function fetchVisitorsAll(): Promise<VisitorRow[]> {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("check_in", { ascending: false });
  if (error) return [];
  return (data as VisitorRow[]) ?? [];
}

export async function fetchBillsAll(): Promise<BillRow[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as BillRow[]) ?? [];
}

export async function fetchParkingAll(): Promise<ParkingSlotRow[]> {
  const { data, error } = await supabase.from("parking_slots").select("*");
  if (error) return [];
  return (data as ParkingSlotRow[]) ?? [];
}

export async function fetchMaintenanceAssets(): Promise<MaintenanceAssetRow[]> {
  const { data, error } = await supabase.from("maintenance_assets").select("*").order("id");
  if (error) return [];
  return (data as MaintenanceAssetRow[]) ?? [];
}

export async function fetchComplaintsForResident(residentId: string): Promise<ComplaintRow[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as ComplaintRow[]) ?? [];
}

export async function fetchBillsForResident(residentId: string): Promise<BillRow[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as BillRow[]) ?? [];
}

export async function insertComplaint(args: {
  residentId: string;
  title: string;
  body?: string;
  flatLabel: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("complaints").insert({
    resident_id: args.residentId,
    title: args.title,
    body: args.body ?? null,
    flat_label: args.flatLabel,
    status: "open",
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function insertVisitor(args: {
  name: string;
  phone?: string;
  flatNumber: string;
  hostName?: string;
  purpose: string;
  vehicle?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("visitors").insert({
    name: args.name,
    phone: args.phone ?? null,
    flat_number: args.flatNumber,
    host_name: args.hostName ?? null,
    purpose: args.purpose,
    vehicle: args.vehicle ?? null,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function checkoutVisitor(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("visitors")
    .update({ check_out: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function markBillPaid(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("bills")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}






