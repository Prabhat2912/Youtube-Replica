import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiUpload, FiPlay, FiFolder, FiThumbsUp } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { formatViews } from "../../components/VideoCard/videoCard";
import { usePageMeta } from "../../function/pageMeta";

const Dashboard = () => {
  const authState = useSelector(selectAuth);
  const name = authState.user?.fullName || authState.user?.username || "Creator";
  const userId = authState.user?._id;
  usePageMeta("Creator dashboard", "Your PlayTube channel stats, uploads and playlists at a glance.");

  const [uploads, setUploads] = useState([]);
  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setError("Log in again to load your dashboard.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const [mine, liked, playlists] = await Promise.all([
        feedApi.videos({ userId, limit: 24, sortBy: "createdAt", sortType: "desc" }),
        feedApi.likedVideos().catch(() => []),
        feedApi.playlists(userId).catch(() => []),
      ]);
      setUploads(Array.isArray(mine) ? mine.map(toCard) : []);
      setLikedCount(Array.isArray(liked) ? liked.length : 0);
      setPlaylistCount(Array.isArray(playlists) ? playlists.length : 0);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load your dashboard."));
      setStatus("error");
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalViews = uploads.reduce((s, v) => s + (v.views || 0), 0);
  const stats = [
    { icon: <FiPlay />, label: "Total views", value: formatViews(totalViews).replace(" views", "") || "0" },
    { icon: <FiThumbsUp />, label: "Applauded", value: String(likedCount) },
    { icon: <FiFolder />, label: "Collections", value: String(playlistCount) },
    { icon: <FiUpload />, label: "Premieres", value: String(uploads.length) },
  ];

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Curtain up, {name}</h1>
      <p className="mt-1 text-sm text-zinc-500">Your channel, counted live from the network.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-panel p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember/10 text-ember">{s.icon}</span>
            <p className="mt-3 text-2xl font-black tabular-nums tracking-tight text-zinc-100">
              {status === "loading" ? "…" : s.value}
            </p>
            <p className="text-[13px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-black tracking-tight text-zinc-100">Your premieres</h2>
        <button className="inline-flex h-10 items-center gap-2 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright">
          <FiUpload /> New premiere
        </button>
      </div>
      <div className="mt-4">
        {status === "loading" ? (
          <CardsSkeleton count={4} />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={load} />
        ) : uploads.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uploads.map((v) => (
              <VideoCard key={v.id} data={v} />
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="No premieres yet"
            hint="Publish your first video and it lands here with live view counts."
            actionTo="/library"
            actionLabel="Browse collections"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
