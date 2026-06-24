import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

// Protects the swipe decks and matches dashboard at the edge: this only checks
// that a *valid signed-in session* exists (cheap, no DB access available at
// the edge). The live PENDING_APPROVAL / APPROVED / REJECTED check happens in
// src/app/(protected)/layout.tsx, which runs on the Node runtime and can read
// the account's current status straight from Postgres.
const PROTECTED_PATHS = ["/seeker", "/recruiter", "/matches"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    // No valid session — bounce to the launch splash ("/"), which re-runs the
    // Telegram initData handshake and routes the user back to the right place.
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seeker/:path*", "/recruiter/:path*", "/matches/:path*"],
};
