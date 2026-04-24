import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { ProfileClient } from "./profile-client";
import type { ProfileData } from "./profile-client";
import { routeInfoFor } from "@/config/multi-city";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  plan_tier: string;
  home_airport: string | null;
  created_at: string;
};

type PrefsRow = {
  email: string;
  deals_email: boolean;
  weekly_digest: boolean;
  push: boolean;
  updates: boolean;
  analytics: boolean;
};

type SavedDealRow = {
  id: string;
  user_email: string;
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
  user_email: string;
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

type MultiCityTripRow = {
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
  user_email: string | null;
};

type MultiCityDealRow = {
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
};

type TripAlertRow = {
  id: string;
  trip_slug: string;
  origin_code: string;
  max_total_inr: number | null;
  min_pct_off: number | null;
  is_active: boolean;
  last_notified_at: string | null;
};

type LegHistRow = {
  trip_slug: string;
  origin_code: string;
  leg: "outbound" | "return";
  price_inr: number;
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?next=/profile");

  const email = session.user.email;

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, prefsRes, savedRes, bookingsRes, dealsRes, tripsRes, mcDealsRes, alertsRes, legHistRes] =
    await Promise.all([
      db.from("user_profiles").select("*").eq("email", email).single(),
      db.from("notification_prefs").select("*").eq("email", email).single(),
      db.from("saved_deals").select("*, deals(*)").eq("user_email", email).order("saved_at", { ascending: false }),
      db.from("bookings").select("*").eq("user_email", email).order("booked_at", { ascending: false }),
      db.from("deals").select("*").order("detected_at", { ascending: false }).limit(10),
      db.from("multi_city_trips")
        .select("*")
        .eq("is_active", true)
        .or(`user_email.is.null,user_email.eq.${email}`)
        .order("created_at", { ascending: true }),
      db.from("multi_city_deals").select("*").eq("is_active", true).order("detected_at", { ascending: false }),
      db.from("trip_alerts").select("*").eq("user_email", email).eq("is_active", true),
      db.from("multi_city_leg_history")
        .select("trip_slug,origin_code,leg,price_inr")
        .gte("fetched_at", ninetyDaysAgo),
    ]);

  const profile = profileRes.data as ProfileRow | null;
  const prefs = prefsRes.data as PrefsRow | null;
  const savedDeals = (savedRes.data ?? []) as SavedDealRow[];
  const bookings = (bookingsRes.data ?? []) as BookingRow[];
  const recentDeals = (dealsRes.data ?? []) as DealRow[];
  const trips = (tripsRes.data ?? []) as MultiCityTripRow[];
  const mcDeals = (mcDealsRes.data ?? []) as MultiCityDealRow[];
  const alerts = (alertsRes.data ?? []) as TripAlertRow[];
  const legHist = (legHistRes.data ?? []) as LegHistRow[];

  const median = (xs: number[]): number | null => {
    if (xs.length === 0) return null;
    const s = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
  };

  const legSummary = (slug: string, origin: string, leg: "outbound" | "return") => {
    const xs = legHist
      .filter((r) => r.trip_slug === slug && r.origin_code === origin && r.leg === leg)
      .map((r) => Number(r.price_inr));
    return { medianInr: median(xs), samples: xs.length };
  };

  const totalSavings = bookings.reduce(
    (sum, b) => sum + (b.baseline_inr - b.price_paid_inr), 0
  );
  const bestSave = bookings.length > 0
    ? Math.max(...bookings.map((b) => b.baseline_inr - b.price_paid_inr))
    : 0;
  const avgDiscount = bookings.length > 0
    ? Math.round(
        bookings.reduce(
          (sum, b) => sum + ((b.baseline_inr - b.price_paid_inr) / b.baseline_inr) * 100, 0
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
    ? new Date(profile.created_at).toLocaleDateString("en", { month: "short", year: "numeric" })
    : "recently";

  const nowMs = new Date().getTime();
  const monthsDiff = profile?.created_at
    ? Math.max(1, Math.ceil((nowMs - new Date(profile.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000)))
    : 1;

  const data: ProfileData = {
    user: {
      email,
      displayName: profile?.display_name ?? session.user.name ?? "User",
      avatarUrl: profile?.avatar_url ?? session.user.image ?? null,
      memberSince,
      monthsInFlock: monthsDiff,
      planTier: (profile?.plan_tier as "free" | "pro") ?? "free",
      referralCode: profile?.referral_code ?? "",
      homeAirport: profile?.home_airport ?? "IDR",
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
      email,
      deals_email: true,
      weekly_digest: true,
      push: false,
      updates: true,
      analytics: true,
    },
    trips: trips.map((t) => ({
      slug: t.slug,
      label: t.label,
      outboundDestCode: t.outbound_dest_code,
      returnOriginCode: t.return_origin_code,
      outboundDate: t.outbound_date,
      returnDate: t.return_date,
      isOwn: t.user_email === email,
      legs: t.origin_codes.map((code) => {
        const d = mcDeals.find((x) => x.trip_slug === t.slug && x.origin_code === code);
        const a = alerts.find((x) => x.trip_slug === t.slug && x.origin_code === code);
        const outSummary = legSummary(t.slug, code, "outbound");
        const retSummary = legSummary(t.slug, code, "return");
        const outInfo = routeInfoFor(code, t.outbound_dest_code);
        const retInfo = routeInfoFor(t.return_origin_code, code);
        return {
          originCode: code,
          outboundPrice: d?.outbound_price_inr ?? null,
          returnPrice: d?.return_price_inr ?? null,
          totalPrice: d?.total_price_inr ?? null,
          baselineTotal: d?.baseline_total_inr ?? null,
          pctOff: d?.pct_off ?? null,
          outboundAirline: d?.outbound_airline ?? null,
          returnAirline: d?.return_airline ?? null,
          outboundStops: d?.outbound_stops ?? null,
          returnStops: d?.return_stops ?? null,
          outboundUrl: d?.outbound_url ?? null,
          returnUrl: d?.return_url ?? null,
          dealType: d?.deal_type ?? null,
          detectedAt: d?.detected_at ?? null,
          alert: a
            ? {
                maxTotalInr: a.max_total_inr,
                minPctOff: a.min_pct_off,
              }
            : null,
          typical: {
            outboundMedianInr: outSummary.medianInr,
            outboundSamples: outSummary.samples,
            returnMedianInr: retSummary.medianInr,
            returnSamples: retSummary.samples,
            outboundInfo: outInfo,
            returnInfo: retInfo,
          },
        };
      }),
    })),
  };

  return <ProfileClient data={data} />;
}
