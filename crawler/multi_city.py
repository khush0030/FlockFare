"""Multi-city / open-jaw trip crawler.

Tracks trips defined in `multi_city_trips` table — for each origin in the trip's
`origin_codes`, fetches outbound + return one-way fares for the specified dates,
stores leg snapshots, computes a combined baseline (median outbound + median
return over the rolling window), and writes a deal when total drops past
MIN_PCT_OFF.
"""

import os
import json
import logging
from datetime import datetime, timedelta, timezone
from html import escape as html_escape
from urllib.request import Request, urlopen
from urllib.error import URLError

from config import (
    MIN_PCT_OFF, RARE_PCT_OFF, UNIQUE_PCT_OFF,
    BASELINE_WINDOW_DAYS, MAX_STOPS,
)
from db import get_client
from flight_source import FareResult
from serpapi_source import fetch_cheapest_oneway

logger = logging.getLogger(__name__)


def _classify(pct_off: int) -> str:
    if pct_off >= UNIQUE_PCT_OFF:
        return "unique"
    if pct_off >= RARE_PCT_OFF:
        return "rare"
    return "common"


def _gflights_url(orig: str, dest: str, date_str: str) -> str:
    # "one way" hint forces Google Flights to open in one-way mode instead of
    # the default round-trip — each multi-city leg is searched independently.
    q = f"One way flights from {orig} to {dest} on {date_str}"
    return f"https://www.google.com/travel/flights?q={q.replace(' ', '+')}"


def _median(prices: list[float]) -> float | None:
    if len(prices) < 3:
        return None
    s = sorted(prices)
    n = len(s)
    mid = n // 2
    return (s[mid - 1] + s[mid]) / 2 if n % 2 == 0 else s[mid]


def fetch_active_trips() -> list[dict]:
    client = get_client()
    resp = client.table("multi_city_trips").select("*").eq("is_active", True).execute()
    return resp.data or []


def _store_leg_snapshot(
    trip_slug: str,
    origin_code: str,
    leg: str,
    leg_origin: str,
    leg_destination: str,
    dep_date: str,
    fare: FareResult,
) -> None:
    client = get_client()
    client.table("multi_city_leg_history").insert({
        "trip_slug": trip_slug,
        "origin_code": origin_code,
        "leg": leg,
        "leg_origin": leg_origin,
        "leg_destination": leg_destination,
        "departure_date": dep_date,
        "price_inr": fare.price_inr,
        "airline": fare.airline,
        "stops": fare.stops,
        "duration_minutes": fare.duration_minutes,
        "source": fare.source,
    }).execute()


def _baseline_total(trip_slug: str, origin_code: str, window_days: int = 90) -> float | None:
    """Median outbound + median return over the rolling window."""
    client = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=window_days)).isoformat()

    out = (
        client.table("multi_city_leg_history")
        .select("price_inr")
        .eq("trip_slug", trip_slug)
        .eq("origin_code", origin_code)
        .eq("leg", "outbound")
        .gte("fetched_at", cutoff)
        .execute()
    )
    ret = (
        client.table("multi_city_leg_history")
        .select("price_inr")
        .eq("trip_slug", trip_slug)
        .eq("origin_code", origin_code)
        .eq("leg", "return")
        .gte("fetched_at", cutoff)
        .execute()
    )

    out_med = _median([float(r["price_inr"]) for r in (out.data or [])])
    ret_med = _median([float(r["price_inr"]) for r in (ret.data or [])])
    if out_med is None or ret_med is None:
        return None
    return out_med + ret_med


def _upsert_deal(
    trip_slug: str,
    origin_code: str,
    out_fare: FareResult,
    ret_fare: FareResult,
    baseline_total: float,
    pct_off: int,
    deal_type: str,
    out_url: str,
    ret_url: str,
) -> dict | None:
    client = get_client()
    total = out_fare.price_inr + ret_fare.price_inr

    existing = (
        client.table("multi_city_deals")
        .select("id")
        .eq("trip_slug", trip_slug)
        .eq("origin_code", origin_code)
        .eq("is_active", True)
        .execute()
    )

    payload = {
        "outbound_price_inr": out_fare.price_inr,
        "return_price_inr": ret_fare.price_inr,
        "total_price_inr": total,
        "baseline_total_inr": baseline_total,
        "pct_off": pct_off,
        "outbound_airline": out_fare.airline,
        "return_airline": ret_fare.airline,
        "outbound_stops": out_fare.stops,
        "return_stops": ret_fare.stops,
        "outbound_url": out_url,
        "return_url": ret_url,
        "deal_type": deal_type,
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }

    if existing.data:
        deal_id = existing.data[0]["id"]
        client.table("multi_city_deals").update(payload).eq("id", deal_id).execute()
        logger.info(f"  Updated existing multi-city deal {deal_id}")
        return None

    payload["trip_slug"] = trip_slug
    payload["origin_code"] = origin_code
    resp = client.table("multi_city_deals").insert(payload).execute()
    return resp.data[0] if resp.data else None


def crawl_trip(trip: dict, dry_run: bool = False) -> list[dict]:
    """For each origin, fetch both legs, store, and check combined deal threshold."""
    new_deals: list[dict] = []
    out_dest = trip["outbound_dest_code"]
    ret_orig = trip["return_origin_code"]
    out_date = trip["outbound_date"]
    ret_date = trip["return_date"]

    for origin in trip["origin_codes"]:
        logger.info(
            f"  [trip {trip['slug']}] {origin}→{out_dest} ({out_date}) "
            f"+ {ret_orig}→{origin} ({ret_date})"
        )

        out_fare = fetch_cheapest_oneway(origin, out_dest, out_date, max_stops=MAX_STOPS)
        ret_fare = fetch_cheapest_oneway(ret_orig, origin, ret_date, max_stops=MAX_STOPS)

        if out_fare is None or ret_fare is None:
            logger.warning(
                f"  Skip {origin}: missing fare "
                f"(outbound={'ok' if out_fare else 'none'}, return={'ok' if ret_fare else 'none'})"
            )
            continue

        if not dry_run:
            _store_leg_snapshot(trip["slug"], origin, "outbound", origin, out_dest, out_date, out_fare)
            _store_leg_snapshot(trip["slug"], origin, "return", ret_orig, origin, ret_date, ret_fare)

        if dry_run:
            continue

        baseline = _baseline_total(trip["slug"], origin, window_days=BASELINE_WINDOW_DAYS)
        if baseline is None:
            logger.debug(f"  No baseline yet for {origin} (need ≥3 snapshots per leg)")
            continue

        total = out_fare.price_inr + ret_fare.price_inr
        pct_off = round((1 - total / baseline) * 100)
        if pct_off < MIN_PCT_OFF:
            continue

        deal_type = _classify(pct_off)
        out_url = _gflights_url(origin, out_dest, out_date)
        ret_url = _gflights_url(ret_orig, origin, ret_date)

        deal = _upsert_deal(
            trip["slug"], origin, out_fare, ret_fare,
            baseline, pct_off, deal_type, out_url, ret_url,
        )
        if deal:
            logger.info(
                f"  MULTI-CITY DEAL [{trip['slug']}] {origin}: "
                f"₹{total:,} vs ₹{baseline:,.0f} = {pct_off}% off [{deal_type}]"
            )
            new_deals.append(deal)

        # Fan out to user alerts whose threshold this hits (idempotent: 24h cooldown).
        try:
            sent = _fan_out_alerts(
                trip, origin, out_fare, ret_fare,
                total, baseline, pct_off, out_url, ret_url,
            )
            if sent:
                logger.info(f"  Sent {sent} alert email(s) for {origin}")
        except Exception as e:
            logger.warning(f"  Alert fan-out failed for {origin}: {e}")

    return new_deals


def _matching_alerts(trip_slug: str, origin_code: str, total: float, pct_off: int) -> list[dict]:
    """Active alerts whose threshold this deal satisfies."""
    client = get_client()
    resp = (
        client.table("trip_alerts")
        .select("*")
        .eq("trip_slug", trip_slug)
        .eq("origin_code", origin_code)
        .eq("is_active", True)
        .execute()
    )
    rows = resp.data or []
    out = []
    for a in rows:
        max_total = a.get("max_total_inr")
        min_pct = a.get("min_pct_off")
        triggered = False
        if max_total is not None and float(total) <= float(max_total):
            triggered = True
        if min_pct is not None and int(pct_off) >= int(min_pct):
            triggered = True
        if triggered:
            out.append(a)
    return out


def _send_alert_email(
    to_email: str,
    trip_label: str,
    origin: str,
    out_dest: str,
    ret_orig: str,
    out_date: str,
    ret_date: str,
    out_price: float,
    ret_price: float,
    total: float,
    baseline: float,
    pct_off: int,
    out_url: str,
    ret_url: str,
) -> bool:
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.debug("RESEND_API_KEY not set — skipping alert email")
        return False

    subject = f"✈ {trip_label} from {origin}: ₹{int(total):,} (-{pct_off}%)"
    html = f"""<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:'DM Sans',system-ui,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:20px 16px;">
  <div style="background:#F6F3EC;border:4px solid #0B0B0F;border-radius:20px;overflow:hidden;">
    <div style="background:#D8FF3C;padding:20px 24px;border-bottom:4px solid #0B0B0F;">
      <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:24px;letter-spacing:-0.03em;color:#0B0B0F;">
        {html_escape(trip_label)} · from {html_escape(origin)}
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:6px;color:rgba(11,11,15,.6);">
        🔔 PRICE ALERT TRIGGERED
      </div>
    </div>
    <div style="padding:24px;">
      <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:48px;color:#0B0B0F;letter-spacing:-0.04em;line-height:1;">
        ₹{int(total):,}
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#9C9C98;text-decoration:line-through;margin-top:5px;">
        Baseline ₹{int(baseline):,} · -{pct_off}% off
      </div>
      <div style="margin-top:20px;border-top:2px solid #E2E2DD;padding-top:14px;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.12em;color:#6A6A67;margin-bottom:6px;">OUTBOUND · {out_date}</div>
        <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:16px;">{html_escape(origin)} → {html_escape(out_dest)} · ₹{int(out_price):,}</div>
        <a href="{html_escape(out_url)}" style="display:inline-block;margin-top:6px;padding:8px 14px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;color:#fff;background:#6D28FF;border:2px solid #0B0B0F;text-decoration:none;">BOOK OUTBOUND →</a>
      </div>
      <div style="margin-top:14px;padding-top:12px;border-top:2px solid #E2E2DD;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.12em;color:#6A6A67;margin-bottom:6px;">RETURN · {ret_date}</div>
        <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:16px;">{html_escape(ret_orig)} → {html_escape(origin)} · ₹{int(ret_price):,}</div>
        <a href="{html_escape(ret_url)}" style="display:inline-block;margin-top:6px;padding:8px 14px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:800;color:#fff;background:#6D28FF;border:2px solid #0B0B0F;text-decoration:none;">BOOK RETURN →</a>
      </div>
    </div>
    <div style="background:#0B0B0F;padding:16px 24px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(246,243,236,.4);">
      flockfare.com · Manage alerts in your profile
    </div>
  </div>
</div></body></html>"""

    payload = {
        "from": "Penny @ FlockFare <penny@flockfare.com>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    }
    req = Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "FlockFare/1.0",
        },
    )
    try:
        with urlopen(req, timeout=10) as resp:
            json.loads(resp.read())
            logger.info(f"  Alert email sent to {to_email}")
            return True
    except URLError as e:
        logger.error(f"  Alert email failed for {to_email}: {e}")
        return False


def _fan_out_alerts(
    trip: dict,
    origin: str,
    out_fare: FareResult,
    ret_fare: FareResult,
    total: float,
    baseline: float,
    pct_off: int,
    out_url: str,
    ret_url: str,
) -> int:
    """Find users whose threshold this deal hits, email them, mark notified."""
    matched = _matching_alerts(trip["slug"], origin, total, pct_off)
    if not matched:
        return 0

    sent = 0
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    client = get_client()

    for a in matched:
        last = a.get("last_notified_at")
        if last:
            try:
                last_dt = datetime.fromisoformat(last.replace("Z", "+00:00"))
                if last_dt > cutoff:
                    continue  # already notified within 24h
            except ValueError:
                pass

        ok = _send_alert_email(
            to_email=a["user_email"],
            trip_label=trip["label"],
            origin=origin,
            out_dest=trip["outbound_dest_code"],
            ret_orig=trip["return_origin_code"],
            out_date=trip["outbound_date"],
            ret_date=trip["return_date"],
            out_price=out_fare.price_inr,
            ret_price=ret_fare.price_inr,
            total=total,
            baseline=baseline,
            pct_off=pct_off,
            out_url=out_url,
            ret_url=ret_url,
        )
        if ok:
            client.table("trip_alerts").update(
                {"last_notified_at": datetime.now(timezone.utc).isoformat()}
            ).eq("id", a["id"]).execute()
            sent += 1
    return sent


def expire_stale_mc_deals(hours: int = 72) -> int:
    client = get_client()
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    resp = (
        client.table("multi_city_deals")
        .update({"is_active": False})
        .eq("is_active", True)
        .lt("detected_at", cutoff)
        .execute()
    )
    count = len(resp.data) if resp.data else 0
    if count:
        logger.info(f"Expired {count} stale multi-city deals (older than {hours}h)")
    return count
