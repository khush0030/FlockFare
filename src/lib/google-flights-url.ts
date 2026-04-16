/**
 * Build a Google Flights search URL for a given route + month.
 *
 * Google Flights URL format:
 * https://www.google.com/travel/flights?q=Flights+from+BOM+to+BKK+in+June+2026
 *
 * The "q" param triggers Google's natural-language flight search.
 */
export function buildGoogleFlightsUrl(
  originCode: string,
  destinationCode: string,
  travelMonth: string // 'YYYY-MM'
): string {
  const [year, month] = travelMonth.split("-");
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-US",
    { month: "long" }
  );

  const query = `Flights from ${originCode} to ${destinationCode} in ${monthName} ${year}`;
  const params = new URLSearchParams({ q: query });

  return `https://www.google.com/travel/flights?${params.toString()}`;
}
