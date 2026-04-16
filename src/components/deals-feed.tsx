"use client";

import { useState } from "react";
import { ORIGINS } from "@/config/watchlist";
import type { Deal } from "@/lib/supabase/deals";

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

const REGIONS = [
  { key: "all", label: "All destinations" },
  { key: "Southeast Asia", label: "Southeast Asia" },
  { key: "Europe", label: "Europe" },
  { key: "East Asia", label: "East Asia" },
  { key: "North America", label: "North America" },
  { key: "Middle East", label: "Middle East" },
  { key: "Oceania", label: "Oceania" },
];

const DEST_REGIONS: Record<string, string> = {
  BKK: "Southeast Asia",
  SIN: "Southeast Asia",
  DPS: "Southeast Asia",
  KUL: "Southeast Asia",
  LHR: "Europe",
  CDG: "Europe",
  FCO: "Europe",
  AMS: "Europe",
  NRT: "East Asia",
  ICN: "East Asia",
  HKG: "East Asia",
  JFK: "North America",
  SFO: "North America",
  LAX: "North America",
  DXB: "Middle East",
  DOH: "Middle East",
  SYD: "Oceania",
  DEL: "Domestic",
  BOM: "Domestic",
  BLR: "Domestic",
  GOI: "Domestic",
  MAA: "Domestic",
  HYD: "Domestic",
};

function getRegion(code: string): string {
  return DEST_REGIONS[code] ?? "Other";
}

function getBannerClass(deal: Deal): string {
  if (deal.deal_type === "unique") return "b-ink";
  if (deal.pct_off >= 60) return "b-lime";
  const cycle = ["b-lime", "b-coral", "b-sun", "b-violet"];
  return cycle[deal.origin_code.charCodeAt(0) % cycle.length];
}

function getBadgePctClass(deal: Deal): string {
  if (deal.pct_off >= 70) return "badge-pct-lime";
  if (deal.pct_off >= 60) return "badge-pct-coral";
  return "badge-pct-violet";
}

function getBadgeTypeClass(deal: Deal): string {
  if (deal.deal_type === "unique") return "badge-unique";
  if (deal.deal_type === "rare") return "badge-rare";
  return "badge-common";
}

function getBadgeTypeLabel(deal: Deal): string {
  if (deal.deal_type === "unique") return "MISTAKE";
  if (deal.deal_type === "rare") return "RARE";
  return "COMMON";
}

function getTimerText(deal: Deal): { text: string; slow: boolean } {
  const detected = new Date(deal.detected_at).getTime();
  const age = (Date.now() - detected) / 60000;
  if (age < 60) return { text: `Expires in ${Math.max(10, Math.round(90 - age))}m — book now`, slow: false };
  if (age < 180) return { text: `Expires in ${Math.round((300 - age) / 60)}h ${String(Math.round((300 - age) % 60)).padStart(2, "0")}m`, slow: false };
  return { text: `Expires in ${Math.round((720 - age) / 60)}h 00m`, slow: true };
}

export function DealsFeed({ deals }: { deals: Deal[] }) {
  const originCodes = ORIGINS.map((o) => o.code);
  const [activeOrigins, setActiveOrigins] = useState<Set<string>>(new Set(originCodes));
  const [activeRegion, setActiveRegion] = useState("all");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(["unique", "rare", "common"]));
  const [minPct, setMinPct] = useState(40);
  const [sortBy, setSortBy] = useState<"discount" | "price" | "expiry">("discount");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function toggleOrigin(code: string) {
    setActiveOrigins((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size === 1) return prev;
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  function toggleType(type: string) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function resetFilters() {
    setActiveOrigins(new Set(originCodes));
    setActiveRegion("all");
    setActiveTypes(new Set(["unique", "rare", "common"]));
    setMinPct(40);
  }

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Filter
  const filtered = deals.filter((d) => {
    if (!activeOrigins.has(d.origin_code)) return false;
    if (activeRegion !== "all" && getRegion(d.destination_code) !== activeRegion) return false;
    if (!activeTypes.has(d.deal_type)) return false;
    if (d.pct_off < minPct) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "discount") return b.pct_off - a.pct_off;
    if (sortBy === "price") return a.current_price_inr - b.current_price_inr;
    return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
  });

  // Group by type
  const unique = sorted.filter((d) => d.deal_type === "unique");
  const rare = sorted.filter((d) => d.deal_type === "rare");
  const common = sorted.filter((d) => d.deal_type === "common");

  // Region counts
  const regionCounts: Record<string, number> = { all: deals.length };
  for (const d of deals) {
    const r = getRegion(d.destination_code);
    regionCounts[r] = (regionCounts[r] ?? 0) + 1;
  }

  return (
    <div className="page-body">
      {/* ── SIDEBAR ──────────────────────────────── */}
      <aside className="sidebar">
        <div className="filter-panel">
          <div className="filter-panel-head">
            <h3>Filters</h3>
            <button className="filter-reset" onClick={resetFilters}>
              Reset all
            </button>
          </div>

          {/* Origin */}
          <div className="filter-section">
            <div className="filter-section-label">Your home airport</div>
            <div className="chip-grid">
              {originCodes.map((code) => (
                <button
                  key={code}
                  className={`chip ${activeOrigins.has(code) ? "active" : ""}`}
                  onClick={() => toggleOrigin(code)}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="filter-section">
            <div className="filter-section-label">Destination region</div>
            <div className="region-list">
              {REGIONS.map((r) => (
                <button
                  key={r.key}
                  className={`region-btn ${activeRegion === r.key ? "active" : ""}`}
                  onClick={() => setActiveRegion(r.key)}
                >
                  <span>{r.label}</span>
                  <span className="region-count">{regionCounts[r.key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Deal Type */}
          <div className="filter-section">
            <div className="filter-section-label">Deal type</div>
            <div className="type-grid">
              <button
                className={`type-toggle ${activeTypes.has("unique") ? "active-unique" : ""}`}
                onClick={() => toggleType("unique")}
              >
                <span className="type-dot unique" />
                <div>
                  <div className="type-label">Unique</div>
                  <div className="type-sublabel">70%+ off · Mistake fares</div>
                </div>
              </button>
              <button
                className={`type-toggle ${activeTypes.has("rare") ? "active-rare" : ""}`}
                onClick={() => toggleType("rare")}
              >
                <span className="type-dot rare" />
                <div>
                  <div className="type-label">Rare</div>
                  <div className="type-sublabel">60–69% off</div>
                </div>
              </button>
              <button
                className={`type-toggle ${activeTypes.has("common") ? "active-common" : ""}`}
                onClick={() => toggleType("common")}
              >
                <span className="type-dot common" />
                <div>
                  <div className="type-label">Common</div>
                  <div className="type-sublabel">40–59% off</div>
                </div>
              </button>
            </div>
          </div>

          {/* Min % off */}
          <div className="filter-section">
            <div className="filter-section-label">Minimum discount</div>
            <div style={{ padding: "4px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-ffgray-500)",
                  marginBottom: 8,
                }}
              >
                <span>40%</span>
                <span style={{ fontWeight: 700, color: "var(--color-ink)" }}>
                  {minPct}%+ off
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={70}
                step={5}
                value={minPct}
                onChange={(e) => setMinPct(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--color-violet)" }}
              />
            </div>
          </div>
        </div>

        {/* Pro upsell */}
        <div className="promo-panel">
          <h3>🔐 6 deals are locked</h3>
          <p>
            Unique mistake fares and business-class drops are Pro-only. Instant
            alerts before the flock.
          </p>
          <button className="promo-btn">Unlock with Pro →</button>
        </div>
      </aside>

      {/* ── FEED ─────────────────────────────────── */}
      <div>
        {/* Controls */}
        <div className="feed-controls">
          <div className="feed-count">
            <strong>{sorted.length} deals</strong> found · {unique.length + rare.length} expiring soon
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
            <div className="sort-row">
              <span className="sort-label">Sort:</span>
              {(["discount", "price", "expiry"] as const).map((s) => (
                <button
                  key={s}
                  className={`sort-btn ${sortBy === s ? "active" : ""}`}
                  onClick={() => setSortBy(s)}
                >
                  {s === "discount" ? "Biggest drop" : s === "price" ? "Lowest price" : "Expiring soon"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Unique section */}
        {unique.length > 0 && (
          <>
            <div className="section-divider">
              <div className="sdl">⚡ Unique · Mistake fares</div>
              <div className="sdline" />
              <div className="sdcount">{unique.length} deals · act fast</div>
            </div>
            <div className="deals-grid">
              {unique.map((deal) => (
                <FeedDealCard
                  key={deal.id}
                  deal={deal}
                  saved={saved.has(deal.id)}
                  onToggleSave={() => toggleSave(deal.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Rare section */}
        {rare.length > 0 && (
          <>
            <div className="section-divider" style={{ marginTop: unique.length > 0 ? 8 : 0 }}>
              <div className="sdl">🔥 Rare · 60–69% off</div>
              <div className="sdline" />
              <div className="sdcount">{rare.length} deals</div>
            </div>
            <div className="deals-grid">
              {rare.map((deal) => (
                <FeedDealCard
                  key={deal.id}
                  deal={deal}
                  saved={saved.has(deal.id)}
                  onToggleSave={() => toggleSave(deal.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Common section */}
        {common.length > 0 && (
          <>
            <div className="section-divider" style={{ marginTop: (unique.length > 0 || rare.length > 0) ? 8 : 0 }}>
              <div className="sdl">✓ Common · 40–59% off</div>
              <div className="sdline" />
              <div className="sdcount">{common.length} deals</div>
            </div>
            <div className="deals-grid">
              {common.map((deal) => (
                <FeedDealCard
                  key={deal.id}
                  deal={deal}
                  saved={saved.has(deal.id)}
                  onToggleSave={() => toggleSave(deal.id)}
                />
              ))}
            </div>
          </>
        )}

        {sorted.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🐧</div>
            <div className="empty-title">No deals match your filters</div>
            <div className="empty-sub">Try adjusting your filters or check back later.</div>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn" disabled>
            ← Prev
          </button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ffgray-400)" }}>
            …
          </span>
          <button className="page-btn">6</button>
          <button className="page-btn">Next →</button>
        </div>
      </div>
    </div>
  );
}

function FeedDealCard({
  deal,
  saved,
  onToggleSave,
}: {
  deal: Deal;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const stopsLabel = deal.stops === 0 ? "Direct" : `${deal.stops} stop`;
  const isNonstop = deal.stops === 0;
  const isMistake = deal.deal_type === "unique";
  const isBusiness = deal.cabin_class === "business";
  const timer = getTimerText(deal);
  const cityName = deal.destination_code; // airport code as fallback

  return (
    <div className="deal-card">
      <div className={`deal-banner ${getBannerClass(deal)}`}>
        <div>
          <div className="deal-route">
            {deal.origin_code} <span className="arr">→</span> {deal.destination_code}
          </div>
          <div className="deal-city">
            {deal.origin_code} → {cityName}
          </div>
        </div>
        <div className="badge-wrap">
          <span className={`badge ${getBadgePctClass(deal)}`}>-{deal.pct_off}%</span>
          <span className={`badge badge-type ${getBadgeTypeClass(deal)}`}>
            {getBadgeTypeLabel(deal)}
          </span>
        </div>
      </div>
      <div className="deal-body">
        <div className="deal-price">
          {formatPrice(deal.current_price_inr)}
          <span className="unit">/ rt</span>
        </div>
        <div className="deal-strike">Was {formatPrice(deal.baseline_price_inr)}</div>
        <div className="deal-meta-row">
          {isNonstop && <span className="meta-chip nonstop">Direct</span>}
          {!isNonstop && <span className="meta-chip">{stopsLabel}</span>}
          {isMistake && <span className="meta-chip mistake">Mistake fare</span>}
          {isBusiness && <span className="meta-chip business">Business</span>}
        </div>
        <div className="deal-airline">
          {deal.airline ?? "Multiple"} · {formatDuration(deal.duration_minutes)} · {deal.cabin_class ?? "Economy"}
        </div>
        <div className={`deal-timer ${timer.slow ? "slow" : ""}`}>{timer.text}</div>
        <div className="deal-cta">
          <a
            href={deal.google_flights_url}
            target="_blank"
            rel="noopener noreferrer"
            className="deal-grab"
          >
            Grab deal →
          </a>
          <button
            className={`deal-save ${saved ? "saved" : ""}`}
            onClick={onToggleSave}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
