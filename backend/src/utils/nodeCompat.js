// Node 23+ removed `SlowBuffer` from `node:buffer`, but the old
// `buffer-equal-constant-time@1.0.1` (via jsonwebtoken → jws → jwa)
// touches `SlowBuffer.prototype` at require-time and crashes the
// whole function. Alias it to Buffer before anything else imports
// jsonwebtoken. Safe on older Nodes (no-op when already present).
import { Buffer as NodeBuffer } from "node:buffer";
import bufferModule from "node:buffer";

if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = NodeBuffer;
}
