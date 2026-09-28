import React, { useState } from "react";
import { FiDownload, FiX, FiShare } from "react-icons/fi";
import { PlayMark } from "../Brand/Logo";
import { usePwaInstall } from "../../function/usePwaInstall";

const PwaInstallBanner = () => {
  const { canInstall, iosHint, install, dismiss } = usePwaInstall();
  const [busy, setBusy] = useState(false);
  if (!canInstall && !iosHint) return null;

  const onInstall = async () => {
    setBusy(true);
    await install();
    setBusy(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Install PlayTube"
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
    >
      <div className="rounded-3xl border border-white/10 bg-panel/95 p-5 shadow-pop backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <PlayMark size={44} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-bold text-zinc-100">
              Get the PlayTube app
            </p>
            {iosHint ? (
              <p className="mt-1 text-[13px] leading-5 text-zinc-400">
                Tap <FiShare className="inline" size={13} /> Share below, then{" "}
                <span className="font-bold text-zinc-200">Add to Home Screen</span>{" "}
                for fullscreen premieres.
              </p>
            ) : (
              <p className="mt-1 text-[13px] leading-5 text-zinc-400">
                Fullscreen, offline shelf, one tap from your home screen.
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Not now"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
          >
            <FiX size={16} />
          </button>
        </div>
        {!iosHint && (
          <button
            onClick={onInstall}
            disabled={busy}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ember text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-60"
          >
            <FiDownload size={16} /> {busy ? "Installing…" : "Install app"}
          </button>
        )}
        {iosHint && (
          <button
            onClick={dismiss}
            className="mt-4 h-11 w-full rounded-xl border border-line text-sm font-bold text-zinc-200 hover:border-ember/50"
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
};

export default PwaInstallBanner;
