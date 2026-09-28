import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function formatViews(views) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

const VideoCard = ({ data }) => {
  const navigate = useNavigate();
  const goChannel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const handle = (data.handle || "").replace(/^@/, "");
    if (handle) navigate(`/channel/${handle}`);
  };
  return (
    <Link
      to={data.videoLink}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition duration-200 hover:-translate-y-1 hover:border-ember/50 hover:shadow-glow"
    >
    <div className="relative aspect-video overflow-hidden bg-black">
      <img
        src={data.thumbnail}
        alt={data.title}
        loading="lazy"
        className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-100"
      />
      <span className="absolute bottom-2 right-2 rounded-md bg-gold px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-void">
        {data.duration}
      </span>
      <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ember text-void">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </span>
      </span>
    </div>
    <div className="flex gap-3 p-3.5">
      <img
        src={data.avatar}
        alt={data.channel}
        loading="lazy"
        className="h-9 w-9 shrink-0 rounded-full bg-black object-cover"
      />
      <div className="min-w-0">
        <h3 className="clamp-2 text-[14.5px] font-semibold leading-5 text-zinc-100">
          {data.title}
        </h3>
        <button onClick={goChannel} title={data.handle ? `Open ${data.handle}'s room` : undefined} className="mt-1.5 block max-w-full truncate text-left text-[13px] text-zinc-500 hover:text-ember">
          {data.channel}
        </button>
        <p className="text-[12.5px] tabular-nums text-zinc-500">
          {formatViews(data.views)} · {data.age}
        </p>
      </div>
    </div>
  </Link>
  );
};

export default VideoCard;
