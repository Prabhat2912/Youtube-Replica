import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  register,
  selectAuth,
} from "../../Redux/Features/Auth/AuthSlice";
import uploadOnCloudinary from "../../function/cloudinary";
import { toast } from "sonner";
import { ScaleLoader } from "react-spinners";
import Logo from "../Brand/Logo";
import PasswordField from "../PasswordField/PasswordField";
import { usePageMeta } from "../../function/pageMeta";

const field =
  "h-12 w-full rounded-xl border border-line bg-void px-4 text-[15px] text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15";

const SignUp = () => {
  const [data, setData] = useState({
    fullName: "",
    avatar: "",
    coverImage: "",
    username: "",
    email: "",
    password: "",
  });
  const [images, setImages] = useState({ avatarFile: "", coverImageFile: "" });
  const [preview, setPreview] = useState(null);
  const authState = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  usePageMeta("Create your account", "Join PlayTube free — verify your email and start uploading.");

  const handleImageChange = (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setPreview((p) => ({ ...p, [imageType]: reader.result }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const signUpPromise = () =>
      new Promise(async (resolve, reject) => {
        try {
          const uploads = [];
          if (images.avatarFile) uploads.push(uploadOnCloudinary(images.avatarFile));
          if (images.coverImageFile) uploads.push(uploadOnCloudinary(images.coverImageFile));
          const [avatarRes, coverRes] = await Promise.all(
            uploads.length ? uploads : [Promise.resolve(null), Promise.resolve(null)]
          );
          const registerResponse = await dispatch(
            register({
              ...data,
              avatar: avatarRes?.url || data.avatar,
              coverImage: coverRes?.url || data.coverImage,
            })
          );
          if (registerResponse.payload) {
            const loginResponse = await dispatch(
              login({ username: data.username, password: data.password })
            );
            if (loginResponse.payload) {
              resolve("ok");
              navigate("/verify-otp", { state: { email: data.email, next: "/home" } });
            } else {
              reject(new Error("Registered, but automatic login failed. Please log in."));
            }
          } else {
            reject(new Error("Registration failed."));
          }
        } catch {
          reject(new Error("An error occurred during sign-up."));
        }
      });
    toast.promise(signUpPromise, {
      loading: "Printing your ticket…",
      success: "Seat claimed — check your inbox for the code",
      error: (error) => `Error: ${error.message}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-void px-4 py-10">
      <Logo />
      <form onSubmit={handleSignUp} className="mt-6 w-full max-w-md rounded-3xl border border-line bg-panel p-8 shadow-card">
        <h1 className="text-2xl font-black tracking-tight text-zinc-100">Claim your seat</h1>
        <p className="mt-1 text-sm text-zinc-500">Free forever. Verify your email to start premiering.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-zinc-300">Full name</span>
            <input type="text" required placeholder="Aarav Sharma" className={field}
              onChange={(e) => setData({ ...data, fullName: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-zinc-300">Username</span>
            <input type="text" required placeholder="aarav" className={field}
              onChange={(e) => setData({ ...data, username: e.target.value })} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold text-zinc-300">Email</span>
          <input type="email" required placeholder="you@example.com" autoComplete="email" className={field}
            onChange={(e) => setData({ ...data, email: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold text-zinc-300">Password</span>
          <PasswordField required placeholder="At least 8 characters" autoComplete="new-password" className={field}
            onChange={(e) => setData({ ...data, password: e.target.value })} />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-zinc-300">Avatar</span>
            <input type="file" accept="image/*"
              className="w-full rounded-xl border border-dashed border-line bg-void px-3 py-2.5 text-sm text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:font-bold file:text-void"
              onChange={(e) => { setImages({ ...images, avatarFile: e.target.files[0] }); handleImageChange(e, "avatar"); }} />
            {preview?.avatar && <img alt="Avatar preview" src={preview.avatar} className="mt-2 h-14 w-14 rounded-full object-cover" />}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-zinc-300">Cover image</span>
            <input type="file" accept="image/*"
              className="w-full rounded-xl border border-dashed border-line bg-void px-3 py-2.5 text-sm text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-ember file:px-3 file:py-1.5 file:font-bold file:text-void"
              onChange={(e) => { setImages({ ...images, coverImageFile: e.target.files[0] }); handleImageChange(e, "coverImage"); }} />
            {preview?.coverImage && <img alt="Cover preview" src={preview.coverImage} className="mt-2 h-14 w-full rounded-lg object-cover" />}
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-ember text-[15px] font-bold text-void transition hover:bg-ember-bright disabled:opacity-60"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? <ScaleLoader loading color="#0A0A0F" height={20} /> : "Claim seat"}
        </button>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Have a ticket? <Link to="/login" className="font-bold text-ember hover:text-ember-bright">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
