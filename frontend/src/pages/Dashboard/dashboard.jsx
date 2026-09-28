import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUpload, FiPlay, FiFolder, FiThumbsUp, FiUsers, FiTrash2, FiEdit3, FiEye, FiEyeOff } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard, timeAgo } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Dashboard = () => {
  const authState = useSelector(selectAuth);
  const name = authState.user?.fullName || authState.user?.username || "Creator";
  usePageMeta("Creator dashboard", "Your PlayTube channel stats, uploads and playlists at a glance.");

  const [stats, setStats] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null); // video card object
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // videoId for delete/publish
  const [confirming, setConfirming] = useState(null); // videoId

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [s, mine, liked, playlists] = await Promise.all([
        feedApi.channelStats().catch(() => null),
        feedApi.channelVideos().catch(() => []),
        feedApi.likedVideos().catch(() => []),
        feedApi.playlists(authState.user?._id).catch(() => []),
      ]);
      setStats(s);
      setUploads(Array.isArray(mine) ? mine.map(toCard) : []);
      setLikedCount(Array.isArray(liked) ? liked.length : 0);
      setPlaylistCount(Array.isArray(playlists) ? playlists.length : 0);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load your dashboard."));
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalViews = stats?.totalVideoViews ?? uploads.reduce((s, v) => s + (v.views || 0), 0);
  const cards = [
    { icon: <FiPlay />, label: "Total views", value: formatViews(totalViews).replace(" views", "") },
    { icon: <FiUsers />, label: "Followers", value: String(stats?.totalSubscribers ?? 0) },
    { icon: <FiThumbsUp />, label: "Applauded", value: String(stats?.totalLikes ?? likedCount) },
    { icon: <FiFolder />, label: "Collections", value: String(playlistCount) },
  ];

  const openEdit = (v) => {
    setEditing(v);
    setEditTitle(v.title);
    setEditDesc(v.description || "");
  };

  const saveEdit = async (e) => {
    e?.preventDefault();
    if (!editing || !editTitle.trim()) return;
    setSaving(true);
    try {
      await feedApi.updateVideo(editing.id, { title: editTitle.trim(), description: editDesc.trim() });
      setUploads((us) => us.map((u) => (u.id === editing.id ? { ...u, title: editTitle.trim(), description: editDesc.trim() } : u)));
      setEditing(null);
    } catch (err) {
      setError(serverMessage(err, "Could not save those changes."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (videoId) => {
    if (confirming !== videoId) {
      setConfirming(videoId);
      setTimeout(() => setConfirming((c) => (c === videoId ? null : c)), 3000);
      return;
    }
    setConfirming(null);
    setBusy(videoId);
    try {
      await feedApi.deleteVideo(videoId);
      setUploads((us) => us.filter((u) => u.id !== videoId));
    } catch (err) {
      setError(serverMessage(err, "Could not delete that premiere."));
    } finally {
      setBusy(null);
    }
  };

  const flipPublish = async (v) => {
    setBusy(v.id);
    try {
      const now = await feedApi.togglePublish(v.id);
      setUploads((us) => us.map((u) => (u.id === v.id ? { ...u, published: typeof now === "boolean" ? now : !u.published } : u)));
    } catch (err) {
      setError(serverMessage(err, "Could not flip that switch."));
    } finally {
      setBusy(null);
    }
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
              {status === "loading" ? "…" : s.value}
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
        {status === "loading" ? (
          <CardsSkeleton count={4} />
        ) : status === "error" && !uploads.length ? (
          <FeedError message={error} onRetry={load} />
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
