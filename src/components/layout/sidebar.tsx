"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Wrench,
  CalendarClock,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/types/database.types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: ClipboardList },
  {
    href: "/requests/new",
    label: "Create Request",
    icon: PlusCircle,
    roles: ["STATION_USER", "ENGINEERING_MANAGER", "ADMIN"],
  },
  { href: "/assets", label: "Assets", icon: Wrench },
  { href: "/preventive-maintenance", label: "Preventive Maintenance", icon: CalendarClock },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/audit-log", label: "Audit Log", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white py-4">
      <div className="mb-2 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-sm font-bold text-white">
            M
          </span>
          <span className="text-sm font-semibold text-neutral-900">Maintenance 2.0</span>
        </Link>
      </div>
      <ul className="flex-1 space-y-0.5 px-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/requests/new");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
