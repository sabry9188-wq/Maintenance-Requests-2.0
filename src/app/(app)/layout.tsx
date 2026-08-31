import { requireSessionUser } from "@/lib/auth/get-session";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSessionUser();
  const [notifications, unreadCount] = await Promise.all([
    getNotifications(10),
    getUnreadNotificationCount(),
  ]);

  return (
    <AppShell profile={session.profile} notifications={notifications} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
