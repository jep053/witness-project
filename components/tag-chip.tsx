"use client";

import Link from "next/link";

const BASE_CLASS =
  "inline-block whitespace-nowrap rounded-full border px-3 py-1 text-xs leading-5 transition-all duration-150";

function chipClass(active?: boolean) {
  return `${BASE_CLASS} ${
    active
      ? "border-foreground bg-foreground text-primary-foreground"
      : "border-border bg-transparent text-foreground hover:border-foreground/30"
  }`;
}

type TagChipProps = {
  label: string;
  active?: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick?: () => void }
);

/** Renders as a link when given `href`, otherwise as a toggle button. */
export function TagChip({ label, active, href, onClick }: TagChipProps) {
  if (href) {
    return (
      <Link href={href} className={chipClass(active)}>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} aria-pressed={active} className={chipClass(active)}>
      {label}
    </button>
  );
}