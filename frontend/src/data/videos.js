// Synthetic catalog for local UI work. Replace with GET /api/v1/videos
// once the feed is wired. Thumbnails are placeholder photos.
export const categories = [
  "All",
  "Music",
  "Coding",
  "Design",
  "Travel",
  "Cooking",
  "Gaming",
  "Podcasts",
  "Live",
];

const pics = [
  "https://picsum.photos/seed/playtube1/640/360",
  "https://picsum.photos/seed/playtube2/640/360",
  "https://picsum.photos/seed/playtube3/640/360",
  "https://picsum.photos/seed/playtube4/640/360",
  "https://picsum.photos/seed/playtube5/640/360",
  "https://picsum.photos/seed/playtube6/640/360",
  "https://picsum.photos/seed/playtube7/640/360",
  "https://picsum.photos/seed/playtube8/640/360",
];

const channels = [
  { name: "Lumen Lab", handle: "@lumenlab" },
  { name: "Parallel Craft", handle: "@parallelcraft" },
  { name: "Field Notes", handle: "@fieldnotes" },
  { name: "Soft Systems", handle: "@softsystems" },
];

const titles = [
  "A calmer way to learn React in 2026",
  "I redesigned my desk setup for deep work",
  "Lo-fi beats for late night coding",
  "The hiking trail that broke my camera",
  "Five pasta shapes worth mastering",
  "Speedrunning my morning routine",
  "Designing empty states people forgive",
  "Tiny house tour: 28 square metres",
];

export const videos = titles.map((title, i) => ({
  id: `vid-${i + 1}`,
  thumbnail: pics[i % pics.length],
  title,
  channel: channels[i % channels.length].name,
  handle: channels[i % channels.length].handle,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    channels[i % channels.length].name
  )}`,
  views: [128000, 45200, 1024000, 8900, 230000, 67000, 312000, 15400][i],
  age: ["2 hours ago", "1 day ago", "3 days ago", "1 week ago"][i % 4],
  duration: ["12:04", "8:31", "1:04:12", "22:47", "15:09", "9:58", "31:20", "18:02"][i],
  category: ["Coding", "Design", "Music", "Travel", "Cooking", "Gaming", "Design", "Travel"][i],
  videoLink: `/video/${i + 1}`,
}));
