// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/auth-code/otp-verify",
  "/auth/auth-code/reset-password",
  "/auth/auth-code/complete-recovery",
  "/auth/auth-code/verify-kyc",
  "/sentry-example-page",
];

// Admin public routes (no auth required)
const adminPublicRoutes = [
  "/admin/auth/login",
  "/admin/auth/register",
  "/admin/auth/forgot-password",
  "/admin/auth/reset-password",
];

// Protected route patterns
const protectedRoutePatterns = [
  // User routes: /<userId>/(dashboard|wallet|investments|...)
  /^\/[^/]+\/(dashboard|wallet|investments|transactions|referral|deposits)/,
];

// Admin protected route patterns
const adminProtectedRoutePatterns = [
  // Admin routes: /admin/(dashboard|users|settings|...)
  /^\/admin\/(dashboard|users|settings|analytics|reports)/,
];

const LOGIN_ROUTE = "/auth/login";
const ADMIN_LOGIN_ROUTE = "/admin/auth/login";
const HOME_ROUTE = "/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const authToken = request.cookies.get("auth-token")?.value;
  const userId = request.cookies.get("user-id")?.value;
  const adminAuthToken = request.cookies.get("admin-auth-token")?.value;
  const adminId = request.cookies.get("admin-id")?.value;

  // 1. Allow Next.js internals, assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 2. Handle root path "/"
  if (pathname === HOME_ROUTE) {
    if (!authToken) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }

    // If coming from dashboard, allow access to home
    if (request.nextUrl.searchParams.get("from") === "dashboard") {
      return NextResponse.next();
    }

    // If user has ID but not coming from dashboard, redirect to dashboard
    if (userId) {
      const dashboardUrl = new URL(`/${userId}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Fallback to login if something is wrong
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  // 3. Handle admin public routes
  if (adminPublicRoutes.some((route) => pathname.startsWith(route))) {
    // If admin is already logged in, redirect to admin dashboard
    if (adminAuthToken && pathname.startsWith("/admin/auth")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle user public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already logged in, redirect to their dashboard
    if (authToken && userId && pathname.startsWith("/auth")) {
      return NextResponse.redirect(
        new URL(`/${userId}/dashboard`, request.url)
      );
    }
    return NextResponse.next();
  }

  // 5. Handle admin protected routes
  if (adminProtectedRoutePatterns.some((pattern) => pattern.test(pathname))) {
    if (!adminAuthToken) {
      const loginUrl = new URL(ADMIN_LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Handle user protected routes
  if (protectedRoutePatterns.some((pattern) => pattern.test(pathname))) {
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 7. Handle specific admin routes that don't match patterns
  if (pathname.startsWith("/admin/")) {
    if (!adminAuthToken) {
      const loginUrl = new URL(ADMIN_LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 8. Handle dynamic user routes (e.g., /userId/...)
  if (pathname.match(/^\/[^/]+\//) && !pathname.startsWith("/admin/")) {
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 9. Fallback - redirect to appropriate home
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, request.url));
  }

  return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
