"use client";

import { MessageCircle } from "lucide-react";

export function CommentButton({
  count,
  open,
  onClick,
}: {
  count: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-label={`Comments (${count})`}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
        open
          ? "border-foreground/40 bg-foreground/5 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      <MessageCircle size={13} />
      {count}
    </button>
  );
}