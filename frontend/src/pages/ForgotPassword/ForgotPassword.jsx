import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiMail, FiCheck } from "react-icons/fi";
import Logo from "../../components/Brand/Logo";
import BASE_URL from "../../../BaseURL";
import { usePageMeta } from "../../function/pageMeta";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState(null);
  usePageMeta("Forgot password", "Get a PlayTube password reset link by email.");

  const send = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setStatus("sending");
    setError(null);
    try {
      await axios.post(`${BASE_URL}/users/forgot-password`, { email }, { timeout: 15000 });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err?.response?.data?.message || "Could not send the email. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-8 shadow-card">
        <div className="flex justify-center"><Logo /></div>
        {status === "sent" ? (
          <div className="mt-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-volt/10 text-volt">
              <FiCheck size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-100">Check your inbox</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              If <span className="font-bold text-zinc-200">{email}</span> has an
              account, a reset link is on its way. It works once and expires in
              15 minutes.
            </p>
            <Link to="/login" className="mt-6 block rounded-xl bg-volt py-3.5 text-center text-[15px] font-bold text-void hover:bg-volt-bright">
              Back to log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-zinc-100">Lost your ticket?</h1>
            <p className="mt-2 text-center text-sm leading-6 text-zinc-500">
              Enter your email and we'll send a one-time link to set a new password.
            </p>
            <form onSubmit={send} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-zinc-300">Email address</span>
                <span className="relative block">
                  <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-line bg-void pl-10 pr-4 text-[15px] text-zinc-100 outline-none transition focus:border-volt/60 focus:ring-2 focus:ring-volt/15"
                  />
                </span>
              </label>
              {error && <p role="alert" className="text-sm text-blaze-hot">{error}</p>}
              <button
                type="submit"
                disabled={status === "sending" || !email}
                className="h-12 w-full rounded-xl bg-volt text-[15px] font-bold text-void transition hover:bg-volt-bright disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-center text-[13px] text-zinc-500">
              Remembered it? <Link to="/login" className="font-bold text-volt hover:text-volt-bright">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
