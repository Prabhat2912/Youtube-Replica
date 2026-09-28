import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiPlay, FiFolder, FiThumbsUp, FiUsers, FiTrash2, FiEdit3, FiEye, FiEyeOff } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import {
  selectLibrary,
  fetchDash,
  patchVideoMeta,
  dropVideo,
  flipPublished,
} from "../../Redux/Features/Library/librarySlice";
import { feedApi, serverMessage } from "../../function/libraryApi";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { timeAgo } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Dashboard = () => {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuth);
  const name = authState.user?.fullName || authState.user?.username || "Creator";
  const dash = useSelector(selectLibrary).dash;
  usePageMeta("Creator dashboard", "Your PlayTube channel stats, uploads and playlists at a glance.");

  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    dispatch(fetchDash()).unwrap().catch((e) => setError(e));
  }, [dispatch]);

  const loading = !dash.updatedAt && !dash.uploads.length && !error;
  const uploads = dash.uploads;
  const totalViews = dash.stats?.totalVideoViews ?? uploads.reduce((s, v) => s + (v.views || 0), 0);
  const cards = [
    { icon: <FiPlay />, label: "Total views", value: formatViews(totalViews).replace(" views", "") },
    { icon: <FiUsers />, label: "Followers", value: String(dash.stats?.totalSubscribers ?? 0) },
    { icon: <FiThumbsUp />, label: "Applauded", value: String(dash.stats?.totalLikes ?? dash.likedCount) },
    { icon: <FiFolder />, label: "Collections", value: String(dash.playlistCount) },
  ];

  const openEdit = (v) => {
    setEditing(v);
    setEditTitle(v.title);
    setEditDesc(v.description || "");
  };

  const saveEdit = (e) => {
    e?.preventDefault();
    if (!editing || !editTitle.trim()) return;
    setSaving(true);
    feedApi
      .updateVideo(editing.id, { title: editTitle.trim(), description: editDesc.trim() })
      .then(() => {
        dispatch(patchVideoMeta({ id: editing.id, patch: { title: editTitle.trim(), description: editDesc.trim() } }));
        setEditing(null);
      })
      .catch((err) => setError(serverMessage(err, "Could not save those changes.")))
      .finally(() => setSaving(false));
  };

  const remove = (videoId) => {
    if (confirming !== videoId) {
      setConfirming(videoId);
      setTimeout(() => setConfirming((c) => (c === videoId ? null : c)), 3000);
      return;
    }
    setConfirming(null);
    setBusy(videoId);
    feedApi
      .deleteVideo(videoId)
      .then(() => dispatch(dropVideo({ id: videoId })))
      .catch((err) => setError(serverMessage(err, "Could not delete that premiere.")))
      .finally(() => setBusy(null));
  };

  const flipPublish = (v) => {
    setBusy(v.id);
    feedApi
      .togglePublish(v.id)
      .then((now) => dispatch(flipPublished({ id: v.id, published: typeof now === "boolean" ? now : !v.published })))
      .catch((err) => setError(serverMessage(err, "Could not flip that switch.")))
      .finally(() => setBusy(null));
  };

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Curtain up, {name}</h1>
      <p className="mt-1 text-sm text-zinc-500">Your channel, counted live from the network.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-panel p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember/10 text-ember">{s.icon}</span>
            <p className="mt-3 text-2xl font-black tabular-nums tracking-tight text-zinc-100">
              {loading ? "…" : s.value}
            </p>
            <p className="text-[13px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-black tracking-tight text-zinc-100">Your premieres</h2>
        <Link to="/upload" className="inline-flex h-10 items-center gap-2 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright">
          <FiUpload /> New premiere
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-bright">{error}</p>
      )}

      <div className="mt-4">
        {loading ? (
          <CardsSkeleton count={4} />
        ) : error && !uploads.length ? (
          <FeedError message={error} onRetry={() => dispatch(fetchDash({ force: true })).unwrap().then(() => setError(null)).catch((e) => setError(e))} />
        ) : uploads.length ? (
          <>
            <ul className="space-y-3">
              {uploads.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-panel p-4">
                  <img src={v.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-bold text-zinc-100">{v.title}</p>
                    <p className="mt-0.5 text-[13px] text-zinc-500">
                      {formatViews(v.views)} · {v.age || timeAgo(v.createdAt)}
                      {v.published === false && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">Unlisted</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => flipPublish(v)}
                      disabled={busy === v.id}
                      title={v.published === false ? "List this premiere" : "Unlist this premiere"}
                      aria-label={v.published === false ? "List this premiere" : "Unlist this premiere"}
                      className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-gold disabled:opacity-50"
                    >
                      {v.published === false ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button
                      onClick={() => openEdit(v)}
                      aria-label="Edit premiere"
                      className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => remove(v.id)}
                      disabled={busy === v.id}
                      aria-label={confirming === v.id ? "Confirm delete" : "Delete premiere"}
                      className={`h-9 rounded-full px-3 text-[13px] font-bold transition disabled:opacity-50 ${
                        confirming === v.id
                          ? "bg-ember/15 text-ember"
                          : "text-zinc-500 hover:bg-white/5 hover:text-ember"
                      }`}
                    >
                      {confirming === v.id ? "Sure?" : <FiTrash2 size={16} />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 mt-8 font-display text-base font-black text-zinc-100">On the marquee</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uploads.slice(0, 4).map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </div>
          </>
        ) : (
          <FeedEmpty
            title="No premieres yet"
            hint="Publish your first video and it lands here with live view counts."
            actionTo="/upload"
            actionLabel="Premiere a video"
          />
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={() => setEditing(null)}>
          <form
            onSubmit={saveEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-line bg-panel p-6"
          >
            <h3 className="font-display text-lg font-black text-zinc-100">Edit premiere</h3>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-bold text-zinc-300">Title</span>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={120}
                className="h-12 w-full rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-sm font-bold text-zinc-300">Description</span>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-void px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember/60"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-full px-5 text-sm font-bold text-zinc-400 hover:bg-white/5">
                Cancel
              </button>
              <button type="submit" disabled={saving || !editTitle.trim()} className="h-10 rounded-full bg-ember px-6 text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
