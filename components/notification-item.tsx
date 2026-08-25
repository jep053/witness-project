import { Avatar } from "@/components/avatar";
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
          <Avatar name={n.actor.username} size={32} />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-foreground">
            <span className="font-semibold">{n.actor.username}</span>
            {describe(n)}
          </p>
          {n.preview && (
            <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
              &ldquo;{n.preview}&rdquo;
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatTime(n.created_at)}
          </p>
        </div>

        {n.awaiting_response && (
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* NOT IMPLEMENTED — writes follows.status, lands in Phase 6. */}
            <button
              disabled
              className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-40"
            >
              Accept
            </button>
            <button
              disabled
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground disabled:opacity-40"
            >
              Decline
            </button>
          </div>
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