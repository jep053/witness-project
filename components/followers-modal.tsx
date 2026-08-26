"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { User } from "@/lib/types";

export function FollowersModal({
  title,
  users,
  onClose,
}: {
  title: "Followers" | "Following";
  users: User[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_rgba(28,25,23,0.12)]">
        {/* Title only — no count, consistent with the profile links */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-sm font-semibold italic text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {users.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              {title === "Followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            <ul>
              {users.map((user, i) => (
                <li
                  key={user.id}
                  className={i < users.length - 1 ? "border-b border-border" : ""}
                >
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={onClose}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <Avatar name={user.username} size={34} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {user.username}
                      </p>
                      {user.bio && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}