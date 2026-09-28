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
    <defs>
      <linearGradient id="pt-sunset" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0" stopColor="#FFB800" />
        <stop offset="1" stopColor="#FF4D2E" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="15" fill="url(#pt-sunset)" />
    <path d="M17 16.5v15l13-7.5-13-7.5Z" fill="#0C0A09" />
    <path
      d="M31 15a13 13 0 0 1 0 18"
      stroke="#FFF7ED"
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
      <span className="font-display text-[17px] font-extrabold lowercase leading-none tracking-tight">
        <span className="text-zinc-100">play</span>
        <span className="text-ember">tube</span>
      </span>
    )}
  </Link>
);

export default Logo;
