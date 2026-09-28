import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiPlus } from "react-icons/fi";
import VideoCard from "../../components/VideoCard/videoCard";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const shell = "w-full overflow-y-auto bg-void px-4 py-6 sm:px-6";

export const Liked = () => {
  usePageMeta("Liked premieres", "Every PlayTube video you applauded, in one place.");
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await feedApi.likedVideos();
      setList(Array.isArray(data) ? data.map(toCard) : []);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load your applauded list."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={shell}>
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Applauded</h1>
      <p className="mt-1 text-sm text-zinc-500">Every premiere you reacted to.</p>
      <div className="mt-5">
        {status === "loading" ? (
          <CardsSkeleton />
        ) : status === "error" ? (
          <FeedError message={error} onRetry={load} />
        ) : list.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((v) => (
              <VideoCard key={v.id} data={v} />
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="No applause yet"
            hint="Tap the thumbs-up on any premiere and it lands here."
            actionTo="/home"
            actionLabel="Find something good"
          />
        )}
      </div>
    </div>
  );
};

export const Library = () => {
  usePageMeta("Collections", "Your PlayTube collections and saved premieres.");
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id;
      if (!userId) throw new Error("Log in again to load your collections.");
      const data = await feedApi.playlists(userId);
      setList(Array.isArray(data) ? data : []);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load your collections."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || creating) return;
    setCreating(true);
    try {
      const pl = await feedApi.createPlaylist(name.trim(), description.trim());
      if (pl?._id) setList((ls) => [pl, ...ls]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(serverMessage(err, "Could not create that collection."));
    } finally {
      setCreating(false);
    }
  };

  const remove = async (playlistId) => {
    if (confirming !== playlistId) {
      setConfirming(playlistId);
      setTimeout(() => setConfirming((c) => (c === playlistId ? null : c)), 3000);
      return;
    }
    setConfirming(null);
    setBusy(playlistId);
    try {
      await feedApi.deletePlaylist(playlistId);
      setList((ls) => ls.filter((p) => p._id !== playlistId));
    } catch (err) {
      setError(serverMessage(err, "Could not delete that collection."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={shell}>
      <h1 className="font-display text-2xl font-black tracking-tight text-zinc-100">Collections</h1>
      <p className="mt-1 text-sm text-zinc-500">Themed shelves of premieres — workout cuts, midnight docs, whatever the week needs.</p>

      <form onSubmit={create} className="mt-5 flex max-w-2xl flex-col gap-2 rounded-3xl border border-line bg-panel p-4 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name"
          maxLength={60}
          aria-label="Collection name"
          className="h-11 flex-1 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What belongs on this shelf?"
          maxLength={140}
          aria-label="Collection description"
          className="h-11 flex-[1.4] rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
        />
        <button
          type="submit"
          disabled={creating || !name.trim() || !description.trim()}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlus /> {creating ? "Shelving…" : "Shelve it"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 max-w-2xl rounded-2xl border border-ember/40 bg-ember/5 p-4 text-sm text-ember-bright">{error}</p>
      )}

      <div className="mt-5">
        {status === "loading" ? (
          <CardsSkeleton count={4} />
        ) : status === "error" && !list.length ? (
          <FeedError message={error} onRetry={load} />
        ) : list.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <div key={p._id} className="group rounded-3xl border border-line bg-panel p-6 transition hover:border-ember/40">
                <Link to={`/library/${p._id}`} className="block">
                  <p className="font-display text-lg font-bold text-zinc-100 group-hover:text-ember">{p.name || "Untitled collection"}</p>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">{p.description}</p>}
                  <p className="mt-3 text-[13px] font-bold text-zinc-400">
                    {Array.isArray(p.videos) ? p.videos.length : 0} premiere{(Array.isArray(p.videos) ? p.videos.length : 0) === 1 ? "" : "s"} · Open shelf →
                  </p>
                </Link>
                <button
                  onClick={() => remove(p._id)}
                  disabled={busy === p._id}
                  className={`mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition disabled:opacity-50 ${
                    confirming === p._id ? "bg-ember/15 text-ember" : "text-zinc-500 hover:bg-white/5 hover:text-ember"
                  }`}
                >
                  <FiTrash2 size={14} /> {confirming === p._id ? "Sure?" : "Delete shelf"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <FeedEmpty
            title="No collections yet"
            hint="Name a shelf above and start collecting premieres into it."
          />
        )}
      </div>
    </div>
  );
};
