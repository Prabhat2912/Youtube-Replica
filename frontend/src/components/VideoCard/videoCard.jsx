import React from "react";
import { Link } from "react-router-dom";

export function formatViews(views) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

const VideoCard = ({ data }) => (
  <Link
    to={data.videoLink}
    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop"
  >
    <div className="relative aspect-video overflow-hidden bg-slate-100">
      <img
        src={data.thumbnail}
        alt={data.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/85 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
        {data.duration}
      </span>
    </div>
    <div className="flex gap-3 p-3.5">
      <img
        src={data.avatar}
        alt={data.channel}
        loading="lazy"
        className="h-9 w-9 shrink-0 rounded-full bg-slate-100 object-cover"
      />
      <div className="min-w-0">
        <h3 className="clamp-2 text-[14.5px] font-semibold leading-5 text-slate-900">
          {data.title}
        </h3>
        <p className="mt-1.5 truncate text-[13px] text-slate-500">{data.channel}</p>
        <p className="text-[12.5px] tabular-nums text-slate-500">
          {formatViews(data.views)} · {data.age}
        </p>
      </div>
    </div>
  </Link>
);

export default VideoCard;
