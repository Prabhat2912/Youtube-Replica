import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ResetToken } from "../models/resetToken.model.js";
import { sendResetMail } from "../utils/mailer.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 15 * 60 * 1000;

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// POST /api/v1/users/forgot-password  { email }
// Always answers 200 with the same message so nobody can probe
// which emails have accounts.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  if (!email || !EMAIL_RE.test(String(email))) {
    throw new ApiError(400, "Enter a valid email address.");
  }

  const address = String(email).toLowerCase().trim();
  const done = () =>
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: address },
          "If that email has an account, a reset link is on its way."
        )
      );

  const user = await User.findOne({ email: address });
  if (!user) {
    return done();
  }

  await ResetToken.deleteMany({ email: address });

  const token = crypto.randomBytes(32).toString("hex");
  await ResetToken.create({
    email: address,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });

  const base =
    process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
  const link = `${base.replace(/\/$/, "")}/reset-password?token=${token}&email=${encodeURIComponent(address)}`;

  try {
    await sendResetMail(address, link);
  } catch (err) {
    console.error("Reset mail failed:", err.message);
    await ResetToken.deleteMany({ email: address });
    throw new ApiError(
      502,
      "Could not send the email. Check the server mail configuration and try again."
    );
  }

  return done();
});

// POST /api/v1/users/reset-password  { token, newPassword }
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body || {};

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "This reset link is invalid. Ask for a fresh one.");
  }
  if (!newPassword || String(newPassword).length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters.");
  }

  const record = await ResetToken.findOne({
    tokenHash: sha256(token),
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new ApiError(
      400,
      "This reset link is invalid or expired. Ask for a fresh one."
    );
  }

  const user = await User.findOne({ email: record.email });
  if (!user) {
    await ResetToken.deleteMany({ email: record.email });
    throw new ApiError(400, "This reset link is invalid. Ask for a fresh one.");
  }

  user.password = String(newPassword); // hashed by the pre-save hook
  await user.save();
  await ResetToken.deleteMany({ email: record.email });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated. Log in with the new one."));
});

export { forgotPassword, resetPassword };
