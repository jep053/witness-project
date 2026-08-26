"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Bell, User, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "My Journey", href: "/my-journey", Icon: Home },
  { label: "Others", href: "/others", Icon: Users },
  { label: "Notifications", href: "/notifications", Icon: Bell },
];

function navClass(active: boolean) {
  return `font-hand relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] transition-all duration-150 ${
    active
      ? "bg-foreground/10 font-bold text-foreground"
      : "font-normal text-foreground/55 hover:bg-foreground/[0.06]"
  }`;
}

export function AppSidebar({
  username,
  unreadCount,
}: {
  username: string | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const profileHref = username ? `/profile/${username}` : null;
  const settingsActive = pathname === "/settings";

  return (
    <aside className="bg-sidebar sticky top-0 flex h-screen w-52 flex-shrink-0 flex-col border-r border-border">
      <div className="px-6 pt-8 pb-7">
        <h1 className="font-hand text-[1.7rem] font-bold leading-none text-foreground">
          Witness
        </h1>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={navClass(active)}>
              <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
              {label}
              {href === "/notifications" && unreadCount > 0 && (
                <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Guests have no profile to link to, so the item is omitted entirely
            rather than pointing somewhere that would bounce them to login. */}
        {profileHref && (
          <Link href={profileHref} className={navClass(pathname === profileHref)}>
            <User size={15} strokeWidth={pathname === profileHref ? 2.2 : 1.7} />
            Profile
          </Link>
        )}
      </nav>

      {/* Settings sits below a divider in a quieter tone — it's sub-navigation,
          not a destination people move between while using the app. */}
      {username && (
        <div className="border-t border-foreground/10 px-3 pb-1 pt-2">
          <Link
            href="/settings"
            className={`font-hand flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.875rem] transition-all duration-150 ${
              settingsActive
                ? "bg-foreground/10 text-foreground/65"
                : "text-foreground/[0.38] hover:bg-foreground/[0.06]"
            }`}
          >
            <Settings size={13} strokeWidth={1.5} />
            Settings
          </Link>
        </div>
      )}

      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center gap-2.5">
          {/* Placeholder avatar until avatar_url is wired up */}
          <div
            className="h-7 w-7 flex-shrink-0 rounded-full"
            style={{ background: "linear-gradient(135deg, #D4A574, #C07848)" }}
          />
          <span className="truncate text-xs text-foreground/45">
            {username ?? "Guest"}
          </span>
        </div>
      </div>
    </aside>
  );
}