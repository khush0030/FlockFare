import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { trip_slug, origin_code, max_total_inr, min_pct_off } = body as {
    trip_slug?: string;
    origin_code?: string;
    max_total_inr?: number | null;
    min_pct_off?: number | null;
  };

  if (!trip_slug || !origin_code) {
    return NextResponse.json({ error: "trip_slug and origin_code required" }, { status: 400 });
  }
  if (max_total_inr == null && min_pct_off == null) {
    return NextResponse.json(
      { error: "Provide at least one of max_total_inr or min_pct_off" },
      { status: 400 },
    );
  }

  const { data, error } = await db
    .from("trip_alerts")
    .upsert(
      {
        user_email: session.user.email,
        trip_slug,
        origin_code,
        max_total_inr: max_total_inr ?? null,
        min_pct_off: min_pct_off ?? null,
        is_active: true,
      },
      { onConflict: "user_email,trip_slug,origin_code" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ alert: data });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trip_slug = searchParams.get("trip_slug");
  const origin_code = searchParams.get("origin_code");
  if (!trip_slug || !origin_code) {
    return NextResponse.json({ error: "trip_slug and origin_code required" }, { status: 400 });
  }

  const { error } = await db
    .from("trip_alerts")
    .delete()
    .eq("user_email", session.user.email)
    .eq("trip_slug", trip_slug)
    .eq("origin_code", origin_code);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
