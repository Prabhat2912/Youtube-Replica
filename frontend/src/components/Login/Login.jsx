import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { resetLibrary } from "../../Redux/Features/Library/librarySlice";
import { toast } from "sonner";
import { ScaleLoader } from "react-spinners";
import Logo from "../Brand/Logo";
import { usePageMeta } from "../../function/pageMeta";

const field =
  "h-12 w-full rounded-xl border border-line bg-void px-4 text-[15px] text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15";

const Login = ({ isModalOpen }) => {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector(selectAuth);
  usePageMeta("Log in", "Log in to PlayTube to pick up watching where you left off.");

  const handleData = (value) => {
    if (value.includes("@")) {
      setData({ ...data, email: value, username: "" });
    } else {
      setData({ ...data, email: "", username: value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginPromise = () =>
      new Promise(async (resolve, reject) => {
        try {
          const res = await dispatch(login(data));
          if (res?.payload?.user) {
            // Fresh account, fresh cache (covers account switching).
            dispatch(resetLibrary());
            navigate("/home");
            isModalOpen?.(false);
            resolve(res.payload);
          } else {
            reject(new Error(res.payload?.error || "Login failed"));
          }
        } catch {
          reject(new Error("An error occurred while logging in"));
        }
      });
    toast.promise(loginPromise, {
      loading: "Rolling the film…",
      success: "Welcome back to your seat",
      error: (error) => `Error: ${error.message}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-void px-4 py-10">
      <Logo />
      <form
        onSubmit={handleLogin}
        className="mt-6 w-full max-w-sm rounded-3xl border border-line bg-panel p-8 shadow-card"
      >
        <h1 className="text-2xl font-black tracking-tight text-zinc-100">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-500">The show held your seat.</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-bold text-zinc-300">Username or email</span>
          <input
            type="text"
            onChange={(e) => handleData(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            className={field}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-bold text-zinc-300">
            Password
            <Link to="/forgot-password" className="font-bold text-ember hover:text-ember-bright">Forgot ticket?</Link>
          </span>
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className={field}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
        </label>
        <button
          type="submit"
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-ember text-[15px] font-bold text-void transition hover:bg-ember-bright disabled:opacity-60"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? <ScaleLoader loading color="#0A0A0F" height={20} /> : "Take your seat"}
        </button>
        <p className="mt-4 text-center text-sm text-zinc-500">
          New here?{" "}
          <Link to="/signup" className="font-bold text-ember hover:text-ember-bright">Claim a seat</Link>
          {" · "}
          <Link to="/verify-otp" className="font-bold text-ember hover:text-ember-bright">Verify email</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
