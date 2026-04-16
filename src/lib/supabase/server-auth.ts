import { auth } from "@/lib/auth";

export async function getUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function getProfile() {
  const session = await auth();
  if (!session) return null;
  return (session as unknown as Record<string, unknown>).profile as {
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    referral_code: string | null;
    plan_tier: string;
    created_at: string;
  } | null;
}
