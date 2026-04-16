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

  const { deal_id } = await request.json();
  if (!deal_id || typeof deal_id !== "string") {
    return NextResponse.json({ error: "deal_id required" }, { status: 400 });
  }

  const { data: existing } = await db
    .from("saved_deals")
    .select("id")
    .eq("user_email", session.user.email)
    .eq("deal_id", deal_id)
    .maybeSingle();

  if (existing) {
    await db.from("saved_deals").delete().eq("id", existing.id);
    return NextResponse.json({ saved: false });
  }

  const { error } = await db
    .from("saved_deals")
    .insert({ user_email: session.user.email, deal_id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
