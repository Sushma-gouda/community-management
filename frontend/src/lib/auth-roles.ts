import type { User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";

export type AppRole = "admin" | "resident" | "security";

export function isAppRole(value: string): value is AppRole {
  return value === "admin" || value === "resident" || value === "security";
}

export function dashboardPathForRole(
  role: AppRole,
): "/dashboard/admin" | "/dashboard/resident" | "/dashboard/security" {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "security":
      return "/dashboard/security";
    default:
      return "/dashboard/resident";
  }
}

export async function resolveUserRole(user: User): Promise<AppRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!error && data?.role && isAppRole(data.role)) {
    return data.role;
  }
  const meta = user.user_metadata?.role;
  if (typeof meta === "string" && isAppRole(meta)) {
    return meta;
  }
  return "resident";
}

export async function getPostAuthRedirectPath(
  user: User,
): Promise<"/dashboard/admin" | "/dashboard/resident" | "/dashboard/security"> {
  const role = await resolveUserRole(user);
  return dashboardPathForRole(role);
}
