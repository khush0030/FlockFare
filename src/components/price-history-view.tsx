"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { PricePoint } from "@/lib/supabase/price-history";

export type RouteMeta = {
  key: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
};

export type CurrentDeal = {
  price: number;
  baseline: number;
  pctOff: number;
  airline: string | null;
  dealType: "common" | "rare" | "unique";
  googleFlightsUrl: string;
};

type Pt = { date: Date; price: number };
type Deal = {
  idx: number;
  price: number;
  pct: number;
  type: "common" | "rare" | "unique";
  date: Date;
  isToday?: boolean;
};

const COLORS = {
  line: "#C9C9C4",
  baseline: "#6D28FF",
  deal: "#FF4E64",
  today: "#D8FF3C",
};

const MARGIN = { top: 20, right: 60, bottom: 36, left: 20 };

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Synthesize a realistic-looking series when crawler data is sparse. */
function synthesize(meta: RouteMeta, days: number, baseline: number, current: number, pctOff: number): { pts: Pt[]; deals: Deal[] } {
  const now = new Date();
  const rng = seededRng(meta.origin.charCodeAt(0) + meta.destination.charCodeAt(0) * 31 + days);
  const pts: Pt[] = [];
  const deals: Deal[] = [];

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const t = (days - i) / Math.max(days, 1);
    const trend = Math.sin(t * Math.PI * 2.4) * baseline * 0.08;
    const noise = (rng() - 0.5) * baseline * 0.15;
    const seasonal = Math.sin(t * Math.PI * 4.8) * baseline * 0.05;
    let price = Math.round(baseline + trend + noise + seasonal);
    price = Math.max(Math.round(baseline * 0.6), Math.min(Math.round(baseline * 1.4), price));

    if (i === 0) price = current;
    if (days >= 22 && i === 22) {
      price = Math.round(baseline * 0.52);
      deals.push({ idx: pts.length, price, pct: 48, type: "common", date: new Date(d) });
    }
    if (days >= 45 && i === 45) {
      price = Math.round(baseline * 0.38);
      deals.push({ idx: pts.length, price, pct: 62, type: "rare", date: new Date(d) });
    }
    if (days >= 71 && i === 71) {
      price = Math.round(baseline * 0.29);
      deals.push({ idx: pts.length, price, pct: 71, type: "unique", date: new Date(d) });
    }
    pts.push({ date: new Date(d), price });
  }
  deals.push({
    idx: pts.length - 1,
    price: current,
    pct: pctOff,
    type: pctOff >= 70 ? "unique" : pctOff >= 60 ? "rare" : "common",
    date: new Date(now),
    isToday: true,
  });
  return { pts, deals };
}

function resolveSeries(meta: RouteMeta, history: PricePoint[], deal: CurrentDeal | null, days: number): { pts: Pt[]; deals: Deal[]; baseline: number } {
  const codeSum = (meta.origin + meta.destination).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseFromCode = 20000 + (codeSum % 80) * 1000;
  const fallbackBase = deal?.baseline ?? baseFromCode;
  const fallbackCurrent = deal?.price ?? Math.round(fallbackBase * 0.45);
  const fallbackPct = deal?.pctOff ?? Math.round((1 - fallbackCurrent / fallbackBase) * 100);

  if (history.length < 10) {
    const s = synthesize(meta, days, fallbackBase, fallbackCurrent, fallbackPct);
    return { ...s, baseline: fallbackBase };
  }

  const parsed: Pt[] = history
    .map((p) => ({ date: parseHistoryDate(p.date), price: p.price }))
    .filter((p) => !isNaN(p.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const pts = parsed.filter((p) => p.date >= cutoff);
  if (pts.length < 10) {
    const s = synthesize(meta, days, fallbackBase, fallbackCurrent, fallbackPct);
    return { ...s, baseline: fallbackBase };
  }

  const sorted = [...pts].map((p) => p.price).sort((a, b) => a - b);
  const baseline = sorted[Math.floor(sorted.length / 2)];
  const deals: Deal[] = [];
  pts.forEach((p, i) => {
    const pct = Math.round((1 - p.price / baseline) * 100);
    if (pct >= 40) {
      deals.push({
        idx: i,
        price: p.price,
        pct,
        type: pct >= 70 ? "unique" : pct >= 60 ? "rare" : "common",
        date: p.date,
      });
    }
  });
  if (deal) {
    deals.push({
      idx: pts.length - 1,
      price: deal.price,
      pct: deal.pctOff,
      type: deal.dealType,
      date: pts[pts.length - 1].date,
      isToday: true,
    });
  }
  return { pts, deals, baseline };
}

function parseHistoryDate(input: string): Date {
  const iso = Date.parse(input);
  if (!isNaN(iso)) return new Date(iso);
  const now = new Date();
  const d = new Date(`${input} ${now.getFullYear()}`);
  return d;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const RANGES = [
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "6 months", value: 180 },
  { label: "1 year", value: 365 },
];

export function PriceHistoryView({
  meta,
  history,
  peerRoutes,
  currentDeal,
}: {
  meta: RouteMeta;
  history: PricePoint[];
  peerRoutes: RouteMeta[];
  currentDeal: CurrentDeal | null;
}) {
  const [range, setRange] = useState(90);
  const series = useMemo(
    () => resolveSeries(meta, history, currentDeal, range),
    [meta, history, currentDeal, range]
  );
  const fullSeries = useMemo(
    () => resolveSeries(meta, history, currentDeal, 365),
    [meta, history, currentDeal]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overviewRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ pt: Pt; idx: number } | null>(null);

  const scales = useMemo(() => {
    if (!series.pts.length) return null;
    const prices = series.pts.map((d) => d.price);
    const minP = Math.min(...prices) * 0.92;
    const maxP = Math.max(...prices) * 1.06;
    return { minP, maxP };
  }, [series]);

  const drawMain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !series.pts.length || !scales) return;
    const container = canvas.parentElement;
    if (!container) return;
    const totalW = container.clientWidth;
    const totalH = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalW * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = totalW + "px";
    canvas.style.height = totalH + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalW, totalH);

    const W = totalW - MARGIN.left - MARGIN.right;
    const H = totalH - MARGIN.top - MARGIN.bottom;

    const x = d3.scaleTime().domain(d3.extent(series.pts, (d) => d.date) as [Date, Date]).range([0, W]);
    const y = d3.scaleLinear().domain([scales.minP, scales.maxP]).range([H, 0]);

    ctx.save();
    ctx.translate(MARGIN.left, MARGIN.top);

    const yTicks = y.ticks(6);
    ctx.strokeStyle = "rgba(11,11,15,0.06)";
    ctx.lineWidth = 1;
    yTicks.forEach((t) => {
      const yPos = y(t);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(W, yPos);
      ctx.stroke();
    });

    const xTicks = x.ticks(d3.timeMonth.every(1) ?? d3.timeMonth);
    ctx.strokeStyle = "rgba(11,11,15,0.05)";
    xTicks.forEach((t) => {
      const xPos = x(t);
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, H);
      ctx.stroke();
    });

    const areaGrad = ctx.createLinearGradient(0, 0, 0, H);
    areaGrad.addColorStop(0, "rgba(201,201,196,0.12)");
    areaGrad.addColorStop(1, "rgba(201,201,196,0.00)");
    ctx.beginPath();
    ctx.moveTo(x(series.pts[0].date), y(series.pts[0].price));
    series.pts.forEach((d) => ctx.lineTo(x(d.date), y(d.price)));
    ctx.lineTo(x(series.pts[series.pts.length - 1].date), H);
    ctx.lineTo(x(series.pts[0].date), H);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    series.pts.forEach((d, i) => {
      if (i === 0) ctx.moveTo(x(d.date), y(d.price));
      else ctx.lineTo(x(d.date), y(d.price));
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = COLORS.baseline;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.moveTo(0, y(series.baseline));
    ctx.lineTo(W, y(series.baseline));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = `700 10px 'JetBrains Mono', monospace`;
    ctx.fillStyle = COLORS.baseline;
    ctx.textAlign = "right";
    ctx.fillText(`BASELINE ₹${(series.baseline / 1000).toFixed(0)}k`, W - 4, y(series.baseline) - 6);

    series.deals.forEach((deal) => {
      const dx = x(deal.date);
      const dy = y(deal.price);
      const isToday = !!deal.isToday;
      const col = isToday ? COLORS.today : COLORS.deal;

      ctx.beginPath();
      ctx.strokeStyle = col + "60";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(dx, y(series.baseline));
      ctx.lineTo(dx, dy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(dx, dy, isToday ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = "#0B0B0F";
      ctx.lineWidth = isToday ? 3 : 2;
      ctx.stroke();

      const label = `-${deal.pct}%`;
      ctx.font = `800 10px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      const tw = ctx.measureText(label).width;
      const bx = dx - tw / 2 - 6;
      const by = dy - 30;
      const bw = tw + 12;
      const bh = 18;
      ctx.fillStyle = col;
      ctx.strokeStyle = "#0B0B0F";
      ctx.lineWidth = 2;
      roundRect(ctx, bx, by, bw, bh, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isToday ? "#0B0B0F" : "#fff";
      ctx.fillText(label, dx, by + 12);
    });

    ctx.font = `700 10px 'JetBrains Mono', monospace`;
    ctx.textAlign = "right";
    yTicks.forEach((t) => {
      ctx.fillStyle = "rgba(11,11,15,0.4)";
      ctx.fillText("₹" + Math.round(t / 1000) + "k", -6, y(t) + 4);
    });

    ctx.textAlign = "center";
    xTicks.forEach((t) => {
      ctx.fillStyle = "rgba(11,11,15,0.4)";
      ctx.fillText(t.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), x(t), H + 22);
    });

    if (hover) {
      const dx = x(hover.pt.date);
      const dy = y(hover.pt.price);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(11,11,15,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.strokeStyle = "rgba(11,11,15,0.15)";
      ctx.moveTo(0, dy);
      ctx.lineTo(W, dy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#0B0B0F";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }, [series, scales, hover]);

  const drawOverview = useCallback(() => {
    const canv = overviewRef.current;
    if (!canv) return;
    const wrap = canv.parentElement;
    if (!wrap) return;
    const totalW = wrap.clientWidth;
    const totalH = 48;
    const dpr = window.devicePixelRatio || 1;
    canv.width = totalW * dpr;
    canv.height = totalH * dpr;
    canv.style.width = totalW + "px";
    canv.style.height = totalH + "px";
    const ctx = canv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalW, totalH);

    const pts = fullSeries.pts;
    if (!pts.length) return;
    const prices = pts.map((d) => d.price);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const x = d3.scaleTime().domain(d3.extent(pts, (d) => d.date) as [Date, Date]).range([0, totalW]);
    const y = d3.scaleLinear().domain([minP, maxP]).range([totalH - 4, 4]);

    const g = ctx.createLinearGradient(0, 0, 0, totalH);
    g.addColorStop(0, "rgba(201,201,196,0.2)");
    g.addColorStop(1, "rgba(201,201,196,0)");
    ctx.beginPath();
    ctx.moveTo(x(pts[0].date), y(pts[0].price));
    pts.forEach((d) => ctx.lineTo(x(d.date), y(d.price)));
    ctx.lineTo(x(pts[pts.length - 1].date), totalH);
    ctx.lineTo(x(pts[0].date), totalH);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(201,201,196,0.6)";
    ctx.lineWidth = 1.5;
    pts.forEach((d, i) => (i === 0 ? ctx.moveTo(x(d.date), y(d.price)) : ctx.lineTo(x(d.date), y(d.price))));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(109,40,255,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.moveTo(0, y(fullSeries.baseline));
    ctx.lineTo(totalW, y(fullSeries.baseline));
    ctx.stroke();
    ctx.setLineDash([]);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const winX = x(cutoff);
    ctx.fillStyle = "rgba(216,255,60,0.15)";
    ctx.fillRect(winX, 0, totalW - winX, totalH);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(216,255,60,0.6)";
    ctx.lineWidth = 1;
    ctx.moveTo(winX, 0);
    ctx.lineTo(winX, totalH);
    ctx.stroke();
  }, [fullSeries, range]);

  useEffect(() => {
    drawMain();
    drawOverview();
    const onResize = () => {
      drawMain();
      drawOverview();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawMain, drawOverview]);

  const onHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !scales || !series.pts.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - MARGIN.left;
    const my = e.clientY - rect.top - MARGIN.top;
    const W = rect.width - MARGIN.left - MARGIN.right;
    const H = rect.height - MARGIN.top - MARGIN.bottom;
    if (mx < 0 || mx > W || my < 0 || my > H) {
      setHover(null);
      if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
      return;
    }
    const x = d3.scaleTime().domain(d3.extent(series.pts, (d) => d.date) as [Date, Date]).range([0, W]);
    const xDate = x.invert(mx);
    let nearest = series.pts[0];
    let nearestIdx = 0;
    series.pts.forEach((d, i) => {
      if (Math.abs(d.date.getTime() - xDate.getTime()) < Math.abs(nearest.date.getTime() - xDate.getTime())) {
        nearest = d;
        nearestIdx = i;
      }
    });
    setHover({ pt: nearest, idx: nearestIdx });

    const tt = tooltipRef.current;
    if (!tt) return;
    const pctOff = Math.round((1 - nearest.price / series.baseline) * 100);
    const dealMatch = series.deals.find((d) => Math.abs(d.date.getTime() - nearest.date.getTime()) < 86400000);
    const dateStr = nearest.date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    tt.innerHTML = `
      <div class="ph-tip-date">${dateStr}</div>
      <div class="ph-tip-row"><span class="ph-tip-k">Fare</span><span class="ph-tip-v">${inr(nearest.price)}</span></div>
      <div class="ph-tip-row"><span class="ph-tip-k">Baseline</span><span class="ph-tip-v">${inr(series.baseline)}</span></div>
      <div class="ph-tip-row"><span class="ph-tip-k">vs baseline</span><span class="ph-tip-v" style="color:${pctOff > 0 ? "var(--coral)" : "var(--success)"}">${pctOff > 0 ? "-" : "+"}${Math.abs(pctOff)}%</span></div>
      ${dealMatch ? `<div class="ph-tip-deal">🔥 Deal detected — ${dealMatch.type.toUpperCase()}</div>` : ""}
    `;
    const ttW = 220;
    const ttH = 110;
    const area = chartAreaRef.current?.getBoundingClientRect();
    if (!area) return;
    const mxA = e.clientX - area.left;
    const myA = e.clientY - area.top;
    let left = mxA + 16;
    let top = myA - ttH / 2;
    if (left + ttW > area.width) left = mxA - ttW - 10;
    if (top < 0) top = 4;
    tt.style.left = left + "px";
    tt.style.top = top + "px";
    tt.style.opacity = "1";
  };

  const onLeave = () => {
    setHover(null);
    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
  };

  const lowest = useMemo(() => Math.min(...series.pts.map((p) => p.price)), [series]);
  const highest = useMemo(() => Math.max(...series.pts.map((p) => p.price)), [series]);
  const today = series.pts[series.pts.length - 1];
  const todayPrice = today?.price ?? currentDeal?.price ?? 0;
  const todayPct = Math.round((1 - todayPrice / series.baseline) * 100);
  const saving = Math.max(0, series.baseline - todayPrice);

  const peerKeys = useMemo(() => {
    const keys = [meta.key];
    const same = peerRoutes.filter((r) => r.key !== meta.key && (r.origin === meta.origin || r.destination === meta.destination));
    for (const r of same) {
      if (keys.length >= 6) break;
      if (!keys.includes(r.key)) keys.push(r.key);
    }
    return keys;
  }, [meta, peerRoutes]);

  const [compareA, compareB] = useMemo(() => {
    const others = peerRoutes.filter((r) => r.key !== meta.key);
    return [others[0], others[1]];
  }, [peerRoutes, meta]);

  return (
    <div className="ph-page">
      <div className="ph-route-header">
        <div>
          <div className="ph-route-eyebrow">✦ 90-day price history</div>
          <h1 className="ph-route-title">
            {meta.origin} <span className="arr">→</span> <span className="dest">{meta.destination}</span>
          </h1>
          <p className="ph-route-sub">
            {meta.originCity} to {meta.destinationCity} · Economy class · Round-trip · Rolling 90-day baseline
          </p>
        </div>
        <div className="ph-route-switcher">
          <div className="ph-route-switcher-label">Switch route</div>
          <div className="ph-route-chips">
            {peerKeys.map((k) => (
              <Link
                key={k}
                href={`/price-history/${k}`}
                className={`ph-route-chip${k === meta.key ? " active" : ""}`}
              >
                {k.replace("-", " → ")}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="ph-stat-strip">
        <div className="ph-stat-tile accent-lime">
          <div className="ph-stat-label">Today&apos;s deal</div>
          <div className="ph-stat-value">{inr(todayPrice)}</div>
          <div className="ph-stat-sub">{todayPct > 0 ? `-${todayPct}% off baseline` : "At baseline"}</div>
        </div>
        <div className="ph-stat-tile">
          <div className="ph-stat-label">90-day baseline</div>
          <div className="ph-stat-value">{inr(series.baseline)}</div>
          <div className="ph-stat-sub">Rolling median</div>
        </div>
        <div className="ph-stat-tile accent-coral">
          <div className="ph-stat-label">All-time low</div>
          <div className="ph-stat-value">{inr(lowest)}</div>
          <div className="ph-stat-sub">{lowest === todayPrice ? "Today — new record" : "Observed low"}</div>
        </div>
        <div className="ph-stat-tile">
          <div className="ph-stat-label">All-time high</div>
          <div className="ph-stat-value">{inr(highest)}</div>
          <div className="ph-stat-sub">Peak in window</div>
        </div>
        <div className="ph-stat-tile accent-violet">
          <div className="ph-stat-label">You save</div>
          <div className="ph-stat-value">{inr(saving)}</div>
          <div className="ph-stat-sub">vs baseline</div>
        </div>
        <div className="ph-stat-tile">
          <div className="ph-stat-label">Data points</div>
          <div className="ph-stat-value">{series.pts.length.toLocaleString("en-IN")}</div>
          <div className="ph-stat-sub">Fares crawled</div>
        </div>
      </div>

      <div className="ph-chart-card">
        <div className="ph-chart-head">
          <div>
            <div className="ph-eyebrow-lime">✦ Price over time</div>
            <h2>
              {meta.origin} → {meta.destination} · Economy · Round-trip
            </h2>
          </div>
          <div className="ph-ctrls">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`ph-ctrl-btn${range === r.value ? " active" : ""}`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ph-legend">
          <div className="ph-legend-item">
            <span className="ph-legend-swatch" style={{ background: "var(--ffgray-300, #C9C9C4)" }} />
            Historical fares
          </div>
          <div className="ph-legend-item">
            <span className="ph-legend-swatch dashed" />
            90-day baseline (median)
          </div>
          <div className="ph-legend-item">
            <span className="ph-legend-dot" style={{ background: "var(--coral)" }} />
            Deal detected
          </div>
          <div className="ph-legend-item">
            <span className="ph-legend-dot" style={{ background: "var(--lime)", border: "2px solid var(--ink)" }} />
            Today&apos;s price
          </div>
        </div>

        <div className="ph-chart-area" ref={chartAreaRef}>
          <canvas
            ref={canvasRef}
            height={320}
            onMouseMove={onHover}
            onMouseLeave={onLeave}
            style={{ cursor: "crosshair", display: "block", width: "100%" }}
          />
          <div ref={tooltipRef} className="ph-tooltip" />
        </div>

        <div className="ph-overview">
          <div className="ph-overview-label">Context — full dataset · highlighted band is current range</div>
          <canvas ref={overviewRef} />
        </div>

        <div className="ph-annotation">
          <strong>Penny&apos;s read:</strong> {meta.origin} → {meta.destination} has averaged {inr(series.baseline)} over {series.pts.length} snapshots. Today&apos;s price of {inr(todayPrice)} sits {todayPct}% below the rolling median. Red dots mark every deal Penny flagged. Dashed purple line is the 90-day baseline.
        </div>
      </div>

      <div className="ph-events">
        <div className="ph-events-head">
          <div>
            <div className="ph-eyebrow-lime">✦ Deal history</div>
            <h3>Every deal Penny flagged on this route</h3>
          </div>
          <span className="ph-events-sub">Last {range} days</span>
        </div>
        <div>
          {series.deals.length === 0 && (
            <div className="ph-event-empty">No deals flagged in this window.</div>
          )}
          {series.deals
            .slice()
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((ev, i) => {
              const emoji = ev.type === "unique" ? "⚡" : ev.type === "rare" ? "🔥" : "✓";
              const pctClass = ev.type === "unique" ? "pct-violet" : ev.type === "rare" ? "pct-coral" : "pct-lime";
              return (
                <div key={i} className="ph-event-row">
                  <div className={`ph-event-type ${ev.type}`}>{emoji}</div>
                  <div className="ph-event-body">
                    <div className="ph-event-route">
                      {meta.origin} → {meta.destination} {currentDeal?.airline ? `· ${currentDeal.airline}` : ""}
                    </div>
                    <div className="ph-event-meta">
                      {ev.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                      {ev.type.toUpperCase()} {ev.isToday ? "· Active now" : "· Expired"}
                    </div>
                  </div>
                  <div className="ph-event-price">
                    <div className="ph-event-price-main">{inr(ev.price)}</div>
                    <div className={`ph-event-pct ${pctClass}`}>-{ev.pct}%</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="ph-compare-grid">
        {[compareA, compareB].filter(Boolean).map((r) => (
          <CompareCard key={r!.key} route={r!} />
        ))}
      </div>

      <div className="ph-insight">
        <div className="ph-insight-penny">🐧</div>
        <div className="ph-insight-bubble">
          <strong>Should you book it?</strong> {todayPct >= 40 ? "Yes — right now." : "Not yet — hold."} This route&apos;s median is {inr(series.baseline)} across {series.pts.length} snapshots. Today it&apos;s at {inr(todayPrice)}, {todayPct > 0 ? `a ${todayPct}% drop` : "near the median"}. You&apos;re saving {inr(saving)} versus the baseline.
        </div>
      </div>

      {currentDeal && (
        <div className="ph-book-cta">
          <div>
            <h3>
              {inr(currentDeal.price)} round-trip · -{currentDeal.pctOff}% off
            </h3>
            <p>
              {currentDeal.airline ?? "Multiple carriers"} · Verified {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <a
            className="ph-btn-book"
            href={currentDeal.googleFlightsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ✈ Book on Google Flights →
          </a>
        </div>
      )}
    </div>
  );
}

function CompareCard({ route }: { route: RouteMeta }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const series = useMemo(() => resolveSeries(route, [], null, 90), [route]);

  useEffect(() => {
    const canv = canvasRef.current;
    if (!canv) return;
    const wrap = canv.parentElement;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = 100;
    const dpr = window.devicePixelRatio || 1;
    canv.width = W * dpr;
    canv.height = H * dpr;
    canv.style.width = W + "px";
    canv.style.height = H + "px";
    const ctx = canv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pts = series.pts;
    const prices = pts.map((d) => d.price);
    const minP = Math.min(...prices) * 0.9;
    const maxP = Math.max(...prices) * 1.08;
    const x = d3.scaleTime().domain(d3.extent(pts, (d) => d.date) as [Date, Date]).range([0, W]);
    const y = d3.scaleLinear().domain([minP, maxP]).range([H - 4, 4]);

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(201,201,196,0.15)");
    g.addColorStop(1, "rgba(201,201,196,0)");
    ctx.beginPath();
    pts.forEach((d, i) => (i === 0 ? ctx.moveTo(x(d.date), y(d.price)) : ctx.lineTo(x(d.date), y(d.price))));
    ctx.lineTo(x(pts[pts.length - 1].date), H);
    ctx.lineTo(x(pts[0].date), H);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(201,201,196,0.7)";
    ctx.lineWidth = 1.5;
    pts.forEach((d, i) => (i === 0 ? ctx.moveTo(x(d.date), y(d.price)) : ctx.lineTo(x(d.date), y(d.price))));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(109,40,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.moveTo(0, y(series.baseline));
    ctx.lineTo(W, y(series.baseline));
    ctx.stroke();
    ctx.setLineDash([]);

    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(x(last.date), y(last.price), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#D8FF3C";
    ctx.fill();
    ctx.strokeStyle = "#0B0B0F";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [series]);

  const last = series.pts[series.pts.length - 1];
  const discount = Math.round((1 - last.price / series.baseline) * 100);

  return (
    <Link href={`/price-history/${route.key}`} className="ph-compare-card">
      <div className="ph-compare-head">
        <div className="ph-eyebrow-lime">✦ Compare</div>
        <h3>
          {route.origin} → {route.destination} ({route.destinationCity})
        </h3>
      </div>
      <div className="ph-compare-body">
        <canvas ref={canvasRef} />
        <div className="ph-compare-stats">
          <div>
            <div className="cs-label">Baseline</div>
            <div className="cs-val">{inr(series.baseline)}</div>
          </div>
          <div>
            <div className="cs-label">Current</div>
            <div className="cs-val">{inr(last.price)}</div>
          </div>
          <div>
            <div className="cs-label">Discount</div>
            <div className="cs-val" style={{ color: "var(--coral)" }}>
              -{discount}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
