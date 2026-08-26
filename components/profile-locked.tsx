import { Lock } from "lucide-react";

export function ProfileLocked({ reason }: { reason: "followers" | "private" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Lock size={32} className="mb-2 text-muted-foreground/50" aria-hidden="true" />
      {reason === "followers" ? (
        <>
          <p className="text-sm font-medium text-foreground">
            This profile is visible to followers only
          </p>
          <p className="text-xs text-muted-foreground">
            Once your follow request is accepted, you&apos;ll see it here.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            This profile is private
          </p>
          <p className="text-xs text-muted-foreground">
            This account keeps their records to themselves.
          </p>
        </>
      )}
    </div>
  );
}