import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { ORIGINS } from "@/config/watchlist";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_ORIGINS = new Set(ORIGINS.map((o) => o.code));

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

function isIsoDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isIata(s: unknown): s is string {
  return typeof s === "string" && /^[A-Z]{3}$/.test(s);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    label,
    outbound_dest_code,
    return_origin_code,
    outbound_date,
    return_date,
    origin_codes,
  } = body as {
    label?: string;
    outbound_dest_code?: string;
    return_origin_code?: string;
    outbound_date?: string;
    return_date?: string;
    origin_codes?: string[];
  };

  if (!label || typeof label !== "string" || label.length > 80) {
    return NextResponse.json({ error: "label required (≤80 chars)" }, { status: 400 });
  }
  if (!isIata(outbound_dest_code)) {
    return NextResponse.json({ error: "outbound_dest_code must be 3-letter IATA" }, { status: 400 });
  }
  if (!isIata(return_origin_code)) {
    return NextResponse.json({ error: "return_origin_code must be 3-letter IATA" }, { status: 400 });
  }
  if (!isIsoDate(outbound_date) || !isIsoDate(return_date)) {
    return NextResponse.json({ error: "dates must be YYYY-MM-DD" }, { status: 400 });
  }
  if (new Date(return_date) <= new Date(outbound_date)) {
    return NextResponse.json({ error: "return_date must be after outbound_date" }, { status: 400 });
  }
  if (new Date(outbound_date) < new Date(new Date().toISOString().slice(0, 10))) {
    return NextResponse.json({ error: "outbound_date cannot be in the past" }, { status: 400 });
  }
  if (!Array.isArray(origin_codes) || origin_codes.length === 0 || origin_codes.length > 4) {
    return NextResponse.json({ error: "origin_codes must be 1–4 IATA codes" }, { status: 400 });
  }
  for (const c of origin_codes) {
    if (!VALID_ORIGINS.has(c)) {
      return NextResponse.json(
        { error: `origin ${c} not in supported list (${[...VALID_ORIGINS].join(", ")})` },
        { status: 400 },
      );
    }
  }

  const userPrefix = session.user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  const slug = `u-${userPrefix}-${slugify(label)}-${randSuffix()}`;

  const { data, error } = await db
    .from("multi_city_trips")
    .insert({
      slug,
      label,
      outbound_dest_code,
      return_origin_code,
      outbound_date,
      return_date,
      origin_codes,
      is_active: true,
      user_email: session.user.email,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ trip: data });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const { data: trip, error: fetchErr } = await db
    .from("multi_city_trips")
    .select("user_email")
    .eq("slug", slug)
    .single();

  if (fetchErr || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  if (trip.user_email !== session.user.email) {
    return NextResponse.json({ error: "Cannot delete trips you don't own" }, { status: 403 });
  }

  const { error } = await db
    .from("multi_city_trips")
    .update({ is_active: false })
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: true });
}
