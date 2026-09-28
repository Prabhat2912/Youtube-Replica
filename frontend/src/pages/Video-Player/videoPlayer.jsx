import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiThumbsUp, FiShare2, FiBookmark, FiCheck } from "react-icons/fi";
import { selectAuth } from "../../Redux/Features/Auth/AuthSlice";
import Player from "../../components/Player/Player";
import VideoCard, { formatViews } from "../../components/VideoCard/videoCard";
import { FeedError } from "../../components/FeedStates/FeedStates";
import { feedApi, serverMessage } from "../../function/libraryApi";
import { toCard, isApiId, timeAgo } from "../../function/format";
import { usePageMeta, useJsonLd } from "../../function/pageMeta";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLogin, user } = useSelector(selectAuth);
  const apiMode = isApiId(id);

  const [video, setVideo] = useState(null);
  const [file, setFile] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentTotal, setCommentTotal] = useState(0);
  const [following, setFollowing] = useState(false);
  const [kept, setKept] = useState(false);
  const [shared, setShared] = useState(false);
  const [upNext, setUpNext] = useState([]);

  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

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

  const load = useCallback(async () => {
    if (!apiMode) {
      setError("That link is from the old preview catalog. Pick a premiere from the feed.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const [data, feed] = await Promise.all([
        feedApi.videoById(id),
        feedApi.videos({ limit: 12 }).catch(() => []),
      ]);
      setVideo(toCard(data));
      setFile(data?.videoFile || null);
      setLikes(Number(data?.likesCount || 0));
      setCommentTotal(Number(data?.commentsCount || 0));
      setUpNext((Array.isArray(feed) ? feed : []).map(toCard).filter((v) => v.id !== id));

      const [list, mine] = await Promise.all([
        feedApi.comments(id, { limit: 20 }).catch(() => []),
        isLogin
          ? Promise.all([
              feedApi.likedVideos().catch(() => []),
              feedApi.subscriptions(user?._id).catch(() => null),
              feedApi.isKept(id).catch(() => ({ kept: false })),
            ])
          : Promise.resolve([[], null, { kept: false }]),
      ]);
      setComments(Array.isArray(list) ? list : []);
      const [likedList, subs, keepState] = mine;
      setLiked((Array.isArray(likedList) ? likedList : []).some((v) => String(v?._id) === String(id)));
      const ownerId = data?.owner?._id;
      setFollowing(
        Boolean(
          ownerId &&
            (Array.isArray(subs?.subscribedTo) ? subs.subscribedTo : []).some(
              (s) => String(s?.channel?._id || s?.channel) === String(ownerId)
            )
        )
      );
      setKept(Boolean(keepState?.kept));
      setStatus("idle");
    } catch (err) {
      setError(serverMessage(err, "Could not load this premiere."));
      setStatus("error");
    }
  }, [apiMode, id, isLogin, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const needLogin = () => navigate("/login");

  const toggleLike = async () => {
    if (!isLogin) return needLogin();
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const total = await feedApi.toggleVideoLike(id);
      if (typeof total === "number") setLikes(total);
    } catch {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    }
  };

  const toggleFollow = async () => {
    if (!isLogin) return needLogin();
    const ownerId = video?.ownerId;
    if (!ownerId) return;
    const next = !following;
    setFollowing(next);
    try {
      await feedApi.toggleSubscription(ownerId);
    } catch {
      setFollowing(!next);
    }
  };

  const toggleKeep = async () => {
    if (!isLogin) return needLogin();
    const next = !kept;
    setKept(next);
    try {
      setKept(await feedApi.toggleKept(id));
    } catch {
      setKept(!next);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch { /* clipboard unavailable — still show feedback */ }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const post = async (e) => {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    if (!isLogin) return needLogin();
    setPosting(true);
    try {
      await feedApi.addComment(id, draft.trim());
      const list = await feedApi.comments(id, { limit: 20 });
      setComments(Array.isArray(list) ? list : []);
      setCommentTotal((n) => n + 1);
      setDraft("");
    } catch (err) {
      setError(serverMessage(err, "Could not post that reaction."));
    } finally {
      setPosting(false);
    }
  };

  const likeComment = async (commentId) => {
    if (!isLogin) return needLogin();
    setComments((cs) =>
      cs.map((c) =>
        c._id === commentId ? { ...c, likesCount: (c.likesCount || 0) + 1 } : c
      )
    );
    try {
      const total = await feedApi.toggleCommentLike(commentId);
      setComments((cs) =>
        cs.map((c) => (c._id === commentId ? { ...c, likesCount: typeof total === "number" ? total : c.likesCount } : c))
      );
    } catch {
      const list = await feedApi.comments(id, { limit: 20 }).catch(() => null);
      if (list) setComments(list);
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full bg-void px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  if (status === "error" || !video) {
    return (
      <div className="w-full bg-void px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <FeedError message={error} onRetry={load} />
          <Link to="/home" className="mt-4 block text-center text-sm font-bold text-ember">
            Back to the program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto bg-void">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <Player src={file} poster={video.thumbnail} title={video.title} />
          <h1 className="mt-4 text-balance font-display text-xl font-bold leading-7 tracking-tight text-zinc-100">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <img src={video.avatar} alt={video.channel} className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-sm font-bold text-zinc-100">{video.channel}</p>
                <p className="text-[12.5px] text-zinc-500">{timeAgo(video.createdAt) || video.age}</p>
              </div>
              <button
                onClick={toggleFollow}
                aria-pressed={following}
                className={`ml-2 h-9 rounded-full px-5 text-sm font-bold transition ${
                  following ? "border border-line text-zinc-300 hover:border-ember/50" : "bg-ember text-white hover:bg-ember-bright"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggleLike}
                aria-pressed={liked}
                className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                  liked ? "border-ember/60 bg-ember/10 text-ember" : "border-line bg-panel text-zinc-300 hover:text-zinc-100"
                }`}
              >
                <FiThumbsUp /> <span className="tabular-nums">{likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}</span>
              </button>
              <button onClick={share} className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-panel px-4 text-sm font-bold text-zinc-300 hover:text-zinc-100">
                {shared ? <FiCheck className="text-ember" /> : <FiShare2 />} {shared ? "Copied" : "Share"}
              </button>
              <button
                onClick={toggleKeep}
                aria-pressed={kept}
                className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                  kept ? "border-ember/60 bg-ember/10 text-ember" : "border-line bg-panel text-zinc-300 hover:text-zinc-100"
                }`}
              >
                <FiBookmark /> {kept ? "Kept" : "Keep"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-panel p-4 text-sm leading-6 text-zinc-400">
            <p className="font-bold text-zinc-100">{formatViews(video.views)} · {video.age}</p>
            <p className="mt-1 whitespace-pre-line">{video.description || "No program notes from the creator yet."}</p>
          </div>

          <section className="mt-6" aria-label="Comments">
            <h2 className="text-base font-bold text-zinc-100">
              {commentTotal} reaction{commentTotal === 1 ? "" : "s"}
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
            <ul className="mt-4 space-y-4">
              {comments.map((c) => {
                const owner = c.owner && typeof c.owner === "object" ? c.owner : {};
                const name = owner.fullName || owner.username || "Member";
                return (
                  <li key={c._id} className="flex gap-3">
                    <img
                      src={owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
                      alt={name}
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] text-zinc-500">
                        <span className="font-bold text-zinc-200">{name}</span> {timeAgo(c.createdAt)}
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-zinc-300">{c.content}</p>
                      <button
                        onClick={() => likeComment(c._id)}
                        className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-500 hover:text-ember"
                      >
                        <FiThumbsUp size={13} /> <span className="tabular-nums">{c.likesCount || 0}</span>
                      </button>
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
    </div>
  );
};

export default VideoPlayer;
