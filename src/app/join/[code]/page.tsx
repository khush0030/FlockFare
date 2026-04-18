import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { auth, signIn } from "@/lib/auth";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COOKIE_NAME = "ff_invite_code";
const COOKIE_MAX_AGE_SECONDS = 60 * 30; // 30 minutes to complete signup

type Props = { params: Promise<{ code: string }> };

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const cleaned = code.trim().slice(0, 32);

  const { data: inviter } = await db
    .from("user_profiles")
    .select("email,display_name")
    .eq("referral_code", cleaned)
    .maybeSingle();

  if (!inviter) {
    return (
      <main style={{ maxWidth: 480, margin: "80px auto", padding: 24, fontFamily: "var(--font-body)", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32 }}>Invalid invite</h1>
        <p style={{ color: "var(--color-ffgray-500)", marginTop: 12 }}>
          This invite link doesn&rsquo;t match any FlockFare member. Ask the person who sent it for a fresh link.
        </p>
        <Link href="/" style={{ display: "inline-block", marginTop: 24, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-violet)" }}>
          ← FlockFare home
        </Link>
      </main>
    );
  }

  // Already signed in? Skip the dance.
  const session = await auth();
  if (session?.user?.email) {
    redirect("/profile");
  }

  async function startSignIn() {
    "use server";
    // Cookie set in the server action — Next disallows it from page-render.
    const jar = await cookies();
    jar.set(COOKIE_NAME, cleaned, {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    await signIn("google", { redirectTo: "/onboarding" });
  }

  return (
    <main style={{ maxWidth: 520, margin: "60px auto", padding: 24, fontFamily: "var(--font-body)" }}>
      <div style={{ background: "var(--color-paper)", border: "4px solid var(--color-ink)", borderRadius: 24, padding: 32, boxShadow: "var(--shadow-brut-lg)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "var(--color-violet)", marginBottom: 8 }}>
          ✦ YOU&rsquo;RE INVITED
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 12 }}>
          {inviter.display_name ?? "Someone"} invited you to FlockFare.
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-ffgray-500)", lineHeight: 1.6, marginBottom: 24 }}>
          Penny watches flight prices 24/7 and pings you when fares drop hard. No spam — only real deals from your home airports.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "grid", gap: 10 }}>
          <li style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-ink)" }}>✓ Free for everyone in the flock</li>
          <li style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-ink)" }}>✓ Set your own price thresholds</li>
          <li style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-ink)" }}>✓ Multi-city + open-jaw trips supported</li>
        </ul>
        <form action={startSignIn}>
          <button
            type="submit"
            style={{
              width: "100%", padding: "14px 18px", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16,
              background: "var(--color-lime)", color: "var(--color-ink)",
              border: "4px solid var(--color-ink)", borderRadius: 999,
              cursor: "pointer", boxShadow: "var(--shadow-brut)",
            }}
          >
            Continue with Google →
          </button>
        </form>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ffgray-500)", marginTop: 16, textAlign: "center", letterSpacing: ".08em" }}>
          INVITED BY {inviter.email}
        </p>
      </div>
    </main>
  );
}
