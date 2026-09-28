import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiPlay, FiArrowRight, FiShield, FiZap, FiFilm, FiRadio, FiStar } from "react-icons/fi";
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
        className="bulb h-2 w-2 rounded-full bg-gold"
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
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

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

      gsap.to("[data-parallax]", {
        y: -46,
        ease: "none",
        scrollTrigger: { trigger: "[data-parallax]", start: "top bottom", end: "bottom top", scrub: 1 },
      });

      // Aurora blobs breathe slowly
      gsap.utils.toArray("[data-aurora]").forEach((el, i) => {
        gsap.to(el, {
          x: i % 2 ? 60 : -60,
          y: i % 2 ? -30 : 30,
          duration: 9 + i * 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });

      if (!fine) return;

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
    <div ref={root} className="relative min-h-screen overflow-clip bg-void text-zinc-100">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="scroll-progress fixed inset-x-0 top-0 z-40 h-[3px] origin-left scale-x-0 bg-ember" aria-hidden="true" />
      <div className="cursor-glow pointer-events-none fixed left-0 top-0 z-40 hidden h-64 w-64 rounded-full bg-ember/15 blur-3xl [@media(pointer:fine)]:block" aria-hidden="true" />

      <nav className="sticky top-0 z-30 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-white/5 hover:text-zinc-100">
              Log in
            </Link>
            <Link to="/signup" className="magnetic rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white shadow-glow hover:bg-ember-bright">
              Claim your seat
            </Link>
          </div>
        </div>
      </nav>

      {/* Premiere hero over aurora */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div data-aurora className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-ember/25 blur-[130px]" />
          <div data-aurora className="absolute right-[-120px] top-64 h-[380px] w-[380px] rounded-full bg-gold/20 blur-[130px]" />
          <div data-aurora className="absolute left-1/3 top-[480px] h-[300px] w-[420px] rounded-full bg-[#FF2E63]/15 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div className="rise">
            <p className="-rotate-2 inline-flex items-center gap-2 rounded-xl bg-gold px-3.5 py-1.5 text-[12.5px] font-black uppercase tracking-[0.14em] text-void shadow-glowgold">
              <span className="rec-dot h-2 w-2 rounded-full bg-void" /> Admit one — nightly
            </p>
            <h1 className="mt-6 font-display text-balance text-[44px] font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-[68px]">
              Every night<br />has a <span className="text-ember">premiere</span>.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-7 text-zinc-400">
              PlayTube is the after-dark screening room for video — premieres,
              live cuts and creator rooms, guarded by a velvet rope of email
              verification. No noise, no doomscroll. Just the good stuff, on
              tonight.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/signup" className="magnetic inline-flex items-center gap-2 rounded-full bg-ember px-8 py-3.5 text-[15px] font-bold text-white shadow-glow hover:bg-ember-bright">
                Claim your seat <FiArrowRight />
              </Link>
              <Link to="/home" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-[15px] font-semibold text-zinc-100 backdrop-blur hover:border-white/30">
                <FiPlay /> Sneak in as guest
              </Link>
            </div>
          </div>

          <div data-parallax>
            <div className="rise rounded-3xl border border-white/10 bg-white/[0.04] pb-5 shadow-card backdrop-blur-xl" style={{ animationDelay: "0.12s" }}>
              <Bulbs />
              <div className="px-5 pt-3">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={videos[0].thumbnail} alt="Tonight's featured premiere" className="aspect-video w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-ember px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                    Tonight 9 PM
                  </span>
                  <Link to="/home" aria-label="Play tonight's premiere" className="absolute inset-0 grid place-items-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-ember text-white shadow-glow transition hover:scale-105">
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
        </div>
      </section>

      {/* Marquee tape */}
      <div className="overflow-hidden border-y border-ember/40 bg-ember py-3" aria-hidden="true">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap pr-8">
          {[...tape, ...tape].map((t, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-sm font-bold uppercase tracking-[0.2em] text-void">
              {t} <FiFilm size={15} />
            </span>
          ))}
        </div>
      </div>

      {/* Bento: one ticket, whole season */}
      <section data-reveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">One ticket.<br />Whole season.</h2>
          <span className="rotate-2 rounded-xl bg-gold px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-void">Season pass included</span>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl lg:col-span-2">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-ember"><FiShield size={14} /> Velvet rope</p>
            <h3 className="mt-3 font-display text-2xl font-bold leading-snug">Bots wait outside.<br />You walk straight in.</h3>
            <p className="mt-3 max-w-md leading-7 text-zinc-400">
              Every seat is email-verified before anyone can premiere or heckle
              from the back row. Six digits, thirty seconds, zero noise over
              the film.
            </p>
            <div className="mt-6 flex max-w-sm justify-start gap-2.5" aria-hidden="true">
              {["4", "2", "9", "1", "0", "7"].map((d, i) => (
                <span key={i} className="grid h-14 w-11 place-items-center rounded-xl border border-white/10 bg-void font-display text-xl font-bold text-gold">
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/verify-otp" className="magnetic rounded-full bg-ember px-7 py-3 text-sm font-bold text-white shadow-glow hover:bg-ember-bright">
                Get my code
              </Link>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-400"><FiZap size={14} className="text-gold" /> 30s resend · paste-friendly</span>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-ember/30 bg-gradient-to-b from-ember/15 to-transparent p-7">
            <p className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-ember">
              <span className="rec-dot h-2 w-2 rounded-full bg-ember" /> On air now
            </p>
            <div>
              <h3 className="mt-3 font-display text-2xl font-bold leading-snug">Live rooms<br />never sleep.</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Drop into cuts, gigs and watch-parties as they happen.</p>
              <Link to="/home" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-ember hover:text-ember-bright">
                Tune in <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-gold"><FiStar size={14} /> Your rooms</p>
            <h3 className="mt-3 font-display text-2xl font-bold leading-snug">Keep the good ones.</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Collections, watch-later and rooms you follow live here.</p>
            <Link to="/dashboard" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-bright">
              Open collections <FiArrowRight />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.16em] text-ember"><FiRadio size={14} /> Creators</p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-snug">Premiere like you mean it.</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Uploads, countdowns and a crowd that showed up for your work.</p>
              </div>
              <Link to="/signup" className="magnetic inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-black text-void shadow-glowgold hover:bg-gold-bright">
                Start premiering <FiArrowRight />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {videos.slice(2, 6).map((v) => (
                <img key={v.id} src={v.thumbnail} alt="" loading="lazy" className="aspect-video w-full rounded-xl border border-white/10 object-cover" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Now showing rail */}
      <section data-reveal className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-black tracking-tight">Now showing</h2>
          <Link to="/home" className="inline-flex items-center gap-1 text-sm font-bold text-ember hover:text-ember-bright">
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

      {/* Close — gold band */}
      <section data-reveal className="bg-gold">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
          <h2 className="flex-1 font-display text-3xl font-black tracking-tight text-void sm:text-4xl">
            The doors open in thirty seconds. Bring a film.
          </h2>
          <div className="flex gap-3">
            <Link to="/signup" className="magnetic inline-flex items-center rounded-full bg-void px-8 py-3.5 text-[15px] font-bold text-gold hover:bg-black">
              Claim your seat
            </Link>
            <Link to="/home" className="inline-flex items-center rounded-full border-2 border-void/70 px-8 py-3.5 text-[15px] font-bold text-void hover:border-void">
              Watch first
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-void">
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
