import axios from "axios";

const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const preset = import.meta.env.VITE_UPLOAD_PRESET;

function configured() {
  return Boolean(cloud && preset);
}

// Unsigned browser-to-Cloudinary upload (bypasses the ~4.5MB serverless
// body cap). resourceType: "video" | "image". onProgress gets 0-100.
export async function uploadToCloudinary(file, resourceType, onProgress) {
  if (!configured()) {
    throw new Error(
      "Uploads aren't configured: set VITE_CLOUDINARY_CLOUD_NAME and VITE_UPLOAD_PRESET in frontend/.env (unsigned preset)."
    );
  }
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
    data,
    {
      timeout: 0,
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
      },
    }
  );
  return res.data; // { secure_url, duration, public_id, ... }
}

// Pull a JPG frame from an uploaded video — no second file needed.
export function autoFrame(publicId, seconds, width = 1280) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0));
  return `https://res.cloudinary.com/${cloud}/video/upload/so_${sec},w_${width}/${publicId}.jpg`;
}
