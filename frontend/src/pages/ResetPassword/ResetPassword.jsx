import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FiCheck } from "react-icons/fi";
import Logo from "../../components/Brand/Logo";
import PasswordField from "../../components/PasswordField/PasswordField";
import BASE_URL from "../../../BaseURL";
import { usePageMeta } from "../../function/pageMeta";

const field =
  "h-12 w-full rounded-xl border border-line bg-void px-4 text-[15px] text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const [error, setError] = useState(null);
  usePageMeta("Set a new password", "Choose a new PlayTube password with your reset link.");

  const mismatch = confirm && pw !== confirm;

  const save = async (e) => {
    e.preventDefault();
    if (pw.length < 8 || mismatch) return;
    setStatus("saving");
    setError(null);
    try {
      await axios.post(
        `${BASE_URL}/users/reset-password`,
        { token, newPassword: pw },
        { timeout: 15000 }
      );
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err?.response?.data?.message || "Could not update the password. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-8 shadow-card">
        <div className="flex justify-center"><Logo /></div>
        {!token ? (
          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">That link is broken</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Open the reset link straight from your email, or ask for a fresh one.
            </p>
            <Link to="/forgot-password" className="mt-6 block rounded-xl bg-ember py-3.5 text-center text-[15px] font-bold text-void hover:bg-ember-bright">
              Get a fresh link
            </Link>
          </div>
        ) : status === "done" ? (
          <div className="mt-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ember/10 text-ember">
              <FiCheck size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-100">Password updated</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Your new password is live. Take your seat again.
            </p>
            <Link to="/login" className="mt-6 block rounded-xl bg-ember py-3.5 text-center text-[15px] font-bold text-void hover:bg-ember-bright">
              Log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-zinc-100">Set a new password</h1>
            <p className="mt-2 text-center text-sm leading-6 text-zinc-500">
              At least 8 characters. Make it one the usher can't guess.
            </p>
            <form onSubmit={save} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-zinc-300">New password</span>
                <PasswordField required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-zinc-300">Repeat it</span>
                <PasswordField required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={field} />
              </label>
              {mismatch && <p role="alert" className="text-sm text-gold-hot">The two passwords don't match yet.</p>}
              {error && <p role="alert" className="text-sm text-gold-hot">{error}</p>}
              <button
                type="submit"
                disabled={status === "saving" || pw.length < 8 || mismatch}
                className="h-12 w-full rounded-xl bg-ember text-[15px] font-bold text-void transition hover:bg-ember-bright disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "saving" ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
