import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { MAX_LOGIN_ATTEMPTS, LOCK_DURATION_MINUTES } from "@/lib/constants";

export const runtime = "edge";

// In-memory rate limiting (per-username failed attempts)
// Note: In Cloudflare Workers, this resets on each deploy/cold start.
// For production, use KV or Durable Objects for rate limiting.
const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (session.authenticated) {
    return NextResponse.json({ data: { username: session.username }, message: "已登录" });
  }

  const body = await request.json() as { username?: string; password?: string };
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
  }

  // Check rate limiting
  const attempts = failedAttempts.get(username);
  if (attempts?.lockUntil && Date.now() < attempts.lockUntil) {
    const remainingMinutes = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
    return NextResponse.json(
      { error: `账号已锁定，请${remainingMinutes}分钟后重试` },
      { status: 429 }
    );
  }

  const db = getDb();
  const result = await db.prepare(
    "SELECT * FROM admin WHERE username = ?"
  ).bind(username).all<{
    id: number;
    username: string;
    password_hash: string;
  }>();

  const admin = result.results[0];

  // Dynamic import bcryptjs (pure JS, works in Edge Runtime)
  const bcrypt = await import("bcryptjs");

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    const current = failedAttempts.get(username) || { count: 0, lockUntil: 0 };
    current.count += 1;

    if (current.count >= MAX_LOGIN_ATTEMPTS) {
      current.lockUntil = Date.now() + LOCK_DURATION_MINUTES * 60 * 1000;
      failedAttempts.set(username, current);
      return NextResponse.json(
        { error: `账号已锁定，请${LOCK_DURATION_MINUTES}分钟后重试` },
        { status: 429 }
      );
    }

    failedAttempts.set(username, current);
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  failedAttempts.delete(username);

  session.username = admin.username;
  session.authenticated = true;
  await session.save();

  return NextResponse.json({
    data: { username: admin.username },
    message: "登录成功",
  });
}
