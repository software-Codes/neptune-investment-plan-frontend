/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/pages/auth/login",
  "/pages/auth/register",
  "/pages/auth/forgot-password",
  "/pages/auth/otp-verify",
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes without authentication
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    // If user is already authenticated, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/pages/user/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!token) {
    // Redirect to login page and store the original url as a query parameter
    const loginUrl = new URL("/pages/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For authenticated users, allow access to all other pages
  return NextResponse.next();
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
    '/((?!api|_next|_vercel|static|.*\\..*).*)',
  ],
};