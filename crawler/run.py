#!/usr/bin/env python3
"""FlockFare crawler — fetch fares for all active multi-city trips via SerpApi.

Usage:
    python crawler/run.py            # Crawl all active trips
    python crawler/run.py --dry-run  # Fetch fares but don't store

Quota: 1 SerpApi call per leg per origin per trip per run.
Phuket+BKK trip with 4 origins = 8 calls/run.
"""

import os
import sys
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

from db import expire_stale_deals
from multi_city import fetch_active_trips, crawl_trip, expire_stale_mc_deals
from baseline_routes import crawl_baselines

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="FlockFare fare crawler")
    parser.add_argument("--dry-run", action="store_true", help="Fetch fares but don't store")
    args = parser.parse_args()

    if args.dry_run:
        logger.info("DRY RUN — fetching fares but not storing")

    new_deals = []
    errors = 0

    try:
        trips = fetch_active_trips()
        if not trips:
            logger.info("No active multi-city trips. Nothing to do.")
            return 0
        logger.info(f"--- Multi-city trips ({len(trips)}) ---")
        for trip in trips:
            logger.info(f"Trip: {trip['label']} ({trip['slug']})")
            try:
                deals = crawl_trip(trip, dry_run=args.dry_run)
                new_deals.extend(deals)
            except Exception as e:
                errors += 1
                logger.error(f"  Trip failed: {e}")
    except Exception as e:
        logger.error(f"Could not load multi-city trips: {e}")
        errors += 1

    try:
        logger.info("--- Baseline route snapshots ---")
        written = crawl_baselines(dry_run=args.dry_run)
        logger.info(f"Baseline snapshots written: {written}")
    except Exception as e:
        logger.error(f"Baseline collection failed: {e}")
        errors += 1

    if not args.dry_run:
        expire_stale_deals(hours=72)
        expire_stale_mc_deals(hours=72)

    logger.info(f"Done. {errors} errors, {len(new_deals)} new deals detected.")
    if new_deals:
        for deal in new_deals:
            logger.info(f"  {deal}")

    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
