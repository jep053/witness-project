import type { Goal, BrightnessTier } from "@/lib/types";

export function GoalCard({
  goal,
  tier,
  showActivate,
}: {
  goal: Goal;
  /** Omitted on other people's profiles — titles are shared, progress isn't. */
  tier?: BrightnessTier;
  showActivate?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5 transition-shadow hover:shadow-[0_2px_10px_rgba(28,25,23,0.06)]">
      <p className="mb-1.5 text-sm font-medium text-foreground">{goal.title}</p>

      {tier !== undefined && (
        <div
          className="flex gap-0.5"
          role="img"
          aria-label={`Brightness tier ${tier} of 4`}
        >
          {Array.from({ length: tier }).map((_, i) => (
            <span key={i} className="text-sm" aria-hidden="true">
              🔥
            </span>
          ))}
        </div>
      )}

      {showActivate && (
        // NOT IMPLEMENTED — writes goals.status and cadence, lands in Phase 6.
        <button
          disabled
          className="mt-2.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground disabled:opacity-40"
        >
          Activate
        </button>
      )}
    </div>
  );
}