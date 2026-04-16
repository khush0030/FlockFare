import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, name, home_airport } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required." },
        { status: 400 }
      );
    }

    const airport = (home_airport || "BOM").toUpperCase().trim();

    const subscriberName = (name || email.split("@")[0]).slice(0, 100);

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        // Reactivate
        await supabaseAdmin
          .from("subscribers")
          .update({ is_active: true, home_airport: airport })
          .eq("id", existing.id);

        return NextResponse.json({
          message: "Welcome back to the flock!",
          reactivated: true,
        });
      }
      return NextResponse.json({
        message: "You're already in the flock!",
        existing: true,
      });
    }

    // New subscriber
    const { error } = await supabaseAdmin.from("subscribers").insert({
      email: email.toLowerCase().trim(),
      name: subscriberName,
      home_airport: airport,
    });

    if (error) {
      console.error("Subscribe error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Welcome to the flock! Penny is already watching fares for you.",
      subscribed: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
