import { supabase } from "./client";

export interface HotelDeal {
  id: string;
  city: string;
  hotel_name: string;
  checkin_date: string;
  nights: number;
  current_price_inr: number;
  baseline_price_inr: number;
  pct_off: number;
  star_rating: number | null;
  booking_url: string;
  deal_type: "common" | "rare" | "unique";
  is_active: boolean;
  detected_at: string;
}

export async function getActiveHotelDeals(limit = 12): Promise<HotelDeal[]> {
  const { data, error } = await supabase
    .from("hotel_deals")
    .select("*")
    .eq("is_active", true)
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch hotel deals:", error.message);
    return [];
  }

  return (data as HotelDeal[]) ?? [];
}
