import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await requireAuth();
    return NextResponse.json({
      data: { username: session.username, authenticated: true },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
