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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      deal_type: "common" | "rare" | "unique";
      cabin_class: "economy" | "premium_economy" | "business" | "first";
    };
  };
}
