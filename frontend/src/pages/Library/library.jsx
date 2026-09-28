import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const shell = "w-full overflow-y-auto bg-void px-4 py-6 sm:px-6";

function useLibraryList(fetcher) {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetcher();
      setList(Array.isArray(data) ? data : []);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load this."));
      setStatus("error");
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { list, status, error, load, setList };
}

export const Liked = () => {
  usePageMeta("Liked premieres", "Every PlayTube video you applauded, in one place.");
  const { list, status, error, load } = useLibraryList(async () => {
    const data = await feedApi.likedVideos();
    return data.map(toCard);
  });

  return (
    <div className={shell}>
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Applauded</h1>
      <p className="mt-1 text-sm text-zinc-500">Every premiere you reacted to.</p>
      <div className="mt-5">
        {status === "loading" ? (
          <CardsSkeleton />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={load} />
        ) : list.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((v) => (
              <VideoCard key={v.id} data={v} />
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="No applause yet"
            hint="Tap the thumbs-up on any premiere and it lands here."
            actionTo="/home"
            actionLabel="Find something good"
          />
        )}
      </div>
    </div>
  );
};

export const Library = () => {
  usePageMeta("Collections", "Your PlayTube collections and saved premieres.");
  const { list, status, error, load } = useLibraryList(async () => {
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id;
    if (!userId) throw new Error("Log in again to load your collections.");
    return feedApi.playlists(userId);
  });

  return (
    <div className={shell}>
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Collections</h1>
      <p className="mt-1 text-sm text-zinc-500">Playlists you built for every mood.</p>
      <div className="mt-5">
        {status === "loading" ? (
          <CardsSkeleton count={4} />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={load} />
        ) : list.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <div key={p._id} className="rounded-3xl border border-line bg-panel p-6">
                <p className="font-display text-lg font-bold text-zinc-100">{p.name || "Untitled collection"}</p>
                {p.description && <p className="mt-1 text-sm leading-6 text-zinc-500">{p.description}</p>}
                <p className="mt-3 text-[13px] font-bold text-zinc-400">
                  {Array.isArray(p.videos) ? p.videos.length : 0} premiere{(Array.isArray(p.videos) ? p.videos.length : 0) === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="No collections yet"
            hint="Build themed shelves of premieres — workout cuts, midnight docs, whatever the week needs."
            actionTo="/home"
            actionLabel="Start collecting"
          />
        )}
      </div>
    </div>
  );
};
