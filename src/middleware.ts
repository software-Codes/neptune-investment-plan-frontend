// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/otp-verify",
  "/auth/reset-password",
  "/auth/complete-recovery",
  "/auth/verify-kyc",
];

const protectedRoutePatterns = [
  // /<userId>/(dashboard|wallet|…)
  /^\/[^/]+\/(dashboard|wallet|investments|transactions|referral)$/,
  // /admin/<adminId>/…
  /^\/admin\/[^/]+(\/.*)?$/,
];

const LOGIN_ROUTE = "/auth/login";
const HOME_ROUTE  = "/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth-token")?.value;
  const userId    = request.cookies.get("user-id")?.value;

  // 1. Allow Next internals, assets, API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Root path
  if (pathname === HOME_ROUTE) {
    if (!authToken) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }
    if (userId) {
      return NextResponse.redirect(new URL(`/${userId}/dashboard`, request.url));
    }
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  // 3. Public routes
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    // Push logged-in users away from /auth pages
    if (authToken && userId && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL(`/${userId}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // 4. Protected routes
  if (protectedRoutePatterns.some((rx) => rx.test(pathname))) {
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Fallback to home
  return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

export const config = {
  matcher: [
    // match all except Next internals & API
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)",
  ],
};
