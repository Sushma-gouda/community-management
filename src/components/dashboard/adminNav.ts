import {
  LayoutDashboard, Building, Users, MessageSquareWarning, CreditCard,
  ShieldCheck, Car, Wrench, Megaphone, Settings,
} from "lucide-react";
import type { NavItem } from "./DashboardLayout";

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Flats", to: "/dashboard/admin/flats", icon: Building },
  { label: "Residents", to: "/dashboard/admin/residents", icon: Users },
  { label: "Complaints", to: "/dashboard/admin/complaints", icon: MessageSquareWarning },
  { label: "Billing", to: "/dashboard/admin/billing", icon: CreditCard },
  { label: "Visitors", to: "/dashboard/admin/visitors", icon: ShieldCheck },
  { label: "Parking", to: "/dashboard/admin/parking", icon: Car },
  { label: "Maintenance", to: "/dashboard/admin/maintenance", icon: Wrench },
  { label: "Notices", to: "/dashboard/admin/notices", icon: Megaphone },
  { label: "Settings", to: "/dashboard/admin/settings", icon: Settings },
];
