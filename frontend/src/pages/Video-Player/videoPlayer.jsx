import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiThumbsUp, FiShare2, FiBookmark, FiCheck, FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import {
  selectLibrary,
  fetchVideo,
  fetchComments,
  fetchFeed,
  postComment,
  toggleCommentLike,
  editComment,
  removeComment,
  toggleLikeVideo,
  toggleFollow,
  toggleKeptVideo,
  ensurePlaylists,
  createPlaylist,
  fetchPlaylistDetail,
  toggleShelfVideo,
} from "../../Redux/Features/Library/librarySlice";
import Player from "../../components/Player/Player";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { FeedError } from "../../components/FeedStates/FeedStates";
import { isApiId, timeAgo } from "../../function/format";
import { usePageMeta, useJsonLd } from "../../function/pageMeta";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin, user } = useSelector(selectAuth);
  const lib = useSelector(selectLibrary);
  const apiMode = isApiId(id);

  const entry = apiMode ? lib.videos[id] : null;
  const video = entry?.card || null;
  const bag = apiMode ? lib.comments[id] : null;
  const comments = bag?.list || [];

  const [booting, setBooting] = useState(apiMode && !entry);
  const [loadError, setLoadError] = useState(null);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [confirmingComment, setConfirmingComment] = useState(null);

  const [shelfOpen, setShelfOpen] = useState(false);
  const [shelfBusy, setShelfBusy] = useState(null);
  const [newShelf, setNewShelf] = useState("");
  const [shared, setShared] = useState(false);

  usePageMeta(
    video?.title || "Watch",
    video ? `Watch ${video.title} by ${video.channel} on PlayTube.` : "Watch on PlayTube."
  );
  useJsonLd(
    "video-jsonld",
    video
      ? {
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: video.title,
          description: `${video.title} by ${video.channel} on PlayTube.`,
          thumbnailUrl: [video.thumbnail],
          uploadDate: (video.createdAt || new Date().toISOString()).slice(0, 10),
          duration: video.duration,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/WatchAction",
            userInteractionCount: video.views,
          },
        }
      : null
  );

  // One cached load per premiere — revisits reuse Redux, zero refetch.
  useEffect(() => {
    if (!apiMode) {
      setLoadError("That link is from the old preview catalog. Pick a premiere from the feed.");
      setBooting(false);
      return;
    }
    setBooting((b) => b);
    Promise.all([dispatch(fetchVideo({ id })), dispatch(fetchComments({ videoId: id }))])
      .then((rs) => {
        const err = rs.find((r) => r.type.endsWith("/rejected"));
        if (err) setLoadError(err.payload || "Could not load this premiere.");
        else setLoadError(null);
      })
      .finally(() => setBooting(false));
    dispatch(fetchFeed());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, apiMode]);

  const upNext = (lib.feed.items || []).filter((v) => v.id !== id).slice(0, 6);
  const needLogin = () => navigate("/login");
  const ownComment = (c) =>
    isLogin && user?._id && String(c?.owner?._id || c?.owner) === String(user._id);

  const doToggleLike = () => {
    if (!isLogin) return needLogin();
    dispatch(toggleLikeVideo({ id }));
  };
  const doToggleFollow = () => {
    if (!isLogin) return needLogin();
    if (video?.ownerId) dispatch(toggleFollow({ ownerId: video.ownerId }));
  };
  const doToggleKeep = () => {
    if (!isLogin) return needLogin();
    dispatch(toggleKeptVideo({ id }));
  };

  const openShelves = () => {
    if (!isLogin) return needLogin();
    setShelfOpen(true);
    dispatch(ensurePlaylists());
    (lib.playlists.list || []).forEach((p) => dispatch(fetchPlaylistDetail({ id: p._id })));
  };

  const flipShelf = (playlistId, has) => {
    setShelfBusy(playlistId);
    dispatch(toggleShelfVideo({ videoId: id, playlistId, has }))
      .unwrap()
      .catch(() => {})
      .finally(() => setShelfBusy(null));
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch { /* clipboard unavailable — still show feedback */ }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const post = (e) => {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    if (!isLogin) return needLogin();
    setPosting(true);
    dispatch(postComment({ videoId: id, content: draft.trim() }))
      .unwrap()
      .then(() => setDraft(""))
      .catch(() => {})
      .finally(() => setPosting(false));
  };

  const saveComment = (commentId) => {
    if (!editText.trim()) return;
    dispatch(editComment({ videoId: id, commentId, content: editText.trim() }))
      .unwrap()
      .then(() => setEditingComment(null))
      .catch(() => {});
  };

  const removeComment = (commentId) => {
    if (confirmingComment !== commentId) {
      setConfirmingComment(commentId);
      setTimeout(() => setConfirmingComment((c) => (c === commentId ? null : c)), 3000);
      return;
    }
    setConfirmingComment(null);
    dispatch(removeComment({ videoId: id, commentId }));
  };

  if (booting) {
    return (
      <div className="w-full bg-void px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  if (loadError || !video) {
    return (
      <div className="w-full bg-void px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <FeedError message={loadError} onRetry={() => {
            setBooting(true);
            Promise.all([dispatch(fetchVideo({ id, force: true })), dispatch(fetchComments({ videoId: id, force: true }))])
              .then((rs) => {
                const err = rs.find((r) => r.type.endsWith("/rejected"));
                if (!err) setLoadError(null);
              })
              .finally(() => setBooting(false));
          }} />
          <Link to="/home" className="mt-4 block text-center text-sm font-bold text-ember">
            Back to the program
          </Link>
        </div>
      </div>
    );
  }

  const shelves = lib.playlists.list || [];
  const shelfHas = (pid) => {
    const vids = lib.details[pid]?.data?.videos || [];
    return vids.some((v) => String(v?._id || v) === String(id));
  };

  return (
    <div className="w-full overflow-y-auto bg-void">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <Player src={entry.file} poster={video.thumbnail} title={video.title} />
          <h1 className="mt-4 text-balance font-display text-xl font-bold leading-7 tracking-tight text-zinc-100">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <img src={video.avatar} alt={video.channel} className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-zinc-100">{video.channel}</p>
                <p className="text-[12.5px] text-zinc-500">
                  {Number(entry.followers || 0).toLocaleString()} follower{Number(entry.followers) === 1 ? "" : "s"} · {timeAgo(video.createdAt) || video.age}
                </p>
              </div>
              <button
                onClick={doToggleFollow}
                aria-pressed={entry.following}
                className={`ml-2 h-9 rounded-full px-5 text-sm font-bold transition ${
                  entry.following ? "border border-line text-zinc-300 hover:border-ember/50" : "bg-ember text-white hover:bg-ember-bright"
                }`}
              >
                {entry.following ? "Following" : "Follow"}
              </button>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                onClick={doToggleLike}
                aria-pressed={entry.liked}
                className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                  entry.liked ? "border-ember/60 bg-ember/10 text-ember" : "border-line bg-panel text-zinc-300 hover:text-zinc-100"
                }`}
              >
                <FiThumbsUp /> <span className="tabular-nums">{entry.likes >= 1000 ? `${(entry.likes / 1000).toFixed(1)}K` : entry.likes}</span>
              </button>
              <button onClick={share} className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-panel px-4 text-sm font-bold text-zinc-300 hover:text-zinc-100">
                {shared ? <FiCheck className="text-ember" /> : <FiShare2 />} {shared ? "Copied" : "Share"}
              </button>
              <button
                onClick={doToggleKeep}
                aria-pressed={entry.kept}
                className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                  entry.kept ? "border-ember/60 bg-ember/10 text-ember" : "border-line bg-panel text-zinc-300 hover:text-zinc-100"
                }`}
              >
                <FiBookmark /> {entry.kept ? "Kept" : "Keep"}
              </button>
              <button
                onClick={openShelves}
                className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-panel px-4 text-sm font-bold text-zinc-300 hover:text-zinc-100"
              >
                <FiPlus /> Shelf it
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-panel p-4 text-sm leading-6 text-zinc-400">
            <p className="font-bold text-zinc-100">{formatViews(video.views)} · {video.age}</p>
            <p className="mt-1 whitespace-pre-line">{video.description || "No program notes from the creator yet."}</p>
          </div>

          <section className="mt-6" aria-label="Comments">
            <h2 className="text-base font-bold text-zinc-100">
              {entry.commentTotal} reaction{entry.commentTotal === 1 ? "" : "s"}
            </h2>
            <form onSubmit={post} className="mt-3 flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember font-display text-sm font-black text-white">
                {(user?.fullName || user?.username || "Y")[0].toUpperCase()}
              </span>
              <div className="flex-1">
                {isLogin ? (
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Shout something nice…"
                    aria-label="Add a comment"
                    className="h-11 w-full rounded-xl border border-line bg-panel px-4 text-sm text-zinc-100 outline-none transition focus:border-ember/60 focus:ring-2 focus:ring-ember/15"
                  />
                ) : (
                  <Link to="/login" className="block rounded-xl border border-dashed border-line px-4 py-3 text-sm text-zinc-500 hover:border-ember/50 hover:text-zinc-300">
                    Log in to join the reactions…
                  </Link>
                )}
                {draft && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setDraft("")} className="h-9 rounded-full px-4 text-sm font-bold text-zinc-500 hover:bg-white/5">Cancel</button>
                    <button type="submit" disabled={posting} className="h-9 rounded-full bg-ember px-5 text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-60">
                      {posting ? "Posting…" : "React"}
                    </button>
                  </div>
                )}
              </div>
            </form>
            {!!lib.mutError && (
              <p role="alert" className="mt-3 rounded-xl border border-ember/40 bg-ember/5 p-3 text-sm text-ember-bright">{lib.mutError}</p>
            )}
            <ul className="mt-4 space-y-4">
              {comments.map((c) => {
                const owner = c.owner && typeof c.owner === "object" ? c.owner : {};
                const name = owner.fullName || owner.username || "Member";
                const own = isLogin && user?._id && String(c?.owner?._id || c?.owner) === String(user._id);
                return (
                  <li key={c._id} className="flex gap-3">
                    <img
                      src={owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
                      alt={name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-zinc-500">
                        <span className="font-bold text-zinc-200">{name}</span> {timeAgo(c.createdAt)}
                      </p>
                      {editingComment === c._id ? (
                        <div className="mt-1">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-line bg-void p-2.5 text-sm text-zinc-100 outline-none focus:border-ember/60"
                          />
                          <div className="mt-1.5 flex justify-end gap-2">
                            <button onClick={() => setEditingComment(null)} className="h-8 rounded-full px-3.5 text-[13px] font-bold text-zinc-500 hover:bg-white/5">
                              Cancel
                            </button>
                            <button onClick={() => dispatch(editComment({ videoId: id, commentId: c._id, content: editText.trim() })).unwrap().then(() => setEditingComment(null))} className="h-8 rounded-full bg-ember px-4 text-[13px] font-bold text-white hover:bg-ember-bright">
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-0.5 text-sm leading-6 text-zinc-300">{c.content}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3">
                        <button
                          onClick={() => dispatch(toggleCommentLike({ videoId: id, commentId: c._id }))}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-500 hover:text-ember"
                        >
                          <FiThumbsUp size={13} /> <span className="tabular-nums">{c.likesCount || 0}</span>
                        </button>
                        {own && editingComment !== c._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingComment(c._id);
                                setEditText(c.content);
                              }}
                              className="inline-flex items-center gap-1 text-[12.5px] font-bold text-zinc-500 hover:text-zinc-200"
                            >
                              <FiEdit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirmingComment !== c._id) {
                                  setConfirmingComment(c._id);
                                  setTimeout(() => setConfirmingComment((x) => (x === c._id ? null : x)), 3000);
                                } else {
                                  setConfirmingComment(null);
                                  dispatch(removeComment({ videoId: id, commentId: c._id }));
                                }
                              }}
                              className={`inline-flex items-center gap-1 text-[12.5px] font-bold transition ${
                                confirmingComment === c._id ? "text-ember" : "text-zinc-500 hover:text-ember"
                              }`}
                            >
                              <FiTrash2 size={12} /> {confirmingComment === c._id ? "Sure?" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!comments.length && (
              <p className="mt-4 text-sm text-zinc-500">No reactions yet — open the night.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500">Up next</h2>
          {upNext.map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
          {!upNext.length && (
            <p className="text-sm text-zinc-500">Nothing else on tonight. Check back after the next premiere.</p>
          )}
          <Link to="/home" className="block rounded-2xl border border-line bg-panel p-4 text-center text-sm font-bold text-ember hover:border-ember/50">
            Back to the program
          </Link>
        </aside>
      </div>

      {shelfOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={() => setShelfOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl border border-line bg-panel p-6">
            <h3 className="font-display text-lg font-black text-zinc-100">Shelve this premiere</h3>
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {shelves.map((s) => {
                const vids = lib.details[s._id]?.data?.videos || [];
                const has = vids.some((v) => String(v?._id || v) === String(id));
                return (
                  <li key={s._id}>
                    <button
                      onClick={() => {
                        setShelfBusy(s._id);
                        dispatch(toggleShelfVideo({ videoId: id, playlistId: s._id, has }))
                          .unwrap()
                          .catch(() => {})
                          .finally(() => setShelfBusy(null));
                      }}
                      disabled={shelfBusy === s._id}
                      aria-pressed={has}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                        has ? "border-ember/60 bg-ember/10 text-ember" : "border-line text-zinc-200 hover:border-ember/40"
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span>{shelfBusy === s._id ? "…" : has ? <FiCheck /> : <FiPlus />}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {!shelves.length && (
              <p className="mt-4 text-sm text-zinc-500">No shelves yet — name your first below.</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newShelf.trim()) flipShelfNew();
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={newShelf}
                onChange={(e) => setNewShelf(e.target.value)}
                placeholder="New shelf name"
                maxLength={60}
                aria-label="New shelf name"
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-void px-4 text-sm text-zinc-100 outline-none focus:border-ember/60"
              />
              <button type="submit" disabled={!newShelf.trim()} className="h-11 shrink-0 rounded-xl bg-ember px-4 text-sm font-bold text-white hover:bg-ember-bright disabled:opacity-50">
                Add
              </button>
            </form>
            <button onClick={() => setShelfOpen(false)} className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-zinc-500 hover:bg-white/5">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function flipShelfNew() {
    dispatch(createPlaylist({ name: newShelf.trim(), description: `Shelf for premieres like ${video?.title || "this one"}.` }))
      .unwrap()
      .then((pl) => {
        if (pl?._id) {
          setShelfBusy(pl._id);
          dispatch(toggleShelfVideo({ videoId: id, playlistId: pl._id, has: false }))
            .unwrap()
            .catch(() => {})
            .finally(() => setShelfBusy(null));
          dispatch(ensurePlaylists());
        }
        setNewShelf("");
      })
      .catch(() => {});
  }
};

export default VideoPlayer;
