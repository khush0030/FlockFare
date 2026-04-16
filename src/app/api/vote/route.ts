import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { deal_id, voter_name } = await req.json();

    if (!deal_id || !voter_name) {
      return NextResponse.json(
        { error: "deal_id and voter_name required." },
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { data, error } = await supabase
    .from("deal_votes")
    .select("voter_name, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    count: data?.length ?? 0,
    voters: (data ?? []).map((v) => v.voter_name),
  });
}
