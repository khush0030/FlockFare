#!/usr/bin/env python3
"""FlockFare crawler — fetch fares, detect deals, store results.

Usage:
    python crawler/run.py                    # Full crawl (all origins x destinations x months)
    python crawler/run.py --origins BOM DEL  # Crawl specific origins only
    python crawler/run.py --dry-run          # Fetch fares but don't store
"""

import os
import sys
import time
import logging
import argparse
from pathlib import Path

# Load .env.local from project root
from dotenv import load_dotenv
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

# Remap Next.js env var names to what crawler expects
if "NEXT_PUBLIC_SUPABASE_URL" in os.environ and "SUPABASE_URL" not in os.environ:
    os.environ["SUPABASE_URL"] = os.environ["NEXT_PUBLIC_SUPABASE_URL"]

from config import (
    ORIGINS, DESTINATIONS, MAX_STOPS,
    MIN_PCT_OFF, RARE_PCT_OFF, UNIQUE_PCT_OFF,
    BASELINE_WINDOW_DAYS,
    get_watch_months, get_sample_dates,
)
from flight_source import fetch_cheapest_fare
from db import store_price_snapshot, get_baseline_price, store_deal, expire_stale_deals

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def build_google_flights_url(origin: str, destination: str, travel_month: str) -> str:
    """Build Google Flights search URL."""
    year, month = travel_month.split("-")
    from datetime import date
    month_name = date(int(year), int(month), 1).strftime("%B")
    query = f"Flights from {origin} to {destination} in {month_name} {year}"
    return f"https://www.google.com/travel/flights?q={query.replace(' ', '+')}"


def classify_deal(pct_off: int) -> str:
    """Classify deal type based on discount percentage."""
    if pct_off >= UNIQUE_PCT_OFF:
        return "unique"
    if pct_off >= RARE_PCT_OFF:
        return "rare"
    return "common"


def crawl_route(origin: str, destination: str, travel_month: str, dry_run: bool = False) -> dict | None:
    """Crawl a single route/month, store snapshot, check for deal.

    Returns deal dict if a new deal was detected, else None.
    """
    sample_dates = get_sample_dates(travel_month)
    cheapest = None

    for dep_date in sample_dates:
        fare = fetch_cheapest_fare(
            origin=origin,
            destination=destination,
            departure_date=dep_date,
            travel_month=travel_month,
            max_stops=MAX_STOPS,
        )
        if fare and (cheapest is None or fare.price_inr < cheapest.price_inr):
            cheapest = fare

        # Rate limit: 1-2 seconds between requests
        time.sleep(1.5)

    if cheapest is None:
        return None

    # Store price snapshot
    if not dry_run:
        store_price_snapshot(
            origin_code=cheapest.origin,
            destination_code=cheapest.destination,
            travel_month=cheapest.travel_month,
            price_inr=cheapest.price_inr,
            airline=cheapest.airline,
            stops=cheapest.stops,
            cabin_class=cheapest.cabin_class,
            duration_minutes=cheapest.duration_minutes,
            source=cheapest.source,
        )

    # Check against baseline
    if dry_run:
        return None

    baseline = get_baseline_price(
        origin_code=origin,
        destination_code=destination,
        travel_month=travel_month,
        window_days=BASELINE_WINDOW_DAYS,
    )

    if baseline is None:
        logger.debug(f"  No baseline yet for {origin}→{destination} ({travel_month})")
        return None

    pct_off = round((1 - cheapest.price_inr / baseline) * 100)

    if pct_off < MIN_PCT_OFF:
        return None

    # We have a deal!
    deal_type = classify_deal(pct_off)
    google_url = build_google_flights_url(origin, destination, travel_month)

    logger.info(
        f"  DEAL: {origin}→{destination} ({travel_month}) "
        f"₹{cheapest.price_inr:,} vs baseline ₹{baseline:,.0f} = {pct_off}% off [{deal_type}]"
    )

    new_deal = store_deal(
        origin_code=origin,
        destination_code=destination,
        travel_month=travel_month,
        current_price_inr=cheapest.price_inr,
        baseline_price_inr=baseline,
        pct_off=pct_off,
        airline=cheapest.airline,
        stops=cheapest.stops,
        cabin_class=cheapest.cabin_class,
        duration_minutes=cheapest.duration_minutes,
        deal_type=deal_type,
        google_flights_url=google_url,
    )

    return new_deal


def main():
    parser = argparse.ArgumentParser(description="FlockFare fare crawler")
    parser.add_argument("--origins", nargs="+", help="Only crawl these origin codes")
    parser.add_argument("--destinations", nargs="+", help="Only crawl these destination codes")
    parser.add_argument("--dry-run", action="store_true", help="Fetch fares but don't store")
    args = parser.parse_args()

    origins = ORIGINS
    destinations = DESTINATIONS
    months = get_watch_months()

    if args.origins:
        origins = [o for o in ORIGINS if o.code in args.origins]
    if args.destinations:
        destinations = [d for d in DESTINATIONS if d.code in args.destinations]

    total_combos = len(origins) * len(destinations) * len(months)
    logger.info(f"Starting crawl: {len(origins)} origins x {len(destinations)} destinations x {len(months)} months = {total_combos} combos")

    if args.dry_run:
        logger.info("DRY RUN — fetching fares but not storing")

    new_deals = []
    crawled = 0
    errors = 0

    for origin in origins:
        for dest in destinations:
            for month in months:
                crawled += 1
                logger.info(f"[{crawled}/{total_combos}] {origin.code}→{dest.code} ({month})")
                try:
                    deal = crawl_route(origin.code, dest.code, month, dry_run=args.dry_run)
                    if deal:
                        new_deals.append(deal)
                except Exception as e:
                    errors += 1
                    logger.error(f"  Failed: {e}")

    # Expire old deals
    if not args.dry_run:
        expire_stale_deals(hours=72)

    logger.info(f"\nDone. Crawled {crawled} combos, {errors} errors, {len(new_deals)} new deals detected.")

    if new_deals:
        logger.info("New deals:")
        for deal in new_deals:
            logger.info(f"  {deal}")

    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
