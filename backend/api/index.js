import "../src/utils/nodeCompat.js";
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";

// Vercel serverless entry. Files under `api/` are auto-built into
// Serverless Functions; a root-level index.js with only `rewrites`
// produces NO function (platform 404). NEVER call app.listen() here.
export default async function handler(req, res) {
  // Let probes answer even if the DB env var is missing,
  // so deployments can be verified before MongoDB is wired.
  const url = req.url || "";
  const isProbe = url === "/" || url.startsWith("/api/v1/healthcheck");
  try {
    await connectDB();
  } catch (err) {
    console.error("Serverless DB error:", err);
    if (isProbe) {
      return app(req, res);
    }
    return res.status(500).json({
      success: false,
      message:
        "Server failed to start. Check Vercel env vars (MONGODB_URI, tokens, Cloudinary).",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    console.error("Serverless handler error:", err);
    return res.status(500).json({
      success: false,
      message: "Request failed.",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
}
