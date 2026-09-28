import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMail, FiRefreshCw } from "react-icons/fi";
import Logo from "../../components/Brand/Logo";
import OtpInput from "../../components/Otp/OtpInput";
import {
  requestOtp,
  confirmOtp,
  setEmail,
  selectOtp,
} from "../../Redux/Features/Otp/OtpSlice";
import { usePageMeta } from "../../function/pageMeta";

const RESEND_SECONDS = 30;

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const otp = useSelector(selectOtp);

  const [address, setAddress] = useState(otp.email || location.state?.email || "");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(Boolean(otp.email));
  const [left, setLeft] = useState(0);
  usePageMeta("Verify your email", "Enter the 6-digit code sent to your inbox to verify your PlayTube account.");

  useEffect(() => {
    if (!left) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);

  // Keep cooldown across reloads of this page from redux state
  useEffect(() => {
    if (otp.cooldownUntil > Date.now()) {
      setLeft(Math.ceil((otp.cooldownUntil - Date.now()) / 1000));
    }
  }, [otp.cooldownUntil]);

  const send = async (e) => {
    e?.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return;
    dispatch(setEmail(address));
    const res = await dispatch(requestOtp(address));
    if (requestOtp.fulfilled.match(res)) {
      setSent(true);
      setLeft(RESEND_SECONDS);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (code.replace(/\D/g, "").length !== 6) return;
    const res = await dispatch(confirmOtp({ email: address, code }));
    if (confirmOtp.fulfilled.match(res)) {
      navigate(location.state?.next || "/home", { replace: true });
    }
  };

  const sending = otp.status === "sending";
  const verifying = otp.status === "verifying";

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-pop">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          {sent ? (
            <>We sent a 6-digit code to <span className="font-semibold text-slate-800">{address}</span>.</>
          ) : (
            "Enter your email and we'll send a 6-digit verification code."
          )}
        </p>

        {!sent ? (
          <form onSubmit={send} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span>
              <span className="relative block">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-stone-50 pl-10 pr-4 text-[15px] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </span>
            </label>
            {otp.error && <p role="alert" className="text-sm text-red-600">{otp.error}</p>}
            <button
              type="submit"
              disabled={sending || !address}
              className="h-12 w-full rounded-xl bg-orange-600 text-[15px] font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-5">
            <OtpInput value={code} onChange={setCode} disabled={verifying} error={otp.error} />
            {otp.error && <p role="alert" className="text-center text-sm text-red-600">{otp.error}</p>}
            <button
              type="submit"
              disabled={verifying || code.replace(/\D/g, "").length !== 6}
              className="h-12 w-full rounded-xl bg-orange-600 text-[15px] font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify email"}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setSent(false); setCode(""); }} className="font-semibold text-slate-500 hover:text-slate-800">
                Wrong email?
              </button>
              <button
                type="button"
                onClick={send}
                disabled={left > 0 || sending}
                className="inline-flex items-center gap-1.5 font-semibold text-orange-600 hover:text-orange-500 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <FiRefreshCw size={14} /> {left > 0 ? `Resend in ${left}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] text-slate-500">
          Already verified? <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
