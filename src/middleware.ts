import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/otp-verify",
  "/auth/reset-password",
  "/auth/verify-kyc",
  "/auth/complete-recovery"
];

// Define protected routes based on actual folder structure
const protectedRoutes = [
  // User routes
  "/(user)/[userId]/dashboard",
  "/(user)/[userId]/wallet",
  "/(user)/[userId]/investments",
  "/(user)/[userId]/transactions",
  "/(user)/[userId]/referral",
  
  // Admin routes
  "/admin/[adminId]",
];

// Constants for routes
const LOGIN_ROUTE = "/auth/login";
const HOME_ROUTE = "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and userId from cookies
  const authToken = request.cookies.get("auth-token");
  const userId = request.cookies.get("user-id");
  const hasToken = !!authToken?.value;

  // Allow access to static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    if (!hasToken) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }
    // Redirect to dashboard with actual userId
    if (userId?.value) {
      return NextResponse.redirect(new URL(`/(user)/${userId.value}/dashboard`, request.url));
    }
    // If no userId, redirect to login
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  // Handle public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages
    if (hasToken && pathname.startsWith("/auth") && userId?.value) {
      return NextResponse.redirect(new URL(`/(user)/${userId.value}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (
    protectedRoutes.some((route) => {
      const routePattern = route
        .replace(/\[([^\]]+)\]/g, '([^/]+)') // Replace dynamic segments with capture groups
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
      return new RegExp(`^${routePattern}`).test(pathname);
    })
  ) {
    if (!hasToken) {
      // Redirect to login with return URL
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // For unmatched routes, redirect to home
  return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'
  ]
};
