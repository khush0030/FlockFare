import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Permanent Pro — bypasses billing, survives DB wipes
const ADMIN_EMAILS = new Set(["khushmutha20@gmail.com"]);

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

      const isAdmin = ADMIN_EMAILS.has(user.email);

      if (!existing) {
        await db.from("user_profiles").insert({
          email: user.email,
          display_name: user.name ?? "User",
          avatar_url: user.image ?? null,
          referral_code: crypto.randomUUID().slice(0, 12),
          plan_tier: isAdmin ? "pro" : "free",
          onboarded: isAdmin ? true : false,
        });
        await db.from("notification_prefs").insert({
          email: user.email,
        });
        await db
          .from("allowed_emails")
          .update({ used_at: new Date().toISOString() })
          .eq("email", user.email);

        return true;
      }

      // Ensure admin stays Pro even if DB drifted
      if (isAdmin) {
        await db
          .from("user_profiles")
          .update({ plan_tier: "pro", onboarded: true })
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
          if (ADMIN_EMAILS.has(session.user.email)) {
            profile.plan_tier = "pro";
            profile.onboarded = true;
          }
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
