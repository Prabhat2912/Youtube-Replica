import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiUpload, FiPlay, FiFolder, FiThumbsUp } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { videos } from "../../data/videos";
import VideoCard from "../../components/VideoCard/videoCard";
import { usePageMeta } from "../../function/pageMeta";

const stat = "rounded-2xl border border-line bg-panel p-5";

const Dashboard = () => {
  const authState = useSelector(selectAuth);
  const name = authState.user?.fullName || authState.user?.username || "Creator";
  usePageMeta("Creator dashboard", "Your PlayTube channel stats, uploads and playlists at a glance.");

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-zinc-100">Curtain up, {name}</h1>
      <p className="mt-1 text-sm text-zinc-500">Your channel at a glance. Full analytics arrive with the dashboard API.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: <FiPlay />, label: "Total views", value: "1.2M" },
          { icon: <FiThumbsUp />, label: "Applause", value: "48K" },
          { icon: <FiFolder />, label: "Collections", value: "12" },
          { icon: <FiUpload />, label: "Premieres", value: String(videos.length) },
        ].map((s) => (
          <div key={s.label} className={stat}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime/10 text-lime">{s.icon}</span>
            <p className="mt-3 text-2xl font-black tabular-nums tracking-tight text-zinc-100">{s.value}</p>
            <p className="text-[13px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-zinc-100">Your premieres</h2>
        <button className="inline-flex h-10 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-void hover:bg-lime-bright">
          <FiUpload /> New premiere
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.slice(0, 4).map((v) => (
          <VideoCard key={v.id} data={v} />
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Looking for collections? <Link to="/profile" className="font-bold text-lime">Open your library</Link>
      </p>
    </div>
  );
};

export default Dashboard;
