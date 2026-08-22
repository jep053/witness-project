"use client";

export function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs leading-5 transition-all duration-150 ${
        active
          ? "border-foreground bg-foreground text-primary-foreground"
          : "border-border bg-transparent text-foreground hover:border-foreground/30"
      }`}
    >
      {label}
    </button>
  );
}