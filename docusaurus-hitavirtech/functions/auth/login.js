// ============================================================
//  /auth/login  — show the branded sign-in page
//  Sets a short-lived CSRF "state" cookie, then renders a page
//  whose button sends the student to Google.
// ============================================================
import { loginPage } from "../_pages.js";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Where to send the student after a successful login (same-origin only).
  let redirect = url.searchParams.get("redirect") || "/";
  if (!redirect.startsWith("/")) redirect = "/";

  // CSRF state, tied to this attempt and stored in an HttpOnly cookie.
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  const statePayload = encodeURIComponent(`${state}|${redirect}`);
  const cookie =
    `hv_oauth=${statePayload}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;

  return new Response(loginPage(googleUrl), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": cookie,
      "Cache-Control": "no-store",
    },
  });
}
