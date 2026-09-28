# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + Vite + Tailwind CSS + Redux Toolkit + React Router. Existing codebase answers stack. Backend: Node Express MongoDB JWT Cloudinary, base URL via VITE_BASE_URL.

## Users

Primary: casual viewers browsing / watching videos on desktop and mobile web. Secondary: creators uploading, managing dashboard, playlists. Situation: at home / on go, low-friction discovery, light-mode reading.

## Product Purpose

A YouTube-like video sharing replica for learning full-stack: watch feed, search, video player, auth, dashboard, playlists, comments, likes, subscriptions. Success = visitor understands offer in seconds from landing, signs up (email + OTP verified), reaches Home feed and plays video without confusion.

## Positioning

Not a YouTube clone pixel-copy. Light-minimal "Viewora" — airy stone/white surfaces, indigo primary, pill search, chip filters, rounded-2xl cards with soft shadow. Calm, friendly, distinct from YouTube red/black density while keeping familiar IA (rail + topbar + grid + player).

## Operating Context

Routes: `/` public landing, `/home` feed (auth-optional), `/video/:id`, `/search`, `/dashboard`, `/profile`, `/login`, `/signup`, `/verify-otp`. Backend REST at `/api/v1`. Auth via accessToken cookie + refreshToken localStorage. Uploads via Cloudinary. OTP is new: email-based, frontend stub with API hooks ready.

## Capabilities and Constraints

Confirmed functionality: register, login, logout, refresh-token, videos list/get/upload/delete, profile, subscriptions, comments, likes, playlists, tweets, dashboard. Constraint: backend has no OTP endpoints yet — frontend ships `OtpApi.sendOtp(email)` / `verifyOtp(email, code)` with mock fallback + clearly marked TODO to wire `POST /api/v1/users/send-otp` and `POST /api/v1/users/verify-otp`. Must keep existing Redux Auth slice compatible. No invented pricing/customers/benchmarks. No live-streaming.

## Brand Commitments

Name: Viewora (distinct from YouTube / PlayTube). Light minimal world: stone-50 ground, white cards, slate-900 ink, indigo-600 primary action, teal secondary. Rounded-2xl, soft shadows, pill inputs, chip filters. Existing logo.png may be replaced by inline SVG wordmark. Voice: plain, friendly, action-naming controls.

## Evidence on Hand

Real: backend API live at VITE_BASE_URL, existing Redux slices (Auth, Profile), VideoCard/Home/Header/Sidebar components as incumbent IA reference. Absent: real thumbnails/avatars (use picsum/pexels placeholders labeled synthetic), real OTP delivery, real user testimonials — do not fabricate customers/prices.

## Product Principles

1. Calm discovery over density — generous spacing, one idea per card.
2. Prove by showing — trending preview and player first, claims second.
3. Same backend, new face — never break API contracts for visual novelty.
4. OTP trust without friction — 6-box input, timer, resend, clear errors.
5. Operate stays boring in a good way — familiar patterns, precise details.

## Accessibility & Inclusion

Keyboard-focusable OTP boxes with paste support, visible focus rings, contrast body ≥4.5:1, error text names problem + recovery. Responsive 390px → 1440px.
