/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/pages/auth/login",
  "/pages/auth/register",
  "/pages/auth/forgot-password",
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Allow access to public routes without authentication
  if (publicRoutes.includes(pathname)) {
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
  try {
    // Verify token on protected routes
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    return NextResponse.next();
  } catch (error) {
    // If token verification fails, clear the token and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

}

// Configure which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. All files in the public folder
     */
    '/((?!api|_next|_vercel|static|.*\\..*).*)',
  ],
};
