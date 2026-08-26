"use client";

import type { FollowStatus } from "@/lib/types";

export function FollowButton({ status }: { status: FollowStatus | null }) {
  const label =
    status === "accepted" ? "Following" : status === "pending" ? "Requested" : "Follow";

  return (
    // NOT IMPLEMENTED — writes to follows, lands in Phase 6.
    <button
      disabled
      className={`whitespace-nowrap rounded-lg border px-5 py-2 text-sm disabled:opacity-40 ${
        status ? "border-border bg-muted text-muted-foreground" : "border-border"
      }`}
    >
      {label}
    </button>
  );
}