"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { CandleButton } from "@/components/candle-button";
import { CommentButton } from "@/components/comment-button";
import { VisibilityLabel } from "@/components/visibility-label";
import type { PostWithMeta } from "@/lib/data/posts";
import type { User } from "@/lib/types";
import type { CommentWithAuthor } from "@/lib/data/interactions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PostCard({
  post,
  comments,
  author,
  isFollowing,
}: {
  post: PostWithMeta;
  comments: CommentWithAuthor[];
  /** Only passed on feeds showing other people's posts. */
  author?: Pick<User, "id" | "username">;
  isFollowing?: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  // TEMP: local-only, resets on refresh. See DEFERRED.md.
  const [lit, setLit] = useState(false);

  const submitComment = () => {
    // NOT IMPLEMENTED — write path lands in Phase 6, after RLS.
    alert("Commenting isn't wired up yet.");
  };

  const visibleTags = post.tags.slice(0, 2);
  const hiddenTagCount = post.tags.length - visibleTags.length;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-[0_2px_16px_rgba(28,25,23,0.06)]">
      {author && (
        <header className="flex items-center gap-2.5 border-b border-border/50 px-5 pb-3 pt-4">
          <Avatar name={author.username} size={26} />
          <span className="text-sm font-semibold">{author.username}</span>
          {isFollowing && (
            <span className="text-[11px] text-muted-foreground">following</span>
          )}
        </header>
      )}

      <div className="px-5 pb-4 pt-4">
        <div className="mb-2.5 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-muted-foreground">
              {formatDate(post.created_at)}
            </span>
            {post.tags.length > 0 && (
              <span className="text-muted-foreground">·</span>
            )}
            {visibleTags.map((tag) => (
              <span key={tag.id} className="font-semibold text-foreground">
                {tag.name}
              </span>
            ))}
            {hiddenTagCount > 0 && (
              <span className="text-muted-foreground">+{hiddenTagCount}</span>
            )}
          </div>
          <div className="flex-shrink-0 pt-0.5">
            <VisibilityLabel isHidden={post.is_hidden} />
          </div>
        </div>

        <p className="mb-3.5 text-sm leading-relaxed text-foreground">
          {post.content}
        </p>

        <div className="flex items-center gap-2">
          <CandleButton lit={lit} onClick={() => setLit((v) => !v)} />
          <CommentButton
            count={post.comment_count}
            open={commentsOpen}
            onClick={() => setCommentsOpen((v) => !v)}
          />
        </div>
      </div>

      {commentsOpen && (
        <div className="space-y-3 border-t border-border bg-muted/30 px-5 py-4">
          {comments.length > 0 && (
            <ul className="space-y-2.5">
              {comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-2.5">
                  <Avatar name={comment.author.username} size={22} />
                  <div>
                    <span className="mr-1.5 text-xs font-semibold text-foreground">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-foreground/75">
                      {comment.content}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 pt-1">
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Write a comment..."
              aria-label="Write a comment"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
            />
            <button
              onClick={submitComment}
              disabled={!commentDraft.trim()}
              className="whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs text-primary-foreground transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
}