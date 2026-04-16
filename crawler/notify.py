"""FlockFare notification system — Telegram + Email (Resend)."""

import os
import json
import logging
from urllib.request import Request, urlopen
from urllib.error import URLError

logger = logging.getLogger(__name__)

# ─── Telegram ───────────────────────────────────────────────

def _tg_send(method: str, payload: dict) -> dict | None:
    """Low-level Telegram Bot API call."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.debug("TELEGRAM_BOT_TOKEN not set, skipping")
        return None

    url = f"https://api.telegram.org/bot{token}/{method}"
    data = json.dumps(payload).encode()
    req = Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except URLError as e:
        logger.error(f"Telegram API error: {e}")
        return None


def send_telegram_deal(deal: dict) -> bool:
    """Send a formatted deal alert to the Telegram channel.

    Args:
        deal: dict with keys from the deals table row
    Returns:
        True if sent successfully
    """
    chat_id = os.environ.get("TELEGRAM_CHANNEL_ID")
    if not chat_id:
        logger.debug("TELEGRAM_CHANNEL_ID not set, skipping")
        return False

    # Deal type emoji
    type_emoji = {"common": "🔵", "rare": "🟡", "unique": "🔴"}.get(
        deal.get("deal_type", "common"), "🔵"
    )
    type_label = {
        "common": "PRICE DROP",
        "rare": "FLASH SALE",
        "unique": "MISTAKE FARE",
    }.get(deal.get("deal_type", "common"), "DEAL")

    origin = deal["origin_code"]
    dest = deal["destination_code"]
    price = f"₹{deal['current_price_inr']:,.0f}"
    baseline = f"₹{deal['baseline_price_inr']:,.0f}"
    pct = deal["pct_off"]
    airline = deal.get("airline") or "Multiple airlines"
    month = deal.get("travel_month", "")
    gf_url = deal.get("google_flights_url", "")

    text = (
        f"{type_emoji} <b>{type_label} · {origin} → {dest}</b>\n"
        f"\n"
        f"<b>{price}</b> round-trip ({pct}% off)\n"
        f"<s>{baseline}</s> usual fare\n"
        f"\n"
        f"✈ {airline} · {month}\n"
        f"\n"
        f'<a href="{gf_url}">Book on Google Flights →</a>\n'
        f"\n"
        f"<i>Penny found this one. Grab before it disappears.</i>"
    )

    result = _tg_send("sendMessage", {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    })

    if result and result.get("ok"):
        logger.info(f"  Telegram alert sent: {origin}→{dest} {pct}% off")
        return True

    logger.warning(f"  Telegram send failed: {result}")
    return False


# ─── Email via Resend ───────────────────────────────────────

def send_email_deal(deal: dict, to_emails: list[str]) -> bool:
    """Send a deal alert email via Resend API.

    Args:
        deal: dict with keys from the deals table row
        to_emails: list of recipient email addresses
    Returns:
        True if sent successfully
    """
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.debug("RESEND_API_KEY not set, skipping email")
        return False

    if not to_emails:
        return False

    origin = deal["origin_code"]
    dest = deal["destination_code"]
    price = f"₹{deal['current_price_inr']:,.0f}"
    baseline = f"₹{deal['baseline_price_inr']:,.0f}"
    pct = deal["pct_off"]
    airline = deal.get("airline") or "Multiple airlines"
    month = deal.get("travel_month", "")
    gf_url = deal.get("google_flights_url", "")
    deal_type = deal.get("deal_type", "common")

    type_label = {
        "common": "Price Drop",
        "rare": "Flash Sale",
        "unique": "MISTAKE FARE",
    }.get(deal_type, "Deal")

    subject = f"{origin} → {dest} dropped to {price} ({pct}% off) · FlockFare"

    # Banner color per deal type
    banner_color = {
        "common": "#D8FF3C",
        "rare": "#FFD166",
        "unique": "#FF4E64",
    }.get(deal_type, "#D8FF3C")
    banner_text_color = "#0B0B0F" if deal_type != "unique" else "#FFFFFF"

    html = f"""
    <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:500px;margin:0 auto;background:#F6F3EC;border:4px solid #0B0B0F;border-radius:20px;overflow:hidden;">
      <div style="background:{banner_color};border-bottom:4px solid #0B0B0F;padding:20px 24px;">
        <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:28px;color:{banner_text_color};letter-spacing:-0.02em;">
          {origin} <span style="color:#6D28FF;">→</span> {dest}
        </div>
        <div style="margin-top:6px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{banner_text_color};opacity:0.8;">
          {type_label}
        </div>
      </div>
      <div style="padding:24px;">
        <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:44px;color:#0B0B0F;letter-spacing:-0.03em;line-height:1;">
          {price}<span style="font-size:14px;color:#6A6A67;margin-left:4px;">round-trip</span>
        </div>
        <div style="margin-top:8px;font-size:14px;color:#9C9C98;text-decoration:line-through;">
          {baseline} usual fare
        </div>
        <div style="margin-top:12px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#6A6A67;">
          {airline} · {month}
        </div>
        <a href="{gf_url}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6D28FF;color:#F6F3EC;font-weight:700;font-size:16px;text-decoration:none;border-radius:999px;border:4px solid #0B0B0F;">
          Grab on Google Flights →
        </a>
        <p style="margin-top:16px;font-size:13px;color:#6A6A67;font-style:italic;">
          Penny found this one. Seats go fast — grab before the airline notices.
        </p>
      </div>
    </div>
    """

    payload = {
        "from": "Penny @ FlockFare <penny@flockfare.com>",
        "to": to_emails,
        "subject": subject,
        "html": html,
    }

    data = json.dumps(payload).encode()
    req = Request(
        "https://api.resend.com/emails",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "FlockFare/1.0",
        },
    )

    try:
        with urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            logger.info(f"  Email sent to {len(to_emails)} recipients: {result.get('id')}")
            return True
    except URLError as e:
        logger.error(f"  Resend API error: {e}")
        return False


# ─── Fan-out ────────────────────────────────────────────────

def notify_deal(deal: dict, subscriber_emails: list[str] | None = None) -> dict:
    """Send deal alert to all configured channels.

    Returns dict with channel: success status.
    """
    results = {}

    # Telegram
    results["telegram"] = send_telegram_deal(deal)

    # Email
    if subscriber_emails:
        results["email"] = send_email_deal(deal, subscriber_emails)
    else:
        results["email"] = False

    sent = [ch for ch, ok in results.items() if ok]
    if sent:
        logger.info(f"  Notified via: {', '.join(sent)}")
    else:
        logger.debug("  No notification channels configured")

    return results
