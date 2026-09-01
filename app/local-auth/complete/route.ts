import { isLocalHost } from "../../chatgpt-auth";

function safeReturnPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/dashboard";
  try {
    const url = new URL(value, "https://agentlab.local");
    return url.origin === "https://agentlab.local" ? `${url.pathname}${url.search}${url.hash}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export function GET(request: Request) {
  const url = new URL(request.url);
  if (!isLocalHost(url.host)) return Response.json({ error: "Local demo authentication is unavailable here" }, { status: 404 });
  const returnTo = safeReturnPath(url.searchParams.get("return_to"));
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(returnTo, url.origin).toString(),
      "Set-Cookie": "agentlab-local-demo=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
    },
  });
}
