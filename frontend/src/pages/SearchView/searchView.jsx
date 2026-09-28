import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import VideoCard from "../../components/VideoCard/videoCard";
import { videos } from "../../data/videos";

const SearchView = () => {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();
  const results = useMemo(() => {
    if (!q) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="w-full overflow-y-auto bg-stone-50 px-4 py-6 sm:px-6">
      <h1 className="text-xl font-bold tracking-tight">
        {q ? (
          <>Results for <span className="text-orange-600">“{params.get("q")}”</span></>
        ) : (
          "Explore everything"
        )}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{results.length} videos · wired to GET /api/v1/videos next</p>
      {results.length ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-card">
          <p className="font-semibold">No matches for “{params.get("q")}”.</p>
          <p className="mt-1 text-sm text-slate-500">Try a channel name, topic or category.</p>
          <Link to="/home" className="mt-4 inline-block rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white">Back to feed</Link>
        </div>
      )}
    </div>
  );
};

export default SearchView;
