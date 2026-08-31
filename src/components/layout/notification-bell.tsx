"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatAge } from "@/lib/utils/request-age";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification-actions";
import type { NotificationRow } from "@/lib/types/database.types";

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationRow[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleItemClick(n: NotificationRow) {
    if (!n.is_read) {
      startTransition(async () => {
        await markNotificationRead(n.id);
        router.refresh();
      });
    }
    setOpen(false);
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-neutral-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="text-xs font-medium text-primary-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.request_id ? `/requests/${n.request_id}` : "/notifications"}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "block border-b border-neutral-100 px-4 py-3 text-sm hover:bg-neutral-50",
                      !n.is_read && "bg-primary-50/50"
                    )}
                  >
                    <p className={cn("font-medium text-neutral-900", !n.is_read && "font-semibold")}>{n.title}</p>
                    {n.body && <p className="mt-0.5 text-neutral-500 line-clamp-2">{n.body}</p>}
                    <p className="mt-1 text-xs text-neutral-400">{formatAge(n.created_at)} ago</p>
                  </Link>
                ))
              )}
            </div>
            <div className="border-t border-neutral-200 px-4 py-2 text-center">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary-600 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
