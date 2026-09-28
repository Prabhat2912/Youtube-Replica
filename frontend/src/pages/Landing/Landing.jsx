import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiPlay, FiArrowRight, FiShield, FiZap, FiFilm } from "react-icons/fi";
import Logo from "../../components/Brand/Logo";
import VideoCard from "../../components/VideoCard/videoCard";
import { videos } from "../../data/videos";
import { usePageMeta } from "../../function/pageMeta";

gsap.registerPlugin(ScrollTrigger);

const tape = ["PremierES", "Live cuts", "Creator rooms", "Midnight docs", "Loud gigs", "Quiet films"];

const Bulbs = () => (
  <div className="flex justify-between px-6 pt-4" aria-hidden="true">
    {Array.from({ length: 18 }).map((_, i) => (
      <span
        key={i}
        className="bulb h-2 w-2 rounded-full bg-volt"
        style={{ animationDelay: `${(i % 6) * 0.35}s` }}
      />
    ))}
  </div>
);

const Landing = () => {
  const root = useRef(null);

  usePageMeta(
    "A lighter home for video",
    "PlayTube is the after-dark screening room for video — premieres, live cuts and creator rooms, with email-verified accounts."
  );

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const ctx = gsap.context(() => {
      // Scroll progress hairline
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // Every section below the hero rises as it arrives
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%" },
          }
        );
      });

      // The marquee screen drifts slower than the scroll (parallax)
      gsap.to("[data-parallax]", {
        y: -46,
        ease: "none",
        scrollTrigger: { trigger: "[data-parallax]", start: "top bottom", end: "bottom top", scrub: 1 },
      });

      if (!fine) return;

      // Cursor glow: a volt orb chasing the pointer, blooming over links
      const glow = document.querySelector(".cursor-glow");
      gsap.set(glow, { xPercent: -50, yPercent: -50, x: -300, y: -300 });
      const xTo = gsap.quickTo(glow, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(glow, "y", { duration: 0.45, ease: "power3" });
      const move = (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const over = (e) => {
        if (e.target.closest("a, button")) glow.classList.add("cursor-big");
      };
      const out = () => glow.classList.remove("cursor-big");
      window.addEventListener("mousemove", move);
      document.addEventListener("mouseover", over);
      document.addEventListener("mouseout", out);

      // Magnetic seats: primary CTAs lean toward the cursor
      const magnets = gsap.utils.toArray(".magnetic");
      const cleanups = magnets.map((el) => {
        const xSet = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
        const ySet = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          xSet((e.clientX - (r.left + r.width / 2)) * 0.22);
          ySet((e.clientY - (r.top + r.height / 2)) * 0.28);
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        };
      });

      return () => {
        window.removeEventListener("mousemove", move);
        document.removeEventListener("mouseover", over);
        document.removeEventListener("mouseout", out);
        cleanups.forEach((fn) => fn());
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen bg-void text-zinc-100">
      <div className="scroll-progress fixed inset-x-0 top-0 z-40 h-[3px] origin-left scale-x-0 bg-volt" aria-hidden="true" />
      <div className="cursor-glow pointer-events-none fixed left-0 top-0 z-40 hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/15 blur-3xl [@media(pointer:fine)]:block" aria-hidden="true" />

      <nav className="sticky top-0 z-30 border-b border-line bg-void/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-panel hover:text-zinc-100">
              Log in
            </Link>
            <Link to="/signup" className="magnetic rounded-full bg-volt px-5 py-2.5 text-sm font-bold text-void shadow-glow hover:bg-volt-bright">
              Claim your seat
            </Link>
          </div>
        </div>
      </nav>

      {/* Premiere hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-volt/40 bg-volt/10 px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-volt">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blaze" /> Now showing nightly
          </p>
          <h1 className="mt-5 text-balance text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">
            Every night<br />has a <span className="text-volt">premiere</span>.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-7 text-zinc-400">
            PlayTube is the after-dark screening room for video — premieres,
            live cuts and creator rooms, guarded by a velvet rope of email
            verification. No noise, no doomscroll. Just the good stuff, on
            tonight.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="magnetic inline-flex items-center gap-2 rounded-full bg-volt px-8 py-3.5 text-[15px] font-bold text-void shadow-glow hover:bg-volt-bright">
              Claim your seat <FiArrowRight />
            </Link>
            <Link to="/home" className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-8 py-3.5 text-[15px] font-semibold text-zinc-100 hover:border-zinc-600">
              <FiPlay /> Sneak in as guest
            </Link>
          </div>
        </div>

        <div data-parallax>
          <div className="rise rounded-3xl border border-line bg-panel pb-5 shadow-card" style={{ animationDelay: "0.12s" }}>
            <Bulbs />
            <div className="px-5 pt-3">
              <div className="relative overflow-hidden rounded-2xl">
                <img src={videos[0].thumbnail} alt="Tonight's featured premiere" className="aspect-video w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-blaze px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Tonight 9 PM
                </span>
                <Link to="/home" aria-label="Play tonight's premiere" className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-volt text-void shadow-glow transition hover:scale-105">
                    <FiPlay size={24} className="ml-1" />
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3 px-1 pt-4">
                <img src={videos[0].avatar} alt="" className="h-10 w-10 rounded-full" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{videos[0].title}</p>
                  <p className="text-[13px] text-zinc-500">{videos[0].channel} · 128K waiting in line</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee tape */}
      <div className="overflow-hidden border-y border-volt/30 bg-volt py-3" aria-hidden="true">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap pr-8">
          {[...tape, ...tape].map((t, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-black uppercase tracking-[0.2em] text-void">
              {t} <FiFilm size={15} />
            </span>
          ))}
        </div>
      </div>

      {/* Now showing rail */}
      <section data-reveal className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black tracking-tight">Now showing</h2>
          <Link to="/home" className="inline-flex items-center gap-1 text-sm font-bold text-volt hover:text-volt-bright">
            Full program <FiArrowRight />
          </Link>
        </div>
        <div className="scroll-hidden -mx-4 mt-7 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {videos.slice(0, 6).map((v) => (
            <div key={v.id} className="w-64 shrink-0 sm:w-72">
              <VideoCard data={v} />
            </div>
          ))}
        </div>
      </section>

      {/* Velvet rope */}
      <section data-reveal className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              A velvet rope,<br />not a paywall.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-zinc-400">
              Every seat is email-verified before anyone can premiere or heckle
              from the back row. Six digits, thirty seconds, zero bots shouting
              over the film.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-void px-3.5 py-1.5 text-[13px] font-bold text-zinc-200"><FiZap size={14} className="text-volt" /> 30s resend</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-void px-3.5 py-1.5 text-[13px] font-bold text-zinc-200"><FiShield size={14} className="text-volt" /> Paste-friendly codes</span>
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-void p-7">
            <div className="flex justify-center gap-2.5" aria-hidden="true">
              {["4", "2", "9", "1", "0", "7"].map((d, i) => (
                <span key={i} className="grid h-14 w-11 place-items-center rounded-xl border border-line bg-panel text-xl font-black text-volt">
                  {d}
                </span>
              ))}
            </div>
            <Link to="/verify-otp" className="magnetic mt-6 block rounded-full bg-volt py-3.5 text-center text-[15px] font-bold text-void hover:bg-volt-bright">
              Get my code
            </Link>
            <p className="mt-3 text-center text-[13px] text-zinc-500">Real verification against your API — mock delivery until the endpoint lands.</p>
          </div>
        </div>
      </section>

      {/* Creator premiere */}
      <section data-reveal className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-5">
          {videos.slice(2, 6).map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
        <div>
          <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Premiere like<br />you mean it.
          </h2>
          <p className="mt-4 max-w-md leading-7 text-zinc-400">
            Uploads, collections, live countdowns and a crowd that actually
            showed up for your work. Your dashboard tracks the applause.
          </p>
          <Link to="/signup" className="magnetic mt-6 inline-flex items-center gap-2 rounded-full bg-blaze px-7 py-3.5 text-[15px] font-bold text-white shadow-glowblaze hover:bg-blaze-hot">
            Start premiering <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Close — volt inversion */}
      <section data-reveal className="bg-volt">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
          <h2 className="flex-1 text-3xl font-black tracking-tight text-void sm:text-4xl">
            The doors open in thirty seconds. Bring a film.
          </h2>
          <div className="flex gap-3">
            <Link to="/signup" className="magnetic inline-flex items-center rounded-full bg-void px-8 py-3.5 text-[15px] font-bold text-volt hover:bg-black">
              Claim your seat
            </Link>
            <Link to="/home" className="inline-flex items-center rounded-full border-2 border-void/70 px-8 py-3.5 text-[15px] font-bold text-void hover:border-void">
              Watch first
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-void">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:px-6">
          <Logo />
          <p className="sm:ml-4">The after-dark screening room. Built on the PlayTube API.</p>
          <div className="flex gap-5 sm:ml-auto">
            <Link to="/home" className="hover:text-zinc-100">Program</Link>
            <Link to="/login" className="hover:text-zinc-100">Log in</Link>
            <Link to="/signup" className="hover:text-zinc-100">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
