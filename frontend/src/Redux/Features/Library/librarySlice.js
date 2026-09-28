import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { feedApi, serverMessage } from "../../../function/libraryApi";
import { toCard } from "../../../function/format";

// Central cache for every library read. Each thunk reuses fresh data
// (TTL) instead of refetching on every visit; mutations patch the cache
// locally and reconcile with server counts. Pass { force: true } to refetch.
const TTL = 4 * 60 * 1000;
const fresh = (ts) => Date.now() - (ts || 0) < TTL;
const myId = (getState) =>
  getState().auth?.user?._id ||
  JSON.parse(localStorage.getItem("user") || "{}")?._id;

// ---- feed ----
export const fetchFeed = createAsyncThunk(
  "library/fetchFeed",
  async ({ force, params } = {}, { getState, rejectWithValue }) => {
    const { feed } = getState().library;
    if (!force && feed.status === "idle" && fresh(feed.updatedAt) && feed.items.length) {
      return { cached: true };
    }
    try {
      const data = await feedApi.videos(params || { limit: 24, sortBy: "createdAt", sortType: "desc" });
      return { items: (Array.isArray(data) ? data : []).map(toCard) };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load the feed."));
    }
  }
);

// ---- single video (+ enrichment, cached wholesale) ----
export const fetchVideo = createAsyncThunk(
  "library/fetchVideo",
  async ({ id, force } = {}, { getState, rejectWithValue, dispatch }) => {
    const st = getState().library;
    const hit = st.videos[id];
    if (!force && hit && fresh(hit.updatedAt)) return { cached: true };
    try {
      const [data, feed] = await Promise.all([
        feedApi.videoById(id),
        (() => {
          const f = getState().library.feed;
          return !force && f.items.length && fresh(f.updatedAt)
            ? Promise.resolve(null)
            : dispatch(fetchFeed()).unwrap().catch(() => null);
        })(),
      ]);
      void feed;
      const card = toCard(data);
      const entry = {
        card,
        file: data?.videoFile || null,
        likes: Number(data?.likesCount || 0),
        liked: false,
        commentTotal: Number(data?.commentsCount || 0),
        following: false,
        followers: 0,
        kept: false,
        updatedAt: Date.now(),
      };
      const uid = myId(getState);
      const authed = getState().auth?.isLogin;
      if (authed) {
        const [likedList, subs, count, keepState] = await Promise.all([
          dispatch(ensureLiked()).unwrap().catch(() => []),
          uid ? dispatch(ensureSubs()).unwrap().catch(() => []) : Promise.resolve([]),
          card.ownerId ? feedApi.subscriberCount(card.ownerId).catch(() => 0) : Promise.resolve(0),
          feedApi.isKept(id).catch(() => ({ kept: false })),
        ]);
        entry.liked = (Array.isArray(likedList) ? likedList : []).some((v) => String(v) === String(id));
        entry.following = Boolean(
          card.ownerId &&
            (Array.isArray(subs) ? subs : []).some(
              (s) => String(s?.channel?._id || s?.channel) === String(card.ownerId)
            )
        );
        entry.followers = Number(count) || 0;
        entry.kept = Boolean(keepState?.kept);
      }
      return { id, entry };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load this premiere."));
    }
  }
);

// ---- comments ----
export const fetchComments = createAsyncThunk(
  "library/fetchComments",
  async ({ videoId, force } = {}, { getState, rejectWithValue }) => {
    const hit = getState().library.comments[videoId];
    if (!force && hit && fresh(hit.updatedAt)) return { cached: true };
    try {
      const list = await feedApi.comments(videoId, { limit: 20 });
      return { videoId, list: Array.isArray(list) ? list : [] };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load reactions."));
    }
  }
);

export const postComment = createAsyncThunk(
  "library/postComment",
  async ({ videoId, content }, { rejectWithValue }) => {
    try {
      await feedApi.addComment(videoId, content);
      const list = await feedApi.comments(videoId, { limit: 20 });
      return { videoId, list: Array.isArray(list) ? list : [] };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not post that reaction."));
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  "library/toggleCommentLike",
  async ({ videoId, commentId }, { getState, rejectWithValue }) => {
    const list = getState().library.comments[videoId]?.list || [];
    const target = list.find((c) => c._id === commentId);
    const next = (target?.likesCount || 0) + 1;
    try {
      const total = await feedApi.toggleCommentLike(commentId);
      return { videoId, commentId, total: typeof total === "number" ? total : next };
    } catch (err) {
      return rejectWithValue({ videoId, commentId, prev: target?.likesCount || 0, error: serverMessage(err) });
    }
  }
);

export const editComment = createAsyncThunk(
  "library/editComment",
  async ({ videoId, commentId, content }, { rejectWithValue }) => {
    try {
      await feedApi.updateComment(commentId, content);
      return { videoId, commentId, content };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not save that edit."));
    }
  }
);

export const removeComment = createAsyncThunk(
  "library/removeComment",
  async ({ videoId, commentId }, { rejectWithValue }) => {
    try {
      await feedApi.deleteComment(commentId);
      return { videoId, commentId };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not delete that reaction."));
    }
  }
);

// ---- likes ----
export const ensureLiked = createAsyncThunk(
  "library/ensureLiked",
  async (_, { getState, rejectWithValue }) => {
    const { liked } = getState().library;
    if (liked.updatedAt && fresh(liked.updatedAt)) return liked.ids;
    try {
      const data = await feedApi.likedVideos();
      const arr = Array.isArray(data) ? data : [];
      return arr.map((v) => String(v?._id));
    } catch (err) {
      return rejectWithValue(serverMessage(err));
    }
  }
);

export const fetchLiked = createAsyncThunk(
  "library/fetchLiked",
  async ({ force } = {}, { getState, rejectWithValue }) => {
    const { liked } = getState().library;
    if (!force && liked.updatedAt && fresh(liked.updatedAt) && liked.items) {
      return { cached: true };
    }
    try {
      const data = await feedApi.likedVideos();
      const arr = Array.isArray(data) ? data : [];
      return { items: arr.map(toCard), ids: arr.map((v) => String(v?._id)) };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load your applauded list."));
    }
  }
);

export const toggleLikeVideo = createAsyncThunk(
  "library/toggleLikeVideo",
  async ({ id }, { rejectWithValue }) => {
    try {
      const total = await feedApi.toggleVideoLike(id);
      return { id, total: typeof total === "number" ? total : null };
    } catch (err) {
      return rejectWithValue({ id, error: serverMessage(err) });
    }
  }
);

// ---- subscriptions ----
export const ensureSubs = createAsyncThunk(
  "library/ensureSubs",
  async ({ force } = {}, { getState, rejectWithValue }) => {
    const { subs } = getState().library;
    if (!force && subs.updatedAt && fresh(subs.updatedAt)) return subs.list;
    try {
      const data = await feedApi.subscriptions(myId(getState));
      const rows = Array.isArray(data?.subscribedTo) ? data.subscribedTo : [];
      return rows;
    } catch (err) {
      return rejectWithValue(serverMessage(err));
    }
  }
);

export const toggleFollow = createAsyncThunk(
  "library/toggleFollow",
  async ({ ownerId }, { rejectWithValue }) => {
    try {
      await feedApi.toggleSubscription(ownerId);
      return { ownerId };
    } catch (err) {
      return rejectWithValue({ ownerId, error: serverMessage(err) });
    }
  }
);

// ---- watch later ----
export const toggleKeptVideo = createAsyncThunk(
  "library/toggleKeptVideo",
  async ({ id }, { rejectWithValue }) => {
    try {
      const kept = await feedApi.toggleKept(id);
      return { id, kept };
    } catch (err) {
      return rejectWithValue({ id, error: serverMessage(err) });
    }
  }
);

// ---- playlists ----
export const ensurePlaylists = createAsyncThunk(
  "library/ensurePlaylists",
  async (_, { getState, rejectWithValue }) => {
    const { playlists } = getState().library;
    if (playlists.updatedAt && fresh(playlists.updatedAt)) return playlists.list;
    try {
      const data = await feedApi.playlists(myId(getState));
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(serverMessage(err));
    }
  }
);

export const createPlaylist = createAsyncThunk(
  "library/createPlaylist",
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const pl = await feedApi.createPlaylist(name, description);
      return pl;
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not create that collection."));
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  "library/deletePlaylist",
  async ({ id }, { rejectWithValue }) => {
    try {
      await feedApi.deletePlaylist(id);
      return { id };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not delete that collection."));
    }
  }
);

export const renamePlaylist = createAsyncThunk(
  "library/renamePlaylist",
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const updated = await feedApi.updatePlaylist(id, { name, description });
      return updated || { _id: id, name, description };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not save those changes."));
    }
  }
);

export const fetchPlaylistDetail = createAsyncThunk(
  "library/fetchPlaylistDetail",
  async ({ id, force } = {}, { getState, rejectWithValue }) => {
    const hit = getState().library.details[id];
    if (!force && hit && fresh(hit.updatedAt)) return { cached: true };
    try {
      const data = await feedApi.playlistById(id);
      if (!data?._id) throw new Error("That shelf doesn't exist.");
      return { id, data };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not open this shelf."));
    }
  }
);

export const toggleShelfVideo = createAsyncThunk(
  "library/toggleShelfVideo",
  async ({ videoId, playlistId, has }, { rejectWithValue }) => {
    try {
      if (has) await feedApi.removeFromPlaylist(videoId, playlistId);
      else await feedApi.addToPlaylist(videoId, playlistId);
      return { videoId, playlistId, has: !has };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not update that shelf."));
    }
  }
);

// ---- history / dashboard ----
export const fetchHistory = createAsyncThunk(
  "library/fetchHistory",
  async ({ force } = {}, { getState, rejectWithValue }) => {
    const { history } = getState().library;
    if (!force && history.updatedAt && fresh(history.updatedAt)) return { cached: true };
    try {
      const data = await feedApi.history();
      return { items: (Array.isArray(data) ? data : []).map(toCard).reverse() };
    } catch (err) {
      return rejectWithValue(serverMessage(err));
    }
  }
);

export const fetchDash = createAsyncThunk(
  "library/fetchDash",
  async ({ force } = {}, { getState, rejectWithValue }) => {
    const { dash } = getState().library;
    if (!force && dash.updatedAt && fresh(dash.updatedAt)) return { cached: true };
    try {
      const [stats, mine, liked, playlists] = await Promise.all([
        feedApi.channelStats().catch(() => null),
        feedApi.channelVideos().catch(() => []),
        feedApi.likedVideos().catch(() => []),
        feedApi.playlists(myId(getState)).catch(() => []),
      ]);
      return {
        stats,
        uploads: (Array.isArray(mine) ? mine : []).map(toCard),
        likedCount: Array.isArray(liked) ? liked.length : 0,
        playlistCount: Array.isArray(playlists) ? playlists.length : 0,
      };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load your dashboard."));
    }
  }
);

// ---- channel rooms ----
export const fetchChannelRoom = createAsyncThunk(
  "library/fetchChannelRoom",
  async ({ username, force } = {}, { getState, rejectWithValue }) => {
    const hit = getState().library.rooms[username];
    if (!force && hit && fresh(hit.updatedAt)) return { cached: true };
    try {
      const room = await feedApi.channel(username);
      const [vids, shts] = await Promise.all([
        feedApi.videos({ userId: room?._id, limit: 24 }).catch(() => []),
        feedApi.userTweets(room?._id).catch(() => []),
      ]);
      return {
        username,
        room,
        videos: (Array.isArray(vids) ? vids : []).map(toCard),
        shouts: Array.isArray(shts) ? shts.slice(0, 5) : [],
      };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not open this room."));
    }
  }
);
export const fetchTweets = createAsyncThunk(
  "library/fetchTweets",
  async ({ tab, force } = {}, { getState, rejectWithValue }) => {
    const { tweets } = getState().library;
    const ts = tab === "mine" ? tweets.updatedAtMine : tweets.updatedAtLatest;
    if (!force && ts && fresh(ts)) return { cached: true };
    try {
      const data =
        tab === "mine"
          ? await feedApi.userTweets(myId(getState))
          : await feedApi.latestTweets();
      return { tab, list: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(serverMessage(err, "Could not load shouts."));
    }
  }
);

const initialState = {
  feed: { items: [], status: "idle", error: null, updatedAt: 0 },
  videos: {},
  comments: {},
  liked: { ids: [], items: null, updatedAt: 0 },
  subs: { list: [], updatedAt: 0 },
  playlists: { list: [], updatedAt: 0 },
  details: {},
  history: { items: [], updatedAt: 0 },
  dash: { stats: null, uploads: [], likedCount: 0, playlistCount: 0, updatedAt: 0 },
  rooms: {},
  tweets: { latest: [], mine: [], updatedAtLatest: 0, updatedAtMine: 0 },
  mutError: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    clearMutError: (state) => {
      state.mutError = null;
    },
    patchVideoMeta: (state, action) => {
      const { id, patch } = action.payload;
      const v = state.videos[id];
      if (v) {
        v.card = { ...v.card, ...patch };
        v.updatedAt = Date.now();
      }
      state.dash.uploads = state.dash.uploads.map((u) => (u.id === id ? { ...u, ...patch } : u));
    },
    dropVideo: (state, action) => {
      const { id } = action.payload;
      delete state.videos[id];
      state.dash.uploads = state.dash.uploads.filter((u) => u.id !== id);
      state.feed.items = state.feed.items.filter((u) => u.id !== id);
    },
    flipPublished: (state, action) => {
      const { id, published } = action.payload;
      const apply = (u) => (u.id === id ? { ...u, published } : u);
      if (state.videos[id]) state.videos[id].card.published = published;
      state.dash.uploads = state.dash.uploads.map(apply);
    },
  },
  extraReducers: (builder) => {
    builder
      // feed
      .addCase(fetchFeed.pending, (state) => {
        if (!state.feed.items.length) state.feed.status = "loading";
        state.feed.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.feed.items = action.payload.items;
        state.feed.status = "idle";
        state.feed.updatedAt = Date.now();
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.feed.status = "error";
        state.feed.error = action.payload;
      })
      // video
      .addCase(fetchVideo.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.videos[action.payload.id] = action.payload.entry;
      })
      // comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.comments[action.payload.videoId] = { list: action.payload.list, updatedAt: Date.now() };
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments[action.payload.videoId] = { list: action.payload.list, updatedAt: Date.now() };
        const v = state.videos[action.payload.videoId];
        if (v) v.commentTotal += 1;
      })
      .addCase(postComment.rejected, (state, action) => {
        state.mutError = action.payload;
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { videoId, commentId, total } = action.payload;
        const bag = state.comments[videoId];
        if (bag) {
          bag.list = bag.list.map((c) => (c._id === commentId ? { ...c, likesCount: total } : c));
        }
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        const { videoId, commentId, prev } = action.payload || {};
        const bag = videoId && state.comments[videoId];
        if (bag) {
          bag.list = bag.list.map((c) => (c._id === commentId ? { ...c, likesCount: prev } : c));
        }
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const { videoId, commentId, content } = action.payload;
        const bag = state.comments[videoId];
        if (bag) {
          bag.list = bag.list.map((c) => (c._id === commentId ? { ...c, content } : c));
        }
      })
      .addCase(editComment.rejected, (state, action) => {
        state.mutError = action.payload;
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const { videoId, commentId } = action.payload;
        const bag = state.comments[videoId];
        if (bag) {
          bag.list = bag.list.filter((c) => c._id !== commentId);
        }
        const v = state.videos[videoId];
        if (v) v.commentTotal = Math.max(0, v.commentTotal - 1);
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.mutError = action.payload;
      })
      // likes
      .addCase(ensureLiked.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.liked.ids = action.payload;
          state.liked.updatedAt = Date.now();
        }
      })
      .addCase(fetchLiked.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.liked.items = action.payload.items;
        state.liked.ids = action.payload.ids;
        state.liked.updatedAt = Date.now();
      })
      .addCase(toggleLikeVideo.fulfilled, (state, action) => {
        const { id, total } = action.payload;
        const v = state.videos[id];
        if (v) {
          v.liked = !v.liked;
          v.likes = typeof total === "number" ? total : v.likes + (v.liked ? 1 : -1);
        }
        if (v?.liked) state.liked.ids = [...new Set([...state.liked.ids, id])];
        else state.liked.ids = state.liked.ids.filter((x) => x !== id);
        if (state.liked.items) {
          state.liked.items = v?.liked
            ? [v.card, ...state.liked.items.filter((x) => x.id !== id)]
            : state.liked.items.filter((x) => x.id !== id);
        }
      })
      .addCase(toggleLikeVideo.rejected, (state, action) => {
        const { id } = action.payload || {};
        const v = id && state.videos[id];
        if (v) {
          v.liked = !v.liked;
          v.likes = Math.max(0, v.likes + (v.liked ? 1 : -1));
        }
      })
      // subs
      .addCase(ensureSubs.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.subs.list = action.payload;
          state.subs.updatedAt = Date.now();
        }
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        const { ownerId } = action.payload;
        const isIn = state.subs.list.some((s) => String(s?.channel?._id || s?.channel) === String(ownerId));
        if (isIn) {
          state.subs.list = state.subs.list.filter(
            (s) => String(s?.channel?._id || s?.channel) !== String(ownerId)
          );
        }
        Object.values(state.videos).forEach((v) => {
          if (String(v.card.ownerId) === String(ownerId)) {
            v.following = !isIn;
            v.followers = Math.max(0, v.followers + (!isIn ? 1 : -1));
          }
        });
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        const { ownerId } = action.payload || {};
        if (!ownerId) return;
        const isIn = state.subs.list.some((s) => String(s?.channel?._id || s?.channel) === String(ownerId));
        Object.values(state.videos).forEach((v) => {
          if (String(v.card.ownerId) === String(ownerId)) {
            v.following = !isIn;
            v.followers = Math.max(0, v.followers + (!isIn ? 1 : -1));
          }
        });
      })
      .addCase(toggleKeptVideo.fulfilled, (state, action) => {
        const v = state.videos[action.payload.id];
        if (v) v.kept = action.payload.kept;
      })
      .addCase(toggleKeptVideo.rejected, (state, action) => {
        const { id } = action.payload || {};
        const v = id && state.videos[id];
        if (v) v.kept = !v.kept;
      })
      // playlists
      .addCase(ensurePlaylists.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.playlists.list = action.payload;
          state.playlists.updatedAt = Date.now();
        }
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        if (action.payload?._id) state.playlists.list = [action.payload, ...state.playlists.list];
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.mutError = action.payload;
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.playlists.list = state.playlists.list.filter((p) => p._id !== action.payload.id);
        delete state.details[action.payload.id];
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.mutError = action.payload;
      })
      .addCase(renamePlaylist.fulfilled, (state, action) => {
        const p = action.payload;
        state.playlists.list = state.playlists.list.map((x) => (x._id === p._id ? { ...x, ...p } : x));
        if (state.details[p._id]) state.details[p._id].data = { ...state.details[p._id].data, ...p };
      })
      .addCase(fetchPlaylistDetail.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.details[action.payload.id] = { data: action.payload.data, updatedAt: Date.now() };
      })
      .addCase(toggleShelfVideo.fulfilled, (state, action) => {
        const { videoId, playlistId, has } = action.payload;
        const d = state.details[playlistId];
        if (d) {
          const vids = Array.isArray(d.data.videos) ? d.data.videos : [];
          d.data.videos = has
            ? [...vids, { _id: videoId }]
            : vids.filter((v) => String(v?._id || v) !== String(videoId));
        }
      })
      // history + dash + rooms + tweets
      .addCase(fetchHistory.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.history = { items: action.payload.items, updatedAt: Date.now() };
      })
      .addCase(fetchDash.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.dash = { ...action.payload, updatedAt: Date.now() };
      })
      .addCase(fetchChannelRoom.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        state.rooms[action.payload.username] = { ...action.payload, updatedAt: Date.now() };
      })
      .addCase(fetchTweets.fulfilled, (state, action) => {
        if (action.payload.cached) return;
        if (action.payload.tab === "mine") {
          state.tweets.mine = action.payload.list;
          state.tweets.updatedAtMine = Date.now();
        } else {
          state.tweets.latest = action.payload.list;
          state.tweets.updatedAtLatest = Date.now();
        }
      });
  },
});

export const { clearMutError, patchVideoMeta, dropVideo, flipPublished } = librarySlice.actions;
export const selectLibrary = (state) => state.library;
export default librarySlice.reducer;
