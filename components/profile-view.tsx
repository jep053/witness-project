"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { BonfireBar } from "@/components/bonfire-bar";
import { GoalCard } from "@/components/goal-card";
import { FollowButton } from "@/components/follow-button";
import { FollowersModal } from "@/components/followers-modal";
import { ProfileLocked } from "@/components/profile-locked";
import type { BrightnessTier, FollowStatus, Goal, User } from "@/lib/types";

export function ProfileView({
  profile,
  isSelf,
  followStatus,
  lockedReason,
  tier,
  activeGoals = [],
  goalTiers = {},
  plannedGoals = [],
  followers = [],
  following = [],
}: {
  profile: User;
  isSelf: boolean;
  followStatus: FollowStatus | null;
  lockedReason?: "followers" | "private";
  tier?: BrightnessTier;
  activeGoals?: Goal[];
  /** Empty on other people's profiles — titles are shared, progress isn't. */
  goalTiers?: Record<string, BrightnessTier>;
  plannedGoals?: Goal[];
  followers?: User[];
  following?: User[];
}) {
  const [tab, setTab] = useState<"active" | "planned">("active");
  const [openList, setOpenList] = useState<"followers" | "following" | null>(null);

  return (
    <div className="px-8 py-10">
      <div className="mb-8 flex max-w-3xl items-start gap-5">
        <Avatar name={profile.username} size={64} />

        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl font-bold italic leading-tight">
            {profile.username}
          </h1>

          {profile.bio && !lockedReason && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          {/* Own profile only — text links, never counts */}
          {isSelf && (
            <div className="mt-2 flex items-center gap-2.5">
              <button
                onClick={() => setOpenList("followers")}
                className="text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                Followers
              </button>
              <span className="text-[11px] text-muted-foreground/40">·</span>
              <button
                onClick={() => setOpenList("following")}
                className="text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                Following
              </button>
            </div>
          )}
        </div>

        {isSelf ? (
          // NOT IMPLEMENTED — profile editing is a write, lands in Phase 6.
          <button
            disabled
            className="flex-shrink-0 whitespace-nowrap rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Edit profile
          </button>
        ) : (
          <FollowButton status={followStatus} />
        )}
      </div>

      {lockedReason ? (
        <>
          <div className="max-w-3xl border-t border-border" />
          <ProfileLocked reason={lockedReason} />
        </>
      ) : (
        <div className="flex max-w-3xl gap-7">
          <div className="sticky top-8 w-20 flex-shrink-0 self-start">
            {tier !== undefined && <BonfireBar tier={tier} />}
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            {isSelf && (
              <div className="flex gap-2">
                {(["active", "planned"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    aria-pressed={tab === value}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-150 ${
                      tab === value
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {value === "active" ? "Active goals" : "Planned goals"}
                  </button>
                ))}
              </div>
            )}

            {(!isSelf || tab === "active") && (
              <GoalGrid
                goals={activeGoals}
                goalTiers={goalTiers}
                emptyText="No active goals."
              />
            )}

            {isSelf && tab === "planned" && (
              <GoalGrid
                goals={plannedGoals}
                showActivate
                emptyText="No planned goals."
              />
            )}

            {isSelf && (
              // NOT IMPLEMENTED — creating a goal is a write, lands in Phase 6.
              <button
                disabled
                className="w-full rounded-xl border-2 border-dashed border-border py-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                + Add goal
              </button>
            )}
          </div>
        </div>
      )}

      {openList && (
        <FollowersModal
          title={openList === "followers" ? "Followers" : "Following"}
          users={openList === "followers" ? followers : following}
          onClose={() => setOpenList(null)}
        />
      )}
    </div>
  );
}

function GoalGrid({
  goals,
  goalTiers,
  showActivate,
  emptyText,
}: {
  goals: Goal[];
  goalTiers?: Record<string, BrightnessTier>;
  showActivate?: boolean;
  emptyText: string;
}) {
  if (goals.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          tier={goalTiers?.[goal.id]}
          showActivate={showActivate}
        />
      ))}
    </div>
  );
}