"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { sendFollowRequest, removeFollow } from "@/app/actions/follows";
import type { FollowStatus } from "@/lib/types";

export function FollowButton({
  profileId,
  status,
}: {
  profileId: string;
  status: FollowStatus | null;
}) {
  const pathname = usePathname();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  const label =
    current === "accepted" ? "Following" : current === "pending" ? "Requested" : "Follow";

  const handleClick = () => {
    startTransition(async () => {
      const result =
        current === null
          ? await sendFollowRequest(profileId, pathname)
          : await removeFollow(profileId, pathname);

      if ("error" in result) {
        console.error("[FollowButton]", result.error);
        return;
      }
      setCurrent(result.status);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`whitespace-nowrap rounded-lg border px-5 py-2 text-sm transition-colors disabled:opacity-40 ${
        current ? "border-border bg-muted text-muted-foreground" : "border-border"
      }`}
    >
      {label}
    </button>
  );
}