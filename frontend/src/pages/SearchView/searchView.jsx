import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const SearchView = () => {
  const [params] = useSearchParams();
  const raw = params.get("q") || "";
  const q = raw.toLowerCase();
  usePageMeta(
    q ? `Results for ${raw}` : "Explore",
    "Search PlayTube videos, channels and topics."
  );

  const [all, setAll] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    setStatus("loading");
    feedApi
      .videos({ limit: 50, sortBy: "createdAt", sortType: "desc" })
      .then((data) => {
        if (!live) return;
        setAll(Array.isArray(data) ? data.map(toCard) : []);
        setStatus("idle");
      })
      .catch((err) => {
        if (!live) return;
        setError(serverMessage(err, "Search is down right now."));
        setStatus("error");
      });
    return () => {
      live = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!q) return all;
    return all.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
    );
  }, [q, all]);

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
      {status === "loading" ? (
        <div className="mt-5"><CardsSkeleton /></div>
      ) : status === "error" ? (
        <div className="mt-5"><FeedError message={error} onRetry={() => window.location.reload()} /></div>
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
