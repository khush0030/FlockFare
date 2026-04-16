import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PricePoint {
  date: string;
  price: number;
}

/** Fetch price history for a route/month, last 90 days. */
export async function getPriceHistory(
  originCode: string,
  destinationCode: string,
  travelMonth?: string,
  days = 90
): Promise<PricePoint[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  let query = supabase
    .from("price_history")
    .select("price_inr, fetched_at")
    .eq("origin_code", originCode)
    .eq("destination_code", destinationCode)
    .gte("fetched_at", cutoff.toISOString())
    .order("fetched_at", { ascending: true });

  if (travelMonth) {
    query = query.eq("travel_month", travelMonth);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch price history:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    date: new Date(row.fetched_at).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    price: Number(row.price_inr),
  }));
}

/** Get all unique routes that have price data. */
export async function getTrackedRoutes(): Promise<
  { origin_code: string; destination_code: string }[]
> {
  const { data, error } = await supabase
    .from("price_history")
    .select("origin_code, destination_code")
    .limit(1000);

  if (error) return [];

  // Deduplicate
  const seen = new Set<string>();
  return (data ?? []).filter((row) => {
    const key = `${row.origin_code}-${row.destination_code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
