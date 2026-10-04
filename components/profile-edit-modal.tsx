"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { updateProfile } from "@/app/actions/profile";
import { BIO_MAX, DISPLAY_NAME_MAX } from "@/lib/validation/profile";

export function ProfileEditModal({
  username,
  initialName,
  initialBio,
  onClose,
}: {
  username: string;
  initialName: string;
  initialBio: string;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const titleId = useId();
  const nameId = useId();
  const bioId = useId();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nameOver = name.length > DISPLAY_NAME_MAX;
  const bioOver = bio.length > BIO_MAX;
  // Name is optional: users.display_name is nullable, and the server turns an
  // empty value into NULL.
  const canSave = !nameOver && !bioOver && !isPending;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (!canSave) return;
    setError(null);

    startTransition(async () => {
      const result = await updateProfile(name, bio, pathname);
      if ("error" in result) {
        setError(result.error);
        return; // stay open so nothing the user typed is lost
      }
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(28,25,23,0.38)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mx-4 flex w-full flex-col rounded-2xl border border-border bg-card shadow-xl"
        style={{ maxWidth: 480, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 id={titleId} className="font-serif text-base font-semibold italic">
            Edit profile
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Avatar preview — read-only. Uses the real Avatar so it matches
              what appears everywhere else (initial + color from username). */}
          <div className="flex justify-center">
            <Avatar name={username} size={64} />
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={nameId}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Name
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  nameOver ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {name.length}/{DISPLAY_NAME_MAX}
              </span>
            </div>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              disabled={isPending}
              className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors ${
                nameOver
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-foreground/40"
              }`}
            />
            {nameOver && (
              <p className="text-[11px] text-destructive">
                Name can be at most {DISPLAY_NAME_MAX} characters.
              </p>
            )}
          </div>

          {/* Bio field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={bioId}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Bio
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  bioOver ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              id={bioId}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A line about yourself"
              rows={4}
              disabled={isPending}
              className={`w-full resize-none rounded-lg border bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors ${
                bioOver
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-foreground/40"
              }`}
            />
            {bioOver && (
              <p className="text-[11px] text-destructive">
                Bio can be at most {BIO_MAX} characters.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              canSave
                ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}