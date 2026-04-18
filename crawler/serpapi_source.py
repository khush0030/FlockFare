"""SerpApi Google Flights wrapper.

Returns FareResult objects compatible with flight_source.py so multi_city.py
can swap sources without changing its call sites.

Quota note: 250 searches/month on the free plan. Each call to
fetch_cheapest_oneway() = 1 search.
"""

import os
import json
import logging
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from flight_source import FareResult

logger = logging.getLogger(__name__)

ENDPOINT = "https://serpapi.com/search.json"
DEFAULT_CURRENCY = "INR"
DEFAULT_HL = "en"

# Sanity bounds — same as flight_source._parse_price
MIN_PRICE_INR = 2000
MAX_PRICE_INR = 1_500_000


def _api_key() -> str:
    key = os.environ.get("SERPAPI_KEY")
    if not key:
        raise RuntimeError("SERPAPI_KEY not set in environment")
    return key


def _query(params: dict) -> dict:
    """Hit SerpApi and return parsed JSON."""
    full = {**params, "api_key": _api_key()}
    url = f"{ENDPOINT}?{urlencode(full)}"
    req = Request(url, headers={"User-Agent": "FlockFare/1.0"})
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:300]
        logger.warning(f"  SerpApi HTTP {e.code}: {body}")
        return {}
    except URLError as e:
        logger.warning(f"  SerpApi URL error: {e}")
        return {}


def fetch_cheapest_oneway(
    origin: str,
    destination: str,
    departure_date: str,
    cabin: str = "economy",
    max_stops: int = 1,
) -> FareResult | None:
    """Fetch the cheapest one-way fare via SerpApi Google Flights."""
    travel_class = {
        "economy": 1,
        "premium_economy": 2,
        "business": 3,
        "first": 4,
    }.get(cabin, 1)

    params = {
        "engine": "google_flights",
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": departure_date,
        "type": 2,  # 1=round-trip, 2=one-way
        "currency": DEFAULT_CURRENCY,
        "hl": DEFAULT_HL,
        "travel_class": travel_class,
        # `stops` filter on SerpApi: 0=any, 1=non-stop, 2=≤1 stop, 3=≤2 stops
        "stops": min(3, max_stops + 1),
    }

    data = _query(params)
    options = (data.get("best_flights") or []) + (data.get("other_flights") or [])
    if not options:
        logger.info(f"  SerpApi: no flights for {origin}→{destination} ({departure_date})")
        return None

    # Pick the cheapest within plausible price range and stop limit.
    valid = []
    for opt in options:
        price = opt.get("price")
        if not isinstance(price, (int, float)):
            continue
        price_int = int(price)
        if price_int < MIN_PRICE_INR or price_int > MAX_PRICE_INR:
            continue
        segments = opt.get("flights") or []
        if not segments:
            continue
        stops = max(0, len(segments) - 1)
        if stops > max_stops:
            continue
        airline = segments[0].get("airline") or None
        duration = opt.get("total_duration")
        if not isinstance(duration, int):
            duration = None
        valid.append((price_int, airline, stops, duration))

    if not valid:
        logger.info(f"  SerpApi: no plausible fares for {origin}→{destination} ({departure_date})")
        return None

    valid.sort(key=lambda x: x[0])
    price, airline, stops, duration = valid[0]
    logger.info(f"  SerpApi {origin}→{destination} ({departure_date}): ₹{price:,} · {airline} · {stops} stops")

    return FareResult(
        origin=origin,
        destination=destination,
        travel_month=departure_date[:7],
        price_inr=price,
        airline=airline,
        stops=stops,
        cabin_class=cabin,
        duration_minutes=duration,
        source="serpapi",
    )
