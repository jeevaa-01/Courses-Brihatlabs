// ============================================================
//  /auth/whoami — returns the signed-in student's email as JSON.
//  Same { email, access } shape as the codelabs gate, so any
//  client-side script can ask "who am I and what can I open?".
//
//  Only ever reveals the CALLER's own email, read from their own
//  HMAC-signed hv_session cookie. No session → 401.
// ============================================================
import { verifySession, parseCookies } from "../_auth.js";
import { RESTRICTED_PATHS, canAccessPath } from "../_allowlist.js";

export async function onRequest(context) {
  const { request, env } = context;
  const cookies = parseCookies(request.headers.get("Cookie"));
  const session = await verifySession(cookies["hv_session"], env.SESSION_SECRET);

  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (!session) {
    return new Response(JSON.stringify({ email: "" }), { status: 401, headers });
  }

  // Per-restricted-path access for THIS caller. Only the caller's own access is
  // exposed. RESTRICTED_PATHS is empty by default, so `access` is usually {}.
  const access = {};
  for (const p in RESTRICTED_PATHS) access[p] = canAccessPath(session.email, p);

  return new Response(JSON.stringify({ email: session.email, access }), { status: 200, headers });
}
