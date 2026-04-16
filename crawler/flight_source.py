"""Flight price fetcher — wraps fast-flights.

Single module to swap out if Google Flights scraping breaks.
"""

import re
import time
import logging
from dataclasses import dataclass

from fast_flights import FlightData, Passengers, get_flights

logger = logging.getLogger(__name__)


@dataclass
class FareResult:
    """Normalized fare result from any source."""
    origin: str
    destination: str
    travel_month: str
    price_inr: int
    airline: str
    stops: int
    cabin_class: str
    duration_minutes: int | None
    source: str


def _parse_price(price_str: str) -> int | None:
    """Extract numeric price from strings like '₹36,500' or 'INR 36500'."""
    cleaned = re.sub(r"[^\d]", "", price_str)
    if cleaned:
        return int(cleaned)
    return None


def _parse_duration(duration_str: str) -> int | None:
    """Parse '13 hr 25 min' or '2h 30m' into total minutes."""
    hours = 0
    minutes = 0
    h_match = re.search(r"(\d+)\s*h", duration_str)
    m_match = re.search(r"(\d+)\s*m", duration_str)
    if h_match:
        hours = int(h_match.group(1))
    if m_match:
        minutes = int(m_match.group(1))
    total = hours * 60 + minutes
    return total if total > 0 else None


def fetch_fares(
    origin: str,
    destination: str,
    departure_date: str,
    travel_month: str,
    cabin: str = "economy",
    max_stops: int = 1,
) -> list[FareResult]:
    """Fetch fares for a single origin→destination on a given date.

    Returns a list of FareResult (typically 5-10 flights).
    """
    results: list[FareResult] = []

    try:
        flight_data = FlightData(
            date=departure_date,
            from_airport=origin,
            to_airport=destination,
            max_stops=max_stops,
        )

        result = get_flights(
            flight_data=[flight_data],
            trip="round-trip",
            passengers=Passengers(adults=1),
            seat=cabin,
            max_stops=max_stops,
        )

        for flight in result.flights:
            price = _parse_price(flight.price)
            if price is None or price == 0:
                continue

            duration = _parse_duration(flight.duration) if flight.duration else None

            # fast-flights sometimes returns 'Unknown' or empty for stops
            stops = 0
            if isinstance(flight.stops, int):
                stops = flight.stops
            elif isinstance(flight.stops, str) and flight.stops.isdigit():
                stops = int(flight.stops)

            results.append(FareResult(
                origin=origin,
                destination=destination,
                travel_month=travel_month,
                price_inr=price,
                airline=flight.name if flight.name else None,
                stops=stops,
                cabin_class=cabin,
                duration_minutes=duration,
                source="fast-flights",
            ))

        logger.info(
            f"  {origin}→{destination} ({departure_date}): "
            f"{len(results)} fares, cheapest ₹{min(r.price_inr for r in results):,}" if results
            else f"  {origin}→{destination} ({departure_date}): no fares found"
        )

    except Exception as e:
        logger.warning(f"  {origin}→{destination} ({departure_date}): error — {e}")

    return results


def fetch_cheapest_fare(
    origin: str,
    destination: str,
    departure_date: str,
    travel_month: str,
    cabin: str = "economy",
    max_stops: int = 1,
) -> FareResult | None:
    """Fetch fares and return the cheapest one, or None."""
    fares = fetch_fares(origin, destination, departure_date, travel_month, cabin, max_stops)
    if not fares:
        return None
    return min(fares, key=lambda f: f.price_inr)
