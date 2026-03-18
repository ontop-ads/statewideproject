import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

// Routes that don't require authentication
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;

  let session = null;
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch {
      session = null;
    }
  }

  // If not logged in and trying to access a protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // If already logged in and trying to access login page
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
