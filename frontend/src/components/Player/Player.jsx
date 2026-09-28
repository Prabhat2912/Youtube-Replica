import React, { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSettings,
  FiLoader,
} from "react-icons/fi";

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmt(t) {
  if (!isFinite(t) || t < 0) return "0:00";
  const s = Math.floor(t);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

// Cloudinary adaptive HLS: same upload, network-picked bitrate.
// https://res.cloudinary.com/<cloud>/video/upload/sp_auto/[v123/]<id>.m3u8
function hlsUrlFor(src) {
  if (!src || !CLOUD || !src.includes("res.cloudinary.com")) return null;
  const m = src.match(/\/video\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+(?:\?.*)?$/i);
  if (!m) return null;
  const version = src.match(/\/video\/upload\/(v\d+)\//)?.[1];
  return `https://res.cloudinary.com/${CLOUD}/video/upload/sp_auto/${version ? version + "/" : ""}${m[1]}.m3u8`;
}

const Player = ({ src, poster, title }) => {
  const wrap = useRef(null);
  const video = useRef(null);
  const hls = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [levels, setLevels] = useState([]); // [{id, label}]
  const [quality, setQuality] = useState(-1); // -1 = Auto
  const [menu, setMenu] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [mode, setMode] = useState("mp4"); // mp4 | hls

  // Attach stream: HLS when possible, plain file as fallback.
  useEffect(() => {
    const el = video.current;
    if (!el || !src) return;
    const url = hlsUrlFor(src);

    setPlaying(false);
    setTime(0);
    setLevels([]);
    setQuality(-1);

    const useMp4 = () => {
      hls.current?.destroy();
      hls.current = null;
      setMode("mp4");
      el.src = src;
    };

    if (url && Hls.isSupported()) {
      const h = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 30 });
      hls.current = h;
      h.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const seen = new Set();
        const lv = data.levels
          .map((l, i) => ({ id: i, label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}k` }))
          .filter((l) => (seen.has(l.label) ? false : (seen.add(l.label), true)));
        setLevels(lv);
        setMode("hls");
      });
      h.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) useMp4();
      });
      h.loadSource(url);
      h.attachMedia(el);
    } else if (url && el.canPlayType("application/vnd.apple.mpegurl")) {
      setMode("hls");
      el.src = url; // Safari native HLS (auto quality)
    } else {
      useMp4();
    }

    return () => {
      hls.current?.destroy();
      hls.current = null;
    };
  }, [src]);

  const pickQuality = (id) => {
    setQuality(id);
    if (hls.current) hls.current.currentLevel = id;
    setMenu(null);
  };

  const pickRate = (r) => {
    setRate(r);
    if (video.current) video.current.playbackRate = r;
    setMenu(null);
  };

  const toggle = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  }, []);

  const seek = (v) => {
    const el = video.current;
    if (el && dur) el.currentTime = (v / 1000) * dur;
  };

  const full = () => {
    const w = wrap.current;
    if (!w) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else w.requestFullscreen?.();
  };

  const onKey = (e) => {
    const el = video.current;
    if (!el || e.target.tagName === "INPUT") return;
    if (e.key === " " || e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowRight") el.currentTime += 5;
    else if (e.key === "ArrowLeft") el.currentTime -= 5;
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      el.volume = Math.min(1, el.volume + 0.1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      el.volume = Math.max(0, el.volume - 0.1);
    } else if (e.key.toLowerCase() === "f") full();
    else if (e.key.toLowerCase() === "m") el.muted = !el.muted;
  };

  const menuBtn =
    "flex w-full items-center justify-between px-4 py-2 text-[13px] hover:bg-white/10";

  return (
    <div
      ref={wrap}
      tabIndex={0}
      onKeyDown={onKey}
      onDoubleClick={full}
      className="group relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-line bg-black outline-none"
    >
      <video
        ref={video}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDur(e.target.duration)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onVolumeChange={(e) => {
          setVolume(e.target.volume);
          setMuted(e.target.muted);
        }}
        onProgress={(e) => {
          try {
            const b = e.target.buffered;
            if (b.length) setBuffered(b.end(b.length - 1));
          } catch { /* noop */ }
        }}
        className="h-full w-full"
        aria-label={title || "Video player"}
      />

      {waiting && (
        <span className="absolute inset-0 grid place-items-center" aria-label="Buffering">
          <FiLoader size={34} className="animate-spin text-ember" />
        </span>
      )}

      {!playing && !waiting && (
        <button
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center bg-black/30"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ember text-white shadow-glow transition hover:scale-105">
            <FiPlay size={24} className="ml-1" />
          </span>
        </button>
      )}

      {/* Control deck */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2.5 pt-10 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <div className="relative mb-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="absolute inset-y-0 left-0 bg-white/30"
            style={{ width: dur ? `${(buffered / dur) * 100}%` : 0 }}
          />
          <input
            type="range"
            min={0}
            max={1000}
            value={dur ? (time / dur) * 1000 : 0}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: dur ? `${(time / dur) * 100}%` : 0 }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-white">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            {playing ? <FiPause size={18} /> : <FiPlay size={18} className="ml-0.5" />}
          </button>
          <button
            onClick={() => {
              const el = video.current;
              if (el) el.muted = !el.muted;
            }}
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
          >
            {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume * 100}
            onChange={(e) => {
              const el = video.current;
              if (!el) return;
              el.muted = false;
              el.volume = Number(e.target.value) / 100;
            }}
            aria-label="Volume"
            className="hidden h-1 w-20 accent-[#FF4D2E] sm:block"
          />
          <span className="ml-1 text-[12.5px] tabular-nums text-zinc-300">
            {fmt(time)} / {fmt(dur)}
          </span>
          <span className="ml-1 hidden rounded bg-white/15 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-200 sm:block">
            {mode === "hls" ? (quality === -1 ? "Auto" : levels.find((l) => l.id === quality)?.label) : "Original"}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setMenu(menu === "speed" ? null : "speed")}
                aria-label="Playback speed"
                className="h-9 rounded-full px-2.5 text-[12.5px] font-bold hover:bg-white/10"
              >
                {rate}×
              </button>
              {menu === "speed" && (
                <div className="absolute bottom-11 right-0 w-32 overflow-hidden rounded-xl border border-white/10 bg-black/95 py-1">
                  {SPEEDS.map((s) => (
                    <button key={s} onClick={() => pickRate(s)} className={menuBtn}>
                      {s}× {s === rate && <span className="text-ember">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setMenu(menu === "quality" ? null : "quality")}
                aria-label="Quality"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10"
              >
                <FiSettings size={17} />
              </button>
              {menu === "quality" && (
                <div className="absolute bottom-11 right-0 w-36 overflow-hidden rounded-xl border border-white/10 bg-black/95 py-1">
                  {mode === "hls" && levels.length ? (
                    <>
                      <button onClick={() => pickQuality(-1)} className={menuBtn}>
                        Auto {quality === -1 && <span className="text-ember">●</span>}
                      </button>
                      {levels.map((l) => (
                        <button key={l.id} onClick={() => pickQuality(l.id)} className={menuBtn}>
                          {l.label} {quality === l.id && <span className="text-ember">●</span>}
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="px-4 py-2 text-[13px] text-zinc-400">
                      {mode === "hls" ? "Auto quality" : "Original file"}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button onClick={full} aria-label="Fullscreen" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
              <FiMaximize size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
