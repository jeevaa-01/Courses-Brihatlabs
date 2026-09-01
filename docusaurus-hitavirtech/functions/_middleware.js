// ============================================================
//  HitaVirTech Access Gate — middleware
//  Runs on EVERY request to the site. This is the gate.
// ============================================================
import { verifySession, parseCookies } from "./_auth.js";
import { isAllowed, canAccessPath } from "./_allowlist.js";
import { restrictedPage } from "./_pages.js";

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Auth endpoints must stay open, or we'd loop forever.
  if (url.pathname.startsWith("/auth/")) return next();

  // 2. Read + verify the signed session cookie.
  const cookies = parseCookies(request.headers.get("Cookie"));
  const session = await verifySession(cookies["hv_session"], env.SESSION_SECRET);

  // 3. Valid signature, not expired, AND still on the allowlist.
  //    Re-checking the allowlist here is what makes removal instant:
  //    delete a student from _allowlist.js and their next click is blocked,
  //    even if their cookie hasn't expired yet.
  if (session && isAllowed(session.email)) {
    // Per-section cohort restriction (e.g. alumni-only modules). The student is
    // on the site allowlist, but some sections can be limited to certain batches.
    if (!canAccessPath(session.email, url.pathname)) {
      const sub = request.headers.get("Sec-Fetch-Dest");
      if (sub && sub !== "document") return new Response(null, { status: 403 });
      return new Response(
        restrictedPage(
          "This part of the course is not open for your batch yet. Hang tight, it is on the way."
        ),
        { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
      );
    }
    return next(); // serve the requested page
  }

  // 4. Not allowed. Only bounce real top-level navigations to the login
  //    page. Sub-resource requests (favicon, images, css, fetch/XHR) must
  //    NOT be redirected into /auth/login: that re-renders the login page
  //    and overwrites the one-time OAuth state cookie (e.g. with
  //    /favicon.ico), which then fails the state check at /auth/callback.
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest && dest !== "document") {
    return new Response(null, { status: 401 });
  }

  // 5. Real navigation → send to login, remembering where they were headed.
  const loginUrl = new URL("/auth/login", url.origin);
  loginUrl.searchParams.set("redirect", url.pathname + url.search);
  return Response.redirect(loginUrl.toString(), 302);
}
