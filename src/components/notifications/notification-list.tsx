"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";
import type { NotificationRow } from "@/lib/types/database.types";

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((n) => !n.is_read);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  function handleClick(n: NotificationRow) {
    if (!n.is_read) {
      startTransition(async () => {
        await markNotificationRead(n.id);
        router.refresh();
      });
    }
  }

  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />;
  }

  return (
    <div>
      {hasUnread && (
        <div className="mb-3 flex justify-end">
          <Button size="sm" variant="outline" disabled={isPending} onClick={handleMarkAll}>
            Mark all as read
          </Button>
        </div>
      )}
      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.request_id ? `/requests/${n.request_id}` : "#"}
            onClick={() => handleClick(n)}
            className={cn("block px-4 py-3 hover:bg-neutral-50", !n.is_read && "bg-primary-50/40")}
          >
            <div className="flex items-center justify-between">
              <p className={cn("text-sm text-neutral-900", !n.is_read && "font-semibold")}>{n.title}</p>
              <p className="text-xs text-neutral-400">{formatDateTime(n.created_at)}</p>
            </div>
            {n.body && <p className="mt-1 text-sm text-neutral-500">{n.body}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
