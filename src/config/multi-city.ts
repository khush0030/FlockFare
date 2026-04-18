/**
 * Multi-city / open-jaw trip definitions.
 *
 * Mirrors `multi_city_trips` rows seeded in migrations/007_multi_city.sql.
 * The crawler reads trips directly from Supabase; this file is the canonical
 * frontend reference for labels, dates, and origin sets.
 */

export interface MultiCityTrip {
  slug: string;
  label: string;
  outboundDestCode: string;
  returnOriginCode: string;
  outboundDate: string; // YYYY-MM-DD
  returnDate: string;   // YYYY-MM-DD
  originCodes: string[];
}

export const MULTI_CITY_TRIPS: MultiCityTrip[] = [
  {
    slug: "phuket-bangkok-jul-2026",
    label: "Phuket + Bangkok",
    outboundDestCode: "HKT",
    returnOriginCode: "BKK",
    outboundDate: "2026-07-09",
    returnDate: "2026-07-16",
    originCodes: ["BOM", "DEL", "IDR", "BLR"],
  },
];

/**
 * Public-knowledge route facts: great-circle distance, typical
 * scheduled flight duration range (min–max minutes including stops),
 * and common operating carriers. Used to give context before live
 * fare snapshots accumulate.
 */
export type RouteInfo = {
  distanceKm: number;
  minMin: number;
  maxMin: number;
  carriers: string[];
};

export const ROUTE_INFO: Record<string, RouteInfo> = {
  // Outbound: India → Phuket
  "BOM-HKT": { distanceKm: 3850, minMin: 285, maxMin: 600, carriers: ["IndiGo", "Thai Lion", "Air India"] },
  "DEL-HKT": { distanceKm: 3960, minMin: 330, maxMin: 660, carriers: ["IndiGo", "Vistara", "Thai Smile"] },
  "IDR-HKT": { distanceKm: 4250, minMin: 540, maxMin: 900, carriers: ["IndiGo (via BOM)", "Air India (via DEL)"] },
  "BLR-HKT": { distanceKm: 3300, minMin: 270, maxMin: 540, carriers: ["IndiGo", "Thai Smile", "Singapore Airlines"] },
  // Return: Bangkok → India
  "BKK-BOM": { distanceKm: 3200, minMin: 240, maxMin: 480, carriers: ["IndiGo", "Thai Airways", "Air India"] },
  "BKK-DEL": { distanceKm: 2950, minMin: 270, maxMin: 510, carriers: ["IndiGo", "Thai Airways", "Vistara"] },
  "BKK-IDR": { distanceKm: 3550, minMin: 540, maxMin: 900, carriers: ["IndiGo (via BOM)", "Air India (via DEL)"] },
  "BKK-BLR": { distanceKm: 2800, minMin: 240, maxMin: 480, carriers: ["IndiGo", "Thai Smile"] },
};

export function routeInfoFor(origin: string, destination: string): RouteInfo | null {
  return ROUTE_INFO[`${origin}-${destination}`] ?? null;
}
