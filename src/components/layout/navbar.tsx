"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "./notification-bell";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { NotificationRow, UserRole } from "@/lib/types/database.types";

export function Navbar({
  fullName,
  role,
  notifications,
  unreadCount,
}: {
  fullName: string;
  role: UserRole;
  notifications: NotificationRow[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/requests?search=${encodeURIComponent(search.trim())}`);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request number, problem, equipment..."
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              {fullName.slice(0, 2).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-neutral-900">{fullName}</span>
              <span className="block text-xs text-neutral-500">{ROLE_LABELS[role]}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-xl">
                <a
                  href="/settings/profile"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  My profile
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-primary-600 hover:bg-neutral-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
