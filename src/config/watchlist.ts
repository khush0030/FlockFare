export interface Airport {
  code: string;
  city: string;
  country: string;
  region?: string;
}

export const ORIGINS: Airport[] = [
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "IDR", city: "Indore", country: "India" },
  { code: "BLR", city: "Bangalore", country: "India" },
];

export const DESTINATIONS: Airport[] = [
  // Southeast Asia
  { code: "BKK", city: "Bangkok", country: "Thailand", region: "Southeast Asia" },
  { code: "DPS", city: "Bali", country: "Indonesia", region: "Southeast Asia" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", region: "Southeast Asia" },
  { code: "SIN", city: "Singapore", country: "Singapore", region: "Southeast Asia" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "Southeast Asia" },
  // South Asia
  { code: "CMB", city: "Colombo", country: "Sri Lanka", region: "South Asia" },
  { code: "MLE", city: "Malé", country: "Maldives", region: "South Asia" },
  // Middle East
  { code: "DXB", city: "Dubai", country: "UAE", region: "Middle East" },
  { code: "IST", city: "Istanbul", country: "Turkey", region: "Middle East" },
  // East Asia
  { code: "NRT", city: "Tokyo", country: "Japan", region: "East Asia" },
  { code: "ICN", city: "Seoul", country: "South Korea", region: "East Asia" },
  // Europe
  { code: "LHR", city: "London", country: "United Kingdom", region: "Europe" },
  { code: "CDG", city: "Paris", country: "France", region: "Europe" },
  { code: "FCO", city: "Rome", country: "Italy", region: "Europe" },
  { code: "ZRH", city: "Zurich", country: "Switzerland", region: "Europe" },
  // North America
  { code: "JFK", city: "New York", country: "USA", region: "North America" },
  { code: "SFO", city: "San Francisco", country: "USA", region: "North America" },
  { code: "YYZ", city: "Toronto", country: "Canada", region: "North America" },
  // Oceania
  { code: "SYD", city: "Sydney", country: "Australia", region: "Oceania" },
  { code: "AKL", city: "Auckland", country: "New Zealand", region: "Oceania" },
];

/** Deal detection thresholds */
export const THRESHOLDS = {
  /** Minimum % drop from baseline to qualify as a deal */
  MIN_PCT_OFF: 40,
  /** % drop to flag as "rare" deal */
  RARE_PCT_OFF: 60,
  /** % drop to flag as "unique" (mistake fare territory) */
  UNIQUE_PCT_OFF: 70,
  /** Days of price history for rolling baseline */
  BASELINE_WINDOW_DAYS: 90,
  /** Maximum stops allowed */
  MAX_STOPS: 1,
} as const;

/** Number of months ahead to watch (from current month) */
export const WATCH_MONTHS_AHEAD = 6;

/** Generate the list of months to watch (YYYY-MM format) */
export function getWatchMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < WATCH_MONTHS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
}
