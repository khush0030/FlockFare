/**
 * SerpApi Google Flights wrapper (TypeScript).
 *
 * Mirrors crawler/serpapi_source.py so /api/trips/refresh can do an on-demand
 * fetch from a Next.js route handler without shelling out to Python.
 *
 * Quota: 1 SerpApi search call per invocation.
 */

const ENDPOINT = "https://serpapi.com/search.json";
const MIN_PRICE_INR = 2000;
const MAX_PRICE_INR = 1_500_000;

const CABIN_CODE: Record<string, number> = {
  economy: 1,
  premium_economy: 2,
  business: 3,
  first: 4,
};

export type FareResult = {
  origin: string;
  destination: string;
  travelMonth: string;
  priceInr: number;
  airline: string | null;
  stops: number;
  cabinClass: string;
  durationMinutes: number | null;
  source: "serpapi";
};

type SerpFlightSegment = { airline?: string };
type SerpFlightOption = {
  price?: number;
  total_duration?: number;
  flights?: SerpFlightSegment[];
};
type SerpResponse = {
  best_flights?: SerpFlightOption[];
  other_flights?: SerpFlightOption[];
};

export async function fetchCheapestOneway(args: {
  origin: string;
  destination: string;
  departureDate: string;
  cabin?: string;
  maxStops?: number;
}): Promise<FareResult | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY not set");

  const cabin = args.cabin ?? "economy";
  const maxStops = args.maxStops ?? 1;
  const travelClass = CABIN_CODE[cabin] ?? 1;

  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: args.origin,
    arrival_id: args.destination,
    outbound_date: args.departureDate,
    type: "2", // one-way
    currency: "INR",
    hl: "en",
    travel_class: String(travelClass),
    stops: String(Math.min(3, maxStops + 1)),
    api_key: apiKey,
  });

  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { "User-Agent": "FlockFare/1.0" },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`SerpApi ${res.status} for ${args.origin}→${args.destination}: ${body.slice(0, 200)}`);
    return null;
  }
  const data: SerpResponse = await res.json();
  const options = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];

  let cheapest: FareResult | null = null;
  for (const opt of options) {
    if (typeof opt.price !== "number") continue;
    const price = Math.round(opt.price);
    if (price < MIN_PRICE_INR || price > MAX_PRICE_INR) continue;
    const segments = opt.flights ?? [];
    if (segments.length === 0) continue;
    const stops = Math.max(0, segments.length - 1);
    if (stops > maxStops) continue;
    if (cheapest && price >= cheapest.priceInr) continue;
    cheapest = {
      origin: args.origin,
      destination: args.destination,
      travelMonth: args.departureDate.slice(0, 7),
      priceInr: price,
      airline: segments[0].airline ?? null,
      stops,
      cabinClass: cabin,
      durationMinutes: typeof opt.total_duration === "number" ? opt.total_duration : null,
      source: "serpapi",
    };
  }
  return cheapest;
}

export function googleFlightsOneWayUrl(orig: string, dest: string, dateStr: string): string {
  const q = `One way flights from ${orig} to ${dest} on ${dateStr}`;
  return `https://www.google.com/travel/flights?q=${q.replace(/ /g, "+")}`;
}
