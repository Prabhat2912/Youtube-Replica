import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiUpload, FiPlay, FiFolder, FiThumbsUp } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { videos } from "../../data/videos";
import VideoCard from "../../components/VideoCard/videoCard";

const stat = "rounded-2xl bg-white p-5 shadow-card";

const Dashboard = () => {
  const authState = useSelector(selectAuth);
  const name = authState.user?.fullName || authState.user?.username || "Creator";

  return (
    <div className="w-full overflow-y-auto bg-stone-50 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Good afternoon, {name}</h1>
      <p className="mt-1 text-sm text-slate-500">Your channel at a glance. Full analytics arrive with the dashboard API.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: <FiPlay />, label: "Total views", value: "1.2M" },
          { icon: <FiThumbsUp />, label: "Likes", value: "48K" },
          { icon: <FiFolder />, label: "Playlists", value: "12" },
          { icon: <FiUpload />, label: "Uploads", value: String(videos.length) },
        ].map((s) => (
          <div key={s.label} className={stat}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600">{s.icon}</span>
            <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight">{s.value}</p>
            <p className="text-[13px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">Your uploads</h2>
        <button className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700">
          <FiUpload /> New upload
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.slice(0, 4).map((v) => (
          <VideoCard key={v.id} data={v} />
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Looking for playlists? <Link to="/profile" className="font-semibold text-orange-600">Open your library</Link>
      </p>
    </div>
  );
};

export default Dashboard;
