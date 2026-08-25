import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationItem } from "@/components/notification-item";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/notifications");

  const notifications = await getNotifications(user.id);

  return (
    <div className="mx-auto max-w-[680px] space-y-5 px-8 py-10">
      <h1 className="text-lg font-semibold">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} n={n} />
          ))}
        </ul>
      )}
    </div>
  );
}