import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const snap = await adminDb.ref("posts").orderByChild("createdAt").limitToLast(50).get();
  const raw = (snap.val() || {}) as Record<string, any>;

  const posts = Object.entries(raw)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = String(body?.text || "").trim();

  if (!text) {
    return NextResponse.json({ error: "Nội dung không được để trống." }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Tối đa 500 ký tự." }, { status: 400 });
  }

  const postRef = adminDb.ref("posts").push();
  const now = Date.now();

  await postRef.set({
    authorUsername: session.username,
    authorDisplayName: session.displayName,
    authorBadge: session.badge,
    text,
    hearts: 0,
    votedBy: {},
    createdAt: now,
  });

  const userRef = adminDb.ref(`users/${session.username}`);
  const userSnap = await userRef.get();
  const user = userSnap.val() || {};

  const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10);
  const todayKey = dayKey(now);
  const lastKey = user.lastPostDate ? dayKey(user.lastPostDate) : null;

  let streak = user.streak ?? 0;
  if (lastKey !== todayKey) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const gapMs = user.lastPostDate ? now - user.lastPostDate : oneDayMs;
    streak = gapMs <= oneDayMs * 2 ? streak + 1 : 1;
    await userRef.update({ streak, lastPostDate: now });
  }

  return NextResponse.json({ id: postRef.key, streak });
          }
