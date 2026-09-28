import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiThumbsUp, FiThumbsDown, FiShare2, FiBookmark, FiCheck } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedError } from "../../components/FeedStates/FeedStates";
import { videos } from "../../data/videos";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard, isApiId, timeAgo } from "../../function/format";
import { usePageMeta, useJsonLd } from "../../function/pageMeta";

const comments = [
  { name: "Mara K.", time: "3 hours ago", text: "The pacing on this one is perfect — watched it twice.", likes: 214 },
  { name: "Devon A.", time: "1 day ago", text: "That transition at the halfway mark deserves its own tutorial.", likes: 96 },
  { name: "Priya S.", time: "2 days ago", text: "Came for the thumbnail, stayed for the editing. Subscribed.", likes: 41 },
];

const VideoPlayer = () => {
  const { id } = useParams();
  const { isLogin } = useSelector(selectAuth);
  const apiMode = isApiId(id);

  // Catalog entries (guests) vs real network premieres (members).
  const mock = !apiMode
    ? videos[(Number(id) - 1 + videos.length) % videos.length] || videos[0]
    : null;

  const [live, setLive] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(apiMode ? "loading" : "idle");
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(null);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [draft, setDraft] = useState("");
  const [list, setList] = useState(comments);

  useEffect(() => {
    if (!apiMode) return;
    if (!isLogin) {
      setStatus("locked");
      return;
    }
    let live = true;
    setStatus("loading");
    feedApi
      .videoById(id)
      .then((data) => {
        if (!live) return;
        setLive(toCard(data));
        setFile(data?.videoFile || null);
        setStatus("idle");
      })
      .catch((err) => {
        if (!live) return;
        setError(serverMessage(err, "Could not load this premiere."));
        setStatus("error");
      });
    return () => {
      live = false;
    };
  }, [apiMode, id, isLogin]);

  const current = live || mock;

  usePageMeta(
    current?.title || "Watch",
    current ? `Watch ${current.title} by ${current.channel} on PlayTube.` : "Watch on PlayTube."
  );
  useJsonLd(
    "video-jsonld",
    current
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: current.title,
          description: `${current.title} by ${current.channel} on PlayTube.`,
          thumbnailUrl: [current.thumbnail],
          uploadDate: (current.createdAt || new Date().toISOString()).slice(0, 10),
          duration: current.duration,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WatchAction",
            userInteractionCount: current.views,
          },
        }
      : null
  );

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch { /* clipboard unavailable — still show feedback */ }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const post = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setList([{ name: "You", time: "just now", text: draft.trim(), likes: 0 }, ...list]);
    setDraft("");
  };

  if (status === "loading") {
    return (
      <div className="w-full bg-void px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="w-full bg-void px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-panel p-8 text-center">
          <p className="font-display text-xl font-bold text-zinc-100">Members-only premiere</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Log in to watch network premieres. Previews stay open to everyone.</p>
          <Link to="/login" className="mt-5 block rounded-xl bg-ember py-3 text-sm font-bold text-white hover:bg-ember-bright">
            Log in to watch
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error" || !current) {
    return (
      <div className="w-full bg-void px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <FeedError message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto bg-void">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-card">
            {file ? (
              <video src={file} poster={current.thumbnail} controls preload="metadata" className="aspect-video w-full" />
            ) : (
              <img src={current.thumbnail} alt={current.title} className="aspect-video w-full object-cover" />
            )}
          </div>
          <h1 className="mt-4 text-balance font-display text-xl font-bold leading-7 tracking-tight text-zinc-100">{current.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <img src={current.avatar} alt={current.channel} className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-zinc-100">{current.channel}</p>
                <p className="text-[12.5px] text-zinc-500">
                  {apiMode ? timeAgo(current.createdAt) || current.age : `${formatViews(842000)} in the room`}
                </p>
              </div>
              <button className="ml-2 h-9 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright">
                Follow
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex h-10 items-center overflow-hidden rounded-full border border-line bg-panel">
                <button
                  onClick={() => setLiked(liked === "up" ? null : "up")}
                  aria-pressed={liked === "up"}
                  className={`flex h-full items-center gap-1.5 px-4 text-sm font-bold ${liked === "up" ? "text-ember" : "text-zinc-400 hover:text-zinc-100"}`}
                >
                  <FiThumbsUp /> 12K
                </button>
                <span className="h-5 w-px bg-line" />
                <button
                  onClick={() => setLiked(liked === "down" ? null : "down")}
                  aria-pressed={liked === "down"}
                  aria-label="Dislike"
                  className={`flex h-full items-center px-3.5 ${liked === "down" ? "text-ember" : "text-zinc-400 hover:text-zinc-100"}`}
                >
                  <FiThumbsDown />
                </button>
              </div>
              <button onClick={share} className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-panel px-4 text-sm font-bold text-zinc-300 hover:text-zinc-100">
                {shared ? <FiCheck className="text-ember" /> : <FiShare2 />} {shared ? "Copied" : "Share"}
              </button>
              <button
                onClick={() => setSaved((v) => !v)}
                aria-pressed={saved}
                className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold ${saved ? "border-ember/50 bg-ember/10 text-ember" : "border-line bg-panel text-zinc-300 hover:text-zinc-100"}`}
              >
                <FiBookmark /> {saved ? "Kept" : "Keep"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-panel p-4 text-sm leading-6 text-zinc-400">
            <p className="font-bold text-zinc-100">{formatViews(current.views)} · {current.age}</p>
            <p className="mt-1">A calm walkthrough with chapters below. Filmed on location, edited for quiet evenings — grab headphones for the middle section.</p>
          </div>

          <section className="mt-6" aria-label="Comments">
            <h2 className="text-base font-bold text-zinc-100">{list.length} reactions</h2>
            <form onSubmit={post} className="mt-3 flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember font-display text-sm font-black text-white">Y</span>
              <div className="flex-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Shout something nice…"
                  aria-label="Add a comment"
                  className="h-11 w-full rounded-xl border border-line bg-panel px-4 text-sm text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
                />
                {draft && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setDraft("")} className="h-9 rounded-full px-4 text-sm font-bold text-zinc-500 hover:bg-white/5">Cancel</button>
                    <button type="submit" className="h-9 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright">React</button>
                  </div>
                )}
              </div>
            </form>
            <ul className="mt-4 space-y-4">
              {list.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-panel text-sm font-bold text-zinc-300">{c.name[0]}</span>
                  <div>
                    <p className="text-[13px] text-zinc-500"><span className="font-bold text-zinc-200">{c.name}</span> {c.time}</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-300">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">Up next</h2>
          {videos.filter((v) => v.id !== current.id).slice(0, 6).map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
          <Link to="/home" className="block rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ember hover:border-ember/50">
            Back to the program
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default VideoPlayer;
