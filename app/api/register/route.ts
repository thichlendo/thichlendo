import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import { hashPasswordSalted } from "@/lib/hash";
import { createSessionValue, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/session";
import { isValidUsername } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const displayName = String(body.displayName || "").trim();
  const password = String(body.password || "");

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Tên đăng nhập chỉ dùng chữ, số, gạch dưới, 3-20 ký tự." },
      { status: 400 }
    );
  }
  if (!displayName) {
    return NextResponse.json({ error: "Vui lòng nhập tên hiển thị." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự." }, { status: 400 });
  }

  const userRef = adminDb.ref(`users/${username}`);
  const existing = await userRef.get();
  if (existing.exists()) {
    return NextResponse.json({ error: "Tên đăng nhập đã được sử dụng." }, { status: 409 });
  }

  const { salt, hash } = hashPasswordSalted(password);

  await userRef.set({
    username,
    displayName,
    passwordSalt: salt,
    passwordHash: hash,
    badge: null,
    streak: 0,
    lastPostDate: null,
    createdAt: Date.now(),
  });

  const sessionValue = createSessionValue({
    username,
    displayName,
    badge: null,
    issuedAt: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  return NextResponse.json({ username, displayName, badge: null });
                          }
