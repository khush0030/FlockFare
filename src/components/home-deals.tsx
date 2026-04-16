"use client";

import { useState } from "react";
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

const bannerColors: Record<string, string> = {
  unique: "b-lime",
  rare: "b-coral",
  common: "b-violet",
};

const bannerAlt: string[] = ["b-lime", "b-coral", "b-violet", "b-sun"];

function getBannerClass(deal: Deal, index: number): string {
  return bannerColors[deal.deal_type] ?? bannerAlt[index % bannerAlt.length];
}

const dealTags: Record<string, string> = {
  LHR: "europe mistake",
  BKK: "asia",
  DEL: "domestic",
  CDG: "europe",
  SIN: "asia mistake",
  GOI: "domestic",
  NRT: "asia",
  FCO: "europe",
};

function getDealTag(deal: Deal): string {
  return dealTags[deal.destination_code] ?? "all";
}

export function HomeDeals({ deals }: { deals: Deal[] }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = ["all", "domestic", "asia", "europe", "mistake"];
  const filterLabels: Record<string, string> = {
    all: "All routes",
    domestic: "Domestic",
    asia: "Southeast Asia",
    europe: "Europe",
    mistake: "Mistake fares",
  };

  const filteredDeals = deals.filter((deal) => {
    if (activeFilter === "all") return true;
    return getDealTag(deal).includes(activeFilter);
  });

  return (
    <>
      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="deals-grid">
        {filteredDeals.map((deal, i) => (
          <HomeDealCard key={deal.id} deal={deal} index={i} />
        ))}
      </div>
    </>
  );
}

function HomeDealCard({ deal, index }: { deal: Deal; index: number }) {
  const [saved, setSaved] = useState(false);
  const stopsLabel = deal.stops === 0 ? "Direct" : `${deal.stops} stop`;

  return (
    <div className="deal-card">
      <div className={`deal-banner ${getBannerClass(deal, index)}`}>
        <div className="deal-route">
          {deal.origin_code} <span className="arr">→</span>{" "}
          {deal.destination_code}
        </div>
        <span className="pill pill-coral">-{deal.pct_off}% OFF</span>
      </div>
      <div className="deal-body">
        <div className="deal-price">
          {formatPrice(deal.current_price_inr)}
          <span className="unit">/ rt</span>
        </div>
        <div className="deal-strike">
          Was {formatPrice(deal.baseline_price_inr)}
        </div>
        <div className="deal-meta">
          {deal.airline ?? "Multiple"} · {stopsLabel}
          {deal.duration_minutes ? ` · ${formatDuration(deal.duration_minutes)}` : ""}
        </div>
        <div className="deal-timer">Expires in 1h 22m</div>
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
            onClick={() => setSaved(!saved)}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
