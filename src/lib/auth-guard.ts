import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Require authenticated session for API routes.
 * Returns session on success, or sends 401 response on failure.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session.authenticated) {
    throw new AuthError();
  }
  return session;
}

/** Thrown when auth check fails — catch in route handlers to send 401 */
export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }

  toResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
