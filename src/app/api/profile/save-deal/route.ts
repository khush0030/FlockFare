import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server-auth";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deal_id } = await request.json();
  if (!deal_id || typeof deal_id !== "string") {
    return NextResponse.json({ error: "deal_id required" }, { status: 400 });
  }

  const { data: existing } = await db
    .from("saved_deals")
    .select("id")
    .eq("user_id", user.id)
    .eq("deal_id", deal_id)
    .maybeSingle();

  if (existing) {
    await db.from("saved_deals").delete().eq("id", existing.id);
    return NextResponse.json({ saved: false });
  }

  const { error } = await db
    .from("saved_deals")
    .insert({ user_id: user.id, deal_id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
