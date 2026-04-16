import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Enforce invite-only allowlist
      const { data } = await db
        .from("allowed_emails")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();

      if (!data) return "/login?error=not_invited";

      // Upsert user profile on first login
      const { data: existing } = await db
        .from("user_profiles")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!existing) {
        await db.from("user_profiles").insert({
          email: user.email,
          display_name: user.name ?? "User",
          avatar_url: user.image ?? null,
          referral_code: crypto.randomUUID().slice(0, 12),
          plan_tier: "free",
        });
        await db.from("notification_prefs").insert({
          email: user.email,
        });
        await db
          .from("allowed_emails")
          .update({ used_at: new Date().toISOString() })
          .eq("email", user.email);
      }

      return true;
    },
    async session({ session }) {
      // Attach profile data to session
      if (session.user?.email) {
        const { data: profile } = await db
          .from("user_profiles")
          .select("*")
          .eq("email", session.user.email)
          .maybeSingle();

        if (profile) {
          (session as unknown as Record<string, unknown>).profile = profile;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
