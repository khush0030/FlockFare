import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Untyped client — subscribe route needs flexible writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, home_airport } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required." },
        { status: 400 }
      );
    }

    const airport = (home_airport || "BOM").toUpperCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        // Reactivate
        await supabase
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
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase().trim(),
      name: name || email.split("@")[0],
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
