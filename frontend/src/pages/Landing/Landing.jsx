import React from "react";
import { Link } from "react-router-dom";
import { FiPlay, FiCheck, FiArrowRight, FiShield, FiZap, FiUsers } from "react-icons/fi";
import Logo from "../../components/Brand/Logo";
import VideoCard from "../../components/VideoCard/videoCard";
import { videos } from "../../data/videos";
import { usePageMeta } from "../../function/pageMeta";

const Landing = () => {
  usePageMeta(
    "A lighter home for video",
    "PlayTube is a calm place to watch and share video — clean feed, trusted channels and email-verified accounts."
  );
  return (
  <div className="min-h-screen bg-stone-50 text-slate-900">
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Log in
          </Link>
          <Link to="/signup" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            Start watching
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero — headline carries its own weight, preview proves the product */}
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-2 lg:pt-20">
      <div>
        <h1 className="max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Video that feels light, calm and yours
        </h1>
        <p className="mt-5 max-w-lg text-[17px] leading-7 text-slate-500">
          PlayTube is a quieter place to watch and share video — a clean feed,
          thoughtful channels and email-verified accounts, without the noise.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-orange-600 px-7 text-[15px] font-semibold text-white shadow-card hover:bg-orange-500">
            Create free account <FiArrowRight />
          </Link>
          <Link to="/home" className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-7 text-[15px] font-semibold text-slate-800 hover:border-slate-400">
            <FiPlay /> Browse as guest
          </Link>
        </div>
        <ul className="mt-7 space-y-2 text-sm text-slate-600">
          {["Email code verification on signup", "Uploads, playlists and comments built in", "Runs on the same API you already deployed"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <FiCheck className="text-orange-600" /> {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-white shadow-pop">
          <div className="relative aspect-video bg-slate-900">
            <img src={videos[0].thumbnail} alt="Featured video preview" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center">
              <Link to="/home" aria-label="Play featured video" className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-slate-900 shadow-pop transition hover:scale-105">
                <FiPlay size={24} className="ml-1" />
              </Link>
            </span>
            <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">12:04</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <img src={videos[0].avatar} alt="" className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{videos[0].title}</p>
              <p className="text-[13px] text-slate-500">{videos[0].channel} · 128K views</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Trending preview — real feed cards, not claims */}
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Trending this week</h2>
          <Link to="/home" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-500">
            Open the feed <FiArrowRight />
          </Link>
        </div>
        <div className="scroll-hidden -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {videos.slice(0, 6).map((v) => (
            <div key={v.id} className="w-64 shrink-0 sm:w-72">
              <VideoCard data={v} />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Feature rows — alternating, paced, no icon-card grid */}
    <section className="mx-auto max-w-6xl space-y-14 px-4 py-16 sm:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-[26px] font-bold leading-snug tracking-tight">A feed that respects your attention</h2>
          <p className="mt-3 leading-7 text-slate-500">
            Category chips, honest durations and channel-first cards. Skim in
            seconds, dive in when something earns it — no autoplay traps, no
            shouting thumbnails.
          </p>
          <Link to="/home" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-500">
            See the feed <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {videos.slice(2, 6).map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="order-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card lg:order-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FiShield className="text-orange-600" /> Email verification built in
          </div>
          <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {["4", "2", "9", "•", "•", "•"].map((d, i) => (
              <span key={i} className="grid h-11 w-10 place-items-center rounded-lg border border-slate-200 bg-stone-50 text-base font-bold">
                {d}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Six-digit codes with resend timer and paste support. Real
            verification against your API the day the endpoint lands — mock
            delivery until then.
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-[26px] font-bold leading-snug tracking-tight">Accounts you can trust</h2>
          <p className="mt-3 leading-7 text-slate-500">
            Every new account confirms its email before uploading or
            commenting. Creators get a clean dashboard; viewers get fewer bots
            and better conversations.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[13px] font-semibold text-orange-700"><FiZap size={14} /> 30s resend</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[13px] font-semibold text-orange-700"><FiUsers size={14} /> Bot-resistant</span>
          </div>
        </div>
      </div>
    </section>

    {/* Close — solid band, one action */}
    <section className="bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Bring your first video this weekend</h2>
          <p className="mt-2 max-w-lg leading-7 text-slate-300">
            Sign up, confirm your email, upload. Your channel, playlists and
            history are waiting.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/signup" className="h-12 inline-flex items-center rounded-full bg-orange-500 px-7 text-[15px] font-semibold text-white shadow-pop hover:bg-orange-400">
            Get started free
          </Link>
          <Link to="/home" className="h-12 inline-flex items-center rounded-full border border-slate-600 px-7 text-[15px] font-semibold text-white hover:border-slate-400">
            Watch first
          </Link>
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-6">
        <Logo />
        <p className="sm:ml-4">A lighter video home. Built on the PlayTube API.</p>
        <div className="flex gap-5 sm:ml-auto">
          <Link to="/home" className="hover:text-slate-900">Feed</Link>
          <Link to="/login" className="hover:text-slate-900">Log in</Link>
          <Link to="/signup" className="hover:text-slate-900">Sign up</Link>
        </div>
      </div>
    </footer>
  </div>
  );
};

export default Landing;
