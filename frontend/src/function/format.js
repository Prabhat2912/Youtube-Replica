export function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  return `${Math.floor(mo / 12)} year${mo < 24 ? "" : "s"} ago`;
}

export function fmtDuration(input) {
  const total = typeof input === "number" ? Math.floor(input) : 0;
  if (!total || total < 0) return "";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const isObjectId = (v) => /^[a-f\d]{24}$/i.test(String(v || ""));

export function isApiId(v) {
  return isObjectId(v);
}

// Normalize every backend video shape (feed, liked, history, by-id)
// into the card shape the UI renders. Tolerates populated or bare owner.
export function toCard(v) {
  const owner = v?.owner && typeof v.owner === "object" ? v.owner : null;
  const name = owner?.fullName || owner?.username || "Unknown channel";
  return {
    id: String(v?._id || v?.id || Math.random()),
    thumbnail: v?.thumbnail || "",
    title: v?.title || "Untitled premiere",
    channel: name,
    handle: owner?.username ? `@${owner.username}` : "",
    ownerId: owner?._id ? String(owner._id) : (typeof v?.owner === "string" ? v.owner : ""),
    description: v?.description || "",
    avatar:
      owner?.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    views: Number(v?.views || 0),
    age: timeAgo(v?.createdAt),
    duration: fmtDuration(v?.duration),
    videoLink: `/video/${v?._id || v?.id || ""}`,
    createdAt: v?.createdAt,
  };
}
