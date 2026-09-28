import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import {
  selectLibrary,
  fetchPlaylistDetail,
  renamePlaylist,
  deletePlaylist,
  toggleShelfVideo,
} from "../../Redux/Features/Library/librarySlice";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bag = useSelector(selectLibrary).details[playlistId];
  const pl = bag?.data || null;
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null);
  const [confirming, setConfirming] = useState(null);

  usePageMeta(
    pl?.name || "Collection",
    pl?.description || "A PlayTube collection of premieres."
  );

  useEffect(() => {
    dispatch(fetchPlaylistDetail({ id: playlistId }))
      .unwrap()
      .then((d) => {
        if (d && !d.cached) {
          setName(d.data?.name || "");
          setDescription(d.data?.description || "");
        }
      })
      .catch((e) => setError(e));
  }, [dispatch, playlistId]);

  useEffect(() => {
    if (pl && !name && !description) {
      setName(pl.name || "");
      setDescription(pl.description || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pl?._id]);

  const save = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || saving) return;
    setSaving(true);
    dispatch(renamePlaylist({ id: playlistId, name: name.trim(), description: description.trim() }))
      .unwrap()
      .then(() => setEditing(false))
      .catch((err) => setError(err))
      .finally(() => setSaving(false));
  };

  const pull = (videoId) => {
    setBusy(videoId);
    dispatch(toggleShelfVideo({ videoId, playlistId, has: true }))
      .unwrap()
      .catch((err) => setError(err))
      .finally(() => setBusy(null));
  };

  const destroy = () => {
    if (confirming !== playlistId) {
      setConfirming(playlistId);
      setTimeout(() => setConfirming(null), 3000);
      return;
    }
    dispatch(deletePlaylist({ id: playlistId }))
      .unwrap()
      .then(() => navigate("/library", { replace: true }))
      .catch((err) => {
        setError(err);
        setConfirming(null);
      });
  };

  const videos = Array.isArray(pl?.videos) ? pl.videos : [];

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/library" className="text-sm font-bold text-zinc-500 hover:text-ember">← All collections</Link>
        {!pl ? (
          error ? (
            <div className="mt-4"><FeedError message={error} onRetry={() => dispatch(fetchPlaylistDetail({ id: playlistId, force: true })).unwrap().catch((e) => setError(e))} /></div>
          ) : (
            <div className="mt-4">
              <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
              <div className="mt-5"><CardsSkeleton count={4} /></div>
            </div>
          )
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-black tracking-tight text-zinc-100">{pl.name}</h1>
                <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">{pl.description}</p>
                <p className="mt-2 text-[13px] font-bold text-zinc-400">{videos.length} premiere{videos.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-5 text-sm font-bold text-zinc-200 hover:border-ember/50"
                >
                  <FiEdit3 size={14} /> Rename
                </button>
                <button
                  onClick={destroy}
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-bold transition ${
                    confirming === playlistId ? "bg-ember/15 text-ember" : "border border-line text-zinc-400 hover:text-ember"
                  }`}
                >
                  <FiTrash2 size={14} /> {confirming === playlistId ? "Sure?" : "Delete"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-bright">{error}</p>
            )}

            {editing && (
              <form onSubmit={save} className="mt-4 flex max-w-2xl flex-col gap-2 rounded-3xl border border-line bg-panel p-4 sm:flex-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  aria-label="Collection name"
                  className="h-11 flex-1 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={140}
                  aria-label="Collection description"
                  className="h-11 flex-[1.4] rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
                />
                <button type="submit" disabled={saving} className="h-11 rounded-xl bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-50">
                  Save
                </button>
              </form>
            )}

            {videos.length ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((raw) => {
                  const v = toCard(typeof raw === "object" ? raw : { _id: raw });
                  const vid = String(raw?._id || raw);
                  return (
                    <div key={vid} className="relative">
                      <VideoCard data={v} />
                      <button
                        onClick={() => pull(vid)}
                        disabled={busy === vid}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-bold text-zinc-300 backdrop-blur hover:text-ember disabled:opacity-50"
                      >
                        {busy === vid ? "…" : "Pull off shelf"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6">
                <FeedEmpty
                  title="An empty shelf"
                  hint="Premieres you keep land in Watch Later; file this shelf's theme from any watch page."
                  actionTo="/home"
                  actionLabel="Find premieres"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;
