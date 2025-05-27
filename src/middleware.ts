import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/reset-password",
  "/auth/verify-kyc",
];

// Define protected routes based on your folder structure
const protectedRoutes = [
  // User routes
  "/user/[userId]/dashboard",
  "/user/[userId]/wallet",
  "/user/[userId]/investments",
  "/user/[userId]/deposits",
  "/user/[userId]/withdrawals",
  "/user/[userId]/referral",

  // Admin routes
  "/admin/[adminId]/dashboard",
  "/admin/[adminId]/users",
  "/admin/[adminId]/transactions",
  "/admin/[adminId]/investments",
  "/admin/[adminId]/analytics",
];

// Constants for routes
const DEFAULT_DASHBOARD = "/user"; // Will be appended with userId
const LOGIN_ROUTE = "/auth/login";
const HOME_ROUTE = "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token and user info from cookies
  const authToken = request.cookies.get("auth-token");
  const userId = request.cookies.get("user-id");
  const userRole = request.cookies.get("user-role");

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

    // Redirect to appropriate dashboard based on user role
    const dashboardPath =
      userRole?.value === "admin"
        ? `/admin/${userId?.value}/dashboard`
        : `/user/${userId?.value}/dashboard`;

    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Handle public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages
    if (hasToken && pathname.startsWith("/auth")) {
      const dashboardPath =
        userRole?.value === "admin"
          ? `/admin/${userId?.value}/dashboard`
          : `/user/${userId?.value}/dashboard`;

      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
   if (
    protectedRoutes.some((route) => {
      // Convert route pattern to regex to handle dynamic segments
      const routePattern = route
        .replace(/\[([^\]]+)\]/g, '([^/]+)') // Replace dynamic segments with capture groups
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
      return new RegExp(`^${routePattern}$`).test(pathname);
    })
  ) {
    if (!hasToken) {
      // Redirect to login with return URL
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (pathname.startsWith("/admin") && userRole?.value !== "admin") {
      return NextResponse.redirect(new URL(DEFAULT_DASHBOARD, request.url));
    }

    return NextResponse.next();
  }

  // For unmatched routes, redirect to home
  return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (internal Next.js data routes)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'
  ]
};
