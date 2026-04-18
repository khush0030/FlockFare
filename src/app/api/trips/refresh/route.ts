import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { fetchCheapestOneway, googleFlightsOneWayUrl } from "@/lib/serpapi-flights";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const THROTTLE_SECONDS = 60 * 60; // 1 refresh per trip per hour

type TripRow = {
  slug: string;
  label: string;
  outbound_dest_code: string;
  return_origin_code: string;
  outbound_date: string;
  return_date: string;
  origin_codes: string[];
  user_email: string | null;
  last_manual_refresh_at: string | null;
};

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const { data: trip, error: tripErr } = await db
    .from("multi_city_trips")
    .select("slug,label,outbound_dest_code,return_origin_code,outbound_date,return_date,origin_codes,user_email,last_manual_refresh_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<TripRow>();

  if (tripErr || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Permission: global trips refreshable by anyone signed in; user trips by owner only.
  if (trip.user_email && trip.user_email !== session.user.email) {
    return NextResponse.json({ error: "Cannot refresh trips you don't own" }, { status: 403 });
  }

  // Throttle
  if (trip.last_manual_refresh_at) {
    const lastMs = new Date(trip.last_manual_refresh_at).getTime();
    const ageSec = (Date.now() - lastMs) / 1000;
    if (ageSec < THROTTLE_SECONDS) {
      const waitMin = Math.ceil((THROTTLE_SECONDS - ageSec) / 60);
      return NextResponse.json(
        { error: `Already refreshed recently. Try again in ${waitMin} min.` },
        { status: 429 },
      );
    }
  }

  // Mark refresh start (so a parallel click doesn't dual-fire)
  await db
    .from("multi_city_trips")
    .update({ last_manual_refresh_at: new Date().toISOString() })
    .eq("slug", slug);

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const origin of trip.origin_codes) {
    try {
      const [outFare, retFare] = await Promise.all([
        fetchCheapestOneway({
          origin,
          destination: trip.outbound_dest_code,
          departureDate: trip.outbound_date,
        }),
        fetchCheapestOneway({
          origin: trip.return_origin_code,
          destination: origin,
          departureDate: trip.return_date,
        }),
      ]);

      if (!outFare || !retFare) {
        skipped += 1;
        continue;
      }

      const inserts = [
        {
          trip_slug: slug,
          origin_code: origin,
          leg: "outbound",
          leg_origin: origin,
          leg_destination: trip.outbound_dest_code,
          departure_date: trip.outbound_date,
          price_inr: outFare.priceInr,
          airline: outFare.airline,
          stops: outFare.stops,
          duration_minutes: outFare.durationMinutes,
          source: outFare.source,
        },
        {
          trip_slug: slug,
          origin_code: origin,
          leg: "return",
          leg_origin: trip.return_origin_code,
          leg_destination: origin,
          departure_date: trip.return_date,
          price_inr: retFare.priceInr,
          airline: retFare.airline,
          stops: retFare.stops,
          duration_minutes: retFare.durationMinutes,
          source: retFare.source,
        },
      ];
      const { error: insErr } = await db.from("multi_city_leg_history").insert(inserts);
      if (insErr) {
        errors.push(`${origin}: ${insErr.message}`);
      } else {
        updated += 1;
      }
    } catch (e) {
      errors.push(`${origin}: ${String(e)}`);
    }
  }

  return NextResponse.json({
    refreshed: updated,
    skipped,
    errors,
    nextRefreshAfterMin: THROTTLE_SECONDS / 60,
    note: "Snapshots stored. Deal detection + alerts run on the next scheduled crawler pass.",
    urls: {
      outbound: googleFlightsOneWayUrl(trip.origin_codes[0], trip.outbound_dest_code, trip.outbound_date),
      return: googleFlightsOneWayUrl(trip.return_origin_code, trip.origin_codes[0], trip.return_date),
    },
  });
}
