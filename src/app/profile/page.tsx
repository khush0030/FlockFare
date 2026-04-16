import { redirect } from "next/navigation";
import { createAuthClient, getUser } from "@/lib/supabase/server-auth";
import { ProfileClient } from "./profile-client";
import type { ProfileData } from "./profile-client";

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  plan_tier: string;
  created_at: string;
};

type PrefsRow = {
  user_id: string;
  deals_email: boolean;
  weekly_digest: boolean;
  push: boolean;
  updates: boolean;
  analytics: boolean;
};

type SavedDealRow = {
  id: string;
  user_id: string;
  deal_id: string;
  status: "active" | "booked" | "expired";
  saved_at: string;
  booked_at: string | null;
  deals: {
    origin_code: string;
    destination_code: string;
    airline: string | null;
    cabin_class: string;
    travel_month: string;
    current_price_inr: number;
    baseline_price_inr: number;
    pct_off: number;
    deal_type: string;
    stops: number;
    is_active: boolean;
    expires_at: string | null;
  } | null;
};

type BookingRow = {
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

type DealRow = {
  id: string;
  origin_code: string;
  destination_code: string;
  pct_off: number;
  current_price_inr: number;
  airline: string | null;
  deal_type: "common" | "rare" | "unique";
  detected_at: string;
  is_active: boolean;
  expires_at: string | null;
};

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/profile");

  const supabase = await createAuthClient();

  const [profileRes, prefsRes, savedRes, bookingsRes, dealsRes] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
      supabase
        .from("notification_prefs")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("saved_deals")
        .select("*, deals(*)")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booked_at", { ascending: false }),
      supabase
        .from("deals")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(10),
    ]);

  const profile = profileRes.data as ProfileRow | null;
  const prefs = prefsRes.data as PrefsRow | null;
  const savedDeals = (savedRes.data ?? []) as SavedDealRow[];
  const bookings = (bookingsRes.data ?? []) as BookingRow[];
  const recentDeals = (dealsRes.data ?? []) as DealRow[];

  const totalSavings = bookings.reduce(
    (sum, b) => sum + (b.baseline_inr - b.price_paid_inr),
    0
  );
  const bestSave =
    bookings.length > 0
      ? Math.max(...bookings.map((b) => b.baseline_inr - b.price_paid_inr))
      : 0;
  const avgDiscount =
    bookings.length > 0
      ? Math.round(
          bookings.reduce(
            (sum, b) =>
              sum +
              ((b.baseline_inr - b.price_paid_inr) / b.baseline_inr) * 100,
            0
          ) / bookings.length
        )
      : 0;

  const now = new Date();
  const monthBars = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en", { month: "short" });
    const savings = bookings
      .filter((b) => b.booked_at?.startsWith(key))
      .reduce((s, b) => s + (b.baseline_inr - b.price_paid_inr), 0);
    return { m: label, s: savings, on: savings > 0 };
  });

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en", {
        month: "short",
        year: "numeric",
      })
    : "recently";

  const monthsDiff = profile?.created_at
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(profile.created_at).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      )
    : 1;

  const data: ProfileData = {
    user: {
      email: user.email ?? "",
      displayName:
        profile?.display_name ?? user.user_metadata?.name ?? "User",
      avatarUrl:
        profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      memberSince,
      monthsInFlock: monthsDiff,
      planTier: (profile?.plan_tier as "free" | "pro") ?? "free",
      referralCode: profile?.referral_code ?? "",
    },
    stats: {
      totalSavings,
      tripsBooked: bookings.length,
      bestSave,
      avgDiscount,
      alertsReceived: recentDeals.length,
      monthBars,
    },
    savedDeals: savedDeals.map((sd) => {
      const deal = sd.deals;
      return {
        id: sd.id,
        dealId: sd.deal_id,
        status: sd.status,
        savedAt: sd.saved_at,
        bookedAt: sd.booked_at,
        originCode: deal?.origin_code ?? "",
        destCode: deal?.destination_code ?? "",
        airline: deal?.airline ?? "",
        cabin: deal?.cabin_class ?? "economy",
        travelMonth: deal?.travel_month ?? "",
        currentPrice: deal?.current_price_inr ?? 0,
        baselinePrice: deal?.baseline_price_inr ?? 0,
        pctOff: deal?.pct_off ?? 0,
        dealType: deal?.deal_type ?? "common",
        stops: deal?.stops ?? 0,
        isActive: deal?.is_active ?? false,
        expiresAt: deal?.expires_at ?? null,
      };
    }),
    bookings: bookings.map((b) => ({
      id: b.id,
      route: b.route,
      airline: b.airline ?? "",
      cabin: b.cabin ?? "economy",
      travelMonth: b.travel_month ?? "",
      pricePaid: b.price_paid_inr,
      baseline: b.baseline_inr,
      bookedAt: b.booked_at,
    })),
    recentDeals: recentDeals.map((d) => ({
      id: d.id,
      originCode: d.origin_code,
      destCode: d.destination_code,
      pctOff: d.pct_off,
      currentPrice: d.current_price_inr,
      airline: d.airline ?? "",
      dealType: d.deal_type,
      detectedAt: d.detected_at,
      isActive: d.is_active,
      expiresAt: d.expires_at,
    })),
    notifPrefs: prefs ?? {
      user_id: user.id,
      deals_email: true,
      weekly_digest: true,
      push: false,
      updates: true,
      analytics: true,
    },
  };

  return <ProfileClient data={data} />;
}
