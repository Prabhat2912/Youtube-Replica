import React, { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedError } from "../../components/FeedStates/FeedStates";
import { selectLibrary, fetchFeed } from "../../Redux/Features/Library/librarySlice";
import { usePageMeta } from "../../function/pageMeta";

const SearchView = () => {
  const [params] = useSearchParams();
  const raw = params.get("q") || "";
  const q = raw.toLowerCase();
  const dispatch = useDispatch();
  const feed = useSelector(selectLibrary).feed;
  usePageMeta(
    q ? `Results for ${raw}` : "Explore",
    "Search PlayTube videos, channels and topics."
  );

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  const results = useMemo(() => {
    if (!q) return feed.items;
    return feed.items.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
    );
  }, [q, feed.items]);

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-xl font-black tracking-tight text-zinc-100">
        {q ? (
          <>Results for <span className="text-ember">“{raw}”</span></>
        ) : (
          "Explore everything"
        )}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{results.length} screening{results.length === 1 ? "" : "s"} on the network</p>
      {feed.status === "loading" ? (
        <div className="mt-5"><CardsSkeleton /></div>
      ) : feed.status === "error" ? (
        <div className="mt-5"><FeedError message={feed.error} onRetry={() => dispatch(fetchFeed({ force: true }))} /></div>
      ) : results.length ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-panel p-10 text-center">
          <p className="font-bold text-zinc-100">No matches for “{raw}”.</p>
          <p className="mt-1 text-sm text-zinc-500">Try a channel name or a word from a title.</p>
          <Link to="/home" className="mt-4 inline-block rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-white">Back to the program</Link>
        </div>
      )}
    </div>
  );
};

export default SearchView;
