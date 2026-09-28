import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { videos } from "../../data/videos";
import VideoCard from "../../components/VideoCard/videoCard";
import { usePageMeta } from "../../function/pageMeta";

const Profile = () => {
  const authState = useSelector(selectAuth);
  const user = authState.user || {};
  const name = user.fullName || user.username || "Guest viewer";
  const initial = (name[0] || "G").toUpperCase();
  usePageMeta("Your profile", "Your PlayTube identity, channel info and watch-later library.");

  return (
    <div className="w-full overflow-y-auto bg-void">
      <div className="h-36 bg-panel sm:h-44">
        {user.coverImage ? (
          <img src={user.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-10 flex flex-wrap items-end gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt={name} className="h-20 w-20 rounded-full border-4 border-void object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-void bg-lime text-3xl font-black text-void">
              {initial}
            </span>
          )}
          <div className="pb-1">
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">{name}</h1>
            <p className="text-sm text-zinc-500">{user.email || "Sign in to sync your library"}</p>
          </div>
          <Link to="/verify-otp" className="mb-1 ml-auto inline-flex h-10 items-center rounded-full border border-line bg-panel px-5 text-sm font-bold text-zinc-200 hover:border-lime/50 hover:text-lime">
            Verify email
          </Link>
        </div>

        <h2 className="mt-8 text-lg font-black tracking-tight text-zinc-100">Keep watching</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.slice(4, 8).map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
