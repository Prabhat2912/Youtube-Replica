import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { toast } from "sonner";
import { ScaleLoader } from "react-spinners";
import Logo from "../Brand/Logo";

const Login = ({ isModalOpen }) => {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector(selectAuth);

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
      loading: "Logging in…",
      success: "Welcome back",
      error: (error) => `Error: ${error.message}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-stone-50 px-4 py-10">
      <Logo />
      <form
        onSubmit={handleLogin}
        className="mt-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-pop"
      >
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to pick up where you left off.</p>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Username or email</span>
          <input
            type="text"
            onChange={(e) => handleData(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            className="h-12 w-full rounded-xl border border-slate-200 bg-stone-50 px-4 text-[15px] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-stone-50 px-4 text-[15px] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
        </label>
        <button
          type="submit"
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-orange-600 text-[15px] font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? <ScaleLoader loading color="white" height={20} /> : "Log in"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-orange-600 hover:text-orange-500">Create account</Link>
          {" · "}
          <Link to="/verify-otp" className="font-semibold text-orange-600 hover:text-orange-500">Verify email</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
