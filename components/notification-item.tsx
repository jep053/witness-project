"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { respondToFollowRequest } from "@/app/actions/follows";
import type { NotificationWithContext } from "@/lib/data/notifications";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function describe(n: NotificationWithContext): string {
  switch (n.type) {
    case "candle":
      return " lit a candle on your post";
    case "comment":
      return " commented on your post";
    case "follow_request":
      return " requested to follow you";
    case "follow_accepted":
      return " accepted your follow request";
  }
}

export function NotificationItem({ n }: { n: NotificationWithContext }) {
  const pathname = usePathname();
  const [resolution, setResolution] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const respond = (accept: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await respondToFollowRequest(n.sender.id, accept, pathname);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setResolution(result.status);
    });
  };

  const showActions = n.awaiting_response && resolution === null;

  return (
    <li
      className={`rounded-xl border transition-colors ${
        n.is_read
          ? "border-border bg-card"
          : "border-[#E8C4A0]/40 bg-[#FDF0E8]"
      }`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        {n.type === "candle" ? (
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#E8C4A0]/80 bg-[#FDF0E8] text-sm"
            aria-hidden="true"
          >
            🕯
          </div>
        ) : (
          <Avatar name={n.sender.username} size={32} />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-foreground">
            <span className="font-semibold">{n.sender.username}</span>
            {describe(n)}
          </p>
          {n.preview && (
            <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
              &ldquo;{n.preview}&rdquo;
            </p>
          )}
          {error && (
            <p role="alert" className="mt-0.5 text-xs text-destructive">
              {error}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatTime(n.created_at)}
          </p>
        </div>

        {showActions && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => respond(true)}
              disabled={isPending}
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-40"
            >
              Accept
            </button>
            <button
              onClick={() => respond(false)}
              disabled={isPending}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground disabled:opacity-40"
            >
              Decline
            </button>
          </div>
        )}

        {resolution && (
          <span className="flex-shrink-0 text-xs text-muted-foreground">
            {resolution === "accepted" ? "Accepted" : "Declined"}
          </span>
        )}

        {!n.is_read && (
          <div
            className="ml-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary"
            aria-label="Unread"
          />
        )}
      </div>
    </li>
  );
}