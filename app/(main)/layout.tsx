import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/data/notifications";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <div className="flex min-h-screen">
      <AppSidebar username={user?.username ?? null} unreadCount={unreadCount} />
      <main className="flex-1">{children}</main>
    </div>
  );
}