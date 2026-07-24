import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import { hashPasswordLegacySha256, hashPasswordSalted, verifySaltedPassword } from "@/lib/hash";
import { createSessionValue, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const userSnap = await adminDb.ref(`users/${username}`).get();
  if (!userSnap.exists()) {
    return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu." }, { status: 401 });
  }

  const user = userSnap.val();
  let passwordOk = false;

  if (user.passwordSalt && user.passwordHash) {
    passwordOk = verifySaltedPassword(password, user.passwordSalt, user.passwordHash);
  } else if (user.passwordHash) {
    passwordOk = hashPasswordLegacySha256(password) === user.passwordHash;
    if (passwordOk) {
      const { salt, hash } = hashPasswordSalted(password);
      await adminDb.ref(`users/${username}`).update({
        passwordSalt: salt,
        passwordHash: hash,
      });
    }
  }

  if (!passwordOk) {
    return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu." }, { status: 401 });
  }

  const badge = user.badge ?? null;

  const sessionValue = createSessionValue({
    username,
    displayName: user.displayName,
    badge,
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

  return NextResponse.json({ username, displayName: user.displayName, badge });
}
