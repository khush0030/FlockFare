import type { Metadata } from "next";
import { getActiveDeals } from "@/lib/supabase/deals";
import { getTripFeed } from "@/lib/supabase/trip-feed";
import { Header } from "@/components/header";
import { DealsFeed } from "@/components/deals-feed";
import { TripFeed } from "@/components/trip-feed";
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

export const revalidate = 60;

function timeAgo(iso: string): string {
  const mins = Math.max(1, Math.floor((new Date().getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function DealsPage() {
  const [deals, trips] = await Promise.all([getActiveDeals(50), getTripFeed()]);
  const totalDeals = deals.length;
  const hasTrips = trips.some((t) => t.quotes.length > 0);

  const uniqueCount = deals.filter((d) => d.deal_type === "unique").length;
  const lowestPrice = deals.length > 0 ? Math.min(...deals.map((d) => d.current_price_inr)) : 0;
  const biggestDrop = deals.length > 0 ? Math.max(...deals.map((d) => d.pct_off)) : 0;
  const lastCrawl = deals.length > 0
    ? timeAgo(deals.map((d) => d.detected_at).sort().slice(-1)[0])
    : "—";

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
              {totalDeals > 0 ? `LIVE · Updated ${lastCrawl}` : "AWAITING FIRST CRAWL"}
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
            <span className="val">{lowestPrice > 0 ? `₹${lowestPrice.toLocaleString("en-IN")}` : "—"}</span>
            <span className="lbl">Lowest fare today</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">{biggestDrop > 0 ? `${biggestDrop}%` : "—"}</span>
            <span className="lbl">Biggest drop today</span>
          </div>
          <div className="stat-sep" />
          <div className="stat-chip">
            <span className="val">{ORIGINS.length}</span>
            <span className="lbl">Origins watched</span>
          </div>
          <div className="last-updated">LAST CRAWL: {lastCrawl.toUpperCase()}</div>
        </div>
      </div>

      {/* ── FEED or TRIP FEED or EMPTY STATE ─────── */}
      {totalDeals > 0 && <DealsFeed deals={deals} />}
      {hasTrips && <TripFeed trips={trips} />}
      {totalDeals === 0 && !hasTrips && (
        <div style={{ maxWidth: 720, margin: "60px auto", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐦</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
            Penny&apos;s still hunting.
          </h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "rgba(11,11,15,.6)", lineHeight: 1.7 }}>
            No active deals right now. The crawler runs on a schedule — once it finds a fare that&apos;s 40%+ below the 90-day median, it&apos;ll land here.
          </p>
        </div>
      )}
    </main>
  );
}
