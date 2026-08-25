import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyPosts } from "@/lib/data/posts";
import { getAllTags, getMyTags } from "@/lib/data/tags";
import { getComments } from "@/lib/data/interactions";
import { NewRecord } from "@/components/new-records";
import { PostCard } from "@/components/post-card";
import { TagFilter } from "@/components/tag-filter";

export default async function MyJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/my-journey");

  const { tags: tagsParam } = await searchParams;
  const selectedTagIds = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  const [allTags, myTags, posts] = await Promise.all([
    getAllTags(),
    getMyTags(user.id),
    getMyPosts(user.id, selectedTagIds.length > 0 ? selectedTagIds : undefined),
  ]);

  // See DEFERRED.md — this fetches comments for collapsed sections too.
  const commentsByPost = Object.fromEntries(
    await Promise.all(
      posts.map(async (p) => [p.id, await getComments(p.id)] as const)
    )
  );

  return (
    <div className="mx-auto max-w-[680px] space-y-5 px-8 py-10">
      <NewRecord tags={allTags} />

      <TagFilter tags={myTags} selectedIds={selectedTagIds} />

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {selectedTagIds.length > 0
            ? "No posts with these tags."
            : "No posts yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}