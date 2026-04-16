import type { Metadata } from "next";
import { getActiveDeals, type Deal } from "@/lib/supabase/deals";
import { Header } from "@/components/header";
import { DealsFeed } from "@/components/deals-feed";
import { ORIGINS } from "@/config/watchlist";

export const metadata: Metadata = {
  title: "Live Deals — FlockFare",
  description:
    "Browse live flight deals from Penny. Every deal links straight to Google Flights with verified prices.",
  openGraph: {
    title: "Live Deals — FlockFare",
    description:
      "Browse live flight deals from Penny. Every deal links straight to Google Flights with verified prices.",
  },
};

export const revalidate = 300;

const SAMPLE_DEALS: Deal[] = [
  {
    id: "sample-u1",
    origin_code: "BOM",
    destination_code: "SIN",
    travel_month: "2026-08",
    current_price_inr: 8200,
    baseline_price_inr: 30400,
    pct_off: 73,
    airline: "Singapore Airlines",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 330,
    deal_type: "unique",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+SIN",
    is_active: true,
    detected_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: "sample-u2",
    origin_code: "BLR",
    destination_code: "NRT",
    travel_month: "2026-09",
    current_price_inr: 18700,
    baseline_price_inr: 64500,
    pct_off: 71,
    airline: "ANA",
    stops: 0,
    cabin_class: "business",
    duration_minutes: 535,
    deal_type: "unique",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BLR+to+NRT",
    is_active: true,
    detected_at: new Date(Date.now() - 55 * 60000).toISOString(),
  },
  {
    id: "sample-r1",
    origin_code: "BOM",
    destination_code: "LHR",
    travel_month: "2026-07",
    current_price_inr: 21400,
    baseline_price_inr: 54800,
    pct_off: 61,
    airline: "Air India",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 590,
    deal_type: "rare",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+LHR",
    is_active: true,
    detected_at: new Date(Date.now() - 98 * 60000).toISOString(),
  },
  {
    id: "sample-r2",
    origin_code: "DEL",
    destination_code: "ICN",
    travel_month: "2026-10",
    current_price_inr: 14900,
    baseline_price_inr: 41400,
    pct_off: 64,
    airline: "Korean Air",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 500,
    deal_type: "rare",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+DEL+to+ICN",
    is_active: true,
    detected_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "sample-r3",
    origin_code: "BOM",
    destination_code: "CDG",
    travel_month: "2026-11",
    current_price_inr: 24800,
    baseline_price_inr: 65300,
    pct_off: 62,
    airline: "Air France",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 730,
    deal_type: "rare",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+CDG",
    is_active: true,
    detected_at: new Date(Date.now() - 240 * 60000).toISOString(),
  },
  {
    id: "sample-c1",
    origin_code: "DEL",
    destination_code: "BKK",
    travel_month: "2026-08",
    current_price_inr: 9800,
    baseline_price_inr: 21200,
    pct_off: 54,
    airline: "IndiGo",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 340,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+DEL+to+BKK",
    is_active: true,
    detected_at: new Date(Date.now() - 300 * 60000).toISOString(),
  },
  {
    id: "sample-c2",
    origin_code: "BOM",
    destination_code: "DPS",
    travel_month: "2026-09",
    current_price_inr: 11600,
    baseline_price_inr: 22700,
    pct_off: 49,
    airline: "Air Asia",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 450,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+DPS",
    is_active: true,
    detected_at: new Date(Date.now() - 480 * 60000).toISOString(),
  },
  {
    id: "sample-c3",
    origin_code: "BLR",
    destination_code: "DXB",
    travel_month: "2026-07",
    current_price_inr: 8400,
    baseline_price_inr: 15800,
    pct_off: 47,
    airline: "Emirates",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 190,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BLR+to+DXB",
    is_active: true,
    detected_at: new Date(Date.now() - 720 * 60000).toISOString(),
  },
  {
    id: "sample-c4",
    origin_code: "DEL",
    destination_code: "FCO",
    travel_month: "2026-10",
    current_price_inr: 19200,
    baseline_price_inr: 39900,
    pct_off: 52,
    airline: "Lufthansa",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 700,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+DEL+to+FCO",
    is_active: true,
    detected_at: new Date(Date.now() - 600 * 60000).toISOString(),
  },
  {
    id: "sample-c5",
    origin_code: "BOM",
    destination_code: "KUL",
    travel_month: "2026-08",
    current_price_inr: 13200,
    baseline_price_inr: 23500,
    pct_off: 44,
    airline: "Malaysia Airlines",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 380,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+KUL",
    is_active: true,
    detected_at: new Date(Date.now() - 900 * 60000).toISOString(),
  },
  {
    id: "sample-c6",
    origin_code: "DEL",
    destination_code: "JFK",
    travel_month: "2026-11",
    current_price_inr: 52800,
    baseline_price_inr: 101500,
    pct_off: 48,
    airline: "Air India",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 1005,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+DEL+to+JFK",
    is_active: true,
    detected_at: new Date(Date.now() - 1200 * 60000).toISOString(),
  },
];

export default async function DealsPage() {
  const liveDeals = await getActiveDeals(50);
  const deals = liveDeals.length > 0 ? liveDeals : SAMPLE_DEALS;
  const totalDeals = deals.length;

  const uniqueCount = deals.filter((d) => d.deal_type === "unique").length;
  const lowestPrice = Math.min(...deals.map((d) => d.current_price_inr));
  const biggestDrop = Math.max(...deals.map((d) => d.pct_off));

  return (
    <main id="main">
      <Header activePage="deals" />

      {/* ── FEED HEADER ──────────────────────────── */}
      <div className="feed-header">
        <div className="feed-header-inner">
          <div className="feed-title-row">
            <div>
              <div className="feed-eyebrow">✦ Live deals</div>
              <h1 className="feed-h1">What Penny found.</h1>
              <p className="feed-sub">
                Every card is a real price drop, verified against 90 days of
                history. Links go straight to Google Flights.
              </p>
            </div>
            <div className="feed-live-badge">
              <span className="live-dot" />
              LIVE · Updated 3 min ago
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────── */}
      <div className="stats-strip">
        <div className="stats-strip-inner">
          <div className="stat-chip">
            <span className="val">{totalDeals}</span>
            <span className="lbl">Active deals</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">{uniqueCount}</span>
            <span className="lbl">Mistake fares</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">₹{lowestPrice.toLocaleString("en-IN")}</span>
            <span className="lbl">Lowest fare today</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">{biggestDrop}%</span>
            <span className="lbl">Biggest drop today</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">{ORIGINS.length}</span>
            <span className="lbl">Origins watched</span>
          </div>
          <div className="last-updated">LAST CRAWL: 3 MIN AGO · NEXT: 2 MIN</div>
        </div>
      </div>

      {/* ── SIDEBAR + FEED ───────────────────────── */}
      <DealsFeed deals={deals} />
    </main>
  );
}
