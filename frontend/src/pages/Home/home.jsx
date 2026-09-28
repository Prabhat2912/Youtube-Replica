import React, { useCallback, useEffect, useState } from "react";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Home = () => {
  const [live, setLive] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  usePageMeta("Home feed", "Fresh premieres from across the PlayTube network.");

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
    load();
  }, [load]);

  return (
    <div className="w-full overflow-y-auto bg-void">
      <h1 className="sr-only">PlayTube screening room — fresh premieres</h1>
      <div className="px-4 pb-10 pt-5 sm:px-6">
        {status === "loading" ? (
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
            actionTo="/upload"
            actionLabel="Premiere a video"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
