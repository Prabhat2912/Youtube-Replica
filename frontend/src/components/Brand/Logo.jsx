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
    <rect width="48" height="48" rx="14" fill="#C8FF2E" />
    <path d="M19 15.5v17l14.5-8.5L19 15.5Z" fill="#0A0A0F" />
    <ellipse
      cx="24"
      cy="24"
      rx="20"
      ry="9"
      transform="rotate(-18 24 24)"
      stroke="#FF5A1F"
      strokeWidth="3"
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
        <span className="text-lime">tube</span>
      </span>
    )}
  </Link>
);

export default Logo;
