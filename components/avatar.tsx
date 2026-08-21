// Initial-and-color avatar. Image support (users.avatar_url) is deferred
// until the write path lands — see Phase 6.

const AVATAR_COLORS = [
  "#C84B11", // brand orange
  "#B0764A",
  "#8C7B6B",
  "#A3906F",
  "#9C6B4F",
  "#7D8471",
  "#B08968",
];

/** Deterministic color from the username, so a user always looks the same. */
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 select-none items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: getAvatarColor(name),
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}