import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLibrary,
  ensureSubs,
  toggleFollow,
} from "../../Redux/Features/Library/librarySlice";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { usePageMeta } from "../../function/pageMeta";

const Subscriptions = () => {
  const dispatch = useDispatch();
  const { list, updatedAt } = useSelector(selectLibrary).subs;
  const [error, setError] = useState(null);
  const loading = !updatedAt && !error && !list.length;
  usePageMeta("Subscriptions", "Channels you follow on PlayTube.");

  useEffect(() => {
    dispatch(ensureSubs()).unwrap().catch((e) => setError(e));
  }, [dispatch]);

  const channels = list.map((r) => r.channel).filter(Boolean);

  const unfollow = (channelId) => {
    dispatch(toggleFollow({ ownerId: channelId })).unwrap().catch((e) => setError(e?.error || e));
  };

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Subscriptions</h1>
      <p className="mt-1 text-sm text-zinc-500">Rooms you never want to miss.</p>
      <div className="mt-5">
        {loading ? (
          <CardsSkeleton count={4} />
        ) : error && !channels.length ? (
          <FeedError message={error} onRetry={() => dispatch(ensureSubs()).unwrap().then(() => setError(null)).catch((e) => setError(e))} />
        ) : channels.length ? (
          <>
            {!!error && (
              <p role="alert" className="mb-4 rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-bright">{error}</p>
            )}
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
                    className="h-9 shrink-0 rounded-full border border-line px-4 text-sm font-bold text-zinc-300 hover:border-ember/60 hover:text-ember"
                  >
                    Unfollow
                  </button>
                </li>
              ))}
            </ul>
          </>
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
