import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";

// Vercel's filesystem is read-only except /tmp.
// "./public/temp" works locally but crashes uploads on Vercel with
// EROFS/ENOENT → "Serverless Function has crashed".
const uploadDir =
  process.env.VERCEL || process.env.VERCEL_ENV
    ? path.join(os.tmpdir(), "playtube-uploads")
    : "./public/temp";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    // Remove spaces from the original filename
    const filename = `${Date.now()}-${originalname.replace(/\s+/g, "")}`;
    cb(null, filename);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB — Vercel has a ~4.5MB body limit on Hobby; larger files should upload direct to Cloudinary from the client
});
