import { getNotifications } from "@/lib/data/notifications";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const notifications = await getNotifications(100);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Notifications</h1>
        <p className="text-sm text-neutral-500">Updates about your maintenance requests.</p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
