import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { TagChip } from "@/components/tag-chip";
import type { Tag, User } from "@/lib/types";

export function SearchResults({ tags, users }: { tags: Tag[]; users: User[] }) {
  if (tags.length === 0 && users.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No results.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {tags.length > 0 && (
        <section>
          <h2 className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                label={tag.name}
                href={`/others?tags=${tag.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {users.length > 0 && (
        <section>
          <h2 className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Users
          </h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.username}`}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <Avatar name={user.username} size={26} />
                  <span className="text-sm font-medium">{user.username}</span>
                  <ChevronRight
                    size={13}
                    className="ml-auto text-muted-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}