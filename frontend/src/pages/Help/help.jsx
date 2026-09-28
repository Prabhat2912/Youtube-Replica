import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { usePageMeta } from "../../function/pageMeta";

const faqs = [
  {
    q: "How do I verify my email?",
    a: "Sign up, then open Verify Email from the menu or log in screen. We send a 6-digit ticket that lives for 10 minutes — paste the whole code at once, and use Resend if it expires. Until your email is verified you can watch, but premiering and commenting stay locked.",
  },
  {
    q: "I never got the code or reset email. What now?",
    a: "Wait 60 seconds, check spam and promotions, and confirm you typed the address right (Wrong email? on the code screen lets you fix it). Gmail addresses receive PlayTube mail from the account's sender — if nothing arrives after a resend, the server mail quota may be exhausted; try again later.",
  },
  {
    q: "How do I reset a forgotten password?",
    a: "Hit Forgot ticket? on the log in screen, enter your email, and open the one-time link within 15 minutes. The link burns after one use — if it says invalid or expired, request a fresh one.",
  },
  {
    q: "How do premieres, collections and follows work?",
    a: "Upload from your dashboard to premiere. Thumbs-up any video to file it under Applauded. Follow a channel to pin it to Subscriptions, and bundle premieres into themed Collections from your library.",
  },
  {
    q: "A video won't play or the feed is empty. Is it broken?",
    a: "First check your connection and log in again — sessions expire. An empty feed after logging in means nobody on your network has premiered yet; be the first from your dashboard. If an API error persists, note the exact message and the time — that is what support needs.",
  },
  {
    q: "How do I change my name, email or password?",
    a: "Open Settings from the side menu. The Account tab edits your name and email, the Password tab rotates your password, and the Session tab logs you out everywhere on this device.",
  },
];

const Help = () => {
  const [open, setOpen] = useState(0);
  usePageMeta("Help desk", "Answers about PlayTube accounts, verification, premieres and fixes.");

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="-rotate-1 inline-block rounded-xl bg-gold px-3 py-1 text-[12px] font-black uppercase tracking-[0.14em] text-void">
          Help desk
        </p>
        <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
          Stuck? The usher knows.
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-zinc-400">
          Real answers for the things that actually go wrong — accounts,
          tickets, premieres and playback.
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`overflow-hidden rounded-2xl border transition ${isOpen ? "border-ember/50 bg-panel" : "border-line bg-panel"}`}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold text-zinc-100">{f.q}</span>
                  <FiChevronDown className={`shrink-0 transition ${isOpen ? "rotate-180 text-ember" : "text-zinc-500"}`} />
                </button>
                {isOpen && <p className="px-5 pb-5 text-sm leading-7 text-zinc-400">{f.a}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-gold/30 bg-gold/5 p-6">
          <p className="font-display text-lg font-bold text-zinc-100">Still stuck?</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">
            Log out and back in first — it fixes expired sessions. Then verify
            your email, and try the action once more.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/verify-otp" className="rounded-full bg-ember px-6 py-2.5 text-sm font-bold text-white hover:bg-ember-bright">
              Verify email
            </Link>
            <Link to="/forgot-password" className="rounded-full border border-line px-6 py-2.5 text-sm font-bold text-zinc-200 hover:border-ember/50">
              Reset password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
