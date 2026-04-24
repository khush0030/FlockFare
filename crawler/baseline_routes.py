"""Baseline price collector for curated one-way routes.

Builds rolling price_history across a small set of popular India-origin routes
so downstream deal detection has a baseline to compare against. Runs alongside
the multi-city crawl; writes directly to price_history.
"""

from __future__ import annotations

import logging
from datetime import date, timedelta

from db import get_client
from serpapi_source import fetch_cheapest_oneway

logger = logging.getLogger(__name__)

ORIGINS = ["BOM", "DEL", "BLR", "IDR"]
DESTINATIONS = ["BKK", "DXB", "SIN", "KUL"]
DAYS_AHEAD = 60
CABIN = "economy"
MAX_STOPS = 1


def _travel_month(d: date) -> str:
    return f"{d.year}-{d.month:02d}"


def crawl_baselines(dry_run: bool = False) -> int:
    """Fetch one cheapest fare per (origin, destination) at DAYS_AHEAD and
    persist to price_history. Returns number of rows written."""
    client = get_client()
    depart = date.today() + timedelta(days=DAYS_AHEAD)
    depart_iso = depart.isoformat()
    month = _travel_month(depart)

    written = 0
    for origin in ORIGINS:
        for dest in DESTINATIONS:
            try:
                fare = fetch_cheapest_oneway(
                    origin=origin,
                    destination=dest,
                    departure_date=depart_iso,
                    cabin=CABIN,
                    max_stops=MAX_STOPS,
                )
            except Exception as e:
                logger.error(f"  {origin}->{dest} fetch failed: {e}")
                continue

            if fare is None:
                logger.debug(f"  {origin}->{dest} no fare")
                continue

            logger.info(
                f"  {origin}->{dest} {depart_iso}: ₹{fare.price_inr:,} "
                f"({fare.airline}, {fare.stops} stops)"
            )

            if dry_run:
                continue

            client.table("price_history").insert({
                "origin_code": origin,
                "destination_code": dest,
                "travel_month": month,
                "price_inr": fare.price_inr,
                "airline": fare.airline,
                "stops": fare.stops,
                "cabin_class": CABIN,
                "duration_minutes": fare.duration_minutes,
                "source": "serpapi",
            }).execute()
            written += 1

    return written
