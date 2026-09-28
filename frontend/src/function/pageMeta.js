import { useEffect } from "react";

// SPA pages share one index.html, so each route sets its own document
// title + meta description. Keeps tabs, history, screen readers,
// search snippets and AI-crawler previews accurate per page.
export function usePageMeta(title, description) {
  useEffect(() => {
    const full = `${title} — PlayTube`;
    document.title = full;

    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", description);

    let og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", full);

    let tw = document.querySelector('meta[name="twitter:title"]');
    if (tw) tw.setAttribute("content", full);
  }, [title, description]);
}

// Inject (and clean up) a page-scoped JSON-LD block, e.g. VideoObject
// on the watch page so Google + AI engines can quote the video.
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, data]);
}
