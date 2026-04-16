import { supabase } from "./client";

export interface Deal {
  id: string;
  origin_code: string;
  destination_code: string;
  travel_month: string;
  current_price_inr: number;
  baseline_price_inr: number;
  pct_off: number;
  airline: string | null;
  stops: number;
  cabin_class: string;
  duration_minutes: number | null;
  deal_type: "common" | "rare" | "unique";
  google_flights_url: string;
  is_active: boolean;
  detected_at: string;
}

/** Fetch active deals, newest first. */
export async function getActiveDeals(limit = 12): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch deals:", error.message);
    return [];
  }

  return (data as Deal[]) ?? [];
}

/** Fetch deals for a specific origin airport. */
export async function getDealsByOrigin(
  originCode: string,
  limit = 12
): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .eq("origin_code", originCode)
    .order("pct_off", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch deals:", error.message);
    return [];
  }

  return (data as Deal[]) ?? [];
}
