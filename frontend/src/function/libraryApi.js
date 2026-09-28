import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "../../BaseURL";

// Authenticated API client. Backend verifyJWT reads the token from the
// accessToken cookie or the Authorization header — we send the header,
// same pattern as ProfileApi.
function authHeaders() {
  const token = Cookies.get("accessToken");
    if (!token) {
    throw new Error("You are logged out. Log in again to load your data.");
  }
  return { Authorization: `Bearer ${token}` };
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

export const serverMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const feedApi = {
  videos: (params) => get("/videos", params),
  videoById: (id) => get(`/videos/${id}`),
  likedVideos: () => get("/likes/videos"),
  toggleVideoLike: (videoId) => post(`/likes/toggle/v/${videoId}`),
  subscriptions: (userId) => get(`/subscriptions/c/${userId}`),
  toggleSubscription: (channelId) => post(`/subscriptions/c/${channelId}`),
  playlists: (userId) => get(`/playlist/user/${userId}`),
  history: () => get("/users/history"),
};
