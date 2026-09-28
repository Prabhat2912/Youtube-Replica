import React from "react";
import { Link } from "react-router-dom";

// Shared loading / empty / error states so every library page behaves
// the same: skeleton shimmer while loading, honest empty states, retry.
export const CardsSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading videos">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="aspect-video animate-pulse bg-white/5" />
        <div className="space-y-2 p-3.5">
          <div className="h-4 w-11/12 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    ))}
  </div>
);

export const FeedEmpty = ({ title, hint, actionTo, actionLabel }) => (
  <div className="rounded-3xl border border-dashed border-line bg-panel p-10 text-center">
    <p className="font-display text-xl font-bold text-zinc-100">{title}</p>
    {hint && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{hint}</p>}
    {actionTo && (
      <Link to={actionTo} className="mt-5 inline-block rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-white hover:bg-ember-bright">
        {actionLabel}
      </Link>
    )}
  </div>
);

export const FeedError = ({ message, onRetry }) => (
  <div className="rounded-3xl border border-ember/30 bg-ember/5 p-10 text-center">
    <p className="font-display text-xl font-bold text-zinc-100">The projector jammed</p>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{message || "Something went wrong loading this. Check your connection and try again."}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-5 rounded-full border border-line bg-panel px-6 py-2.5 text-sm font-bold text-zinc-100 hover:border-ember/50">
        Try again
      </button>
    )}
  </div>
);
