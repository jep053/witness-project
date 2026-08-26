import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, getProfileAccess } from "@/lib/data/users";
import { getFollowBetween, getFollowers, getFollowing } from "@/lib/data/follows";
import {
  getActiveGoals,
  getPlannedGoals,
  getBonfireBrightness,
  getBrightnessTier,
  getGoalTiers,
} from "@/lib/data/goals";
import { ProfileView } from "@/components/profile-view";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [viewer, profile] = await Promise.all([
    getCurrentUser(),
    getUserByUsername(username),
  ]);

  if (!profile) notFound();

  const viewerId = viewer?.id ?? null;
  const access = await getProfileAccess(profile, viewerId);
  const isSelf = access === "self";

  if (access === "locked_private" || access === "locked_followers") {
    const follow = viewerId
      ? await getFollowBetween(viewerId, profile.id)
      : null;

    return (
      <ProfileView
        profile={profile}
        isSelf={false}
        followStatus={follow?.status ?? null}
        lockedReason={access === "locked_private" ? "private" : "followers"}
      />
    );
  }

  const [activeGoals, brightness, goalTiers] = await Promise.all([
    getActiveGoals(profile.id),
    getBonfireBrightness(profile.id),
    getGoalTiers(profile.id),
  ]);

  // Own profile gets planned goals and follow lists; visitors get neither.
  const [plannedGoals, followers, following, follow] = isSelf
    ? await Promise.all([
        getPlannedGoals(profile.id),
        getFollowers(profile.id),
        getFollowing(profile.id),
        Promise.resolve(null),
      ])
    : [[], [], [], viewerId ? await getFollowBetween(viewerId, profile.id) : null];

  return (
    <ProfileView
      profile={profile}
      isSelf={isSelf}
      followStatus={follow?.status ?? null}
      tier={getBrightnessTier(brightness)}
      activeGoals={activeGoals}
      goalTiers={isSelf ? Object.fromEntries(goalTiers) : {}}
      plannedGoals={plannedGoals}
      followers={followers}
      following={following}
    />
  );
}