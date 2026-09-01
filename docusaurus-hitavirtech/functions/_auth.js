// ============================================================
//  HitaVirTech Access Gate — shared auth helpers
//  (underscore-prefixed: imported by other functions, never
//   served as its own route)
// ============================================================

const encoder = new TextEncoder();

// ---- base64url ----------------------------------------------------
function b64urlEncode(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToString(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

// ---- HMAC-SHA256 session tokens ----------------------------------
async function importKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Token format:  base64url(JSON payload) "." base64url(HMAC)
export async function createSession(email, secret, ttlSeconds = 604800) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { email, iat: now, exp: now + ttlSeconds };
  const payloadB64 = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return `${payloadB64}.${b64urlEncode(sig)}`;
}

export async function verifySession(token, secret) {
  if (!token || token.indexOf(".") === -1) return null;
  const [payloadB64, sigB64] = token.split(".");
  const key = await importKey(secret);
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );
  if (!timingSafeEqual(sigB64, b64urlEncode(expected))) return null;

  let payload;
  try {
    payload = JSON.parse(b64urlToString(payloadB64));
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) return null;
  return payload;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// ---- cookies ------------------------------------------------------
export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// ---- Gmail-aware email normalization ------------------------------
// Gmail ignores dots and +tags, so johndoe@ == john.doe@ == j.o.h.n+x@.
// Normalizing both sides means students are never wrongly denied over
// a stray dot in the allowlist.
export function normalizeEmail(email) {
  if (!email) return "";
  email = email.trim().toLowerCase();
  const at = email.indexOf("@");
  if (at === -1) return email;
  let local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0].replace(/\./g, "");
    return `${local}@gmail.com`;
  }
  return `${local}@${domain}`;
}
