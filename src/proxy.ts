import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED = ["/profile", "/preferences", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  const session = await auth();

  if (!session?.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check onboarding status — redirect new users to /onboarding
  if (pathname !== "/onboarding") {
    const profile = (session as unknown as Record<string, unknown>).profile as
      | { onboarded?: boolean }
      | null;

    if (profile && profile.onboarded === false) {
      const onboardUrl = request.nextUrl.clone();
      onboardUrl.pathname = "/onboarding";
      return NextResponse.redirect(onboardUrl);
    }
  }

  return NextResponse.next();
}
