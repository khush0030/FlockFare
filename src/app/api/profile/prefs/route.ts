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
  const allowed = [
    "deals_email",
    "weekly_digest",
    "push",
    "updates",
    "analytics",
  ] as const;

  const updates: Record<string, boolean> = {};
  for (const key of allowed) {
    if (typeof body[key] === "boolean") {
      updates[key] = body[key];
    }
  }

  const { error } = await db
    .from("notification_prefs")
    .update(updates)
    .eq("email", session.user.email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
