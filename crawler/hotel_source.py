"""Hotel price fetcher — scrapes Google Hotels for now.

Uses Google Hotels search URL to find prices. Same approach as flight_source.py.
Can swap to Amadeus Hotels API later if needed.
"""

import re
import logging
from dataclasses import dataclass
from urllib.request import Request, urlopen
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)


@dataclass
class HotelResult:
    city: str
    hotel_name: str
    checkin_date: str
    nights: int
    price_per_night_inr: int
    star_rating: int | None
    source: str


def build_google_hotels_url(city: str, checkin: str, nights: int = 2) -> str:
    """Build a Google Hotels search URL."""
    checkout_parts = checkin.split("-")
    # Simple date arithmetic for checkout
    day = int(checkout_parts[2]) + nights
    checkout = f"{checkout_parts[0]}-{checkout_parts[1]}-{day:02d}"

    query = quote_plus(f"Hotels in {city}")
    return (
        f"https://www.google.com/travel/hotels/{city.replace(' ', '%20')}"
        f"?q={query}&g2lb=2502548,2503771,2503781,4258168,4270442"
        f"&hl=en-IN&gl=in&cs=1&ssta=1&ts=CAESCAoCCAMKAggDGhwSGjIkMHgwOjB4MCIQSm9obm55JTIwQ2FzaA"
        f"&checkin={checkin}&checkout={checkout}&currency=INR"
    )


def build_booking_url(city: str, checkin: str, nights: int = 2) -> str:
    """Build a Booking.com search URL for hand-off."""
    checkout_parts = checkin.split("-")
    day = int(checkout_parts[2]) + nights
    checkout = f"{checkout_parts[0]}-{checkout_parts[1]}-{day:02d}"

    return (
        f"https://www.booking.com/searchresults.html"
        f"?ss={quote_plus(city)}&checkin={checkin}&checkout={checkout}"
        f"&group_adults=2&no_rooms=1&selected_currency=INR"
    )
