import { EyeOff } from "lucide-react";

/**
 * Per-post privacy indicator.
 *
 * Account-level `profile_visibility` is the master gate; a post can only
 * narrow it further via `is_hidden`. Posts that follow the account setting
 * get no label — repeating the account's visibility on every card would be
 * noise, and misleading if the account setting later changes.
 */
export function VisibilityLabel({ isHidden }: { isHidden: boolean }) {
  if (!isHidden) return null;

  return (
    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <EyeOff size={11} />
      Only me
    </span>
  );
}