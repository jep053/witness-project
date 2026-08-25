import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/data/posts";
import { getAllTags, searchTags } from "@/lib/data/tags";
import { searchUsers } from "@/lib/data/users";
import { getComments } from "@/lib/data/interactions";
import { PostCard } from "@/components/post-card";
import { TagFilter } from "@/components/tag-filter";
import { SearchBar } from "@/components/search-bar";
import { SearchResults } from "@/components/search-results";

export default async function OthersPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; q?: string }>;
}) {
  // Guests are allowed here — viewerId stays null and only public posts show.
  const user = await getCurrentUser();
  const viewerId = user?.id ?? null;

  const { tags: tagsParam, q } = await searchParams;
  const query = q?.trim() ?? "";
  const selectedTagIds = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

  // Searching replaces the filter and feed rather than layering over them.
  if (query) {
    const [tags, users] = await Promise.all([
      searchTags(query),
      searchUsers(query, viewerId),
    ]);

    return (
      <div className="mx-auto max-w-[680px] space-y-5 px-8 py-10">
        <SearchBar defaultValue={query} />
        <SearchResults tags={tags} users={users} />
      </div>
    );
  }

  const [allTags, posts] = await Promise.all([
    getAllTags(),
    getFeedPosts(viewerId, selectedTagIds.length > 0 ? selectedTagIds : undefined),
  ]);

  const commentsByPost = Object.fromEntries(
    await Promise.all(
      posts.map(async (p) => [p.id, await getComments(p.id)] as const)
    )
  );

  return (
    <div className="mx-auto max-w-[680px] space-y-5 px-8 py-10">
      <SearchBar />

      <TagFilter tags={allTags} selectedIds={selectedTagIds} />

      {posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {selectedTagIds.length > 0
            ? "No posts with these tags."
            : "No posts to show yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              comments={commentsByPost[post.id] ?? []}
              author={post.author}
              isFollowing={post.viewer_follows_author}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border-2 border-dashed border-border">
        <button
          disabled
          className="w-full py-4 text-sm text-muted-foreground disabled:opacity-50"
        >
          more posts...
        </button>
      </div>
    </div>
  );
}