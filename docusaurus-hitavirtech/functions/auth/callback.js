// ============================================================
//  /auth/callback — Google redirects back here after sign-in
//  Verifies state, gets the verified email, checks the allowlist,
//  and (if allowed) issues a signed 7-day session cookie.
// ============================================================
import { createSession, parseCookies, normalizeEmail } from "../_auth.js";
import { isAllowed, ADMIN_CONTACT } from "../_allowlist.js";
import { deniedPage, messagePage } from "../_pages.js";

const html = (body, status) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  // 1. CSRF check: state from Google must match the cookie we set.
  const cookies = parseCookies(request.headers.get("Cookie"));
  const [savedState, savedRedirect = "/"] = (cookies["hv_oauth"] || "").split("|");
  if (!code || !returnedState || returnedState !== savedState) {
    return html(messagePage("Sign-in expired", "That sign-in link timed out. Please try again."), 400);
  }

  // 2. Exchange the authorization code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/auth/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return html(messagePage("Couldn't verify sign-in", "Google didn't confirm your sign-in. Please try again."), 502);
  }
  const tokens = await tokenRes.json();

  // 3. Get the verified email from Google.
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = await infoRes.json();
  const email = user.email || "";
  const verified = user.verified_email !== false;
  if (!email || !verified) {
    return html(messagePage("Email not verified", "We couldn't confirm a verified email on that Google account."), 403);
  }

  // 4. Allowlist gate.
  if (!isAllowed(email)) {
    return html(deniedPage(email, ADMIN_CONTACT), 403);
  }

  // 5. Issue the signed session and clear the one-time state cookie.
  const token = await createSession(normalizeEmail(email), env.SESSION_SECRET);
  const dest = savedRedirect.startsWith("/") ? savedRedirect : "/";

  const headers = new Headers({ Location: dest, "Cache-Control": "no-store" });
  headers.append(
    "Set-Cookie",
    `hv_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  );
  headers.append("Set-Cookie", "hv_oauth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");

  return new Response(null, { status: 302, headers });
}
