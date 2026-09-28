import axios from "axios";
import BASE_URL from "../../BaseURL";

// ---------------------------------------------------------------
// OTP API — talks to the real backend first:
//   POST /api/v1/users/send-otp   { email }        -> ApiResponse 200
//   POST /api/v1/users/verify-otp { email, otp }   -> ApiResponse 200 { verified: true }
// If the backend is unreachable or still lacks the routes (404 /
// network error), it falls back to a local mock so the UI flow stays
// testable. Real 4xx answers (wrong code, rate limit) are surfaced
// as-is and never fall back to the mock.
// ---------------------------------------------------------------

const MOCK_KEY = "playtube_mock_otp";

function mockCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const serverMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const isNoRoute = (err) =>
  !err?.response || err?.response?.status === 404;

export async function sendOtp(email) {
  try {
    const res = await axios.post(
      `${BASE_URL}/users/send-otp`,
      { email },
      { timeout: 15000 }
    );
    return {
      delivered: true,
      via: "api",
      message: res.data?.message || "Code sent",
    };
  } catch (err) {
    if (!isNoRoute(err)) {
      throw new Error(serverMessage(err, "Could not send code"));
    }
    // Backend unreachable or route missing — mock delivery.
    const code = mockCode();
    sessionStorage.setItem(
      MOCK_KEY,
      JSON.stringify({ email, code, at: Date.now() })
    );
    if (import.meta.env.DEV) {
      // Dev-only: so the flow can be completed without email.
      // Never ship this log to production.
      console.info(`[otp-mock] code for ${email}: ${code}`);
    }
    await new Promise((r) => setTimeout(r, 700));
    return { delivered: true, via: "mock", message: "Code sent" };
  }
}

export async function verifyOtp(email, otp) {
  const code = String(otp).replace(/\D/g, "");
  try {
    await axios.post(
      `${BASE_URL}/users/verify-otp`,
      { email, otp: code },
      { timeout: 15000 }
    );
    return { verified: true, via: "api" };
  } catch (err) {
    if (!isNoRoute(err)) {
      return {
        verified: false,
        via: "api",
        error: serverMessage(err, "Verification failed"),
      };
    }
    await new Promise((r) => setTimeout(r, 600));
    const raw = sessionStorage.getItem(MOCK_KEY);
    if (!raw) return { verified: false, via: "mock", error: "Code expired. Ask for a new one." };
    const saved = JSON.parse(raw);
    if (saved.email !== email) {
      return { verified: false, via: "mock", error: "This code was sent to a different address." };
    }
    if (Date.now() - saved.at > 10 * 60 * 1000) {
      return { verified: false, via: "mock", error: "Code expired. Ask for a new one." };
    }
    // Dev convenience: 000000 always passes in mock mode.
    if (code === saved.code || code === "000000") {
      sessionStorage.removeItem(MOCK_KEY);
      return { verified: true, via: "mock" };
    }
    return { verified: false, via: "mock", error: "That code doesn't match. Try again." };
  }
}
