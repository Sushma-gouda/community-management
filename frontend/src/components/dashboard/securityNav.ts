import { LayoutDashboard, UserPlus, Users, ClipboardList } from "lucide-react";
import type { NavItem } from "./DashboardLayout";

export const securityNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/security", icon: LayoutDashboard },
  { label: "Add Visitor", to: "/dashboard/security/add-visitor", icon: UserPlus },
  { label: "Active Visitors", to: "/dashboard/security/active-visitors", icon: Users },
  { label: "Visitor Logs", to: "/dashboard/security/visitor-logs", icon: ClipboardList },
];
