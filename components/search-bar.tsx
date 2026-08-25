"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  // Submitted rather than live-filtered: the query lives in the URL, and
  // pushing a route on every keystroke would flood the history stack.
  const submit = () => {
    const trimmed = value.trim();
    router.push(trimmed ? `/others?q=${encodeURIComponent(trimmed)}` : "/others");
  };

  const clear = () => {
    setValue("");
    router.push("/others");
  };

  return (
    <div className="relative">
      <Search
        size={14}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Search tags and users..."
        aria-label="Search tags and users"
        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
      />
      {value && (
        <button
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}