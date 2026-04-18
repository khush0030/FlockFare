export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      origins: {
        Row: {
          id: string;
          code: string;
          city: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          city: string;
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          city?: string;
          country?: string;
          created_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          code: string;
          city: string;
          country: string;
          region: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          city: string;
          country: string;
          region: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          city?: string;
          country?: string;
          region?: string;
          created_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          origin_code: string;
          destination_code: string;
          travel_month: string;
          price_inr: number;
          airline: string | null;
          stops: number;
          cabin_class: string;
          duration_minutes: number | null;
          source: string;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          origin_code: string;
          destination_code: string;
          travel_month: string;
          price_inr: number;
          airline?: string | null;
          stops?: number;
          cabin_class?: string;
          duration_minutes?: number | null;
          source?: string;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          origin_code?: string;
          destination_code?: string;
          travel_month?: string;
          price_inr?: number;
          airline?: string | null;
          stops?: number;
          cabin_class?: string;
          duration_minutes?: number | null;
          source?: string;
          fetched_at?: string;
        };
      };
      deals: {
        Row: {
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
          bags_included: boolean;
          deal_type: "common" | "rare" | "unique";
          google_flights_url: string;
          is_active: boolean;
          detected_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          origin_code: string;
          destination_code: string;
          travel_month: string;
          current_price_inr: number;
          baseline_price_inr: number;
          pct_off: number;
          airline?: string | null;
          stops?: number;
          cabin_class?: string;
          duration_minutes?: number | null;
          bags_included?: boolean;
          deal_type?: "common" | "rare" | "unique";
          google_flights_url: string;
          is_active?: boolean;
          detected_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          origin_code?: string;
          destination_code?: string;
          travel_month?: string;
          current_price_inr?: number;
          baseline_price_inr?: number;
          pct_off?: number;
          airline?: string | null;
          stops?: number;
          cabin_class?: string;
          duration_minutes?: number | null;
          bags_included?: boolean;
          deal_type?: "common" | "rare" | "unique";
          google_flights_url?: string;
          is_active?: boolean;
          detected_at?: string;
          expires_at?: string | null;
        };
      };
      subscribers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          telegram_chat_id: string | null;
          home_airport: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          telegram_chat_id?: string | null;
          home_airport?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          telegram_chat_id?: string | null;
          home_airport?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      allowed_emails: {
        Row: {
          email: string;
          invited_by: string | null;
          created_at: string;
          used_at: string | null;
        };
        Insert: {
          email: string;
          invited_by?: string | null;
          created_at?: string;
          used_at?: string | null;
        };
        Update: {
          email?: string;
          invited_by?: string | null;
          created_at?: string;
          used_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          referral_code: string | null;
          referred_by: string | null;
          plan_tier: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          plan_tier?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          plan_tier?: string;
          created_at?: string;
        };
      };
      saved_deals: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string;
          status: "active" | "booked" | "expired";
          saved_at: string;
          booked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id: string;
          status?: "active" | "booked" | "expired";
          saved_at?: string;
          booked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          deal_id?: string;
          status?: "active" | "booked" | "expired";
          saved_at?: string;
          booked_at?: string | null;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string | null;
          route: string;
          airline: string | null;
          cabin: string | null;
          travel_month: string | null;
          price_paid_inr: number;
          baseline_inr: number;
          booked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id?: string | null;
          route: string;
          airline?: string | null;
          cabin?: string | null;
          travel_month?: string | null;
          price_paid_inr: number;
          baseline_inr: number;
          booked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deal_id?: string | null;
          route?: string;
          airline?: string | null;
          cabin?: string | null;
          travel_month?: string | null;
          price_paid_inr?: number;
          baseline_inr?: number;
          booked_at?: string;
        };
      };
      notification_prefs: {
        Row: {
          user_id: string;
          deals_email: boolean;
          weekly_digest: boolean;
          push: boolean;
          updates: boolean;
          analytics: boolean;
        };
        Insert: {
          user_id: string;
          deals_email?: boolean;
          weekly_digest?: boolean;
          push?: boolean;
          updates?: boolean;
          analytics?: boolean;
        };
        Update: {
          user_id?: string;
          deals_email?: boolean;
          weekly_digest?: boolean;
          push?: boolean;
          updates?: boolean;
          analytics?: boolean;
        };
      };
      multi_city_trips: {
        Row: {
          id: string;
          slug: string;
          label: string;
          outbound_dest_code: string;
          return_origin_code: string;
          outbound_date: string;
          return_date: string;
          origin_codes: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          outbound_dest_code: string;
          return_origin_code: string;
          outbound_date: string;
          return_date: string;
          origin_codes: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          label?: string;
          outbound_dest_code?: string;
          return_origin_code?: string;
          outbound_date?: string;
          return_date?: string;
          origin_codes?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      multi_city_deals: {
        Row: {
          id: string;
          trip_slug: string;
          origin_code: string;
          outbound_price_inr: number;
          return_price_inr: number;
          total_price_inr: number;
          baseline_total_inr: number;
          pct_off: number;
          outbound_airline: string | null;
          return_airline: string | null;
          outbound_stops: number;
          return_stops: number;
          outbound_url: string;
          return_url: string;
          deal_type: "common" | "rare" | "unique";
          is_active: boolean;
          detected_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          trip_slug: string;
          origin_code: string;
          outbound_price_inr: number;
          return_price_inr: number;
          total_price_inr: number;
          baseline_total_inr: number;
          pct_off: number;
          outbound_airline?: string | null;
          return_airline?: string | null;
          outbound_stops?: number;
          return_stops?: number;
          outbound_url: string;
          return_url: string;
          deal_type?: "common" | "rare" | "unique";
          is_active?: boolean;
          detected_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          trip_slug?: string;
          origin_code?: string;
          outbound_price_inr?: number;
          return_price_inr?: number;
          total_price_inr?: number;
          baseline_total_inr?: number;
          pct_off?: number;
          outbound_airline?: string | null;
          return_airline?: string | null;
          outbound_stops?: number;
          return_stops?: number;
          outbound_url?: string;
          return_url?: string;
          deal_type?: "common" | "rare" | "unique";
          is_active?: boolean;
          detected_at?: string;
          expires_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      deal_type: "common" | "rare" | "unique";
      cabin_class: "economy" | "premium_economy" | "business" | "first";
      saved_deal_status: "active" | "booked" | "expired";
    };
  };
}
