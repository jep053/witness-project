"use client";

import { useState } from "react";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import type { Tag } from "@/lib/types";

export function NewRecord({ tags }: { tags: Tag[] }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagDraft, setNewTagDraft] = useState("");
  const [isHidden, setIsHidden] = useState(false);

  const selected = tags.filter((t) => selectedTagIds.includes(t.id));
  const unselected = tags.filter((t) => !selectedTagIds.includes(t.id));

  const reset = () => {
    setExpanded(false);
    setContent("");
    setSelectedTagIds([]);
    setNewTagDraft("");
    setIsHidden(false);
  };

  const submit = () => {
    // NOT IMPLEMENTED — write path lands in Phase 6, after RLS.
    // Everything above this line works; only persistence is missing.
    alert("Posting isn't wired up yet.");
  };

  const createTag = () => {
    // NOT IMPLEMENTED — creating a tag is a write, same as posting.
    if (!newTagDraft.trim()) return;
    alert("Creating tags isn't wired up yet.");
    setNewTagDraft("");
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

            {unselected.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagIds((prev) => [...prev, tag.id])}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {tag.name}
              </button>
            ))}

            <input
              value={newTagDraft}
              onChange={(e) => setNewTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  createTag();
                }
              }}
              placeholder="+ new tag"
              aria-label="Create a new tag"
              className="w-24 rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-xs outline-none placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>
        </div>

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
              className="rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!content.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-xs text-primary-foreground transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}