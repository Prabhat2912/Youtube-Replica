import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "../../BaseURL";

// Backend verifyJWT reads the token from the accessToken cookie or the
// Authorization header — we send the header, same pattern as ProfileApi.
// Reads (feed, video, comments) are PUBLIC; writes need login.
function authHeaders() {
  const token = Cookies.get("accessToken");
  if (!token) {
    throw new Error("Log in to do that.");
  }
  return { Authorization: `Bearer ${token}` };
}

async function pubGet(path, params) {
  const res = await axios.get(`${BASE_URL}${path}`, { params, timeout: 15000 });
  return res.data?.data;
}

async function get(path, params) {
  const res = await axios.get(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    params,
    timeout: 15000,
  });
  return res.data?.data;
}

async function post(path, body) {
  const res = await axios.post(`${BASE_URL}${path}`, body || {}, {
    headers: authHeaders(),
    timeout: 15000,
  });
  return res.data?.data;
}

async function patch(path, body) {
  const res = await axios.patch(`${BASE_URL}${path}`, body || {}, {
    headers: authHeaders(),
    timeout: 15000,
  });
  return res.data?.data;
}

export const serverMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const feedApi = {
  // public reads
  videos: (params) => pubGet("/videos", params),
  videoById: (id) => pubGet(`/videos/${id}`),
  comments: (videoId, params) => pubGet(`/comments/${videoId}`, params),
  latestTweets: () => pubGet("/tweets/latest"),
  userTweets: (userId) => pubGet(`/tweets/user/${userId}`),
  // authed writes + private reads
  videoByIdAuth: (id) => get(`/videos/${id}`),
  likedVideos: () => get("/likes/videos"),
  toggleVideoLike: (videoId) => post(`/likes/toggle/v/${videoId}`),
  toggleCommentLike: (commentId) => post(`/likes/toggle/c/${commentId}`),
  addComment: (videoId, content) => post(`/comments/${videoId}`, { content }),
  createTweet: (content) => post("/tweets", { content }),
  updateTweet: (tweetId, content) => patch(`/tweets/${tweetId}`, { content }),
  toggleTweetLike: (tweetId) => post(`/likes/toggle/t/${tweetId}`),
  subscriptions: (userId) => get(`/subscriptions/c/${userId}`),
  toggleSubscription: (channelId) => post(`/subscriptions/c/${channelId}`),
  playlists: (userId) => get(`/playlist/user/${userId}`),
  playlistById: (playlistId) => get(`/playlist/${playlistId}`),
  createPlaylist: (name, description) => post("/playlist", { name, description }),
  addToPlaylist: (videoId, playlistId) => patch(`/playlist/add/${videoId}/${playlistId}`),
  removeFromPlaylist: (videoId, playlistId) => patch(`/playlist/remove/${videoId}/${playlistId}`),
  history: () => get("/users/history"),

  async deleteTweet(tweetId) {
    const res = await axios.delete(`${BASE_URL}/tweets/${tweetId}`, {
      headers: authHeaders(),
      timeout: 15000,
    });
    return res.data?.data;
  },

  // "Keep" shelf: one Watch Later collection per member.
  async watchLaterId() {
    const mine = await this.playlists(
      JSON.parse(localStorage.getItem("user") || "{}")?._id
    );
    const found = (Array.isArray(mine) ? mine : []).find((p) => p.name === "Watch Later");
    if (found) return found._id;
    const created = await this.createPlaylist("Watch Later", "Kept premieres to watch soon.");
    return created?._id;
  },
  async isKept(videoId) {
    const id = await this.watchLaterId();
    const pl = await this.playlistById(id);
    const vids = Array.isArray(pl?.videos) ? pl.videos : [];
    return {
      id,
      kept: vids.some((v) => String(v?._id || v) === String(videoId)),
    };
  },
  async toggleKept(videoId) {
    const { id, kept } = await this.isKept(videoId);
    if (kept) await this.removeFromPlaylist(videoId, id);
    else await this.addToPlaylist(videoId, id);
    return !kept;
  },
};
