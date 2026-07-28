import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/auth";

/** Public API routes — no auth required */
const PUBLIC_API_PREFIXES = ["/api/auth/"];
const PUBLIC_GET_ROUTES = ["/api/site-config", "/api/portfolio"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // === Protect admin pages (except /admin/login) ===
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.authenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  // === API route protection ===
  if (pathname.startsWith("/api/")) {
    // Public: /api/auth/* (login, logout, me)
    if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    // Public: GET on specific routes
    if (method === "GET" && PUBLIC_GET_ROUTES.some((route) => pathname === route)) {
      return NextResponse.next();
    }

    // All other API routes require auth
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
