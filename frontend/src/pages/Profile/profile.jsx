import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { selectLibrary, fetchHistory } from "../../Redux/Features/Library/librarySlice";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty } from "../../components/FeedStates/FeedStates";
import { usePageMeta } from "../../function/pageMeta";

const Profile = () => {
  const authState = useSelector(selectAuth);
  const { isLogin, user } = authState;
  const dispatch = useDispatch();
  const history = useSelector(selectLibrary).history;
  const name = user?.fullName || user?.username || "Guest viewer";
  const initial = (name[0] || "G").toUpperCase();
  usePageMeta("Your profile", "Your PlayTube identity, channel info and watch history.");

  useEffect(() => {
    if (isLogin) dispatch(fetchHistory());
  }, [isLogin, dispatch]);

  return (
    <div className="w-full overflow-y-auto bg-void">
      <div className="h-36 bg-panel sm:h-44">
        {user?.coverImage ? (
          <img src={user.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-10 flex flex-wrap items-end gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={name} className="h-20 w-20 rounded-full border-4 border-void object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-void bg-ember font-display text-3xl font-black text-white">
              {initial}
            </span>
          )}
          <div className="pb-1">
            <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">{name}</h1>
            <p className="text-sm text-zinc-500">{user?.email || "Sign in to sync your library"}</p>
          </div>
          <div className="mb-1 ml-auto flex gap-2">
            <Link to="/settings" className="inline-flex h-10 items-center rounded-full border border-line bg-panel px-5 text-sm font-bold text-zinc-200 hover:border-ember/50 hover:text-ember">
              Settings
            </Link>
            {!user?.email && (
              <Link to="/verify-otp" className="inline-flex h-10 items-center rounded-full border border-line bg-panel px-5 text-sm font-bold text-zinc-200 hover:border-ember/50 hover:text-ember">
                Verify email
              </Link>
            )}
          </div>
        </div>

        <h2 className="mt-8 font-display text-lg font-black tracking-tight text-zinc-100">Keep watching</h2>
        <div className="mt-4 pb-10">
          {!isLogin || !history.updatedAt ? (
            !isLogin ? (
            <FeedEmpty
              title="Sign in to build history"
              hint="Your watch history syncs once you log in."
              actionTo="/login"
              actionLabel="Log in"
            />
            ) : (
              <CardsSkeleton count={4} />
            )
          ) : history.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {history.items.slice(0, 8).map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </div>
          ) : (
            <FeedEmpty
              title="Nothing on the reel yet"
              hint="Premieres you watch land here automatically."
              actionTo="/home"
              actionLabel="Watch something"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
