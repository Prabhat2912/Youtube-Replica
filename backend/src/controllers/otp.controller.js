import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Otp } from "../models/otp.model.js";
import { sendOtpMail } from "../utils/mailer.js";

const CODE_TTL_MINUTES = 10;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const makeCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

// POST /api/v1/users/send-otp  { email }
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  if (!email || !EMAIL_RE.test(String(email))) {
    throw new ApiError(400, "Enter a valid email address.");
  }

  const address = String(email).toLowerCase().trim();

  const recent = await Otp.findOne({ email: address }).sort({ createdAt: -1 });
  if (recent) {
    const ageSec = (Date.now() - new Date(recent.createdAt).getTime()) / 1000;
    if (ageSec < RESEND_SECONDS) {
      throw new ApiError(
        429,
        `A code was just sent. Wait ${Math.ceil(RESEND_SECONDS - ageSec)}s before asking again.`
      );
    }
    await Otp.deleteMany({ email: address });
  }

  const code = makeCode();
  const otpHash = await bcrypt.hash(code, 10);
  await Otp.create({ email: address, otpHash });

  try {
    await sendOtpMail(address, code);
  } catch (err) {
    console.error("OTP mail failed:", err.message);
    await Otp.deleteMany({ email: address });
    throw new ApiError(
      502,
      "Could not send the email. Check the server mail configuration and try again."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: address, expiresInMinutes: CODE_TTL_MINUTES },
        "Verification code sent to your email."
      )
    );
});

// POST /api/v1/users/verify-otp  { email, otp }
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  const code = String(otp || "").replace(/\D/g, "");

  if (!email || !EMAIL_RE.test(String(email))) {
    throw new ApiError(400, "Enter a valid email address.");
  }
  if (code.length !== 6) {
    throw new ApiError(400, "Enter the 6-digit code from your email.");
  }

  const address = String(email).toLowerCase().trim();
  const record = await Otp.findOne({ email: address });

  if (!record) {
    throw new ApiError(
      400,
      "No active code for this email. It may have expired — ask for a new one."
    );
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteMany({ email: address });
    throw new ApiError(429, "Too many wrong tries. Ask for a fresh code.");
  }

  const ok = await bcrypt.compare(code, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, "That code doesn't match. Try again.");
  }

  await Otp.deleteMany({ email: address });

  return res
    .status(200)
    .json(new ApiResponse(200, { email: address, verified: true }, "Email verified."));
});

export { sendOtp, verifyOtp };
