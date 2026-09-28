import "./src/utils/nodeCompat.js";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";

dotenv.config({
  path: "./.env",
});

const isServerless = Boolean(process.env.VERCEL);

// ---- Local dev: connect once, then listen (old behaviour) ----
if (!isServerless) {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT || 8000}`);
      });
      app.on("Error !!", (err) => {
        console.log("Error on app!!!", err);
      });
    })
    .catch((err) => {
      console.log("MongoDB connection failed !!!", err);
    });
}

// ---- Vercel serverless: export a handler, NEVER app.listen() ----
// Vercel imports the default export as the function. We connect lazily
// (cached in src/db/index.js) so cold starts reuse the connection.
export default async function handler(req, res) {
  // Let the root probe answer even if the DB env var is missing,
  // so Vercel deployments can be verified before MongoDB is wired.
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

export { app };
