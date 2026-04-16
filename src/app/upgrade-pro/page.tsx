"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";

const MISSED = [
  { route: "BLR → NRT", pct: 71, price: "₹18,700", type: "Business" },
  { route: "BOM → LHR", pct: 61, price: "₹21,400", type: "Mistake fare" },
  { route: "DEL → SFO", pct: 58, price: "₹36,000", type: "Economy" },
  { route: "BOM → SIN", pct: 73, price: "₹8,200", type: "Mistake fare" },
  { route: "DEL → AMS", pct: 55, price: "₹24,800", type: "Economy" },
  { route: "BLR → CDG", pct: 62, price: "₹19,200", type: "Economy" },
  { route: "BOM → YYZ", pct: 48, price: "₹52,800", type: "Economy" },
  { route: "DEL → ICN", pct: 64, price: "₹14,900", type: "Business" },
];

const FAQS = [
  { q: "Does Pro really get alerts 4 hours earlier?", a: "Yes. When Penny detects a deal, we push it to Pro members immediately. Free members receive the same alert 4 hours later. On mistake fares that expire in 2–3 hours, free users never see them before they're gone." },
  { q: "What if I don't save anything in my first 7 days?", a: "Full refund, no questions asked. Email Penny at penny@flockfare.com within 7 days of upgrading. We'll process the refund within 24 hours. No forms, no hoops." },
  { q: "How is FlockFare different from Google Flights?", a: "Google Flights shows you prices when you search. FlockFare watches prices for you 24/7 and alerts you the moment something exceptional happens — you never need to search. We link to Google Flights for the actual booking." },
  { q: "Can I cancel my Pro subscription anytime?", a: "Yes. Cancel from your account settings with one click. If you cancel mid-cycle on the annual plan, you keep Pro until the end of your billing period. No penalty." },
  { q: "Does Pro include GST?", a: "Yes. ₹799/year and ₹99/month are inclusive of 18% GST. No surprises at checkout. Razorpay handles the payment securely." },
  { q: "What are \"mistake fares\" exactly?", a: "Airline pricing errors — a zero dropped from a fare, a wrong currency conversion, a stale filing. They're 70%+ below the normal price and live for hours, not days. Airlines sometimes cancel them but are increasingly honoring them. Pro members get these first." },
  { q: "What's the difference between Common, Rare, and Unique deals?", a: "Common: 40–59% off, appear regularly. Rare: 60–69% off, appear a few times a month. Unique: 70%+ off, mistake fares and premium-cabin drops — very rare, very good. Free plan shows Common and some Rare. Pro shows everything." },
  { q: "Can I share my Pro with family?", a: "One Pro account covers one email. But each family member can have their own free account, and if you upgrade theirs too, it's just ₹799/person — less than one coffee a month per traveller in the family." },
];

const FEATURES = [
  { icon: "⚡", bg: "var(--color-lime)", title: "Instant alerts", desc: "Free members get alerts 4 hours after Pro. Mistake fares expire in 2. On free, you're always too late for the best ones.", badge: "THE BIG ONE", badgeCls: "fb-lime" },
  { icon: "🔐", bg: "var(--color-violet-tint)", title: "Mistake fares (priority)", desc: "The rarest, wildest deals — pricing errors that vanish in hours. Pro members are first in. Free members never see them at all.", badge: "UNIQUE DEALS ONLY", badgeCls: "fb-violet" },
  { icon: "💼", bg: "var(--color-violet)", title: "Business & first class", desc: "When Singapore Airlines drops a business class fare from BLR to SIN by 71%, you want to know. Free plan only shows economy.", badge: "PREMIUM CABINS", badgeCls: "fb-violet" },
  { icon: "🏠", bg: "var(--color-sun-tint)", title: "Unlimited home airports", desc: "Free is limited to 1 airport. If you travel from BOM and your family flies from DEL, Pro covers every city you call home.", badge: "UNLIMITED", badgeCls: "fb-sun" },
  { icon: "✈", bg: "var(--color-lime-tint)", title: "Unlimited custom routes", desc: "Free gets 3. Pro gets unlimited. Watch BOM → GRU, DEL → AMS, BLR → HND — any specific route Penny doesn't cover by default.", badge: "UNLIMITED", badgeCls: "fb-lime" },
  { icon: "🏨", bg: "var(--color-coral-tint)", title: "Hotel deal alerts", desc: "Penny watches hotel prices too. Flash sales and drastic rate drops on curated properties across your watched destinations.", badge: "PRO EXCLUSIVE", badgeCls: "fb-coral" },
  { icon: "📊", bg: "var(--color-ffgray-100)", title: "90-day price charts", desc: "Every deal comes with a full 90-day fare chart so you can see exactly how exceptional the price really is — not just a crossed-out number.", badge: "FULL HISTORY", badgeCls: "fb-lime" },
];

const PROOF = [
  { initials: "AK", bg: "rgba(216,255,60,.15)", color: "var(--color-lime)", name: "Aryan Khanna", handle: "@aryanfliesalot · BOM", body: "Upgraded to Pro after missing a <span class=\"hi\">BOM → LHR mistake fare</span> that free users got 4 hours too late. Next month I caught a BLR → NRT business class at -71%. The subscription paid for itself 49x in one booking.", saved: "💰 ₹39,700 saved on one deal" },
  { initials: "RS", bg: "rgba(255,78,100,.15)", color: "var(--color-coral)", name: "Riya Shah", handle: "@riyatravels · DEL", body: "I travel 6x a year for work. Pro is genuinely the best ₹799 I spend annually. <span class=\"hi\">Caught a DEL → SFO business class at ₹1.1L</span> (usually ₹3.2L). That's more than 4 years of Pro in one booking.", saved: "💰 ₹2,10,000 saved in one booking" },
  { initials: "PM", bg: "rgba(109,40,255,.15)", color: "var(--color-violet)", name: "Priya Menon", handle: "@wanderpriya · BLR", body: "3 family trips this year — Paris, Bali, Tokyo. Total saved across all bookings? <span class=\"hi\">₹1,84,000.</span> Pro costs ₹799. The math is almost embarrassing. Penny is the best employee my family has.", saved: "💰 ₹1,84,000 saved across 3 family trips" },
  { initials: "DN", bg: "rgba(255,209,102,.15)", color: "var(--color-sun)", name: "Dev Narayan", handle: "@devnfly · IDR", body: "Was skeptical of paying for flight alerts. Tried Pro for a month (₹99). <span class=\"hi\">Caught a IDR → DXB deal at -68%</span> in week 1. Never looked back. The instant alerts are the real difference — everything good is gone by the time free users see it.", saved: "💰 ₹18,400 saved in first week of Pro" },
];

export default function UpgradeProPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [trips, setTrips] = useState(3);
  const [disc, setDisc] = useState(55);
  const [price, setPrice] = useState(45000);
  const [sticky, setSticky] = useState(false);
  const [totalSecs, setTotalSecs] = useState(4 * 86400 + 11 * 3600 + 22 * 60);

  useEffect(() => {
    const id = setInterval(() => setTotalSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const saving = Math.round(trips * (disc / 100) * price);
  const roi = Math.round(saving / 799);

  const scrollToCTA = () => {
    document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" });
  };

  const checkout = () => {
    alert("Razorpay checkout would open here in production.");
  };

  const priceMain = billing === "yearly" ? "₹799" : "₹99";
  const priceUnit = billing === "yearly" ? "/year" : "/month";
  const priceWas = billing === "yearly" ? "₹1,188 if billed monthly" : "₹799 if billed yearly";
  const priceSaving = billing === "yearly" ? "You save ₹389 vs monthly" : "Save ₹389 by switching to annual";

  return (
    <div className="upro-root">
      <Header />

      {/* HERO */}
      <section className="upro-hero">
        <div className="upro-hero-noise" />
        <div className="upro-hero-inner">
          <div className="upro-hero-left">
            <div className="upro-early-badge">⚡ Limited — Early flock pricing</div>
            <div className="upro-hero-eyebrow">✦ FlockFare Pro · Unlock everything</div>
            <h1 className="upro-hero-h1">
              Every deal Penny finds.<br />
              In your pocket<br />
              <span className="hl-lime">before anyone else</span><br />
              <span className="hl-coral">gets there.</span>
            </h1>
            <p className="upro-hero-sub">Free members get alerts 4 hours after Pro. On mistake fares that expire in 2 hours, that&apos;s not a delay — that&apos;s a miss. Upgrade once. Save ₹40,000+ every year.</p>
            <div className="upro-hero-actions">
              <button className="upro-btn-hero" onClick={scrollToCTA}>⚡ Upgrade to Pro · ₹799/year</button>
              <button className="upro-btn-ghost-hero" onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}>Compare plans →</button>
            </div>
            <div className="upro-hero-guarantee">✓ 7-day money-back · ✓ Cancel anytime · ✓ No hidden fees · ✓ GST included</div>
            <div className="upro-timer-label">EARLY PRICING ENDS IN</div>
            <div className="upro-timer-row">
              <div className="upro-timer-block">{pad(d)}</div><span className="upro-timer-sep">:</span>
              <div className="upro-timer-block">{pad(h)}</div><span className="upro-timer-sep">:</span>
              <div className="upro-timer-block">{pad(m)}</div><span className="upro-timer-sep">:</span>
              <div className="upro-timer-block">{pad(s)}</div>
            </div>
          </div>

          <div className="upro-price-card">
            <div className="upro-hpc-head">
              <div className="upro-hpc-eyebrow">✦ PRO BIRD PLAN</div>
              <div className="upro-hpc-name">FlockFare Pro</div>
              <div className="upro-bill-toggle">
                <button className={`upro-bill-opt ${billing === "monthly" ? "active" : ""}`} onClick={() => setBilling("monthly")}>Monthly</button>
                <button className={`upro-bill-opt ${billing === "yearly" ? "active" : ""}`} onClick={() => setBilling("yearly")}>Yearly · save 33%</button>
              </div>
            </div>
            <div className="upro-hpc-body">
              <div className="upro-hpc-price">{priceMain}<span className="unit">{priceUnit}</span></div>
              <div className="upro-hpc-was">{priceWas}</div>
              <div className="upro-hpc-saving">{priceSaving}</div>
              <div className="upro-hpc-features">
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>Instant alerts — no 4h delay</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>All deal types inc. mistake fares</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>Business &amp; first class deals</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>Unlimited home airports</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>Unlimited custom routes</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>Hotel deal alerts</div>
                <div className="upro-hpc-feat"><span className="ic ic-lime">✓</span>90-day price history charts</div>
                <div className="upro-hpc-feat"><span className="ic ic-violet">★</span>Priority support from Penny</div>
              </div>
              <button className="upro-btn-cta-card" onClick={checkout}>Upgrade now →</button>
              <div className="upro-hpc-legal">7-day money-back guarantee · GST included · Cancel anytime via your account settings</div>
            </div>
          </div>
        </div>
      </section>
      <div className="upro-hero-lime-bar" />

      {/* MISSED TICKER */}
      <div className="upro-missed">
        <div className="upro-missed-inner">
          <div className="upro-missed-label">🔐 PRO MEMBERS ONLY THIS WEEK</div>
          <div className="upro-missed-scroll">
            <div className="upro-missed-track">
              {[...MISSED, ...MISSED].map((d, i) => (
                <div key={i} className="upro-missed-chip">
                  {d.route} · <span className="upro-missed-pct">-{d.pct}%</span> · {d.price} · {d.type}
                </div>
              ))}
            </div>
          </div>
          <button className="upro-missed-cta" onClick={scrollToCTA}>Unlock all →</button>
        </div>
      </div>

      {/* ROI */}
      <section className="upro-section upro-roi">
        <div className="upro-section-inner">
          <div className="upro-roi-inner">
            <div className="upro-roi-left">
              <div className="upro-section-eyebrow" style={{ color: "var(--color-lime)" }}>✦ Do the math</div>
              <h2 className="upro-section-h2" style={{ color: "var(--color-cream)" }}>One trip pays for a whole year.</h2>
              <p className="upro-section-sub" style={{ color: "rgba(246,243,236,.5)" }}>The average FlockFare Pro member saves ₹62,000 in year one. Adjust the sliders to see your own ROI.</p>
            </div>
            <div>
              <div className="upro-roi-card">
                <div className="upro-roi-row">
                  <div className="upro-roi-label">Trips I take per year</div>
                  <div className="upro-roi-control-wrap">
                    <input type="range" min={1} max={10} value={trips} onChange={e => setTrips(parseInt(e.target.value))} />
                    <div className="upro-roi-value">{trips} trip{trips > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="upro-roi-row">
                  <div className="upro-roi-label">Avg. discount I&apos;d catch</div>
                  <div className="upro-roi-control-wrap">
                    <input type="range" min={30} max={75} step={5} value={disc} onChange={e => setDisc(parseInt(e.target.value))} />
                    <div className="upro-roi-value">{disc}%</div>
                  </div>
                </div>
                <div className="upro-roi-row">
                  <div className="upro-roi-label">Avg. ticket I&apos;d normally pay</div>
                  <div className="upro-roi-control-wrap">
                    <input type="range" min={15000} max={150000} step={5000} value={price} onChange={e => setPrice(parseInt(e.target.value))} />
                    <div className="upro-roi-value">₹{Math.round(price / 1000)}k</div>
                  </div>
                </div>
                <div className="upro-roi-result">
                  <div>
                    <div className="upro-roi-result-label">Estimated annual savings</div>
                    <div className="upro-roi-result-val">₹{saving.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="upro-roi-result-label">Pro costs you</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color: "var(--color-ink)" }}>₹799</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(11,11,15,.5)", marginTop: 2, letterSpacing: ".08em" }}>ROI: <span style={{ fontWeight: 800 }}>{roi}x</span></div>
                  </div>
                </div>
                <div className="upro-roi-note">Based on your inputs · Actual savings depend on deal availability</div>
              </div>
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button className="upro-roi-start" onClick={scrollToCTA}>Start saving →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="upro-section upro-features">
        <div className="upro-section-inner">
          <div className="upro-section-eyebrow">✦ What Pro unlocks</div>
          <h2 className="upro-section-h2">8 features. 0 excuses.</h2>
          <p className="upro-section-sub">Every feature Pro unlocks is designed around one thing: getting you the deal before it disappears.</p>
          <div className="upro-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="upro-feat-card">
                <div className="upro-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="upro-feat-title">{f.title}</div>
                <div className="upro-feat-desc">{f.desc}</div>
                <span className={`upro-feat-badge ${f.badgeCls}`}>{f.badge}</span>
              </div>
            ))}
            <div className="upro-feat-card dark">
              <div className="upro-feat-icon" style={{ background: "rgba(216,255,60,.15)", fontSize: 28 }}>🐧</div>
              <div className="upro-feat-title" style={{ color: "var(--color-cream)" }}>Priority Penny support</div>
              <div className="upro-feat-desc" style={{ color: "rgba(246,243,236,.5)" }}>Questions about a deal? Penny (and the team) respond to Pro members first. Usually within the hour on urgent deals.</div>
              <span className="upro-feat-badge" style={{ background: "var(--color-lime)", color: "var(--color-ink)" }}>PENNY-POWERED</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="upro-section upro-compare" id="compare">
        <div className="upro-section-inner">
          <div className="upro-section-eyebrow">✦ Full comparison</div>
          <h2 className="upro-section-h2">Free vs Pro — side by side.</h2>
          <p className="upro-section-sub">No marketing speak. Every row is a real feature, every cell is accurate.</p>
          <div className="upro-compare-wrap">
            <table className="upro-compare-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Feature</th>
                  <th style={{ width: "20%" }}>Free</th>
                  <th className="pro-col" style={{ width: "20%" }}>⚡ Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-category"><td colSpan={3}>Alerts &amp; timing</td></tr>
                <Row feat="Alert speed" free="4h delay" pro="INSTANT" proMode="text" />
                <Row feat="Common deals (40%+ off)" free="yes" pro="yes" />
                <Row feat="Rare deals (60%+ off)" free="yes" pro="yes" />
                <Row feat="Unique / mistake fares (70%+)" free="no" pro="PRIORITY ACCESS" proMode="text" />
                <Row feat="Business class deals" free="no" pro="yes" />
                <Row feat="First class deals" free="no" pro="yes" />
                <Row feat="Hotel deal alerts" free="no" pro="yes" />
                <tr className="row-category"><td colSpan={3}>Personalisation</td></tr>
                <Row feat="Home airports" free="1 airport" pro="UNLIMITED" proMode="text" />
                <Row feat="Custom watched routes" free="3 routes" pro="UNLIMITED" proMode="text" />
                <Row feat="Destination filters" free="yes" pro="yes" />
                <Row feat="Cabin class filter" free="Economy only" pro="ALL CLASSES" proMode="text" />
                <Row feat="Alert threshold control" free="yes" pro="yes" />
                <Row feat="Travel month filters" free="no" pro="yes" />
                <tr className="row-category"><td colSpan={3}>Data &amp; insights</td></tr>
                <Row feat="Live deals feed" free="yes" pro="yes" />
                <Row feat="Price history chart" free="7 days" pro="90 DAYS" proMode="text" />
                <Row feat="Price baseline data" free="no" pro="yes" />
                <Row feat="Savings tracker" free="yes" pro="yes" />
                <tr className="row-category"><td colSpan={3}>Notifications</td></tr>
                <Row feat="Email alerts" free="yes" pro="yes" />
                <Row feat="Telegram alerts" free="yes" pro="yes" />
                <Row feat="Browser push notifications" free="yes" pro="yes" />
                <Row feat="WhatsApp alerts" free="no" pro="yes" />
                <Row feat="Quiet hours + override" free="yes" pro="yes" />
                <tr className="row-category"><td colSpan={3}>Support</td></tr>
                <Row feat="Support response time" free="Best effort" pro="PRIORITY (<1h)" proMode="text" />
                <Row feat="Penny's personal notes" free="no" pro="yes" />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="upro-proof">
        <div className="upro-proof-inner">
          <div className="upro-proof-eyebrow">✦ The flock speaks</div>
          <h2 className="upro-section-h2" style={{ color: "var(--color-cream)", marginBottom: 6 }}>Real members. Real saves.</h2>
          <p style={{ fontSize: 15, color: "rgba(246,243,236,.45)", lineHeight: 1.65 }}>We don&apos;t buy reviews. These are from Pro members who booked real flights.</p>
          <div className="upro-proof-grid">
            {PROOF.map((p, i) => (
              <div key={i} className="upro-proof-card">
                <div className="upro-proof-header">
                  <div className="upro-proof-avatar" style={{ background: p.bg, color: p.color }}>{p.initials}</div>
                  <div>
                    <div className="upro-proof-name">{p.name}</div>
                    <div className="upro-proof-handle">{p.handle}</div>
                  </div>
                </div>
                <p className="upro-proof-body" dangerouslySetInnerHTML={{ __html: p.body }} />
                <div className="upro-proof-savings">{p.saved}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="upro-section upro-faq">
        <div className="upro-section-inner">
          <div className="upro-section-eyebrow">✦ Questions</div>
          <h2 className="upro-section-h2">The ones everyone asks.</h2>
          <div className="upro-faq-grid">
            {FAQS.map((f, i) => (
              <div key={i} className={`upro-faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="upro-faq-q">{f.q}<span className="upro-faq-arrow">+</span></div>
                <div className="upro-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="upro-final-cta" id="final-cta">
        <div className="upro-final-inner">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐧</div>
          <h2>Penny&apos;s waiting.<br />The deals aren&apos;t.</h2>
          <p>Every hour you&apos;re on the free plan, you&apos;re getting alerts 4 hours too late. Pro members are already booking. Join them.</p>
          <div className="upro-final-price-row">
            <div className="upro-fp-option">
              <div className="upro-fp-amount">₹799</div>
              <div className="upro-fp-period">PER YEAR</div>
              <div className="upro-fp-note">Best value · save ₹389</div>
            </div>
            <div className="upro-fp-sep">OR</div>
            <div className="upro-fp-option">
              <div className="upro-fp-amount" style={{ fontSize: 28 }}>₹99</div>
              <div className="upro-fp-period">PER MONTH</div>
              <div className="upro-fp-note">No commitment</div>
            </div>
          </div>
          <button className="upro-btn-final" onClick={checkout}>⚡ Upgrade to Pro now →</button>
          <div className="upro-final-guarantee">✓ 7-day money-back guarantee · ✓ GST included · ✓ Cancel anytime · ✓ Razorpay secure checkout</div>
        </div>
      </section>

      {/* STICKY BAR */}
      <div className={`upro-sticky-bar ${sticky ? "visible" : ""}`}>
        <div>
          <div className="upro-sticky-bar-text">⚡ FlockFare <span>Pro</span> — instant alerts, every deal</div>
          <div className="upro-sticky-bar-sub">You missed 6 Pro-only deals this month · Free members got them 4 hours too late</div>
        </div>
        <div className="upro-sticky-bar-right">
          <div className="upro-sticky-price">₹799<span className="per">/year</span></div>
          <button className="upro-btn-sticky" onClick={scrollToCTA}>Upgrade →</button>
        </div>
      </div>
    </div>
  );
}

function Row({ feat, free, pro, proMode }: { feat: string; free: string; pro: string; proMode?: "text" }) {
  const renderCell = (v: string, isPro: boolean) => {
    if (v === "yes") return <span className="check-yes">✓</span>;
    if (v === "no") return <span className="check-no">✗</span>;
    if (isPro && proMode === "text") return <span className="check-pro">{v}</span>;
    return v;
  };
  return (
    <tr>
      <td>{feat}</td>
      <td>{renderCell(free, false)}</td>
      <td className="pro-col-cell">{renderCell(pro, true)}</td>
    </tr>
  );
}
