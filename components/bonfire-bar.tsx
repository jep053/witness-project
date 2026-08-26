import type { BrightnessTier } from "@/lib/types";

/**
 * Four stacked segments, brightest at the top, with the flame marking the
 * current tier. Placeholder visual — see DEFERRED.md for the intended
 * burning-fire treatment. The 1–4 contract stays either way.
 */
const SEGMENTS: { tier: BrightnessTier; color: string; label: string }[] = [
  { tier: 4, color: "#C84B11", label: "high" },
  { tier: 3, color: "#E07A40", label: "mid" },
  { tier: 2, color: "#F0B08C", label: "low" },
  { tier: 1, color: "#DDD8D0", label: "off" },
];

export function BonfireBar({ tier }: { tier: BrightnessTier }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-border/50"
      style={{ minHeight: 300 }}
      role="img"
      aria-label={`Bonfire brightness: tier ${tier} of 4`}
    >
      {SEGMENTS.map((segment) => (
        <div
          key={segment.label}
          className="flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-500"
          style={{ backgroundColor: segment.color }}
        >
          {tier === segment.tier && (
            <span className="text-lg leading-none" aria-hidden="true">
              🔥
            </span>
          )}
          <span
            className="text-[10px] font-medium"
            style={{
              color:
                segment.tier >= 3
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(100,75,60,0.7)",
            }}
          >
            {segment.label}
          </span>
        </div>
      ))}
    </div>
  );
}