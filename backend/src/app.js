import "./utils/nodeCompat.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../public")));
app.use(cookieParser());

// Root probe — Vercel hits `/` first. Without this it 404s,
// and with the old vercel.json `dest: "/"` it crashed the function.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PlayTube API is running",
    docs: "/api/v1/healthcheck",
  });
});

//routes import
import userRouter from "./routes/user.routes.js";
import otpRouter from "./routes/otp.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/users", otpRouter); // POST /send-otp, POST /verify-otp
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);

// 404 for unknown /api routes (returns JSON instead of crashing)
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Generic 404 (JSON, so probes never get an HTML crash page)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Central error handler — this is what turns a thrown error into
// a JSON 500 instead of "This Serverless Function has crashed".
// Must have 4 args so Express treats it as error middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
});
export { app };
