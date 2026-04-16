/**
 * Build a Google Calendar "Add Event" URL for a tentative trip.
 *
 * Opens Google Calendar with a pre-filled event.
 * No API key needed — uses the public add-event URL.
 */
export function buildCalendarUrl(
  origin: string,
  destination: string,
  travelMonth: string,
  price: number
): string {
  const [year, month] = travelMonth.split("-");
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-US",
    { month: "long" }
  );

  // Default to 10th-17th of the month as tentative dates
  const startDate = `${year}${month}10`;
  const endDate = `${year}${month}17`;

  const title = `${origin} \u2192 ${destination} (FlockFare deal)`;
  const details = [
    `FlockFare found a deal: ${origin} \u2192 ${destination}`,
    `Price: \u20B9${price.toLocaleString("en-IN")} round-trip`,
    `Month: ${monthName} ${year}`,
    ``,
    `Book via Google Flights before this deal expires.`,
    `Sent by Penny the Puffin \ud83d\udc27`,
  ].join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startDate}/${endDate}`,
    details,
    sf: "true",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
