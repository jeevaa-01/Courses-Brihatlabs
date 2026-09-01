// ============================================================
//  /auth/logout — clear the session and return to sign-in
// ============================================================
export async function onRequest() {
  const headers = new Headers({ Location: "/auth/login", "Cache-Control": "no-store" });
  headers.append(
    "Set-Cookie",
    "hv_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );
  return new Response(null, { status: 302, headers });
}
