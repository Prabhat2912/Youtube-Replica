import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ compact = false }) => (
  <Link to="/home" className="flex items-center gap-2 shrink-0" aria-label="PlayTube home">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-600 text-white shadow-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
      </svg>
    </span>
    {!compact && (
      <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
        PlayTube
      </span>
    )}
  </Link>
);

export default Logo;
