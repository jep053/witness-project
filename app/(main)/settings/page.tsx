import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserSettings } from "@/lib/data/settings";
import { SettingsView } from "@/components/settings-view";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/settings");

  const settings = await getUserSettings(user.id);

  return <SettingsView user={user} settings={settings} />;
}