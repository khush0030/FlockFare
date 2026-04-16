"""FlockFare notification system — Telegram + Email (Resend).

Templates based on flockfare-alert-templates.html design spec.
Three deal types: common (40%+ off), rare (60%+ off), unique (mistake fare).
"""

import os
import json
import logging
from html import escape as html_escape
from urllib.request import Request, urlopen
from urllib.error import URLError

logger = logging.getLogger(__name__)

# ─── Deal type config ──────────────────────────────────────

DEAL_TYPES = {
    "common": {
        "emoji": "✓",
        "label": "PRICE DROP",
        "tg_emoji": "🔵",
        "tg_label": "🔵 PRICE DROP",
        "banner_bg": "#D8FF3C",
        "banner_text": "rgba(11,11,15,.6)",
        "pct_bg": "#D8FF3C",
        "pct_color": "#0B0B0F",
        "urgent": False,
        "urgent_bg": "",
        "urgent_color": "",
        "urgent_text": "",
        "subject_tpl": "✓ {origin} → {dest} dropped to {price} (–{pct}% off) · FlockFare",
        "penny_email": (
            '"This one\'s real. I\'ve been watching this route for 90 days '
            'and {price} is the lowest I\'ve ever seen it — by ₹6,000. '
            '{airline}, direct outbound. Book before the airline\'s pricing '
            'team wakes up. — Penny"'
        ),
        "penny_tg": "Penny found this one. Grab before it disappears.",
    },
    "rare": {
        "emoji": "🔥",
        "label": "RARE DEAL",
        "tg_emoji": "🟡",
        "tg_label": "🟡 FLASH SALE",
        "banner_bg": "#FFF6D6",
        "banner_text": "#996a00",
        "pct_bg": "#FF4E64",
        "pct_color": "#fff",
        "urgent": True,
        "urgent_bg": "#FFF6D6",
        "urgent_color": "#996a00",
        "urgent_text": "RARE DEAL · {cabin} · EXPIRES IN ~3H · ACT FAST",
        "subject_tpl": "🔥 {origin} → {dest} · rare deal · {price} round-trip (–{pct}%)",
        "penny_email": (
            '"{airline} {cabin} from {origin_city} to {dest_city} at {pct}% off. '
            '{price} — less than a mid-range economy fare. This is the kind of deal '
            'people tell stories about. Book. Now. — Penny"'
        ),
        "penny_tg": "Penny found a rare one. Seats go fast — grab before the airline notices.",
    },
    "unique": {
        "emoji": "⚡",
        "label": "MISTAKE FARE",
        "tg_emoji": "🔴",
        "tg_label": "🔴 MISTAKE FARE",
        "banner_bg": "#FF4E64",
        "banner_text": "rgba(255,255,255,.8)",
        "pct_bg": "#6D28FF",
        "pct_color": "#fff",
        "urgent": True,
        "urgent_bg": "#FFE5ED",
        "urgent_color": "#FF4E64",
        "urgent_text": "MISTAKE FARE · PRICING ERROR · EXPIRES IN ~90 MIN · ACT IMMEDIATELY",
        "subject_tpl": "⚡ MISTAKE FARE: {origin} → {dest} · {price} · –{pct}% · Act NOW",
        "penny_email": (
            '"This is a pricing error. {airline}, direct, {price} round-trip. '
            'The airline will fix this. You have 90 minutes, maybe less. '
            'Book directly on their site — not an OTA. Do not call to confirm. '
            'Go. — Penny"'
        ),
        "penny_tg": "PRICING ERROR. Book directly with the airline NOW. Do not wait.",
    },
}


def _deal_config(deal: dict) -> dict:
    """Get deal type config with fallback to common."""
    return DEAL_TYPES.get(deal.get("deal_type", "common"), DEAL_TYPES["common"])


def _format_fields(deal: dict) -> dict:
    """Extract and escape common deal fields."""
    origin = html_escape(deal["origin_code"])
    dest = html_escape(deal["destination_code"])
    price = f"₹{deal['current_price_inr']:,.0f}"
    baseline = f"₹{deal['baseline_price_inr']:,.0f}"
    pct = deal["pct_off"]
    airline = html_escape(deal.get("airline") or "Multiple airlines")
    month = html_escape(deal.get("travel_month", ""))
    cabin = html_escape(deal.get("cabin", "Economy"))
    stops = deal.get("stops", 0)
    stops_label = "Non-stop ✓" if stops == 0 else f"{stops} stop{'s' if stops > 1 else ''}"
    gf_url = html_escape(deal.get("google_flights_url", ""), quote=True)
    origin_city = html_escape(deal.get("origin_city", origin))
    dest_city = html_escape(deal.get("destination_city", dest))

    return {
        "origin": origin, "dest": dest, "price": price, "baseline": baseline,
        "pct": pct, "airline": airline, "month": month, "cabin": cabin,
        "stops_label": stops_label, "gf_url": gf_url,
        "origin_city": origin_city, "dest_city": dest_city,
    }


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
    """Send a formatted deal alert to the Telegram channel."""
    chat_id = os.environ.get("TELEGRAM_CHANNEL_ID")
    if not chat_id:
        logger.debug("TELEGRAM_CHANNEL_ID not set, skipping")
        return False

    cfg = _deal_config(deal)
    f = _format_fields(deal)

    text = (
        f"{cfg['tg_label']} · <b>{f['origin']} → {f['dest']}</b>\n"
        f"\n"
        f"<b>{f['price']}</b> round-trip\n"
        f"<s>{f['baseline']}</s> usual fare · <b>{f['pct']}% off</b>\n"
        f"\n"
        f"✈ {f['airline']} · {f['stops_label']} · {f['cabin']}\n"
        f"📅 {f['month']}\n"
        f"\n"
        f"<i>{cfg['penny_tg']}</i>"
    )

    # Inline keyboard with Google Flights deeplink
    reply_markup = None
    if f["gf_url"]:
        reply_markup = {
            "inline_keyboard": [[
                {"text": "✈ Book on Google Flights →", "url": f["gf_url"]},
            ]]
        }

    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    result = _tg_send("sendMessage", payload)

    if result and result.get("ok"):
        logger.info(f"  Telegram alert sent: {f['origin']}→{f['dest']} {f['pct']}% off")
        # Pin mistake fares to channel top
        if deal.get("deal_type") == "unique" and result.get("result", {}).get("message_id"):
            _tg_send("pinChatMessage", {
                "chat_id": chat_id,
                "message_id": result["result"]["message_id"],
                "disable_notification": True,
            })
        return True

    logger.warning(f"  Telegram send failed: {result}")
    return False


# ─── Email via Resend ───────────────────────────────────────

def _build_email_html(deal: dict) -> tuple[str, str]:
    """Build branded email HTML and subject line.

    Returns (subject, html) tuple.
    """
    cfg = _deal_config(deal)
    f = _format_fields(deal)

    # Subject line from deal-type template
    subject = cfg["subject_tpl"].format(**f)

    # Penny note with deal-specific fills
    penny_note = cfg["penny_email"].format(**f)

    # Urgency strip (rare + unique only)
    urgency_html = ""
    if cfg["urgent"]:
        urgent_text = cfg["urgent_text"].format(**f)
        urgency_html = f"""
      <div style="display:flex;align-items:center;gap:8px;padding:10px 24px;
                  font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
                  letter-spacing:0.1em;background:{cfg['urgent_bg']};
                  color:{cfg['urgent_color']};border-bottom:3px solid #0B0B0F;">
        <div style="width:7px;height:7px;border-radius:50%;background:{cfg['urgent_color']};flex-shrink:0;"></div>
        {html_escape(urgent_text)}
      </div>"""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'DM Sans',system-ui,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:20px 16px;">
<div style="background:#F6F3EC;border:4px solid #0B0B0F;border-radius:20px;overflow:hidden;">

  <!-- Urgency strip -->{urgency_html}

  <!-- Banner -->
  <div style="background:{cfg['banner_bg']};border-bottom:4px solid #0B0B0F;padding:20px 24px;">
    <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:28px;letter-spacing:-0.03em;line-height:1;color:#0B0B0F;">
      {f['origin']} <span style="color:#6D28FF;margin:0 6px;">→</span> {f['dest']}
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:6px;color:{cfg['banner_text']};">
      {cfg['emoji']} {cfg['label']}
    </div>
  </div>

  <!-- Content -->
  <div style="padding:24px;">
    <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:52px;letter-spacing:-0.04em;line-height:1;color:#0B0B0F;">
      {f['price']}<span style="font-size:16px;font-weight:400;color:#6A6A67;margin-left:4px;">/ round-trip</span>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#9C9C98;text-decoration:line-through;margin-top:5px;">
      Was {f['baseline']} · 90-day baseline
    </div>
    <div style="display:inline-flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;letter-spacing:0.1em;padding:5px 12px;border-radius:999px;margin-top:8px;background:{cfg['pct_bg']};color:{cfg['pct_color']};">
      -{f['pct']}% OFF BASELINE
    </div>

    <!-- Fact grid -->
    <div style="border:3px solid #0B0B0F;border-radius:12px;overflow:hidden;margin-top:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:10px 12px;border-right:2px solid #E2E2DD;border-bottom:2px solid #E2E2DD;width:50%;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;color:#6A6A67;text-transform:uppercase;margin-bottom:3px;">Airline</div>
            <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:13px;">{f['airline']}</div>
          </td>
          <td style="padding:10px 12px;border-bottom:2px solid #E2E2DD;width:50%;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;color:#6A6A67;text-transform:uppercase;margin-bottom:3px;">Route type</div>
            <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:13px;color:#00B775;">{f['stops_label']}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-right:2px solid #E2E2DD;width:50%;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;color:#6A6A67;text-transform:uppercase;margin-bottom:3px;">Cabin</div>
            <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:13px;">{f['cabin']}</div>
          </td>
          <td style="padding:10px 12px;width:50%;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;color:#6A6A67;text-transform:uppercase;margin-bottom:3px;">Travel month</div>
            <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:700;font-size:13px;">{f['month']}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Meta -->
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6A6A67;margin-top:14px;line-height:2.2;">
      · Price verified just now · links straight to Google Flights<br/>
      · No transit visa required on Indian passport
    </div>

    <!-- CTA -->
    <a href="{f['gf_url']}" style="display:block;margin:20px 0 0;text-align:center;padding:15px;border-radius:999px;font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:16px;color:#fff;background:#6D28FF;border:4px solid #0B0B0F;text-decoration:none;">
      ✈ Book on Google Flights →
    </a>
  </div>

  <!-- Penny sign-off -->
  <div style="padding:16px 24px;border-top:3px solid #E2E2DD;display:flex;align-items:center;gap:12px;">
    <div style="width:40px;height:40px;border-radius:50%;border:3px solid #0B0B0F;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">🐧</div>
    <div style="font-size:13px;color:#6A6A67;line-height:1.55;font-style:italic;">
      {html_escape(penny_note)}
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#0B0B0F;padding:16px 24px;text-align:center;">
    <div style="font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:900;font-size:16px;color:#F6F3EC;margin-bottom:6px;">
      Flock<span style="color:#D8FF3C;">Fare</span>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(246,243,236,.3);line-height:2;letter-spacing:0.06em;">
      flockfare.com · Unsubscribe · Alert preferences · Privacy
    </div>
  </div>

</div>
</div>
</body></html>"""

    return subject, html


def send_email_deal(deal: dict, to_emails: list[str]) -> bool:
    """Send a deal alert email via Resend API."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.debug("RESEND_API_KEY not set, skipping email")
        return False

    if not to_emails:
        return False

    subject, html = _build_email_html(deal)

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

    # Telegram fires first (instant for all tiers per spec)
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
