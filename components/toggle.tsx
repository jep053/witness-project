"use client";

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** What this switch controls — the visible row label doesn't reach the button. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative flex-shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 ${
        checked ? "bg-foreground" : "bg-muted"
      }`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-200"
        style={{
          width: 16,
          height: 16,
          top: 3,
          left: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transform: checked ? "translateX(18px)" : "translateX(0px)",
        }}
      />
    </button>
  );
}