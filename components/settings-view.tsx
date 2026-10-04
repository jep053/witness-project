"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Toggle } from "@/components/toggle";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import type { ProfileVisibility, User, UserSettings } from "@/lib/types";

import { logout } from "@/app/auth/actions";
import { updateProfileVisibility, updateNotificationSetting } from "@/app/actions/settings";

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "followers_only", label: "Followers" },
  { value: "private", label: "Private" },
];

/** One toggle per notification type — these mirror NotificationType exactly. */
type NotificationKey = keyof Omit<UserSettings, "user_id" | "language">;

const NOTIFICATION_ROWS: {
  key: NotificationKey;
  label: string;
  description: string;
}[] = [
  {
    key: "notify_candle",
    label: "Candles",
    description: "When someone lights a candle on your post",
  },
  {
    key: "notify_comment",
    label: "Comments",
    description: "When someone comments on your post",
  },
  {
    key: "notify_follow_request",
    label: "Follow requests",
    description: "When someone asks to follow you",
  },
  {
    key: "notify_follow_accepted",
    label: "Accepted requests",
    description: "When someone accepts your follow request",
  },
];

export function SettingsView({
  user,
  settings,
}: {
  user: User;
  settings: UserSettings | null;
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Profile Visibility 낙관적 업데이트 상태 및 에러 핸들링
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    user.profile_visibility
  );
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const handleVisibilityChange = (next: ProfileVisibility) => {
    const prev = visibility;
    setVisibility(next); // optimistic
    setVisibilityError(null);
    updateProfileVisibility(next).then((result) => {
      if ("error" in result) {
        setVisibility(prev); // revert
        setVisibilityError(result.error);
      }
    });
  };

  // 알림 설정 낙관적 업데이트 상태 및 핸들러
  const [notifications, setNotifications] = useState<UserSettings>(
    settings ?? {
      user_id: user.id,
      notify_candle: true,
      notify_comment: true,
      notify_follow_request: true,
      notify_follow_accepted: true,
      language: "en",
    }
  );

  const handleNotificationToggle = (key: NotificationKey, next: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: next })); // optimistic
    updateNotificationSetting(key, next).then((result) => {
      if ("error" in result) {
        setNotifications((prev) => ({ ...prev, [key]: !next })); // revert
        console.error("[SettingsView]", result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-[560px] space-y-8 px-8 py-10">
      <h1 className="text-lg font-semibold">Settings</h1>

      {/* Account Section */}
      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">Edit profile</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Name, bio, profile picture
              </p>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Open
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">Sign-in method</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                How you access this account
              </p>
            </div>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              Email
            </span>
          </div>

          <div className="flex select-none items-center justify-between px-4 py-3.5 opacity-40">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Permanently erase all your data
              </p>
            </div>
            <span className="text-xs text-muted-foreground">Post-MVP</span>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Security
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <button
            onClick={() => setPasswordOpen((v) => !v)}
            aria-expanded={passwordOpen}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
          >
            <div>
              <p className="text-sm font-medium">Change password</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                For email and password accounts
              </p>
            </div>
            <ChevronRight
              size={15}
              className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                passwordOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {passwordOpen && (
            <div className="space-y-2.5 border-t border-border px-4 py-4">
              {["Current password", "New password", "Confirm new password"].map(
                (placeholder) => (
                  <input
                    key={placeholder}
                    type="password"
                    placeholder={placeholder}
                    aria-label={placeholder}
                    disabled
                    className="w-full rounded-lg border-0 bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  />
                )
              )}
              <button
                disabled
                className="mt-1 w-full rounded-lg bg-foreground py-2.5 text-sm text-primary-foreground disabled:opacity-40"
              >
                Change password
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Privacy Section */}
      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Privacy
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="space-y-3 px-4 py-4">
            <div>
              <p className="text-sm font-medium">Profile visibility</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sets the maximum reach of everything you post
              </p>
            </div>

            <div className="flex overflow-hidden rounded-lg border border-border">
              {VISIBILITY_OPTIONS.map((option, i) => (
                <button
                  key={option.value}
                  onClick={() => handleVisibilityChange(option.value)}
                  aria-pressed={visibility === option.value}
                  className={`flex-1 py-2 text-sm transition-colors ${
                    i > 0 ? "border-l border-border" : ""
                  } ${
                    visibility === option.value
                      ? "bg-foreground font-medium text-primary-foreground"
                      : "text-foreground hover:bg-muted/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {visibility === "followers_only" && (
              <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                Only people whose follow requests you&apos;ve accepted can see
                your profile and posts.
              </p>
            )}
            {visibility === "private" && (
              <p className="rounded-lg border border-[#E8C4A0]/50 bg-[#FDF0E8] px-3 py-2.5 text-xs leading-relaxed text-primary">
                No one else can see your profile or posts — not even your
                followers. You can still follow and read others.
              </p>
            )}

            {/* Visibility Server Action 에러 표시 */}
            {visibilityError && (
              <p role="alert" className="text-xs text-destructive">
                {visibilityError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-3">
        <h2 className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Notifications
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {NOTIFICATION_ROWS.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
              <Toggle
                checked={notifications[key]}
                label={label}
                onChange={(next) => handleNotificationToggle(key, next)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Logout Section */}
      <section className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center px-4 py-3.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/[0.06]"
            >
              Log out
            </button>
          </form>
        </div>
      </section>

      {editOpen && (
        <ProfileEditModal
          username={user.username}
          initialName={user.display_name ?? ""}
          initialBio={user.bio ?? ""}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}