import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiThumbsUp } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { selectLibrary, fetchChannelRoom, toggleFollow } from "../../Redux/Features/Library/librarySlice";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { timeAgo } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Channel = () => {
  const { username } = useParams();
  const { isLogin, user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const cached = useSelector(selectLibrary).rooms[username];
  const subsList = useSelector(selectLibrary).subs.list;
  const room = cached?.room || null;
  const videos = cached?.videos || [];
  const shouts = cached?.shouts || [];
  const [error, setError] = useState(null);

  usePageMeta(
    room ? `${room.fullName} (@${room.username})` : "Channel",
    room ? `Premieres, shouts and rooms from ${room.fullName} on PlayTube.` : "Channel on PlayTube."
  );

  useEffect(() => {
    setError(null);
    dispatch(fetchChannelRoom({ username }))
      .unwrap()
      .catch((e) => setError(e));
  }, [dispatch, username]);

  const following = room?._id
    ? subsList.some((s) => String(s?.channel?._id || s?.channel) === String(room._id))
      || (Boolean(room.isSubscribed) && !subsList.length)
    : false;

  const toggle = () => {
    if (!room?._id) return;
    dispatch(toggleFollow({ ownerId: room._id }))
      .unwrap()
      .then(() => {
        dispatch(fetchChannelRoom({ username, force: true })).unwrap().catch(() => {});
      })
      .catch(() => {});
  };

  const ownRoom = isLogin && user?._id && room?._id && String(user._id) === String(room._id);

  return (
    <div className="w-full overflow-y-auto bg-void">
      {(!cached && !error) || (!cached && !room) ? (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="h-36 animate-pulse rounded-3xl bg-white/5 sm:h-44" />
          <div className="mt-4 h-8 w-64 animate-pulse rounded bg-white/5" />
          <div className="mt-6"><CardsSkeleton count={4} /></div>
        </div>
      ) : error || !room ? (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <FeedError message={error} onRetry={() => dispatch(fetchChannelRoom({ username, force: true })).unwrap().then(() => setError(null)).catch((e) => setError(e))} />
        </div>
      ) : (
        <>
          <div className="h-36 overflow-hidden bg-panel sm:h-48">
            {room.coverImage && <img src={room.coverImage} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="-mt-10 flex flex-wrap items-end gap-4">
              <img
                src={room.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(room.fullName || "?")}`}
                alt={room.fullName}
                className="h-20 w-20 rounded-full border-4 border-void object-cover"
              />
              <div className="pb-1">
                <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">{room.fullName}</h1>
                <p className="text-sm text-zinc-500">
                  @{room.username} · {(room.subscribersCount || 0).toLocaleString()} follower{(room.subscribersCount || 0) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mb-1 ml-auto">
                {ownRoom ? (
                  <Link to="/dashboard" className="inline-flex h-10 items-center rounded-full border border-line bg-panel px-5 text-sm font-bold text-zinc-200 hover:border-ember/50">
                    Manage room
                  </Link>
                ) : (
                  <button
                    onClick={toggle}
                    aria-pressed={following}
                    className={`h-10 rounded-full px-6 text-sm font-bold transition ${
                      following ? "border border-line text-zinc-300 hover:border-ember/50" : "bg-ember text-white hover:bg-ember-bright"
                    }`}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-10 pb-10 pt-8 lg:grid-cols-[1fr_320px]">
              <section aria-label="Premieres">
                <h2 className="font-display text-lg font-black tracking-tight text-zinc-100">Premieres</h2>
                {videos.length ? (
                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {videos.map((v) => (
                      <VideoCard key={v.id} data={v} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-line p-6 text-sm text-zinc-500">
                    No premieres in this room yet.
                  </p>
                )}
              </section>
              <aside aria-label="Shouts">
                <h2 className="font-display text-lg font-black tracking-tight text-zinc-100">Shouts</h2>
                {shouts.length ? (
                  <ul className="mt-4 space-y-3">
                    {shouts.map((t) => (
                      <li key={t._id} className="rounded-2xl border border-line bg-panel p-4">
                        <p className="text-sm leading-6 text-zinc-200">{t.content}</p>
                        <p className="mt-2 flex items-center gap-3 text-[12.5px] text-zinc-500">
                          <span>{timeAgo(t.createdAt)}</span>
                          <span className="inline-flex items-center gap-1 font-bold"><FiThumbsUp size={12} /> {t.likesCount || 0}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-2xl border border-dashed border-line p-6 text-sm text-zinc-500">
                    Quiet backstage — no shouts yet.
                  </p>
                )}
                <Link to="/shouts" className="mt-4 block rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ember hover:border-ember/50">
                  Open the shoutbox
                </Link>
              </aside>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Channel;
