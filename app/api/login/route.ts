import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, buildAuthToken } from "@/lib/auth";

const safeNextPath = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
};

export async function POST(request: NextRequest) {
  const configuredPassword = process.env.pass;
  const formData = await request.formData();
  const submittedPassword = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!configuredPassword || submittedPassword !== configuredPassword) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.cookies.set(AUTH_COOKIE, await buildAuthToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
