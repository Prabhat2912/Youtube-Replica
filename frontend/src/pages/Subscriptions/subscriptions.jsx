import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { usePageMeta } from "../../function/pageMeta";

const Subscriptions = () => {
  const { user } = useSelector(selectAuth);
  const [channels, setChannels] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  usePageMeta("Subscriptions", "Channels you follow on PlayTube.");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const id = user?._id || JSON.parse(localStorage.getItem("user") || "{}")?._id;
      if (!id) throw new Error("Log in again to load your subscriptions.");
      const data = await feedApi.subscriptions(id);
      const rows = Array.isArray(data?.subscribedTo) ? data.subscribedTo : [];
      setChannels(rows.map((r) => r.channel).filter(Boolean));
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load your subscriptions."));
      setStatus("error");
    }
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const unfollow = async (channelId) => {
    setBusy(channelId);
    try {
      await feedApi.toggleSubscription(channelId);
      setChannels((cs) => cs.filter((c) => String(c._id) !== String(channelId)));
    } catch (err) {
      setError(serverMessage(err, "Could not update that subscription."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Subscriptions</h1>
      <p className="mt-1 text-sm text-zinc-500">Rooms you never want to miss.</p>
      <div className="mt-5">
        {status === "loading" ? (
          <CardsSkeleton count={4} />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={load} />
        ) : channels.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((c) => (
              <li key={c._id} className="flex items-center gap-4 rounded-3xl border border-line bg-panel p-5">
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.fullName || c.username || "?")}`}
                  alt={c.fullName || c.username}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-zinc-100">{c.fullName || c.username}</p>
                  <p className="truncate text-sm text-zinc-500">@{c.username}</p>
                </div>
                <button
                  onClick={() => unfollow(c._id)}
                  disabled={busy === c._id}
                  className="h-9 shrink-0 rounded-full border border-line px-4 text-sm font-bold text-zinc-300 hover:border-ember/60 hover:text-ember disabled:opacity-50"
                >
                  {busy === c._id ? "…" : "Unfollow"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <FeedEmpty
            title="An empty balcony"
            hint="Follow a channel from any premiere and new drops from your rooms land here."
            actionTo="/home"
            actionLabel="Find rooms to follow"
          />
        )}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Looking for your saves? <Link to="/liked" className="font-bold text-ember">Open applauded</Link>
      </p>
    </div>
  );
};

export default Subscriptions;
