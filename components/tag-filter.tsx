"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TagChip } from "@/components/tag-chip";
import type { Tag } from "@/lib/types";

/** Multi-select with OR logic — a post matches if it carries any selected tag. */
export function TagFilter({
  tags,
  selectedIds,
}: {
  tags: Tag[];
  selectedIds: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggle = (tagId: string) => {
    const next = selectedIds.includes(tagId)
      ? selectedIds.filter((id) => id !== tagId)
      : [...selectedIds, tagId];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("tags", next.join(","));
    } else {
      params.delete("tags");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {selectedIds.length > 0 && (
        <TagChip label="All" onClick={() => router.push(pathname)} />
      )}
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          label={tag.name}
          active={selectedIds.includes(tag.id)}
          onClick={() => toggle(tag.id)}
        />
      ))}
    </div>
  );
}