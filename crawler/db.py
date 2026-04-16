"""Supabase database operations for the crawler."""

import os
import logging
from datetime import datetime, timedelta, timezone

from supabase import create_client, Client

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_client() -> Client:
    """Get or create Supabase client with service role key."""
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        _client = create_client(url, key)
    return _client


def store_price_snapshot(
    origin_code: str,
    destination_code: str,
    travel_month: str,
    price_inr: int,
    airline: str | None = None,
    stops: int = 0,
    cabin_class: str = "economy",
    duration_minutes: int | None = None,
    source: str = "fast-flights",
) -> None:
    """Insert one price snapshot into price_history."""
    client = get_client()
    client.table("price_history").insert({
        "origin_code": origin_code,
        "destination_code": destination_code,
        "travel_month": travel_month,
        "price_inr": price_inr,
        "airline": airline,
        "stops": stops,
        "cabin_class": cabin_class,
        "duration_minutes": duration_minutes,
        "source": source,
    }).execute()


def get_baseline_price(
    origin_code: str,
    destination_code: str,
    travel_month: str,
    window_days: int = 90,
) -> float | None:
    """Get rolling median price for a route/month over the last N days.

    Returns None if fewer than 3 data points (baseline not reliable yet).
    """
    client = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).isoformat()

    resp = (
        client.table("price_history")
        .select("price_inr")
        .eq("origin_code", origin_code)
        .eq("destination_code", destination_code)
        .eq("travel_month", travel_month)
        .gte("fetched_at", cutoff)
        .order("price_inr")
        .execute()
    )

    prices = [row["price_inr"] for row in resp.data]

    if len(prices) < 3:
        return None

    # Median
    n = len(prices)
    mid = n // 2
    if n % 2 == 0:
        return (prices[mid - 1] + prices[mid]) / 2
    return prices[mid]


def store_deal(
    origin_code: str,
    destination_code: str,
    travel_month: str,
    current_price_inr: int,
    baseline_price_inr: float,
    pct_off: int,
    airline: str | None,
    stops: int,
    cabin_class: str,
    duration_minutes: int | None,
    deal_type: str,
    google_flights_url: str,
) -> dict | None:
    """Insert a new deal. Returns the inserted row, or None if duplicate."""
    client = get_client()

    # Check for existing active deal on same route/month (avoid duplicates)
    existing = (
        client.table("deals")
        .select("id")
        .eq("origin_code", origin_code)
        .eq("destination_code", destination_code)
        .eq("travel_month", travel_month)
        .eq("is_active", True)
        .execute()
    )

    if existing.data:
        # Update existing deal if price dropped further
        deal_id = existing.data[0]["id"]
        client.table("deals").update({
            "current_price_inr": current_price_inr,
            "baseline_price_inr": baseline_price_inr,
            "pct_off": pct_off,
            "airline": airline,
            "stops": stops,
            "deal_type": deal_type,
            "google_flights_url": google_flights_url,
            "detected_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", deal_id).execute()
        logger.info(f"  Updated existing deal {deal_id}")
        return None  # Not a new deal

    resp = client.table("deals").insert({
        "origin_code": origin_code,
        "destination_code": destination_code,
        "travel_month": travel_month,
        "current_price_inr": current_price_inr,
        "baseline_price_inr": baseline_price_inr,
        "pct_off": pct_off,
        "airline": airline,
        "stops": stops,
        "cabin_class": cabin_class,
        "duration_minutes": duration_minutes,
        "deal_type": deal_type,
        "google_flights_url": google_flights_url,
    }).execute()

    return resp.data[0] if resp.data else None


def expire_stale_deals(hours: int = 72) -> int:
    """Mark deals older than N hours as inactive. Returns count expired."""
    client = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

    resp = (
        client.table("deals")
        .update({"is_active": False})
        .eq("is_active", True)
        .lt("detected_at", cutoff)
        .execute()
    )

    count = len(resp.data) if resp.data else 0
    if count:
        logger.info(f"Expired {count} stale deals (older than {hours}h)")
    return count
