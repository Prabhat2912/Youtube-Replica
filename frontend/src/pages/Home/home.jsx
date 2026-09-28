import React, { useMemo, useState } from "react";
import VideoCard from "../../components/VideoCard/videoCard";
import { videos, categories } from "../../data/videos";

const Home = () => {
  const [active, setActive] = useState("All");
  const list = useMemo(
    () => (active === "All" ? videos : videos.filter((v) => v.category === active)),
    [active]
  );

  return (
    <div className="w-full overflow-y-auto bg-stone-50">
      <div className="scroll-hidden sticky top-0 z-10 flex gap-2 overflow-x-auto bg-stone-50/95 px-4 py-3 backdrop-blur sm:px-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            aria-pressed={active === c}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition ${
              active === c
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 shadow-card hover:bg-slate-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 px-4 pb-10 pt-2 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
        {(list.length ? list : videos).map((video) => (
          <VideoCard key={video.id} data={video} />
        ))}
      </div>
      {!list.length && (
        <p className="px-6 pb-10 text-sm text-slate-500">
          Nothing in {active} yet — showing everything instead.
        </p>
      )}
    </div>
  );
};

export default Home;
