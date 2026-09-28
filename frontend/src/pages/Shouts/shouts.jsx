import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiThumbsUp, FiTrash2, FiEdit3 } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import { CardsSkeleton, FeedEmpty, FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { timeAgo } from "../../function/format";
import { usePageMeta } from "../../function/pageMeta";

const Shouts = () => {
  const { isLogin, user } = useSelector(selectAuth);
  const navigate = useNavigate();
  usePageMeta("Shouts", "Short backstage notes from across the PlayTube network.");

  const [tab, setTab] = useState("latest"); // latest | mine
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(null); // tweetId
  const [editText, setEditText] = useState("");
  const [confirming, setConfirming] = useState(null); // tweetId
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data =
        tab === "mine"
          ? await feedApi.userTweets(user?._id || JSON.parse(localStorage.getItem("user") || "{}")?._id)
          : await feedApi.latestTweets();
      setList(Array.isArray(data) ? data : []);
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load shouts."));
      setStatus("error");
    }
  }, [tab, user?._id]);

  useEffect(() => {
    if (tab === "mine" && !isLogin) {
      navigate("/login", { replace: true });
      return;
    }
    load();
  }, [tab, isLogin, load, navigate]);

  const shout = async (e) => {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    setPosting(true);
    try {
      await feedApi.createTweet(draft.trim());
      setDraft("");
      await load();
      setTab("mine");
    } catch (err) {
      setError(serverMessage(err, "Could not post that shout."));
      setStatus("error");
    } finally {
      setPosting(false);
    }
  };

  const saveEdit = async (tweetId) => {
    if (!editText.trim()) return;
    setBusy(tweetId);
    try {
      await feedApi.updateTweet(tweetId, editText.trim());
      setEditing(null);
      await load();
    } catch (err) {
      setError(serverMessage(err, "Could not save that edit."));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (tweetId) => {
    if (confirming !== tweetId) {
      setConfirming(tweetId);
      setTimeout(() => setConfirming((c) => (c === tweetId ? null : c)), 3000);
      return;
    }
    setConfirming(null);
    setBusy(tweetId);
    try {
      await feedApi.deleteTweet(tweetId);
      setList((ls) => ls.filter((t) => t._id !== tweetId));
    } catch (err) {
      setError(serverMessage(err, "Could not delete that shout."));
    } finally {
      setBusy(null);
    }
  };

  const like = async (tweetId) => {
    if (!isLogin) return navigate("/login");
    setList((ls) =>
      ls.map((t) => (t._id === tweetId ? { ...t, likesCount: (t.likesCount || 0) + 1 } : t))
    );
    try {
      const total = await feedApi.toggleTweetLike(tweetId);
      setList((ls) =>
        ls.map((t) => (t._id === tweetId ? { ...t, likesCount: typeof total === "number" ? total : t.likesCount } : t))
      );
    } catch {
      load();
    }
  };

  const mine = (t) =>
    isLogin && user?._id && String(t?.owner?._id || t?.owner) === String(user._id);

  return (
    <div className="w-full overflow-y-auto bg-void px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="-rotate-1 inline-block rounded-xl bg-gold px-3 py-1 text-[12px] font-black uppercase tracking-[0.14em] text-void">
          Backstage mic
        </p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-zinc-100">Shouts</h1>
        <p className="mt-1 text-sm text-zinc-500">Short notes from the rooms — drops, polls, premiere dates.</p>

        <div className="mt-5 flex gap-2">
          {[
            ["latest", "Latest"],
            ["mine", "My shouts"],
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

        {isLogin && (
          <form onSubmit={shout} className="mt-4 rounded-3xl border border-line bg-panel p-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Shout something to the rooms…"
              aria-label="Write a shout"
              rows={2}
              maxLength={280}
              className="w-full resize-none bg-transparent text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12.5px] tabular-nums text-zinc-600">{draft.length}/280</span>
              <button
                type="submit"
                disabled={posting || !draft.trim()}
                className="h-10 rounded-full bg-ember px-6 text-sm font-bold text-white hover:bg-ember-bright disabled:cursor-not-allowed disabled:opacity-50"
              >
                {posting ? "Shouting…" : "Shout"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4">
          {status === "loading" ? (
            <CardsSkeleton count={4} />
          ) : status === "error" ? (
            <FeedError message={error} onRetry={load} />
          ) : list.length ? (
            <ul className="space-y-3">
              {list.map((t) => {
                const owner = t.owner && typeof t.owner === "object" ? t.owner : {};
                const name = owner.fullName || owner.username || "Member";
                const own = mine(t);
                return (
                  <li key={t._id} className="rounded-3xl border border-line bg-panel p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-100">{name}</p>
                        <p className="text-[12.5px] text-zinc-500">@{owner.username || "member"} · {timeAgo(t.createdAt)}</p>
                      </div>
                      {own && (
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => {
                              setEditing(editing === t._id ? null : t._id);
                              setEditText(t.content);
                            }}
                            aria-label="Edit shout"
                            className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
                          >
                            <FiEdit3 size={15} />
                          </button>
                          <button
                            onClick={() => remove(t._id)}
                            aria-label={confirming === t._id ? "Confirm delete" : "Delete shout"}
                            disabled={busy === t._id}
                            className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-bold transition ${
                              confirming === t._id
                                ? "bg-ember/15 text-ember"
                                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
                            }`}
                          >
                            {confirming === t._id ? "Sure?" : <FiTrash2 size={15} />}
                          </button>
                        </div>
                      )}
                    </div>
                    {editing === t._id ? (
                      <div className="mt-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          maxLength={280}
                          className="w-full resize-none rounded-xl border border-line bg-void p-3 text-sm text-zinc-100 outline-none focus:border-ember/60"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button onClick={() => setEditing(null)} className="h-9 rounded-full px-4 text-sm font-bold text-zinc-500 hover:bg-white/5">
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(t._id)}
                            disabled={busy === t._id || !editText.trim()}
                            className="h-9 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-zinc-200">{t.content}</p>
                    )}
                    <button
                      onClick={() => like(t._id)}
                      className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 hover:text-ember"
                    >
                      <FiThumbsUp size={14} /> <span className="tabular-nums">{t.likesCount || 0}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <FeedEmpty
              title={tab === "mine" ? "You haven't shouted yet" : "Dead air"}
              hint={tab === "mine" ? "Your shouts live here once you post the first one." : "Nobody has shouted anything yet. Open the mic."}
              actionTo={isLogin ? undefined : "/login"}
              actionLabel={isLogin ? undefined : "Log in to shout"}
            />
          )}
        </div>

        {!isLogin && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Want the mic? <Link to="/login" className="font-bold text-ember">Log in to shout</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Shouts;
