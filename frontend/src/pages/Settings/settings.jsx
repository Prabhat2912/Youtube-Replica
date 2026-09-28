import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth, setUser } from "../../Redux/Features/Auth/AuthSlice";
import UpdateAccount from "../../components/UpdateAccount/UpdateAccount";
import PasswordChange from "../../components/PasswordChange/PasswordChange";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { uploadToCloudinary } from "../../function/cloudinaryUpload";
import { usePageMeta } from "../../function/pageMeta";

const Settings = () => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [tab, setTab] = useState("account");
  const [imgBusy, setImgBusy] = useState(null);
  const [imgError, setImgError] = useState(null);
  usePageMeta("Settings", "Manage your PlayTube identity, password and session.");

  const refreshMe = async () => {
    try {
      const me = await feedApi.me();
      if (me?._id) {
        dispatch(setUser(me));
        localStorage.setItem("user", JSON.stringify(me));
      }
    } catch { /* profile screens re-read on visit */ }
  };

  const saveImage = async (kind, file) => {
    if (!file) return;
    setImgBusy(kind);
    setImgError(null);
    try {
      const done = await uploadToCloudinary(file, "image", () => {});
      if (kind === "avatar") await feedApi.patchAvatar(done.secure_url);
      else await feedApi.patchCover(done.secure_url);
      await refreshMe();
    } catch (err) {
      setImgError(serverMessage(err, "Could not update that image."));
    } finally {
      setImgBusy(null);
    }
  };

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Signed in as <span className="font-bold text-zinc-300">{user?.fullName || user?.username}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["account", "Account"],
          ["images", "Images"],
          ["password", "Password"],
          ["session", "Session"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`h-10 rounded-full px-5 text-sm font-bold transition ${
              tab === id ? "bg-ember text-white" : "border border-line bg-panel text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 max-w-lg rounded-3xl border border-line bg-panel p-6">
        {tab === "account" && <UpdateAccount isModalOpen={() => {}} />}
        {tab === "images" && (
          <div className="space-y-5">
            {[
              ["avatar", "Profile picture", user?.avatar, "h-20 w-20 rounded-full"],
              ["cover", "Room banner", user?.coverImage, "h-24 w-full rounded-2xl"],
            ].map(([kind, label, src, cls]) => (
              <div key={kind}>
                <p className="mb-2 text-sm font-bold text-zinc-300">{label}</p>
                {src ? (
                  <img src={src} alt={`${label} preview`} className={`${cls} border border-line object-cover`} />
                ) : (
                  <p className="text-sm text-zinc-500">None yet.</p>
                )}
                <label className="mt-2 block cursor-pointer rounded-xl border border-dashed border-line bg-void px-4 py-3 text-center text-sm font-bold text-zinc-300 transition hover:border-ember/60 hover:text-zinc-100">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => saveImage(kind, e.target.files[0])}
                  />
                  {imgBusy === kind ? "Uploading…" : `Upload new ${label.toLowerCase()}`}
                </label>
              </div>
            ))}
            {imgError && <p role="alert" className="text-sm text-ember-bright">{imgError}</p>}
          </div>
        )}
        {tab === "password" && <PasswordChange isModalOpen={() => {}} />}
        {tab === "session" && (
          <div>
            <p className="text-sm leading-6 text-zinc-400">
              Logging out ends this session on this device. Your premieres,
              collections and subscriptions stay on your account.
            </p>
            <button
              onClick={() => dispatch(logout())}
              className="mt-4 h-11 w-full rounded-xl border border-ember/50 font-bold text-ember hover:bg-ember/10"
            >
              Log out everywhere here
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        Stuck? <Link to="/help" className="font-bold text-ember">Visit the help desk</Link>
      </p>
    </div>
  );
};

export default Settings;
