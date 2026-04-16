import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
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

    const { deal_id, voter_name } = await req.json();

    if (!deal_id || !voter_name) {
      return NextResponse.json(
        { error: "deal_id and voter_name required." },
        { status: 400 }
      );
    }

    if (!UUID_RE.test(String(deal_id))) {
      return NextResponse.json(
        { error: "Invalid deal_id format." },
        { status: 400 }
      );
    }

    const name = String(voter_name).trim().slice(0, 30);

    const { error } = await supabase
      .from("deal_votes")
      .insert({ deal_id, voter_name: name });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already voted!", duplicate: true });
      }
      console.error("Vote error:", error);
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Vote counted!", voted: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const dealId = req.nextUrl.searchParams.get("deal_id");

  if (!dealId) {
    return NextResponse.json({ error: "deal_id required." }, { status: 400 });
  }

  if (!UUID_RE.test(dealId)) {
    return NextResponse.json({ error: "Invalid deal_id format." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deal_votes")
    .select("voter_name, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Vote fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    count: data?.length ?? 0,
    voters: (data ?? []).map((v) => v.voter_name),
  });
}
