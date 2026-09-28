import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiThumbsUp, FiThumbsDown, FiShare2, FiBookmark, FiCheck } from "react-icons/fi";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { videos } from "../../data/videos";

const comments = [
  { name: "Mara K.", time: "3 hours ago", text: "The pacing on this one is perfect — watched it twice.", likes: 214 },
  { name: "Devon A.", time: "1 day ago", text: "That transition at the halfway mark deserves its own tutorial.", likes: 96 },
  { name: "Priya S.", time: "2 days ago", text: "Came for the thumbnail, stayed for the editing. Subscribed.", likes: 41 },
];

const VideoPlayer = () => {
  const { id } = useParams();
  const current = videos[(Number(id) - 1 + videos.length) % videos.length] || videos[0];
  const [liked, setLiked] = useState(null);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [draft, setDraft] = useState("");
  const [list, setList] = useState(comments);

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

  return (
    <div className="w-full overflow-y-auto bg-stone-50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-card">
            <img src={current.thumbnail} alt={current.title} className="aspect-video w-full object-cover" />
          </div>
          <h1 className="mt-4 text-balance text-xl font-bold leading-7 tracking-tight">{current.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <img src={current.avatar} alt={current.channel} className="h-10 w-10 rounded-full bg-slate-200" />
              <div>
                <p className="text-sm font-semibold">{current.channel}</p>
                <p className="text-[12.5px] text-slate-500">{formatViews(842000)} subscribers</p>
              </div>
              <button className="ml-2 h-9 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700">
                Subscribe
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex h-10 items-center overflow-hidden rounded-full bg-white shadow-card">
                <button
                  onClick={() => setLiked(liked === "up" ? null : "up")}
                  aria-pressed={liked === "up"}
                  className={`flex h-full items-center gap-1.5 px-4 text-sm font-semibold ${liked === "up" ? "text-orange-600" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <FiThumbsUp /> 12K
                </button>
                <span className="h-5 w-px bg-slate-200" />
                <button
                  onClick={() => setLiked(liked === "down" ? null : "down")}
                  aria-pressed={liked === "down"}
                  aria-label="Dislike"
                  className={`flex h-full items-center px-3.5 ${liked === "down" ? "text-orange-600" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <FiThumbsDown />
                </button>
              </div>
              <button onClick={share} className="flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-slate-600 shadow-card hover:text-slate-900">
                {shared ? <FiCheck className="text-orange-600" /> : <FiShare2 />} {shared ? "Copied" : "Share"}
              </button>
              <button
                onClick={() => setSaved((v) => !v)}
                aria-pressed={saved}
                className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold shadow-card ${saved ? "bg-orange-50 text-orange-700" : "bg-white text-slate-600 hover:text-slate-900"}`}
              >
                <FiBookmark /> {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 shadow-card">
            <p className="font-semibold text-slate-900">{formatViews(current.views)} · {current.age}</p>
            <p className="mt-1">A calm walkthrough with chapters below. Filmed on location, edited for quiet evenings — grab headphones for the middle section.</p>
          </div>

          <section className="mt-6" aria-label="Comments">
            <h2 className="text-base font-bold">{list.length} comments</h2>
            <form onSubmit={post} className="mt-3 flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">Y</span>
              <div className="flex-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment…"
                  aria-label="Add a comment"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                {draft && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setDraft("")} className="h-9 rounded-full px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
                    <button type="submit" className="h-9 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-500">Comment</button>
                  </div>
                )}
              </div>
            </form>
            <ul className="mt-4 space-y-4">
              {list.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">{c.name[0]}</span>
                  <div>
                    <p className="text-[13px]"><span className="font-semibold">{c.name}</span> <span className="text-slate-500">{c.time}</span></p>
                    <p className="mt-0.5 text-sm leading-6">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Up next</h2>
          {videos.filter((v) => v.id !== current.id).slice(0, 6).map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
          <Link to="/home" className="block rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-orange-600 shadow-card hover:text-orange-500">
            Back to feed
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default VideoPlayer;
