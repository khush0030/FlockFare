"use client";

import { useState } from "react";
import { ORIGINS } from "@/config/watchlist";
import type { Deal } from "@/lib/supabase/deals";
import type { HotelDeal } from "@/lib/supabase/hotels";
import { DealCard } from "./deal-card";
import { HotelDealCard } from "./hotel-deal-card";

type Tab = "flights" | "hotels";

export function DealFilters({
  flightDeals,
  hotelDeals,
}: {
  flightDeals: Deal[];
  hotelDeals: HotelDeal[];
}) {
  const [activeOrigin, setActiveOrigin] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("flights");

  const filteredFlights = activeOrigin
    ? flightDeals.filter((d) => d.origin_code === activeOrigin)
    : flightDeals;

  const hasHotels = hotelDeals.length > 0;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("flights")}
          className={`font-display font-bold text-sm px-4 py-2 rounded-full border-4 border-ink transition-all cursor-pointer ${
            activeTab === "flights"
              ? "bg-ink text-lime shadow-none"
              : "bg-paper text-ink shadow-brut-sm hover:shadow-brut"
          }`}
        >
          Flights ({flightDeals.length})
        </button>
        <button
          onClick={() => setActiveTab("hotels")}
          className={`font-display font-bold text-sm px-4 py-2 rounded-full border-4 border-ink transition-all cursor-pointer ${
            activeTab === "hotels"
              ? "bg-ink text-lime shadow-none"
              : "bg-paper text-ink shadow-brut-sm hover:shadow-brut"
          }`}
        >
          Hotels ({hotelDeals.length})
        </button>
      </div>

      {/* Origin filter (flights only) */}
      {activeTab === "flights" && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveOrigin(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase border-2 border-ink cursor-pointer transition-all ${
              activeOrigin === null
                ? "bg-ink text-lime"
                : "bg-paper text-ink hover:bg-ffgray-100"
            }`}
          >
            All
          </button>
          {ORIGINS.map((origin) => {
            const count = flightDeals.filter(
              (d) => d.origin_code === origin.code
            ).length;
            const isActive = activeOrigin === origin.code;
            return (
              <button
                key={origin.code}
                onClick={() =>
                  setActiveOrigin(isActive ? null : origin.code)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase border-2 border-ink cursor-pointer transition-all ${
                  isActive
                    ? "bg-ink text-lime"
                    : "bg-paper text-ink hover:bg-ffgray-100"
                }`}
              >
                {origin.code}
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? "bg-lime text-ink"
                      : "bg-ffgray-200 text-ink"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Flight deals grid */}
      {activeTab === "flights" && (
        <>
          {filteredFlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFlights.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <p className="text-ffgray-400 font-mono text-sm mt-4">
              No flight deals from {activeOrigin} right now. Penny is on it.
            </p>
          )}
        </>
      )}

      {/* Hotel deals grid */}
      {activeTab === "hotels" && (
        <>
          {hasHotels ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hotelDeals.map((deal) => (
                <HotelDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <p className="text-ffgray-400 font-mono text-sm mt-4">
              Hotel deals coming soon. Penny is learning the hotel game.
            </p>
          )}
        </>
      )}
    </div>
  );
}
