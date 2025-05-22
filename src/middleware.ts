/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/pages/auth/login",
  "/pages/auth/register",
  "/pages/auth/initiate-recovery",
  "/pages/auth/complete-recovery",
  "/pages/auth/otp-verify",
  "/support",
];

// Define paths that should be protected (requiring authentication)
const protectedRoutes = [
  "/pages/user/dashboard",
  "/pages/user/profile",
  "/pages/user/settings",
  // Add other protected routes here
];

// Constants for routes
const DASHBOARD_ROUTE = "/pages/user/dashboard";
const LOGIN_ROUTE = "/pages/auth/login";
const HOME_ROUTE = "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies (more secure than localStorage for auth)
  const authCookie = request.cookies.get("auth-token");
  const hasToken = !!authCookie?.value;
  
  // Allow access to static assets and API routes without authentication checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle root path ("/")
  if (pathname === "/") {
    const bypass = request.nextUrl.searchParams.get('bypass');
    if (bypass === 'true') {
      return NextResponse.next();
    }
    
    if (!hasToken) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
  }
  // Handle public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    // If user is already authenticated and trying to access login/register pages,
    // redirect them to dashboard
    if (hasToken && (pathname.includes("/login") || pathname.includes("/register"))) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }
    
    // Otherwise, allow access to public routes
    return NextResponse.next();
  }
  
  // Handle protected routes - require authentication
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    if (!hasToken) {
      // Redirect to login page and store the original URL as a query parameter
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token exists, allow access to protected route
    return NextResponse.next();
  }
  
  // For any unmatched routes, redirect to home
  return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
}

// Configure which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api routes
     * - /_next (Next.js internals)
     * - /_vercel (Vercel internals)
     * - /static (static files)
     * - All files in the public folder
     */
    "/((?!api|_next|_vercel|static|.*\\..*).*)",
  ],
};