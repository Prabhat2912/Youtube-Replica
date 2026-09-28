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

const field =
  "h-12 w-full rounded-xl border border-slate-200 bg-stone-50 px-4 text-[15px] text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100";

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
              // New accounts confirm email before full access
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
      loading: "Creating your account…",
      success: "Account created — check your inbox for the code",
      error: (error) => `Error: ${error.message}`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-stone-50 px-4 py-10">
      <Logo />
      <form onSubmit={handleSignUp} className="mt-6 w-full max-w-md rounded-2xl bg-white p-8 shadow-pop">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Free forever. Verify your email to start uploading.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span>
            <input type="text" required placeholder="Aarav Sharma" className={field}
              onChange={(e) => setData({ ...data, fullName: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Username</span>
            <input type="text" required placeholder="aarav" className={field}
              onChange={(e) => setData({ ...data, username: e.target.value })} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
          <input type="email" required placeholder="you@example.com" autoComplete="email" className={field}
            onChange={(e) => setData({ ...data, email: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
          <input type="password" required placeholder="At least 8 characters" autoComplete="new-password" className={field}
            onChange={(e) => setData({ ...data, password: e.target.value })} />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Avatar</span>
            <input type="file" accept="image/*"
              className="w-full rounded-xl border border-dashed border-slate-300 bg-stone-50 px-3 py-2.5 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white"
              onChange={(e) => { setImages({ ...images, avatarFile: e.target.files[0] }); handleImageChange(e, "avatar"); }} />
            {preview?.avatar && <img alt="Avatar preview" src={preview.avatar} className="mt-2 h-14 w-14 rounded-full object-cover" />}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Cover image</span>
            <input type="file" accept="image/*"
              className="w-full rounded-xl border border-dashed border-slate-300 bg-stone-50 px-3 py-2.5 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white"
              onChange={(e) => { setImages({ ...images, coverImageFile: e.target.files[0] }); handleImageChange(e, "coverImage"); }} />
            {preview?.coverImage && <img alt="Cover preview" src={preview.coverImage} className="mt-2 h-14 w-full rounded-lg object-cover" />}
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-orange-600 text-[15px] font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
          disabled={authState.isLoading}
        >
          {authState.isLoading ? <ScaleLoader loading color="white" height={20} /> : "Sign up"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
