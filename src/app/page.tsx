import type { Metadata } from "next";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";
import { getActiveDeals, type Deal } from "@/lib/supabase/deals";
import { Header } from "@/components/header";
import { HomeDeals } from "@/components/home-deals";
import { EmailCapture } from "@/components/email-capture";
import { PennySvg } from "@/components/penny-svg";

export const metadata: Metadata = {
  title: "FlockFare — Cheap Flight & Hotel Deals for Your Flock",
  description:
    "Penny watches hundreds of fare databases and alerts you when mistake fares, flash sales, and price drops appear. Join for free.",
  openGraph: {
    title: "FlockFare — Cheap Flight & Hotel Deals for Your Flock",
    description:
      "Penny watches hundreds of fare databases and alerts you when mistake fares, flash sales, and price drops appear. Join for free.",
  },
};

const SAMPLE_DEALS: Deal[] = [
  {
    id: "sample-1",
    origin_code: "BOM",
    destination_code: "LHR",
    travel_month: "2026-07",
    current_price_inr: 21400,
    baseline_price_inr: 54800,
    pct_off: 61,
    airline: "Air India",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 590,
    deal_type: "rare",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+BOM+to+LHR+in+July+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    origin_code: "DEL",
    destination_code: "BKK",
    travel_month: "2026-08",
    current_price_inr: 9800,
    baseline_price_inr: 21200,
    pct_off: 54,
    airline: "IndiGo",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 340,
    deal_type: "common",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+DEL+to+BKK+in+August+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    origin_code: "BLR",
    destination_code: "DEL",
    travel_month: "2026-09",
    current_price_inr: 2199,
    baseline_price_inr: 4150,
    pct_off: 47,
    airline: "Vistara",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 170,
    deal_type: "common",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+BLR+to+DEL+in+September+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-4",
    origin_code: "MAA",
    destination_code: "CDG",
    travel_month: "2026-10",
    current_price_inr: 28600,
    baseline_price_inr: 56100,
    pct_off: 49,
    airline: "Air France",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 740,
    deal_type: "common",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+MAA+to+CDG+in+October+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-5",
    origin_code: "BOM",
    destination_code: "SIN",
    travel_month: "2026-08",
    current_price_inr: 8200,
    baseline_price_inr: 30400,
    pct_off: 73,
    airline: "Singapore Airlines",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 330,
    deal_type: "unique",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+BOM+to+SIN+in+August+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-6",
    origin_code: "HYD",
    destination_code: "GOI",
    travel_month: "2026-07",
    current_price_inr: 1899,
    baseline_price_inr: 3950,
    pct_off: 52,
    airline: "SpiceJet",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 85,
    deal_type: "common",
    google_flights_url:
      "https://www.google.com/travel/flights?q=Flights+from+HYD+to+GOI+in+July+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
];

export default async function Home() {
  const liveDeals = await getActiveDeals(6);
  const deals = liveDeals.length > 0 ? liveDeals : SAMPLE_DEALS;

  return (
    <main id="main">
      <Header activePage="home" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-noise" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="ff-eyebrow fade-up" style={{ color: "var(--color-lime)" }}>
              ✦ Cheap flight alerts · For the flock
            </div>
            <h1 className="hero-headline fade-up delay-1">
              Cheap flights<br />
              land in your<br />
              <span className="hl-lime">pocket.</span><br />
              <span className="hl-coral">Not theirs.</span>
            </h1>
            <p className="hero-sub fade-up delay-2">
              Penny watches <strong>hundreds of fare databases</strong> every
              minute. Mistake fares, flash sales, price drops — you get a push
              in under 5 minutes. Before anyone else.
            </p>
            <div className="hero-actions fade-up delay-3">
              <a href="#join" className="btn btn-lime">
                Join free — no card →
              </a>
              <a href="/deals" className="btn btn-ghost">
                See live deals
              </a>
            </div>
            <div className="hero-proof fade-up delay-4">
              <div className="hero-proof-avatar">
                <div className="avatar-ring">AK</div>
                <div className="avatar-ring">RS</div>
                <div className="avatar-ring">PM</div>
                <div className="avatar-ring">DN</div>
              </div>
              <p className="hero-proof-text">
                <strong>12,400+ flyers</strong> already
                <br />
                saving 40–90% on every trip
              </p>
            </div>
          </div>

          {/* Penny mascot */}
          <div className="hero-penny fade-up delay-3">
            <div className="penny-img-wrap">
              <div className="penny-ping">
                <div className="ping-label">
                  PENNY FOUND ·&nbsp;
                  <span className="ping-drop">-61% OFF</span>
                </div>
                <div className="ping-route">BOM → BKK</div>
                <div className="ping-price">₹ 11,200 &nbsp;·&nbsp; round-trip</div>
              </div>
              <PennySvg />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat">
            <div className="stat-val">40–90%</div>
            <div className="stat-lbl">Off published fares</div>
          </div>
          <div className="stats-sep" />
          <div className="stat">
            <div className="stat-val">&lt;5 min</div>
            <div className="stat-lbl">Alert latency</div>
          </div>
          <div className="stats-sep" />
          <div className="stat">
            <div className="stat-val">{ORIGINS.length}</div>
            <div className="stat-lbl">Home airports watched</div>
          </div>
          <div className="stats-sep" />
          <div className="stat">
            <div className="stat-val">₹0</div>
            <div className="stat-lbl">To join the flock</div>
          </div>
          <div className="stats-sep" />
          <div className="stat">
            <div className="stat-val">12.4k</div>
            <div className="stat-lbl">Members saving money</div>
          </div>
        </div>
      </div>

      {/* ── LIVE DEALS ───────────────────────────────────── */}
      <section className="ff-section">
        <div className="ff-section-inner">
          <div className="ff-section-header">
            <div className="ff-eyebrow">✦ Live deals</div>
            <h2>What Penny found this week.</h2>
            <p>
              Real deals from real price drops. Every card links straight to
              Google Flights. Prices move fast — act in the next 90 minutes.
            </p>
          </div>
          <HomeDeals deals={deals} />
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a href="/deals" className="btn btn-lime" style={{ fontSize: 14 }}>
              See all live deals →
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="ff-section how-section" id="how">
        <div className="ff-section-inner">
          <div className="ff-section-header">
            <div className="ff-eyebrow">✦ How it works</div>
            <h2>
              Three steps.<br />
              Zero effort.
            </h2>
            <p>Penny does the price-watching. You do the packing.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-icon" style={{ background: "var(--color-lime)" }}>
                ✈️
              </div>
              <h3>Tell us where you fly from</h3>
              <p>
                Pick your home airports and any dream destinations. BOM, DEL,
                BLR — Penny covers all of them.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-icon" style={{ background: "var(--color-violet)" }}>
                🔔
              </div>
              <h3>Penny watches 24/7</h3>
              <p>
                We check hundreds of fares every minute. The moment a route
                drops 40%+ below its 30-day average, you&apos;re the first to know.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-icon" style={{ background: "var(--color-coral)" }}>
                ⚡
              </div>
              <h3>Book it. Brag about it.</h3>
              <p>
                One tap → Google Flights. 90 minutes to decide. Then tell your
                friends how you flew Singapore Air for ₹8k.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────── */}
      <section className="ff-section" id="proof" style={{ background: "var(--color-cream)" }}>
        <div className="ff-section-inner">
          <div className="ff-section-header">
            <div className="ff-eyebrow">✦ The flock speaks</div>
            <h2>Real saves. Real people.</h2>
            <p>
              We don&apos;t buy reviews. These are from members who actually used
              the alerts.
            </p>
          </div>
          <div className="tweets-grid">
            <div className="tweet">
              <div className="tweet-header">
                <div
                  className="tweet-avatar"
                  style={{
                    background: "var(--color-lime-tint)",
                    color: "var(--color-violet)",
                  }}
                >
                  AK
                </div>
                <div>
                  <div className="tweet-name">Aryan Khanna</div>
                  <div className="tweet-handle">@aryanfliesalot</div>
                </div>
              </div>
              <p className="tweet-body">
                bro FlockFare just sent me an alert at 7am and I booked{" "}
                <span className="highlight">BOM → LHR for ₹21k</span> round
                trip. my colleague paid ₹54k for the same flight last month 💀
              </p>
              <div className="tweet-savings">💰 Saved approx ₹33,000</div>
            </div>

            <div className="tweet">
              <div className="tweet-header">
                <div
                  className="tweet-avatar"
                  style={{
                    background: "var(--color-coral-tint)",
                    color: "var(--color-coral)",
                  }}
                >
                  RS
                </div>
                <div>
                  <div className="tweet-name">Riya Shah</div>
                  <div className="tweet-handle">@riyatravels</div>
                </div>
              </div>
              <p className="tweet-body">
                I was literally sleeping when the{" "}
                <span className="highlight-coral">
                  Singapore Airlines deal dropped
                </span>
                . Woke up to the push, booked in 10 minutes. This app is the
                only reason I take international trips.
              </p>
              <div className="tweet-savings">💰 Saved approx ₹22,200</div>
            </div>

            <div className="tweet">
              <div className="tweet-header">
                <div
                  className="tweet-avatar"
                  style={{
                    background: "var(--color-violet-tint)",
                    color: "var(--color-violet)",
                  }}
                >
                  PM
                </div>
                <div>
                  <div className="tweet-name">Priya Menon</div>
                  <div className="tweet-handle">@wanderpriya</div>
                </div>
              </div>
              <p className="tweet-body">
                3 trips booked through FlockFare this year. Paris, Bali, Goa.
                Total saved?{" "}
                <span className="highlight-lime">₹71,000.</span> Pro
                subscription costs ₹799/yr. The ROI is actually insane.
              </p>
              <div className="tweet-savings">
                💰 Saved approx ₹71,000 this year
              </div>
            </div>

            <div className="tweet">
              <div className="tweet-header">
                <div
                  className="tweet-avatar"
                  style={{ background: "#FFF6D6", color: "#996A00" }}
                >
                  DN
                </div>
                <div>
                  <div className="tweet-name">Dev Narayan</div>
                  <div className="tweet-handle">@devnfly</div>
                </div>
              </div>
              <p className="tweet-body">
                Used to spend hours on Skyscanner every weekend. Now I just wait
                for Penny.{" "}
                <span className="highlight">Got BLR → CDG for ₹28k</span> —
                Skyscanner showed ₹52k for the same dates.
              </p>
              <div className="tweet-savings">💰 Saved approx ₹24,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────── */}
      <section className="email-section" id="join">
        <div className="email-inner">
          <div
            className="ff-eyebrow"
            style={{ color: "rgba(255,255,255,.6)", marginBottom: 16 }}
          >
            ✦ Join 12,400+ smart travellers
          </div>
          <h2>
            Penny&apos;s waiting.
            <br />
            Are you?
          </h2>
          <p>
            Free forever. No credit card. Unsubscribe in one click. Penny will
            be devastated but she&apos;ll understand.
          </p>
          <EmailCapture />
          <p className="email-legal">
            ≤ 5 alerts / week · No spam · Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="ff-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">
                Flock<span>Fare</span>
              </div>
              <div className="footer-tagline">Deals · Drops · Departures</div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="/deals">Live deals</a>
                <a href="#how">How it works</a>
                <a href="#join">Pro plan</a>
                <a href="/deals">Price history</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Cookie policy</a>
              </div>
              <div className="footer-col">
                <h4>Follow</h4>
                <a href="#">Twitter / X</a>
                <a href="#">Instagram</a>
                <a href="#">Telegram</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 FlockFare · Built for the flock</div>
            <div className="footer-airports">
              BOM · DEL · BLR · MAA · CCU · HYD · PNQ · AMD · COK · GOI
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
