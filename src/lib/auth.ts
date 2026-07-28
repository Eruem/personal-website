import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { SESSION_MAX_AGE } from "@/lib/constants";

export interface SessionData {
  username?: string;
  authenticated?: boolean;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET 环境变量未设置。请确保 .env.local 中包含 SESSION_SECRET（至少 32 字符随机字符串）。"
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
