import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, buildAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login", "/icon.svg"];

export async function proxy(request: NextRequest) {
  if (!process.env.pass) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const expectedToken = await buildAuthToken();
  const hasValidCookie = request.cookies.get(AUTH_COOKIE)?.value === expectedToken;

  if (isPublicPath) {
    if (pathname === "/login" && hasValidCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (hasValidCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
