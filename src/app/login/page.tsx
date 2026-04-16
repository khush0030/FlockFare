"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createAuthBrowserClient } from "@/lib/supabase/browser-auth";
import { Header } from "@/components/header";

const fd = "var(--font-display)";
const fm = "var(--font-mono)";
const ink = "var(--color-ink)";
const cream = "var(--color-cream)";
const lime = "var(--color-lime)";
const coral = "var(--color-coral)";
const coralT = "var(--color-coral-tint)";
const brut = "var(--shadow-brut)";
const brutLg = "var(--shadow-brut-lg)";
const violet = "var(--color-violet)";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/profile";

  const handleGoogleSignIn = async () => {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-ffgray-50)",
        fontFamily: "var(--font-body)",
        color: ink,
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: 440,
          margin: "0 auto",
          padding: "80px 24px 120px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐧</div>
        <h1
          style={{
            fontFamily: fd,
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            letterSpacing: "-.03em",
            marginBottom: 8,
          }}
        >
          Join the flock
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--color-ffgray-500)",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          FlockFare is invite-only for friends &amp; family. Sign in with Google
          to continue.
        </p>

        {error === "not_invited" && (
          <div
            style={{
              background: coralT,
              border: `3px solid ${coral}`,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontFamily: fd,
                fontWeight: 700,
                fontSize: 14,
                color: coral,
                marginBottom: 4,
              }}
            >
              Not on the list yet
            </div>
            <p style={{ fontSize: 13, color: "var(--color-ffgray-500)" }}>
              Your email isn&rsquo;t on the invite list. Ask a flock member to
              add you, or reach out to the admin.
            </p>
          </div>
        )}

        {error === "auth_error" && (
          <div
            style={{
              background: coralT,
              border: `3px solid ${coral}`,
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontFamily: fd,
                fontWeight: 700,
                fontSize: 14,
                color: coral,
              }}
            >
              Something went wrong. Try again.
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontFamily: fd,
            fontWeight: 900,
            fontSize: 16,
            padding: "16px 32px",
            borderRadius: 999,
            background: ink,
            color: cream,
            border: `4px solid ${ink}`,
            boxShadow: brut,
            cursor: "pointer",
            transition: "transform 120ms, box-shadow 120ms",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translate(-2px,-2px)";
            e.currentTarget.style.boxShadow = brutLg;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = brut;
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Sign in with Google
        </button>

        <div
          style={{
            marginTop: 20,
            fontFamily: fm,
            fontSize: 10,
            color: "var(--color-ffgray-400)",
            letterSpacing: ".08em",
          }}
        >
          INVITE-ONLY · YOUR DATA STAYS PRIVATE
        </div>

        <div
          style={{
            marginTop: 48,
            background: violet,
            border: `4px solid ${ink}`,
            borderRadius: 20,
            boxShadow: brut,
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
          <h3
            style={{
              fontFamily: fd,
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            Why sign in?
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.65)",
              lineHeight: 1.6,
            }}
          >
            Save deals, track bookings, get personalized alerts from Penny, and
            see how much you&rsquo;ve saved over time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
