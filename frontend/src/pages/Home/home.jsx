import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { videos as catalog, categories } from "../../data/videos";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Home = () => {
  const { isLogin } = useSelector(selectAuth);
  const [active, setActive] = useState("All");
  const [live, setLive] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error (logged-in only)
  const [error, setError] = useState(null);

  usePageMeta("Home feed", "Browse trending videos across music, coding, design, travel and more on PlayTube.");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await feedApi.videos({ limit: 24, sortBy: "createdAt", sortType: "desc" });
      setLive(Array.isArray(data) ? data.map(toCard) : []);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load the feed."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (isLogin) load();
  }, [isLogin, load]);

  // Guests see the preview catalog (the video API needs a login).
  // Logged-in members only ever see their real network feed.
  const guestList = useMemo(
    () => (active === "All" ? catalog : catalog.filter((v) => v.category === active)),
    [active]
  );

  return (
    <div className="w-full overflow-y-auto bg-void">
      <h1 className="sr-only">PlayTube screening room — trending videos</h1>

      {!isLogin && (
        <div className="scroll-hidden sticky top-0 z-10 flex gap-2 overflow-x-auto bg-void/95 px-4 py-3 backdrop-blur sm:px-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                active === c
                  ? "bg-ember text-white"
                  : "border border-line bg-panel text-zinc-400 hover:border-zinc-600 hover:text-zinc-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-10 pt-4 sm:px-6">
        {isLogin ? (
          status === "loading" ? (
            <CardsSkeleton />
          ) : status === "error" ? (
            <FeedError message={error} onRetry={load} />
          ) : live.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {live.map((video) => (
                <VideoCard key={video.id} data={video} />
              ))}
            </div>
          ) : (
            <FeedEmpty
              title="A blank marquee"
              hint="Nobody on the network has premiered anything yet. Yours could be first."
              actionTo="/dashboard"
              actionLabel="Premiere a video"
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(guestList.length ? guestList : catalog).map((video) => (
              <VideoCard key={video.id} data={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
