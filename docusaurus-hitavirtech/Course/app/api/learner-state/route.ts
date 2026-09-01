import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { learnerRecords, users } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { privateHeaders } from "../../../lib/http";

const allowedKinds = new Set(["course-progress", "project-workspace"]);

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind") || "";
  if (!allowedKinds.has(kind)) return Response.json({ error: "Unsupported record type" }, { status: 400 });
  try {
    const rows = await (await getDb()).select().from(learnerRecords).where(and(eq(learnerRecords.userId, user.userId), eq(learnerRecords.kind, kind))).limit(1);
    const row = rows[0];
    if (!row) return Response.json({ record: null }, { headers: privateHeaders });
    const payload = JSON.parse(row.payload) as unknown;
    return Response.json({ record: { kind: row.kind, version: row.version, payload, updatedAt: row.updatedAt } }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Learner state is temporarily unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 500_000) return Response.json({ error: "Learner state is too large" }, { status: 413 });
  let body: { kind?: string; version?: number; payload?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 500_000) return Response.json({ error: "Learner state is too large" }, { status: 413 });
    body = JSON.parse(raw) as { kind?: string; version?: number; payload?: unknown };
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const kind = body.kind || "";
  if (!allowedKinds.has(kind) || !body.payload || typeof body.payload !== "object") return Response.json({ error: "Invalid learner state" }, { status: 400 });
  const serializedPayload = JSON.stringify(body.payload);
  if (serializedPayload.length > 500_000) return Response.json({ error: "Learner state is too large" }, { status: 413 });
  const now = new Date().toISOString();
  try {
    const db = await getDb();
    await db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } });
    await db.insert(learnerRecords).values({ userId: user.userId, kind, version: Math.max(1, Math.min(100, Number(body.version) || 1)), payload: serializedPayload, updatedAt: now }).onConflictDoUpdate({ target: [learnerRecords.userId, learnerRecords.kind], set: { version: Math.max(1, Math.min(100, Number(body.version) || 1)), payload: serializedPayload, updatedAt: now } });
    return Response.json({ ok: true, updatedAt: now }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Learner state could not be saved" }, { status: 503 });
  }
}
