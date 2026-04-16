"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ReferenceDot, CartesianGrid,
} from "recharts";
import { Header } from "@/components/header";

type Range = "90d" | "30d" | "6m";
type PricePoint = { day: number; label: string; price: number };

const BASELINE = 54200;
const DEAL_PRICE = 21400;

const FM: CSSProperties = { fontFamily: "var(--font-mono)" };
const FD: CSSProperties = { fontFamily: "var(--font-display)" };

/** Deterministic layered-sine price history (stable between renders). */
function generatePrices(days: number): PricePoint[] {
  const out: PricePoint[] = [];
  const now = new Date("2026-04-16T00:00:00Z");
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const noise =
      Math.sin(i * 0.3) * 5000 +
      Math.sin(i * 0.13) * 3000 +
      Math.cos(i * 0.07) * 1800;
    const price = Math.round(Math.max(38000, 54000 + noise));
    out.push({ day: days - i, label, price });
  }
  out[out.length - 1].price = DEAL_PRICE;
  return out;
}

const inr = (n: number) => `\u20B9${n.toLocaleString("en-IN")}`;
const inrShort = (n: number) => `\u20B9${Math.round(n / 1000)}k`;

export default function DealPage() {
  const [secondsLeft, setSecondsLeft] = useState(82 * 60);
  const [saved, setSaved] = useState(false);
  const [alertOn, setAlertOn] = useState(false);
  const [range, setRange] = useState<Range>("90d");

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const chartData = useMemo<PricePoint[]>(() => {
    const days = range === "30d" ? 30 : range === "6m" ? 180 : 90;
    return generatePrices(days);
  }, [range]);
  const lastIdx = chartData.length - 1;

  return (
    <>
      <Header activePage="deals" />

      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <Link href="/deals">Deals</Link>
        <span className="sep">›</span>
        <Link href="/deals">Europe</Link>
        <span className="sep">›</span>
        <span className="current">BOM → LHR · Rare deal</span>
      </div>

      {/* HERO */}
      <div className="deal-hero">
        <div className="deal-hero-inner">
          <div className="hero-top">
            <span className="deal-type-badge badge-rare-detail">
              🔥 RARE DEAL · -61% OFF BASELINE
            </span>
            <div className="countdown-wrap">
              <span className="live-dot" />
              <span style={{ marginRight: 4 }}>Expires in</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div className="cd-block">{hh}</div>
                <span className="cd-sep">:</span>
                <div className="cd-block">{mm}</div>
                <span className="cd-sep">:</span>
                <div className="cd-block">{ss}</div>
              </div>
            </div>
          </div>

          <div className="route-display">
            <div className="route-airports">
              <div className="airport-block">
                <div className="airport-code-xl">BOM</div>
                <div className="airport-city-label">Mumbai</div>
              </div>
              <div className="route-arrow-wrap">
                <div className="plane-icon">✈</div>
                <div className="route-arrow-line" />
                <div style={{ ...FM, fontSize: 10, color: "rgba(246,243,236,.3)", marginTop: 5, letterSpacing: ".1em" }}>
                  9H 50M · DIRECT
                </div>
              </div>
              <div className="airport-block">
                <div className="airport-code-xl" style={{ color: "var(--color-lime)" }}>LHR</div>
                <div className="airport-city-label">London</div>
              </div>
            </div>
          </div>

          <div className="price-block">
            <div className="price-main">
              ₹21,400<span className="unit">round-trip</span>
            </div>
            <div className="price-was">
              <span className="price-struck">₹54,800 baseline</span>
              <span className="pct-badge">-61% OFF</span>
            </div>
            <div className="price-note">
              ECONOMY · AIR INDIA · PRICE VERIFIED 3 MIN AGO · TAXES INCLUDED
            </div>
          </div>

          <div className="hero-actions-detail">
            <button className="btn-book" onClick={() => window.open("https://www.google.com/flights", "_blank")}>
              ✈ Book on Google Flights
            </button>
            <button
              onClick={() => setSaved((v) => !v)}
              style={{
                ...FD, fontWeight: 700, fontSize: 15,
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 24px", borderRadius: 999, background: "transparent",
                color: saved ? "var(--color-lime)" : "var(--color-cream)",
                border: `4px solid ${saved ? "var(--color-lime)" : "rgba(246,243,236,.3)"}`,
                cursor: "pointer", transition: "all .12s",
              }}
            >
              {saved ? "♥ Saved!" : "♡ Save deal"}
            </button>
            <button
              style={{
                ...FD, fontWeight: 700, fontSize: 15,
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 20px", borderRadius: 999, background: "transparent",
                color: "rgba(246,243,236,.5)", border: "4px solid rgba(246,243,236,.15)",
                cursor: "pointer",
              }}
            >
              ↗ Share
            </button>
          </div>
        </div>
      </div>
      <div className="hero-lime-bar" />

      {/* PAGE BODY */}
      <div
        className="detail-page-body"
        style={{
          maxWidth: 1200, margin: "0 auto", padding: "36px 40px",
          display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          {/* CHART */}
          <div className="detail-card">
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ 90-day price history</div>
                <h2>This deal vs the baseline</h2>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["90d", "30d", "6m"] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    style={{
                      ...FM, fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                      padding: "6px 14px", borderRadius: 999,
                      border: "2.5px solid var(--color-ink)",
                      background: range === r ? "var(--color-ink)" : "var(--color-paper)",
                      color: range === r ? "var(--color-lime)" : "var(--color-ink)",
                      cursor: "pointer",
                    }}
                  >
                    {r === "90d" ? "90 days" : r === "30d" ? "30 days" : "6 months"}
                  </button>
                ))}
              </div>
            </div>
            <div className="detail-card-body">
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 6, left: 0 }}>
                    <CartesianGrid stroke="rgba(11,11,15,.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--color-ffgray-500)" }}
                      axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={32}
                    />
                    <YAxis
                      orientation="right"
                      tickFormatter={inrShort}
                      tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--color-ffgray-500)" }}
                      axisLine={false} tickLine={false} width={48} domain={[18000, 66000]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-ink)", border: "none", borderRadius: 10,
                        fontFamily: "var(--font-mono)", fontSize: 12, color: "#fff", padding: 12,
                      }}
                      labelStyle={{ color: "rgba(246,243,236,.5)", fontSize: 11 }}
                      formatter={(value, _n, item) => {
                        const isDeal = (item as { payload?: PricePoint })?.payload?.day === lastIdx;
                        return [`${isDeal ? "🔥 Deal: " : "Fare: "}${inr(Number(value))}`, ""];
                      }}
                      separator=""
                    />
                    <ReferenceLine y={BASELINE} stroke="var(--color-violet)" strokeDasharray="6 4" strokeWidth={2} />
                    <Line
                      type="monotone" dataKey="price"
                      stroke="var(--color-ffgray-300)" strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, fill: "var(--color-violet)", stroke: "var(--color-ink)", strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                    <ReferenceDot
                      x={chartData[lastIdx].label} y={DEAL_PRICE} r={7}
                      fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth={2}
                      ifOverflow="extendDomain"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                <LegendDot color="var(--color-ffgray-300)" label="Historical fares" />
                <LegendDot color="var(--color-violet)" label="90-day baseline" />
                <LegendDot color="var(--color-coral)" label="Today's deal price" />
              </div>

              <div
                style={{
                  marginTop: 14, padding: "12px 14px",
                  background: "var(--color-lime-tint)",
                  border: "2.5px solid var(--color-lime)",
                  borderRadius: 12, ...FM, fontSize: 11,
                  color: "var(--color-ink)", lineHeight: 1.5,
                }}
              >
                <strong style={{ fontWeight: 800 }}>Penny&apos;s read:</strong>{" "}
                BOM → LHR has been hovering around ₹52,000–₹58,000 for the past 90 days.
                Today&apos;s price of ₹21,400 is the lowest this route has ever been in
                our dataset — by a wide margin. This has mistake fare written all over it.
              </div>
            </div>
          </div>

          {/* FLIGHT DETAILS */}
          <div className="detail-card">
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ Flight details</div>
                <h2>Outbound · Return</h2>
              </div>
              <span style={{ ...FM, fontSize: 11, color: "rgba(246,243,236,.5)" }}>
                Air India · Economy
              </span>
            </div>
            <div className="detail-card-body" style={{ paddingTop: 18 }}>
              <Segment
                headerBg="var(--color-lime-tint)"
                title="Outbound — Mumbai to London"
                date="Tue 8 Jul 2026"
                depTime="01:15" depCode="BOM" depDate="Tue 8 Jul"
                arrTime="07:05" arrCode="LHR" arrDate="Tue 8 Jul"
                duration="9h 50m" stops="NON-STOP" stopsColor="var(--color-success)"
                meta={[
                  ["Flight", "AI 101"],
                  ["Aircraft", "Boeing 787-8"],
                  ["Class", "Economy", "violet"],
                  ["Baggage", "25kg included ✓", "green"],
                  ["Meal", "Included ✓", "green"],
                  ["Seat selection", "At check-in"],
                ]}
              />
              <Segment
                headerBg="var(--color-violet-tint)"
                title="Return — London to Mumbai"
                date="Sat 19 Jul 2026"
                depTime="14:30" depCode="LHR" depDate="Sat 19 Jul"
                arrTime="08:25" arrSuffix="+1" arrCode="BOM" arrDate="Sun 20 Jul"
                duration="8h 55m" stops="1 STOP · DEL"
                layover="⏱ 2h 10m layover in New Delhi (DEL) — no visa required for Indian passport"
                meta={[
                  ["Flight", "AI 112 / 802"],
                  ["Aircraft", "A320 + 787"],
                  ["Class", "Economy", "violet"],
                  ["Baggage", "25kg included ✓", "green"],
                  ["Self-transfer?", "No — one ticket ✓", "green"],
                  ["Transit visa", "Not required ✓", "green"],
                ]}
              />
            </div>
          </div>

          {/* FACTS */}
          <div className="detail-card">
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ Deal facts</div>
                <h2>The numbers</h2>
              </div>
            </div>
            <div className="detail-card-body">
              <div className="facts-grid">
                <FactTile tone="lime" label="You save" val="₹33,400" sub="vs 90-day baseline" />
                <FactTile tone="coral" label="Discount" val="-61%" sub="off ₹54,800 baseline" />
                <FactTile tone="cream" label="Deal type" val="🔥 Rare" valSize={17} sub="60–69% off · uncommon" />
                <FactTile tone="violet" label="Detected" val="3 min ago" valSize={17} valColor="var(--color-violet)" sub="by Penny's crawler" />
                <FactTile tone="cream" label="Historical low" val="₹21,400" sub="All-time lowest on record" />
                <FactTile tone="cream" label="Data points" val="847" sub="fares checked · 90 days" />
              </div>
            </div>
          </div>

          {/* PENNY */}
          <div className="detail-card">
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ Penny&apos;s take</div>
                <h2 style={{ color: "var(--color-cream)" }}>Should you book it?</h2>
              </div>
            </div>
            <div className="penny-advice">
              <div className="penny-avatar-circle">🐧</div>
              <div className="penny-bubble">
                <strong>Short answer: yes, right now.</strong>
                <br /><br />
                This is the lowest BOM → LHR fare we&apos;ve ever logged — by ₹6,000.
                Air India is a full-service carrier with one ticket on the return,
                no self-transfer, no transit visa drama. The return layover in Delhi
                is 2h10m — totally fine.
                <br /><br />
                At ₹21,400 round-trip with 25kg bags included, you&apos;re paying
                less than most BOM → DEL domestic fares. I&apos;d call this a mistake
                fare but I can&apos;t confirm it — so{" "}
                <strong>book before the airline notices</strong>. Prices this low
                disappear in hours, not days.
              </div>
            </div>
          </div>

          {/* GUIDE */}
          <div className="detail-card">
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ Mistake fare etiquette</div>
                <h2>How to not blow it</h2>
              </div>
            </div>
            <div className="detail-card-body">
              <GuideStep n={1} title="Book directly with the airline"
                body="Go to Google Flights → book via Air India's site directly. Airlines are more likely to honour mistake fares booked through their own channels than through OTAs like MakeMyTrip." />
              <GuideStep n={2} title="Don't call to confirm"
                body={`Seriously. Calling the airline to "confirm" the price tips them off and speeds up cancellation. Book, get your ticket email, then wait 24–48 hours.`} />
              <GuideStep n={3} title="Hold off on hotels and connections"
                body="Don't book non-refundable accommodation until your flight ticket is confirmed and 48 hours have passed. Use a credit card with chargeback protection." />
              <GuideStep n={4} title="Set expectations"
                body="There is no Indian consumer-protection law forcing airlines to honour mistake fares. It might get cancelled. If it does, you'll get a full refund. The upside is worth the risk." />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <div className="cta-card">
            <div className="cta-card-banner">
              <div className="cta-route-mini">
                BOM <span className="arr">→</span> LHR
              </div>
              <div className="cta-price-mini">
                ₹21,400<span className="unit"> rt</span>
              </div>
              <div className="cta-was">Was ₹54,800 · save ₹33,400</div>
            </div>
            <div className="cta-body">
              <div className="urgency-bar">
                <div style={{ fontSize: 18, flexShrink: 0 }}>⏰</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--color-coral)", fontWeight: 700 }}>
                    Expires in ~82 min.
                  </strong>{" "}
                  Mistake fares are pulled without notice. Book before the airline&apos;s pricing team wakes up.
                </div>
              </div>

              <CtaMetaRow k="Airline" v="Air India" />
              <CtaMetaRow k="Route type" v="Non-stop outbound ✓" green />
              <CtaMetaRow k="Baggage" v="25kg included ✓" green />
              <CtaMetaRow k="Self-transfer" v="None ✓" green />
              <CtaMetaRow k="Transit visa" v="Not required ✓" green />
              <CtaMetaRow k="Travel month" v="July 2026" />
              <CtaMetaRow k="Cabin" v="Economy" />

              <button
                className="btn-book-full"
                style={{ marginTop: 14 }}
                onClick={() => window.open("https://www.google.com/flights", "_blank")}
              >
                ✈ Book on Google Flights →
              </button>
              <button
                className="btn-alert-full"
                onClick={() => setAlertOn((v) => !v)}
                style={alertOn ? { background: "var(--color-lime-tint)", borderColor: "var(--color-lime)" } : undefined}
              >
                {alertOn ? "✓ Alert set — we'll ping you" : "🔔 Alert me if price drops more"}
              </button>

              <div
                style={{
                  ...FM, fontSize: 10, color: "var(--color-ffgray-400)",
                  lineHeight: 1.6, letterSpacing: ".04em",
                }}
              >
                Price verified by Penny 3 min ago. Fares update constantly — the deal may no
                longer be available by the time you click. We link to Google Flights; we
                don&apos;t sell tickets.{" "}
                <Link href="/" style={{ color: "var(--color-violet)" }}>Privacy policy</Link>.
              </div>

              <div className="share-row">
                <button className="share-btn" style={{ background: "var(--color-violet-tint)", color: "var(--color-violet)" }}>
                  Telegram
                </button>
                <button className="share-btn" style={{ background: "#dcfce7", color: "#166534" }}>
                  WhatsApp
                </button>
                <button className="share-btn" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                  X / Twitter
                </button>
              </div>
            </div>
          </div>

          <div className="detail-card" style={{ marginBottom: 0 }}>
            <div className="detail-card-head">
              <div>
                <div className="eyebrow">✦ From Mumbai</div>
                <h2>More deals</h2>
              </div>
            </div>
            <div className="detail-card-body" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
              <RelatedCard banner="rl" from="BOM" to="SIN" pct="-73%" price="₹8,200"
                meta="Singapore Airlines · Direct · Economy · MISTAKE FARE" />
              <RelatedCard banner="rc" from="BOM" to="CDG" pct="-62%" price="₹24,800"
                meta="Air France · 1 stop · Economy" />
              <RelatedCard banner="rv" from="BOM" to="KUL" pct="-44%" price="₹13,200"
                meta="Malaysia Airlines · Direct · Economy" />
              <Link
                href="/deals"
                style={{
                  display: "block", textAlign: "center", ...FM,
                  fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
                  color: "var(--color-violet)", padding: 8,
                }}
              >
                VIEW ALL 47 DEALS →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── sub-components ───────── */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ ...FM, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-ffgray-500)" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </div>
  );
}

type MetaTone = "green" | "violet";
type MetaRow = [string, string] | [string, string, MetaTone];

function Segment(props: {
  headerBg: string;
  title: string;
  date: string;
  depTime: string; depCode: string; depDate: string;
  arrTime: string; arrSuffix?: string; arrCode: string; arrDate: string;
  duration: string; stops: string; stopsColor?: string;
  layover?: string;
  meta: MetaRow[];
}) {
  const smallDate: CSSProperties = { ...FM, fontSize: 10, color: "var(--color-ffgray-400)", marginTop: 1 };
  return (
    <div className="flight-segment">
      <div className="segment-header" style={{ background: props.headerBg }}>
        <h3>{props.title}</h3>
        <span style={{ ...FM, fontSize: 11, color: "var(--color-ffgray-500)" }}>{props.date}</span>
      </div>
      <div className="segment-body">
        <div className="flight-row">
          <div className="flight-node">
            <div className="flight-time">{props.depTime}</div>
            <div className="flight-code-sm">{props.depCode}</div>
            <div style={smallDate}>{props.depDate}</div>
          </div>
          <div className="flight-line">
            <div className="flight-line-duration">{props.duration}</div>
            <div className="flight-line-bar" />
            <div className="flight-line-stops" style={props.stopsColor ? { color: props.stopsColor } : undefined}>
              {props.stops}
            </div>
          </div>
          <div className="flight-node">
            <div className="flight-time">
              {props.arrTime}
              {props.arrSuffix && (
                <span style={{ fontSize: 12, color: "var(--color-ffgray-400)" }}>{props.arrSuffix}</span>
              )}
            </div>
            <div className="flight-code-sm">{props.arrCode}</div>
            <div style={smallDate}>{props.arrDate}</div>
          </div>
        </div>
        {props.layover && <div className="layover-chip">{props.layover}</div>}
        <div className="flight-meta-grid">
          {props.meta.map(([label, value, tone]) => (
            <div key={label}>
              <div className="meta-label-sm">{label}</div>
              <div className={`meta-value-sm${tone ? ` ${tone}` : ""}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FactTile({
  tone, label, val, sub, valSize, valColor,
}: {
  tone: "lime" | "cream" | "violet" | "coral";
  label: string; val: string; sub: string;
  valSize?: number; valColor?: string;
}) {
  const valStyle: CSSProperties = {};
  if (valSize) valStyle.fontSize = valSize;
  if (valColor) valStyle.color = valColor;
  return (
    <div className={`fact-tile ${tone}`}>
      <div className="fact-label">{label}</div>
      <div className="fact-val" style={valStyle}>{val}</div>
      <div className="fact-sub">{sub}</div>
    </div>
  );
}

function GuideStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="guide-step">
      <div className="guide-num">{n}</div>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  );
}

function CtaMetaRow({ k, v, green }: { k: string; v: string; green?: boolean }) {
  return (
    <div className="cta-meta-row">
      <span className="cta-meta-key">{k}</span>
      <span className={`cta-meta-val${green ? " green" : ""}`}>{v}</span>
    </div>
  );
}

function RelatedCard({
  banner, from, to, pct, price, meta,
}: {
  banner: "rl" | "rc" | "rv";
  from: string; to: string; pct: string; price: string; meta: string;
}) {
  return (
    <div className="related-card">
      <div className={`related-banner ${banner}`}>
        <div className="related-route">
          {from} <span className="arr">→</span> {to}{" "}
          <span className="related-pct">{pct}</span>
        </div>
      </div>
      <div className="related-body">
        <div className="related-price">{price}</div>
        <div className="related-meta">{meta}</div>
      </div>
    </div>
  );
}
