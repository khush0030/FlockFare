import { supabaseAdmin } from "./server";

export interface TripOriginQuote {
  trip_slug: string;
  trip_label: string;
  origin_code: string;
  outbound_price_inr: number;
  return_price_inr: number;
  total_price_inr: number;
  outbound_airline: string | null;
  return_airline: string | null;
  outbound_stops: number | null;
  return_stops: number | null;
  outbound_date: string;
  return_date: string;
  outbound_dest_code: string;
  return_origin_code: string;
  last_updated: string;
}

export interface TripCard {
  trip_slug: string;
  trip_label: string;
  outbound_dest_code: string;
  return_origin_code: string;
  outbound_date: string;
  return_date: string;
  quotes: TripOriginQuote[];
  cheapest?: TripOriginQuote;
}

type LegRow = {
  trip_slug: string;
  origin_code: string;
  leg: "outbound" | "return";
  price_inr: number;
  airline: string | null;
  stops: number | null;
  fetched_at: string;
};

type TripRow = {
  slug: string;
  label: string;
  outbound_dest_code: string;
  return_origin_code: string;
  outbound_date: string;
  return_date: string;
  origin_codes: string[];
  is_active: boolean;
};

export async function getTripFeed(): Promise<TripCard[]> {
  const { data: trips, error: tErr } = await supabaseAdmin
    .from("multi_city_trips")
    .select(
      "slug,label,outbound_dest_code,return_origin_code,outbound_date,return_date,origin_codes,is_active"
    )
    .eq("is_active", true);

  if (tErr || !trips?.length) {
    if (tErr) console.error("Failed to fetch trips:", tErr.message);
    return [];
  }

  const slugs = (trips as TripRow[]).map((t) => t.slug);
  const { data: legs, error: lErr } = await supabaseAdmin
    .from("multi_city_leg_history")
    .select("trip_slug,origin_code,leg,price_inr,airline,stops,fetched_at")
    .in("trip_slug", slugs)
    .order("fetched_at", { ascending: false })
    .limit(2000);

  if (lErr) {
    console.error("Failed to fetch leg history:", lErr.message);
    return [];
  }

  const byTripOriginLeg = new Map<string, LegRow>();
  for (const row of (legs as LegRow[] | null) ?? []) {
    const key = `${row.trip_slug}|${row.origin_code}|${row.leg}`;
    const prev = byTripOriginLeg.get(key);
    if (!prev || row.price_inr < prev.price_inr) {
      byTripOriginLeg.set(key, row);
    }
  }

  return (trips as TripRow[]).map((t) => {
    const quotes: TripOriginQuote[] = [];
    for (const origin of t.origin_codes ?? []) {
      const out = byTripOriginLeg.get(`${t.slug}|${origin}|outbound`);
      const ret = byTripOriginLeg.get(`${t.slug}|${origin}|return`);
      if (!out || !ret) continue;
      quotes.push({
        trip_slug: t.slug,
        trip_label: t.label,
        origin_code: origin,
        outbound_price_inr: out.price_inr,
        return_price_inr: ret.price_inr,
        total_price_inr: out.price_inr + ret.price_inr,
        outbound_airline: out.airline,
        return_airline: ret.airline,
        outbound_stops: out.stops,
        return_stops: ret.stops,
        outbound_date: t.outbound_date,
        return_date: t.return_date,
        outbound_dest_code: t.outbound_dest_code,
        return_origin_code: t.return_origin_code,
        last_updated:
          out.fetched_at > ret.fetched_at ? out.fetched_at : ret.fetched_at,
      });
    }
    quotes.sort((a, b) => a.total_price_inr - b.total_price_inr);
    return {
      trip_slug: t.slug,
      trip_label: t.label,
      outbound_dest_code: t.outbound_dest_code,
      return_origin_code: t.return_origin_code,
      outbound_date: t.outbound_date,
      return_date: t.return_date,
      quotes,
      cheapest: quotes[0],
    };
  });
}
