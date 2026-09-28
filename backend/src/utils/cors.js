// Bulletproof CORS for serverless.
//
// Why not the `cors` package with CORS_ORIGIN=*?
//  1. `*` + credentials:true emits `Access-Control-Allow-Origin: *`,
//     which browsers REJECT whenever credentials are involved.
//  2. Preflights must succeed even when the DB is unreachable, so the
//     serverless entry short-circuits OPTIONS before any DB work and
//     error paths below carry the same headers.

const parseAllowed = () =>
  (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function setCorsHeaders(req, res) {
  const allowed = parseAllowed();
  const origin = req.headers?.origin;

  // Echo the caller's origin when allowed (required for credentials).
  // A bare "*" in the env means "any origin, echoed back".
  const allow =
    allowed.includes("*") || allowed.includes(origin)
      ? origin || "*"
      : allowed[0] || "*";

  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

export function isPreflight(req) {
  return req.method === "OPTIONS";
}

// Express middleware — must be the FIRST app.use() so every route,
// 404 and error response carries the headers.
export function corsMiddleware(req, res, next) {
  setCorsHeaders(req, res);
  if (isPreflight(req)) {
    return res.sendStatus(204);
  }
  next();
}
