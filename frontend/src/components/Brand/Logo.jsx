import React from "react";
import { Link } from "react-router-dom";

export const PlayMark = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <rect width="48" height="48" rx="14" fill="#00E5FF" />
    <path d="M15 17v14l12-7-12-7Z" fill="#0A0A0F" />
    <path
      d="M29 14.5a14 14 0 0 1 0 19"
      stroke="#0A0A0F"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M34 10.5a20 20 0 0 1 0 27"
      stroke="#FF5A1F"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const Logo = ({ compact = false }) => (
  <Link
    to="/home"
    className="flex shrink-0 items-center gap-2.5"
    aria-label="PlayTube home"
  >
    <PlayMark />
    {!compact && (
      <span className="text-[20px] font-extrabold lowercase leading-none tracking-tight">
        <span className="text-zinc-100">play</span>
        <span className="text-volt">tube</span>
      </span>
    )}
  </Link>
);

export default Logo;
