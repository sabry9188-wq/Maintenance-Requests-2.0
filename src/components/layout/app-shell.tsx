"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import type { ProfileRow, NotificationRow } from "@/lib/types/database.types";

export function AppShell({
  profile,
  notifications,
  unreadCount,
  children,
}: {
  profile: ProfileRow;
  notifications: NotificationRow[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-neutral-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <Sidebar role={profile.role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={profile.role} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-neutral-200 bg-white lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="px-4 py-4 text-neutral-500 hover:text-neutral-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <Navbar
          fullName={profile.full_name}
          role={profile.role}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
