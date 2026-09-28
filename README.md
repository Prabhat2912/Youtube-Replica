# PlayTube — the after-dark screening room for video

A full-stack video-sharing app (a YouTube-style replica with its own identity):
an Express + MongoDB API and a React frontend with a public landing page,
email-code verification, password reset, live feeds and creator tools —
wrapped in the **Afterglow** design world (warm black, sunset ember + gold,
Unbounded display type, film grain, GSAP motion).

Built by **Prabhat Kumar** while learning backend development from
**[Hitesh Choudhary](https://github.com/hiteshchoudhary)**.

## Live

- Frontend: `https://youtube-replica-frontend.vercel.app`
  (`/` landing, `/home` feed, `/video/:id`, `/search`, auth + library pages)
- Backend API: `https://youtube-clone-mu-seven.vercel.app`
  (probe: `GET /` and `GET /api/v1/healthcheck`)

## Features

### Landing + growth (`/`)

- Premiere hero with lit-marquee cinema screen, twinkling bulbs and parallax
- Scrolling marquee tape, glass bento grid, gold close band
- GSAP throughout: cursor glow, magnetic CTAs, scroll reveals, scroll progress
- SEO + AI-ready: meta/OG/Twitter cards, `WebSite` + per-video `VideoObject`
  JSON-LD, per-route titles, `robots.txt`, `sitemap.xml`, `llms.txt`

### Accounts

- Register / login / logout with JWT (access cookie + refresh token)
- **Email OTP verification** (`/verify-otp`) — 6-box input, paste support,
  30s resend cooldown, 10-minute codes, 5-attempt lockout
  - Real delivery via Gmail + nodemailer; local mock fallback when the API
    is unreachable (dev only, `000000` passes in mock mode)
- **Forgot / reset password** (`/forgot-password`, `/reset-password?token=`)
  — single-use sha256-hashed tokens, 15-minute expiry, generic replies so
  emails can't be probed
- Profile with cover/avatar, Settings (account, images, password, session),
  Help desk
- Dashboard doubles as studio: edit titles/descriptions, list/unlist,
  delete premieres (owner-guarded); channel stats from `/dashboard/*`
- Watch page: collection picker (file any premiere into any shelf),
  follower counts, own-comment edit/delete

### Watching (100% live — zero mock data)

- `/home` — the **live network feed** for everyone (`GET /videos`, public,
  owners populated); skeleton, retry and empty states, no fixtures
- `/video/:id` — adaptive HLS player (auto + manual quality, speed,
  fullscreen, shortcuts) streaming network premieres; real likes with live
  counts, follow, Watch-Later keep, real comments with likes, real up-next
- `/search?q=` — live results across titles, channels, descriptions
- `/subscriptions` — followed channels with working unfollow
- `/liked` (Applauded), `/library` (Collections/playlists)
- `/library/:playlistId` — shelf detail: rename, pull premieres off, delete
- `/channel/:username` — public rooms: cover, follower counts, follow toggle,
  premieres + shouts
- `/shouts` — backstage mic: post, edit, delete and like short notes;
  Latest (public) + Mine tabs, 280 chars
- `/profile` — real watch history (`GET /users/history`)
- `/dashboard` — uploads + **live-counted stats** (views, applause,
  collections, premieres)
- `/upload` — real publishing: file beams straight to Cloudinary (unsigned
  preset, progress bar), poster via auto-frame or image upload, then metadata
  POSTs to the API and lands on the watch page

### Backend API

- Users, JWT auth + refresh, OTP, password reset, videos (CRUD, publish
  toggle), likes, comments, subscriptions, playlists, tweets, dashboard,
  healthcheck
- Serverless-safe: `api/index.js` entry, cached Mongo connection, `/tmp`
  uploads, JSON 404s + central error handler, bulletproof CORS (origin echo,
  preflight short-circuit, headers on every response incl. errors)

## Tech stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 18, Vite 8, Tailwind CSS, Redux Toolkit, React Router, GSAP |
| Backend  | Node.js, Express 4, MongoDB + Mongoose, JWT, bcryptjs, nodemailer |
| Media    | Cloudinary (uploads, thumbnails, playback)                        |
| Deploy   | Vercel (frontend static + backend serverless function)            |

## Data layer (Redux caching)

Every read goes through the Redux Toolkit `library` slice
(`frontend/src/Redux/Features/Library/librarySlice.js`) with a ~4-minute
TTL. First visit fetches, revisits reuse the cache, manual retries pass
`{ force: true }`. Nothing refetches just because you navigated.

| Cached                  | Thunks                                              | Invalidated / patched on                          |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Feed                    | `fetchFeed`                                         | publish, retry                                    |
| Video rooms             | `fetchVideo` (doc + counts + liked/follow/kept)     | like, follow, keep, comment, edit, delete         |
| Comments                | `fetchComments`, `post/edit/remove/toggleLike`      | post, edit, delete, like (counts reconciled)      |
| Liked                   | `fetchLiked`, `ensureLiked`, `toggleLikeVideo`      | toggle (ids + list patched, rollback on failure)  |
| Subscriptions           | `ensureSubs`, `toggleFollow`                        | follow/unfollow (list + room counts patched)      |
| Watch Later             | `toggleKeptVideo`                                   | toggle (rollback on failure)                      |
| Playlists + shelves     | `ensure/create/delete/rename/fetchDetail/toggle`    | create, rename, delete, shelf add/remove          |
| History                 | `fetchHistory`                                      | logout (wiped)                                    |
| Dashboard               | `fetchDash` (stats + uploads + counts)              | publish, edit, delete, list/unlist                |
| Tweets                  | `fetchTweets` (Latest + Mine tabs)                  | post, edit, delete (force refetch)                |
| Channel rooms           | `fetchChannelRoom` (room + premieres + shouts)      | follow (force refresh)                            |

Rules the slice enforces:

- **Mutations patch locally first**, reconcile with server totals, and roll
  back on failure — the UI never waits on a round trip to feel instant.
- **Publishing** invalidates feed + dashboard so the premiere appears
  everywhere immediately.
- **Logout wipes the whole library** (and login resets it) — one account can
  never see the previous account's subs, likes, history or collections.
- One-shot flows (login, OTP, password reset, uploads to Cloudinary) call
  the API directly — caching those would be wrong.

## Project structure

```
Youtube-Replica/
├── frontend/
│   ├── src/
│   │   ├── components/  # Brand, Header, SideBar, VideoCard, Otp, FeedStates…
│   │   ├── pages/       # Landing, Home, Video-Player, SearchView,
│   │   │                # VerifyOtp, ForgotPassword, ResetPassword,
│   │   │                # Subscriptions, Library, Settings, Help,
│   │   │                # Dashboard, Profile
│   │   ├── function/    # libraryApi (authed client), otpApi, format, pageMeta
│   │   ├── Redux/       # auth, profile, otp slices
│   │   └── data/        # guest preview catalog (logged-out only)
│   └── public/          # robots.txt, sitemap.xml, llms.txt
└── backend/
    ├── api/index.js     # Vercel serverless entry (no app.listen here)
    ├── index.js         # local dev entry (npm run dev)
    └── src/
        ├── controllers/ # user, video, otp, password, like, comment…
        ├── models/      # user, video, otp (TTL), resetToken (TTL)…
        ├── routes/      # users, videos, likes, subscriptions, playlist…
        ├── middlewares/ # JWT auth, multer (/tmp on Vercel)
        └── utils/       # cors, mailer, cloudinary, ApiError/ApiResponse
```

## Getting started

Prerequisites: Node.js 20+, MongoDB, Cloudinary account, Gmail app password.

```bash
# backend
cd backend
npm install
cp .env.sample .env   # then fill it in
npm run dev            # http://localhost:8000

# frontend
cd frontend
npm install
cp .env.sample .env   # then fill it in
npm run dev            # http://localhost:5173
```

### Backend `.env`

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<long random string>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<long random string>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
EMAIL_USER=<gmail address>
EMAIL_PASS=<gmail app password — never commit>
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_BASE_URL=http://localhost:8000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=<name>
VITE_UPLOAD_PRESET=<preset>
```

## API endpoints

| Method | Endpoint                              | Auth | Purpose              |
| ------ | ------------------------------------- | ---- | -------------------- |
| POST   | `/api/v1/users/register`              | –    | Register             |
| POST   | `/api/v1/users/login`                 | –    | Login                |
| POST   | `/api/v1/users/logout`                | ✅   | Logout               |
| POST   | `/api/v1/users/refresh-token`         | –    | Refresh tokens       |
| POST   | `/api/v1/users/send-otp`              | –    | Send email code      |
| POST   | `/api/v1/users/verify-otp`            | –    | Verify email code    |
| POST   | `/api/v1/users/forgot-password`       | –    | Send reset link      |
| POST   | `/api/v1/users/reset-password`        | –    | Set new password     |
| GET    | `/api/v1/users/current-user`          | ✅   | Current user         |
| GET    | `/api/v1/users/history`               | ✅   | Watch history          |
| GET    | `/api/v1/users/c/:username`           | – (public) | Channel room     |
| GET    | `/api/v1/dashboard/stats`             | ✅   | Channel stats          |
| GET    | `/api/v1/dashboard/videos`            | ✅   | Channel uploads        |
| GET    | `/api/v1/videos?userId=&limit=`       | – (public) | Feed / channel videos|
| GET    | `/api/v1/videos/:videoId`             | – (public) | Single video (+counts, +1 view) |
| PATCH  | `/api/v1/videos/:videoId`             | ✅   | Edit own premiere      |
| DELETE | `/api/v1/videos/:videoId`             | ✅   | Delete own premiere    |
| PATCH  | `/api/v1/videos/toggle/publish/:id`   | ✅   | List/unlist premiere   |
| GET    | `/api/v1/comments/:videoId`           | – (public) | Video comments (owners, likes) |
| PATCH  | `/api/v1/comments/c/:commentId`       | ✅   | Edit own comment       |
| DELETE | `/api/v1/comments/c/:commentId`       | ✅   | Delete own comment     |
| POST   | `/api/v1/videos`                      | ✅   | Publish video        |
| GET    | `/api/v1/likes/videos`                | ✅   | Liked videos         |
| POST   | `/api/v1/likes/toggle/v/:videoId`     | ✅   | Like/unlike          |
| GET    | `/api/v1/subscriptions/c/:channelId`  | ✅   | Followed channels    |
| POST   | `/api/v1/subscriptions/c/:channelId`  | ✅   | Follow/unfollow      |
| GET    | `/api/v1/playlist/user/:userId`       | ✅   | Collections          |
| GET    | `/api/v1/tweets/latest`               | – (public) | Freshest shouts  |
| GET    | `/api/v1/tweets/user/:userId`         | – (public) | Member shouts    |
| POST   | `/api/v1/tweets`                      | ✅   | Post a shout         |
| PATCH  | `/api/v1/tweets/:tweetId`             | ✅   | Edit own shout       |
| DELETE | `/api/v1/tweets/:tweetId`             | ✅   | Delete own shout     |
| GET    | `/api/v1/healthcheck`                 | –    | Health probe         |

List endpoints populate owners/channels (`fullName username avatar`).

## Deploying the backend (Vercel)

The repo root has no app — Vercel must use `backend/` as its root:

1. Project → **Settings → General → Root Directory** → `backend` → Save
2. **Settings → Environment Variables** → add every key from `.env.sample`
   (production values; `CORS_ORIGIN` = frontend URL, `FRONTEND_URL` = same)
3. **Deployments → Redeploy**

The function entry is `api/index.js` (auto-built); `index.js` is local-only.
Uploads use `/tmp` on Vercel — files over ~4.5MB on Hobby should upload
direct to Cloudinary from the client.

## Scripts

```bash
# backend
npm run dev      # nodemon + dotenv
npm start        # node ./index.js

# frontend
npm run dev      # vite dev server
npm run build    # production build (dist/)
```

## Status

- ✅ Backend API + OTP + password reset + Vercel/CORS hardening
- ✅ Landing, auth flows, real-data library pages, help, SEO/llms.txt
- 🚧 Video transcoding/quality options, notifications, recommendations
- 🚧 In-app upload progress for very large files (direct-to-Cloudinary already live)

## Author

**Prabhat Kumar** — [@Prabhat2912](https://github.com/Prabhat2912)

Thanks to Hitesh Choudhary for the backend mentorship, and to the
open-source community behind the MERN ecosystem.
