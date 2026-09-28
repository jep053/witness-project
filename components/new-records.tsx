"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import { createPost } from "@/app/actions/posts";
import {
  MAX_TAGS_PER_POST,
  normalizeTagName,
  validateTagName,
} from "@/lib/validation/tags";
import type { Tag } from "@/lib/types";

export function NewRecord({ tags }: { tags: Tag[] }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  // Names typed via "+ new tag". They live only in this component until the
  // post is submitted — nothing is written to the tags table before that, so
  // cancelling can't leave a ghost tag behind.
  const [pendingNames, setPendingNames] = useState<string[]>([]);
  const [newTagDraft, setNewTagDraft] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const selected = tags.filter((t) => selectedTagIds.includes(t.id));
  const unselected = tags.filter((t) => !selectedTagIds.includes(t.id));
  const tagCount = selected.length + pendingNames.length;

  const reset = () => {
    setExpanded(false);
    setContent("");
    setSelectedTagIds([]);
    setPendingNames([]);
    setNewTagDraft("");
    setIsHidden(false);
    setError(null);
  };

  const selectExistingTag = (id: string) => {
    if (tagCount >= MAX_TAGS_PER_POST) {
      setError(`You can add at most ${MAX_TAGS_PER_POST} tags.`);
      return;
    }
    setError(null);
    setSelectedTagIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const addPendingTag = () => {
    const name = normalizeTagName(newTagDraft);
    if (!name) return;

    const problem = validateTagName(name);
    if (problem) {
      setError(problem);
      return;
    }

    // Typed the name of a tag that already exists → select that one instead
    // of queuing a duplicate.
    const existing = tags.find((t) => normalizeTagName(t.name) === name);
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) selectExistingTag(existing.id);
      setNewTagDraft("");
      return;
    }

    if (pendingNames.includes(name)) {
      setNewTagDraft("");
      return;
    }

    if (tagCount >= MAX_TAGS_PER_POST) {
      setError(`You can add at most ${MAX_TAGS_PER_POST} tags.`);
      return;
    }

    setError(null);
    setPendingNames((prev) => [...prev, name]);
    setNewTagDraft("");
  };

  const submit = () => {
    setError(null);
    const tagNames = [...selected.map((t) => t.name), ...pendingNames];

    startTransition(async () => {
      const result = await createPost(content, tagNames, isHidden, pathname);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      reset();
    });
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-5 text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
      >
        <Plus size={15} />
        New Record — write today&apos;s post
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-card">
      <div className="space-y-4 p-5">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How was today?"
          aria-label="Post text"
          rows={4}
          disabled={isPending}
          className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((tag) => (
              <button
                key={tag.id}
                onClick={() =>
                  setSelectedTagIds((prev) => prev.filter((id) => id !== tag.id))
                }
                aria-label={`Remove tag ${tag.name}`}
                className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs text-primary-foreground"
              >
                {tag.name}
                <X size={10} />
              </button>
            ))}

            {pendingNames.map((name) => (
              <button
                key={`pending-${name}`}
                onClick={() =>
                  setPendingNames((prev) => prev.filter((n) => n !== name))
                }
                aria-label={`Remove new tag ${name}`}
                className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs text-primary-foreground"
              >
                {name}
                <X size={10} />
              </button>
            ))}

            {unselected.map((tag) => (
              <button
                key={tag.id}
                onClick={() => selectExistingTag(tag.id)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {tag.name}
              </button>
            ))}

            <input
              value={newTagDraft}
              onChange={(e) => setNewTagDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter while a Korean/Japanese/Chinese IME is composing
                // confirms the composition — it isn't "add this tag" yet.
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addPendingTag();
                }
              }}
              placeholder="+ new tag"
              aria-label="Create a new tag"
              className="w-24 rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <button
            onClick={() => setIsHidden((v) => !v)}
            aria-pressed={isHidden}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              isHidden
                ? "border-foreground/40 bg-foreground/5 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/25"
            }`}
          >
            {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            Only me
          </button>

          <div className="flex gap-2">
            <button
              onClick={reset}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!content.trim() || isPending}
              className="rounded-lg bg-foreground px-4 py-2 text-xs text-primary-foreground transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}