"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { DESTINATIONS, ORIGINS } from "@/config/watchlist";

// ── Types ─────────────────────────────────────────────────
type ThreshType = "common" | "rare" | "unique";
type FreqType = "1" | "3" | "5" | "daily" | "instant";
type PreviewTab = "push" | "email" | "telegram";
type CabinKey = "economy" | "premium" | "business" | "first";
type DestState = { code: string; city: string; region: string; flag: string; on: boolean };
type RouteItem = { id: string; from: string; to: string; meta: string; alerts: string };

// ── Constants ─────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  Thailand: "🇹🇭", Indonesia: "🇮🇩", Vietnam: "🇻🇳", Singapore: "🇸🇬", Malaysia: "🇲🇾",
  "Sri Lanka": "🇱🇰", Maldives: "🇲🇻", UAE: "🇦🇪", Turkey: "🇹🇷", Japan: "🇯🇵",
  "South Korea": "🇰🇷", "United Kingdom": "🇬🇧", France: "🇫🇷", Italy: "🇮🇹",
  Switzerland: "🇨🇭", USA: "🇺🇸", Canada: "🇨🇦", Australia: "🇦🇺", "New Zealand": "🇳🇿",
  India: "🇮🇳",
};

const INITIAL_ON = new Set<string>();
const REGION_ORDER = ["Southeast Asia","South Asia","Middle East","East Asia","Europe","North America","Oceania"];

const SIDEBAR_ITEMS: { id: string; icon: string; label: string; badge?: string }[] = [
  { id: "airports", icon: "🏠", label: "Home airports" },
  { id: "destinations", icon: "🌍", label: "Destinations" },
  { id: "threshold", icon: "⚡", label: "Alert threshold" },
  { id: "channels", icon: "🔔", label: "Channels", badge: "1 unverified" },
  { id: "frequency", icon: "🕐", label: "Frequency & quiet" },
  { id: "filters", icon: "🎚️", label: "Deal filters" },
  { id: "routes", icon: "✈️", label: "Custom routes" },
  { id: "preview", icon: "👁️", label: "Alert preview" },
];

const THRESH_CARDS = [
  { type: "common" as ThreshType, pct: "40%", pctColor: "var(--color-ffgray-500)", title: "Any deal", body: "All discounts 40%+ off baseline. ~3–5 alerts/week.", tagCls: "tag-lime", tag: "COMMON", activeCls: "active-c" },
  { type: "rare" as ThreshType, pct: "60%", pctColor: "var(--color-coral)", title: "Rare deals", body: "Exceptional drops only. ~1–2 per week.", tagCls: "tag-coral", tag: "RARE · RECOMMENDED", activeCls: "active-r" },
  { type: "unique" as ThreshType, pct: "70%", pctColor: "var(--color-violet)", title: "Mistake fares only", body: "Extreme drops. Act in minutes. Ultra-rare.", tagCls: "tag-violet", tag: "UNIQUE", activeCls: "active-u" },
];

const FREQ_BTNS: { k: FreqType; label: string }[] = [
  { k: "1", label: "1×/week" }, { k: "3", label: "3×/week" },
  { k: "5", label: "5×/week" }, { k: "daily", label: "Daily" },
];

const CABIN_OPTS: { k: CabinKey; label: string }[] = [
  { k: "economy", label: "Economy" }, { k: "premium", label: "Premium Economy" },
  { k: "business", label: "Business" }, { k: "first", label: "First Class" },
];

const STOP_OPTS: { k: "0"|"1"|"2"; label: string }[] = [
  { k: "0", label: "Non-stop only" }, { k: "1", label: "Up to 1 stop" }, { k: "2", label: "Up to 2 stops" },
];

// ── Shared inline styles ──────────────────────────────────
const mono = "var(--font-mono)";
const disp = "var(--font-display)";
const g500 = "var(--color-ffgray-500)";
const ink = "var(--color-ink)";
const lime = "var(--color-lime)";
const paper = "var(--color-paper)";
const coral = "var(--color-coral)";
const violet = "var(--color-violet)";
const brutSm = "var(--shadow-brut-sm)";
const brut = "var(--shadow-brut)";

const S = {
  h3: { fontFamily: disp, fontWeight: 700, fontSize: 15, marginBottom: 4 } as CSSProperties,
  pMeta: { fontSize: 13, color: g500 } as CSSProperties,
  pBody: { fontSize: 14, color: g500, marginBottom: 18, lineHeight: 1.6 } as CSSProperties,
  monoMeta: { fontFamily: mono, fontSize: 11, color: "rgba(246,243,236,.55)" } as CSSProperties,
  monoSmall: { fontFamily: mono, fontSize: 11, color: g500, letterSpacing: ".06em" } as CSSProperties,
  label: { fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: g500, marginBottom: 6 } as CSSProperties,
  select: { width: "100%", padding: "10px 14px", fontFamily: mono, fontSize: 12, border: `3px solid ${ink}`, borderRadius: 10, background: paper, boxShadow: brutSm, outline: "none", cursor: "pointer" } as CSSProperties,
  timeIn: { fontFamily: mono, fontSize: 12, padding: "7px 10px", border: `2.5px solid ${ink}`, borderRadius: 8, background: paper, outline: "none", width: 96 } as CSSProperties,
  routeIn: { flex: 1, minWidth: 120, fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: ".08em", padding: "10px 14px", border: `3px solid ${ink}`, borderRadius: 10, background: paper, boxShadow: brutSm, outline: "none", textTransform: "uppercase" } as CSSProperties,
  btnGhost: { fontFamily: disp, fontWeight: 700, fontSize: 13, padding: "10px 14px", borderRadius: 10, background: "transparent", color: g500, border: "3px solid var(--color-ffgray-200)", cursor: "pointer" } as CSSProperties,
  btnLime: { fontFamily: disp, fontWeight: 700, fontSize: 13, padding: "10px 16px", borderRadius: 10, background: lime, color: ink, border: `3px solid ${ink}`, boxShadow: brutSm, cursor: "pointer" } as CSSProperties,
  chLink: { fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: violet, cursor: "pointer", background: "none", border: "none" } as CSSProperties,
  regionLabel: { fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: g500, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 } as CSSProperties,
  toggleAll: { fontFamily: mono, fontSize: 10, fontWeight: 700, color: violet, cursor: "pointer", background: "none", border: "none", letterSpacing: ".08em" } as CSSProperties,
};

function Toggle({ checked, onChange, ml }: { checked: boolean; onChange: () => void; ml?: string }) {
  return (
    <label className="toggle" style={ml ? { marginLeft: ml } : undefined}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="toggle-track" /><div className="toggle-thumb" />
    </label>
  );
}

function SectionHead({ n, title, right }: { n: number; title: string; right?: React.ReactNode }) {
  return (
    <div className="section-head">
      <div>
        <div className="section-eyebrow">✦ Section {n}</div>
        <h2>{title}</h2>
      </div>
      {right}
    </div>
  );
}

export default function PreferencesPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";
  const initials = (userName || userEmail)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
  // ── State ───────────────────────────────────────────────
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSection, setActiveSection] = useState("airports");
  const [airports, setAirports] = useState<string[]>(["BOM", "DEL"]);
  const [showAddAirport, setShowAddAirport] = useState(false);
  const [newAirport, setNewAirport] = useState("");
  const [nearby, setNearby] = useState(false);
  const [dests, setDests] = useState<DestState[]>(() =>
    DESTINATIONS.map((d) => ({
      code: d.code, city: d.city, region: d.region ?? "Other",
      flag: COUNTRY_FLAGS[d.country] ?? "🌍", on: INITIAL_ON.has(d.code),
    }))
  );
  const [threshold, setThreshold] = useState<ThreshType>("rare");
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [tgOn, setTgOn] = useState(true);
  const [tgHandle, setTgHandle] = useState("");
  const [waOn, setWaOn] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [freq, setFreq] = useState<FreqType>("5");
  const [timezone, setTimezone] = useState("IST (UTC+5:30)");
  const [digestTime, setDigestTime] = useState("8:00 AM");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [quietOn, setQuietOn] = useState(true);
  const [overrideQuiet, setOverrideQuiet] = useState(true);
  const [cabins, setCabins] = useState<Record<CabinKey, boolean>>({
    economy: true, premium: true, business: true, first: false,
  });
  const [stops, setStops] = useState<"0" | "1" | "2">("1");
  const [transitVisa, setTransitVisa] = useState(true);
  const [baggageIncluded, setBaggageIncluded] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([
    { id: "r1", from: "BOM", to: "HND", meta: "Tokyo Haneda · Any airline · Economy", alerts: "⚡ 2 alerts sent so far" },
    { id: "r2", from: "DEL", to: "AMS", meta: "Amsterdam · Any airline · Economy or Business", alerts: "⚡ 1 alert sent so far" },
    { id: "r3", from: "BOM", to: "GRU", meta: "São Paulo · Any airline · Economy", alerts: "⚡ 0 alerts yet · building baseline" },
  ]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("push");

  // ── Helpers ─────────────────────────────────────────────
  const markDirty = useCallback(() => { setDirty(true); setSaved(false); }, []);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.3, rootMargin: "-60px 0px -60% 0px" }
    );
    SIDEBAR_ITEMS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Hydrate prefs from server for signed-in user
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile/prefs", { method: "GET" });
        if (!res.ok) return;
        const p = await res.json();
        if (cancelled) return;
        const origins: string[] = Array.isArray(p.origins) ? p.origins : [];
        if (origins.length > 0) {
          const on = new Set(origins);
          setDests((ds) => ds.map((d) => ({ ...d, on: on.has(d.code) })));
        }
        if (typeof p.telegram_handle === "string") setTgHandle(p.telegram_handle);
      } catch {
        // silent: prefs remain at defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Actions ─────────────────────────────────────────────
  const removeAirport = (code: string) => {
    if (airports.length <= 1) { showToast("You need at least one home airport."); return; }
    setAirports((a) => a.filter((x) => x !== code)); markDirty();
  };
  const confirmAddAirport = () => {
    const val = newAirport.trim().toUpperCase();
    if (val.length !== 3) { showToast("Enter a 3-letter IATA code."); return; }
    if (airports.includes(val)) { showToast(`${val} is already added.`); return; }
    setAirports((a) => [...a, val]); setNewAirport(""); setShowAddAirport(false);
    markDirty(); showToast(`${val} added to your home airports.`);
  };
  const toggleDest = (code: string) => {
    setDests((ds) => ds.map((d) => d.code === code ? { ...d, on: !d.on } : d)); markDirty();
  };
  const toggleRegion = (region: string) => {
    setDests((ds) => {
      const regionDests = ds.filter((d) => d.region === region);
      const allOn = regionDests.every((d) => d.on);
      return ds.map((d) => d.region === region ? { ...d, on: !allOn } : d);
    });
    markDirty();
  };
  const toggleCabin = (key: CabinKey) => {
    const currentOn = Object.values(cabins).filter(Boolean).length;
    if (cabins[key] && currentOn === 1) return;
    setCabins((c) => ({ ...c, [key]: !c[key] })); markDirty();
  };
  const handleFreq = (f: FreqType) => {
    if (f === "instant") { showToast("⚡ Instant alerts — Pro only"); return; }
    setFreq(f); markDirty();
  };
  const requestPush = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Push notifications not supported in this browser."); return;
    }
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") { showToast("✓ Push notifications enabled!"); setPushOn(true); markDirty(); }
      else showToast("Push permission denied in browser settings.");
    });
  };
  const togglePush = () => {
    if (!pushOn) requestPush(); else { setPushOn(false); markDirty(); }
  };
  const removeRoute = (id: string) => {
    setRoutes((r) => r.filter((x) => x.id !== id)); markDirty(); showToast("Route removed.");
  };
  const confirmAddRoute = () => {
    const f = routeFrom.trim().toUpperCase();
    const t = routeTo.trim().toUpperCase();
    if (f.length !== 3 || t.length !== 3) { showToast("Enter valid 3-letter IATA codes."); return; }
    setRoutes((r) => [...r, { id: `r${Date.now()}`, from: f, to: t, meta: "Custom route · Any airline · Economy", alerts: "⚡ Just added · building baseline" }]);
    setRouteFrom(""); setRouteTo(""); setShowAddRoute(false);
    markDirty(); showToast(`${f} → ${t} added to watched routes.`);
  };
  const savePrefs = () => { setDirty(false); setSaved(true); showToast("✓ Preferences saved — Penny is updated!"); };
  const discard = () => { setDirty(false); setSaved(false); showToast("Changes discarded."); };
  const pauseAlerts = () => showToast("Alerts paused. Resume anytime from preferences.");

  // ── Derived ─────────────────────────────────────────────
  const destOnCount = useMemo(() => dests.filter((d) => d.on).length, [dests]);
  const destOffCount = dests.length - destOnCount;
  const destsByRegion = useMemo(() => {
    const map = new Map<string, DestState[]>();
    REGION_ORDER.forEach((r) => map.set(r, []));
    dests.forEach((d) => { if (!map.has(d.region)) map.set(d.region, []); map.get(d.region)!.push(d); });
    return Array.from(map.entries()).filter(([, arr]) => arr.length > 0);
  }, [dests]);
  const airportCity = (code: string) => ORIGINS.find((o) => o.code === code)?.city ?? "";
  const channelSummary =
    [emailOn && "Email", pushOn && "Push", tgOn && "Telegram", waOn && "WhatsApp"].filter(Boolean).join(" + ") || "No channels";
  const threshLabel = threshold === "common" ? "Any deal (40%+)" : threshold === "rare" ? "Rare (60%+)" : "Mistake fares (70%+)";

  // ── Render ──────────────────────────────────────────────
  return (
    <>
      {/* NAV */}
      <nav className="ff-nav">
        <Link href="/" className="nav-logo">Flock<span>Fare</span></Link>
        <div className="nav-links">
          <Link href="/deals">Deals</Link>
          <Link href="/preferences" className="active">Preferences</Link>
          <Link href="/#join">Pro</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: violet, color: "#fff", fontFamily: mono, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--color-cream)" }}>{initials}</div>
          <span style={{ fontFamily: mono, fontSize: 11, color: "rgba(246,243,236,.55)", letterSpacing: ".06em" }}>{userEmail}</span>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="feed-header" style={{ padding: "28px 40px" }}>
        <div className="feed-header-inner" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div className="feed-eyebrow">✦ Your account</div>
            <h1 className="feed-h1">Alert preferences</h1>
            <p className="feed-sub">Configure what Penny watches, when she alerts you, and how loud she is about it.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", padding: "8px 16px", borderRadius: 999, background: "var(--color-success-tint)", color: "var(--color-success)", border: "2px solid var(--color-success)", flexShrink: 0 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)" }} />
            PENNY IS WATCHING · {routes.length + destOnCount} ROUTES ACTIVE
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="page-body">
        <aside className="side-nav">
          <div className="side-nav-card">
            <div className="side-nav-head"><span>JUMP TO</span></div>
            {SIDEBAR_ITEMS.map((item) => (
              <div key={item.id} className={`side-nav-item ${activeSection === item.id ? "active" : ""}`} onClick={() => scrollToSection(item.id)}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge" style={{ marginLeft: "auto" }}>{item.badge}</span>}
              </div>
            ))}
          </div>
          <div className="promo-panel">
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐧</div>
            <h3>Penny&apos;s watching {routes.length + destOnCount} routes.</h3>
            <p>Pro members get instant alerts, not 4h delayed. Unlock more airports too.</p>
            <button className="promo-btn">Upgrade to Pro →</button>
          </div>
        </aside>

        <main>
          {/* 1. AIRPORTS */}
          <section className="section-card" id="airports">
            <SectionHead n={1} title="Home airports" right={<div style={S.monoMeta}>Penny watches departures from these cities</div>} />
            <div className="section-body">
              <p style={S.pBody}>All deals shown in your feed will depart from these airports. Add up to 2 on free plan, unlimited on Pro.</p>
              <div className="airport-chip-row">
                {airports.map((code) => (
                  <div key={code} className="airport-chip">
                    {code}{airportCity(code) ? ` · ${airportCity(code)}` : ""}
                    <button className="chip-remove" onClick={() => removeAirport(code)} title="Remove">✕</button>
                  </div>
                ))}
                <button className="add-chip" onClick={() => setShowAddAirport(true)}>+ Add airport</button>
              </div>
              {showAddAirport && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input type="text" value={newAirport} onChange={(e) => setNewAirport(e.target.value.toUpperCase())} placeholder="e.g. BLR" maxLength={3}
                      style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", width: 90, padding: "10px 12px", border: `3px solid ${ink}`, borderRadius: 10, background: paper, outline: "none", boxShadow: brutSm }} />
                    <button onClick={confirmAddAirport} style={S.btnLime}>Add</button>
                    <button onClick={() => setShowAddAirport(false)} style={S.btnGhost}>Cancel</button>
                  </div>
                  <p style={{ fontFamily: mono, fontSize: 10, color: "var(--color-ffgray-400)", marginTop: 6, letterSpacing: ".06em" }}>
                    You&apos;re on the free plan — max 2 airports. <a href="#" style={{ color: violet, fontWeight: 700 }}>Upgrade for unlimited →</a>
                  </p>
                </div>
              )}
              <div className="divider" />
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <h3>Include nearby airports</h3>
                  <p>For BOM, also watch deals from PNQ (Pune). For DEL, include AGR (Agra) when fares are dramatically lower.</p>
                </div>
                <Toggle checked={nearby} onChange={() => { setNearby((v) => !v); markDirty(); }} />
              </div>
            </div>
          </section>

          {/* 2. DESTINATIONS */}
          <section className="section-card" id="destinations">
            <SectionHead n={2} title="Destinations" right={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", padding: "3px 8px", borderRadius: 999, background: lime, color: ink }}>{destOnCount} / {dests.length}</span>
                <span style={S.monoMeta}>active</span>
              </div>
            } />
            <div className="section-body">
              <p style={S.pBody}>Toggle destinations on or off. Penny only alerts you for routes you&apos;re watching.</p>
              {destsByRegion.map(([region, arr]) => (
                <div key={region} style={{ marginBottom: 20 }}>
                  <div style={S.regionLabel}>
                    <span>{region}</span>
                    <button onClick={() => toggleRegion(region)} style={S.toggleAll}>toggle all</button>
                    <span style={{ flex: 1, height: 1, background: "var(--color-ffgray-200)" }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {arr.map((d) => (
                      <div key={d.code} className={`dest-pill ${d.on ? "on" : "off"}`} onClick={() => toggleDest(d.code)}>
                        <span style={{ fontSize: 14 }}>{d.flag}</span>
                        {d.code} · {d.city}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontFamily: mono, fontSize: 11, color: g500, letterSpacing: ".06em", marginTop: 12 }}>
                <strong style={{ color: ink }}>{destOnCount}</strong> destinations active · <strong style={{ color: ink }}>{destOffCount}</strong> paused
              </div>
            </div>
          </section>

          {/* 3. THRESHOLD */}
          <section className="section-card" id="threshold">
            <SectionHead n={3} title="Alert threshold" />
            <div className="section-body">
              <p style={S.pBody}>Penny only pings you when a deal crosses this threshold. Higher = fewer alerts, better deals.</p>
              <div className="threshold-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                {THRESH_CARDS.map((c) => (
                  <div key={c.type} className={`thresh-card ${threshold === c.type ? c.activeCls : ""}`}
                    onClick={() => { setThreshold(c.type); markDirty(); }}>
                    <div className="thresh-radio"><div className="thresh-radio-dot" /></div>
                    <div className="thresh-pct" style={{ color: c.pctColor }}>{c.pct}</div>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                    <span className={`thresh-tag ${c.tagCls}`}>{c.tag}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 14px", background: "var(--color-lime-tint)", border: `3px solid ${lime}`, borderRadius: 12, fontSize: 13, lineHeight: 1.55 }}>
                💡 <strong>Pro tip:</strong> Set to &quot;Rare&quot; and enable Telegram for the fastest response time. Penny fires Telegram before email — on mistake fares, every second matters.
              </div>
            </div>
          </section>

          {/* 4. CHANNELS */}
          <section className="section-card" id="channels">
            <SectionHead n={4} title="Notification channels" />
            <div className="section-body">
              {/* Email */}
              <div className="channel-row">
                <div className="channel-icon-wrap" style={{ background: "var(--color-lime-tint)" }}>📧</div>
                <div style={{ flex: 1 }}>
                  <h3 style={S.h3}>Email</h3>
                  <p style={{ ...S.pMeta, lineHeight: 1.5 }}>Deal digest every time Penny finds something. Instant for Unique deals, up to 4h delay on free plan.</p>
                  <div className="channel-detail">
                    <span>{userEmail}</span>
                    <span className="ch-verified">✓ Verified</span>
                  </div>
                </div>
                <Toggle checked={emailOn} onChange={() => { setEmailOn((v) => !v); markDirty(); }} />
              </div>
              <div className="divider" style={{ margin: 0 }} />
              {/* Push */}
              <div className="channel-row">
                <div className="channel-icon-wrap" style={{ background: "var(--color-violet-tint)" }}>🔔</div>
                <div style={{ flex: 1 }}>
                  <h3 style={S.h3}>Browser push</h3>
                  <p style={{ ...S.pMeta, lineHeight: 1.5 }}>Desktop and mobile pop-ups. Best for catching mistake fares before they vanish.</p>
                  <div className="channel-detail" style={{ marginTop: 10 }}>
                    <span style={{ color: coral, fontFamily: mono, fontSize: 11, fontWeight: 700 }}>⚠ Permission not granted yet</span>
                    <button onClick={requestPush} style={S.chLink}>Enable push →</button>
                  </div>
                </div>
                <Toggle checked={pushOn} onChange={togglePush} />
              </div>
              <div className="divider" style={{ margin: 0 }} />
              {/* Telegram */}
              <div className="channel-row">
                <div className="channel-icon-wrap" style={{ background: "#e8f4fd" }}>✈</div>
                <div style={{ flex: 1 }}>
                  <h3 style={S.h3}>Telegram</h3>
                  <p style={{ ...S.pMeta, lineHeight: 1.5 }}>Real-time deal cards in the FlockFare channel. Fastest channel — alerts fire the instant Penny detects a drop.</p>
                  <div className="channel-detail">
                    <input type="text" value={tgHandle} placeholder="@yourusername" onChange={(e) => { setTgHandle(e.target.value); markDirty(); }} />
                    <span className="ch-verified">✓ Connected</span>
                  </div>
                </div>
                <Toggle checked={tgOn} onChange={() => { setTgOn((v) => !v); markDirty(); }} />
              </div>
              <div className="divider" style={{ margin: 0 }} />
              {/* WhatsApp */}
              <div className="channel-row">
                <div className="channel-icon-wrap" style={{ background: "#dcfce7" }}>💬</div>
                <div style={{ flex: 1 }}>
                  <h3 style={S.h3}>WhatsApp</h3>
                  <p style={{ ...S.pMeta, lineHeight: 1.5 }}>Get deal cards straight to WhatsApp. Great for sharing with travel buddies instantly.</p>
                  <div className="channel-detail">
                    <input type="tel" value={waNumber} placeholder="+91 98765 43210" onChange={(e) => { setWaNumber(e.target.value); markDirty(); }} />
                    <button style={S.chLink}>Connect →</button>
                  </div>
                </div>
                <Toggle checked={waOn} onChange={() => { setWaOn((v) => !v); markDirty(); }} />
              </div>
            </div>
          </section>

          {/* 5. FREQUENCY */}
          <section className="section-card" id="frequency">
            <SectionHead n={5} title="Frequency & quiet hours" />
            <div className="section-body">
              <div style={{ marginBottom: 10 }}>
                <h3 style={S.h3}>Alert frequency</h3>
                <p style={S.pMeta}>How often can Penny ping you per week?</p>
              </div>
              <div className="freq-grid">
                {FREQ_BTNS.map((b) => (
                  <button key={b.k} className={`freq-btn ${freq === b.k ? "active" : ""}`} onClick={() => handleFreq(b.k)}>{b.label}</button>
                ))}
                <button className="freq-btn" onClick={() => handleFreq("instant")}>Instant <span className="pro-lock">PRO</span></button>
              </div>
              <div className="divider" />
              <div style={{ marginBottom: 10 }}>
                <h3 style={S.h3}>Best time for alerts</h3>
                <p style={S.pMeta}>When do you want Penny to send your daily digest?</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <div>
                  <div style={S.label}>Timezone</div>
                  <select value={timezone} onChange={(e) => { setTimezone(e.target.value); markDirty(); }} style={S.select}>
                    <option>IST (UTC+5:30)</option><option>GMT (UTC+0)</option><option>PST (UTC-8)</option><option>EST (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <div style={S.label}>Send digest at</div>
                  <select value={digestTime} onChange={(e) => { setDigestTime(e.target.value); markDirty(); }} style={S.select}>
                    <option>7:00 AM</option><option>8:00 AM</option><option>9:00 AM</option><option>12:00 PM</option><option>6:00 PM</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "14px 16px", background: "var(--color-sun-tint)", border: "3px solid var(--color-sun)", borderRadius: 12, marginTop: 14 }}>
                <span style={{ fontSize: 18 }}>🌙</span>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: ink, letterSpacing: ".06em" }}>Quiet hours — no alerts between</span>
                <input type="time" value={quietStart} onChange={(e) => { setQuietStart(e.target.value); markDirty(); }} style={S.timeIn} />
                <span style={{ fontFamily: mono, fontSize: 12, color: "var(--color-ffgray-600)" }}>and</span>
                <input type="time" value={quietEnd} onChange={(e) => { setQuietEnd(e.target.value); markDirty(); }} style={S.timeIn} />
                <Toggle checked={quietOn} onChange={() => { setQuietOn((v) => !v); markDirty(); }} ml="auto" />
              </div>
              <div className="divider" />
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <h3>Override quiet hours for mistake fares</h3>
                  <p>Mistake fares expire in hours. If Penny finds a -70% deal at 3am, wake you up anyway.</p>
                </div>
                <Toggle checked={overrideQuiet} onChange={() => { setOverrideQuiet((v) => !v); markDirty(); }} />
              </div>
            </div>
          </section>

          {/* 6. FILTERS */}
          <section className="section-card" id="filters">
            <SectionHead n={6} title="Deal filters" />
            <div className="section-body">
              <div style={{ marginBottom: 10 }}>
                <h3 style={S.h3}>Cabin class</h3>
                <p style={S.pMeta}>Only alert me for deals in these classes.</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {CABIN_OPTS.map((c) => {
                  const on = cabins[c.k];
                  return (
                    <div key={c.k} onClick={() => toggleCabin(c.k)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                      padding: "8px 14px", borderRadius: 999,
                      border: on ? `3px solid ${ink}` : "3px solid var(--color-ffgray-200)",
                      cursor: "pointer",
                      background: on ? ink : paper,
                      color: on ? lime : "var(--color-ffgray-400)",
                      boxShadow: on ? brutSm : "none", userSelect: "none",
                    }}>{c.label}</div>
                  );
                })}
              </div>
              <div className="divider" />
              <div style={{ marginBottom: 6 }}>
                <h3 style={S.h3}>Maximum stops</h3>
                <p style={S.pMeta}>Connections allowed per leg.</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {STOP_OPTS.map((s) => (
                  <button key={s.k} className={`freq-btn ${stops === s.k ? "active" : ""}`}
                    onClick={() => { setStops(s.k); markDirty(); }}>{s.label}</button>
                ))}
              </div>
              <div className="divider" />
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <h3>Exclude transit visa required routes</h3>
                  <p>Some routings through the US, UK, or Schengen require Indian passport holders to hold transit visas. Filter these out.</p>
                </div>
                <Toggle checked={transitVisa} onChange={() => { setTransitVisa((v) => !v); markDirty(); }} />
              </div>
              <div className="divider" />
              <div className="toggle-wrap">
                <div className="toggle-info">
                  <h3>Baggage must be included</h3>
                  <p>Only show deals where checked baggage (23kg+) is included in the fare. No hidden surprises.</p>
                </div>
                <Toggle checked={baggageIncluded} onChange={() => { setBaggageIncluded((v) => !v); markDirty(); }} />
              </div>
              <div className="divider" />
              <div style={{ marginBottom: 6 }}>
                <h3 style={S.h3}>Travel months <span className="pro-lock">PRO</span></h3>
                <p style={S.pMeta}>Only alert for deals departing in specific months.</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.45, pointerEvents: "none" }}>
                <div className="freq-btn active" style={{ fontSize: 11 }}>All months</div>
                <div className="freq-btn" style={{ fontSize: 11 }}>Apr–Jun</div>
                <div className="freq-btn" style={{ fontSize: 11 }}>Jul–Sep</div>
                <div className="freq-btn" style={{ fontSize: 11 }}>Oct–Dec</div>
                <div className="freq-btn" style={{ fontSize: 11 }}>Jan–Mar</div>
              </div>
            </div>
          </section>

          {/* 7. ROUTES */}
          <section className="section-card" id="routes">
            <SectionHead n={7} title="Custom watched routes" right={
              <div style={S.monoMeta}>{routes.length} / 3 on free plan · <a href="#" style={{ color: lime }}>Upgrade for unlimited</a></div>
            } />
            <div className="section-body">
              <p style={S.pBody}>Watch specific routes Penny doesn&apos;t cover by default. She&apos;ll alert you the moment any of these drop.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {routes.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: `3px solid ${ink}`, borderRadius: 14, background: paper, boxShadow: brutSm }}>
                    <div style={{ fontFamily: disp, fontWeight: 900, fontSize: 16, letterSpacing: "-.02em", flexShrink: 0 }}>
                      {r.from} <span style={{ color: violet, margin: "0 4px" }}>→</span> {r.to}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={S.pMeta}>{r.meta}</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", padding: "3px 8px", borderRadius: 999, background: "var(--color-lime-tint)", color: ink, border: `2px solid ${lime}`, marginTop: 4 }}>{r.alerts}</div>
                    </div>
                    <button onClick={() => removeRoute(r.id)} style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "var(--color-ffgray-400)", cursor: "pointer", background: "none", border: "none", padding: 6, borderRadius: 6 }}>Remove ✕</button>
                  </div>
                ))}
              </div>
              {showAddRoute ? (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <input value={routeFrom} onChange={(e) => setRouteFrom(e.target.value.toUpperCase())} placeholder="FROM" maxLength={3} style={S.routeIn} />
                  <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, alignSelf: "center", color: violet }}>→</span>
                  <input value={routeTo} onChange={(e) => setRouteTo(e.target.value.toUpperCase())} placeholder="TO" maxLength={3} style={S.routeIn} />
                  <button onClick={confirmAddRoute} style={{ ...S.btnLime, fontSize: 14, padding: "10px 18px" }}>Add route</button>
                  <button onClick={() => setShowAddRoute(false)} style={S.btnGhost}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowAddRoute(true)} style={{ marginTop: 12, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: g500, background: "none", border: "3px dashed var(--color-ffgray-300)", padding: "10px 16px", borderRadius: 10, cursor: "pointer", width: "100%" }}>
                  + Watch a custom route ({routes.length} / 3 used — upgrade for more)
                </button>
              )}
            </div>
          </section>

          {/* 8. PREVIEW */}
          <section className="section-card" id="preview">
            <SectionHead n={8} title="Alert preview" />
            <div className="section-body">
              <p style={S.pBody}>Here&apos;s what your alerts will look like based on your current settings.</p>
              <div style={{ border: `4px solid ${ink}`, borderRadius: 16, overflow: "hidden", boxShadow: brut }}>
                <div style={{ display: "flex", borderBottom: `3px solid ${ink}` }}>
                  {([
                    { k: "push" as PreviewTab, label: "Push notification" },
                    { k: "email" as PreviewTab, label: "Email" },
                    { k: "telegram" as PreviewTab, label: "Telegram" },
                  ]).map((t) => (
                    <div key={t.k} onClick={() => setPreviewTab(t.k)} style={{
                      fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
                      padding: "10px 18px", cursor: "pointer", borderRight: "2px solid var(--color-ffgray-200)",
                      background: previewTab === t.k ? ink : "var(--color-ffgray-100)",
                      color: previewTab === t.k ? lime : ink,
                    }}>{t.label}</div>
                  ))}
                </div>
                {previewTab === "push" && (
                  <div style={{ background: "var(--color-ink-soft)", padding: 16, display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: paper, borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: ".14em", color: g500, marginBottom: 4 }}>🐧 FLOCKFARE · now</div>
                        <div style={{ fontFamily: disp, fontWeight: 900, fontSize: 14, marginBottom: 2 }}>🔥 BOM → LHR · -61% off</div>
                        <div style={{ fontSize: 12, color: g500, lineHeight: 1.4 }}>₹21,400 round-trip (was ₹54,800). Air India · Direct. Book in the next 90 min.</div>
                      </div>
                    </div>
                  </div>
                )}
                {previewTab === "email" && (
                  <div style={{ padding: 20, background: "var(--color-ffgray-50)", borderTop: `3px solid ${ink}` }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: g500, marginBottom: 6 }}>From: Penny @ FlockFare &lt;penny@flockfare.com&gt;</div>
                    <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🔥 BOM → LHR just dropped 61%. ₹21,400 round-trip.</div>
                    <div style={{ fontSize: 13, color: g500, lineHeight: 1.5 }}>
                      Hey — Penny found a rare deal on one of your watched routes.<br /><br />
                      <strong>Mumbai → London Heathrow</strong><br />
                      ₹21,400 round-trip · Was ₹54,800 · -61% off baseline<br />
                      Air India · Direct · Economy · 25kg baggage included<br /><br />
                      This price is the lowest BOM→LHR fare in our 90-day dataset. Book before the airline notices.
                    </div>
                  </div>
                )}
                {previewTab === "telegram" && (
                  <div style={{ background: "var(--color-ink-soft)", padding: 20, display: "flex" }}>
                    <div style={{ background: "#212b36", borderRadius: 16, padding: "14px 16px", maxWidth: 320, fontSize: 13, lineHeight: 1.6, color: "#e8eaed" }}>
                      🔴 <strong>RARE DEAL · BOM → LHR</strong><br /><br />
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>₹21,400</span> round-trip (61% off)<br />
                      <span style={{ textDecoration: "line-through", color: "#888" }}>₹54,800</span> usual fare<br /><br />
                      ✈ Air India · July 2026<br /><br />
                      <span style={{ color: "#4fc3f7" }}>Book on Google Flights →</span><br /><br />
                      <em style={{ color: "#888" }}>Penny found this one. Grab before it disappears.</em>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--color-ffgray-50)", border: "2px solid var(--color-ffgray-200)", borderRadius: 12, fontSize: 13, color: g500, lineHeight: 1.5 }}>
                Based on your current settings: <strong style={{ color: ink }}>{threshLabel}</strong> threshold · <strong style={{ color: ink }}>{channelSummary}</strong> · Sent at <strong style={{ color: ink }}>{digestTime} {timezone.split(" ")[0]}</strong> (quiet hours {quietStart}–{quietEnd}).
              </div>
            </div>
          </section>

          {/* DANGER */}
          <div className="danger-zone">
            <div>
              <h4 style={{ fontFamily: disp, fontWeight: 700, fontSize: 15, color: coral, marginBottom: 4 }}>Pause all alerts</h4>
              <p style={{ ...S.pMeta, lineHeight: 1.5 }}>Going offline for a while? Pause Penny without losing your settings. Resume anytime.</p>
            </div>
            <button onClick={pauseAlerts} style={{ fontFamily: disp, fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 999, background: "transparent", color: coral, border: `3px solid ${coral}`, cursor: "pointer", flexShrink: 0 }}>Pause alerts</button>
          </div>
        </main>
      </div>

      {/* SAVE BAR */}
      <div className="save-bar" style={{ opacity: dirty ? 1 : 0.4, pointerEvents: dirty ? "auto" : "none", transition: "opacity .2s" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: g500, letterSpacing: ".06em" }}>
          {dirty ? (<>⚠ <strong style={{ color: coral }}>Unsaved changes</strong> — don&apos;t forget to save</>)
            : saved ? (<strong style={{ color: "var(--color-success)" }}>✓ All preferences saved</strong>)
            : "No unsaved changes"}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={discard} style={{ fontFamily: disp, fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 999, background: "transparent", color: g500, border: "3px solid var(--color-ffgray-200)", cursor: "pointer" }}>Discard</button>
          <button onClick={savePrefs} style={{ fontFamily: disp, fontWeight: 900, fontSize: 15, padding: "13px 28px", borderRadius: 999, background: lime, color: ink, border: `4px solid ${ink}`, boxShadow: brut, cursor: "pointer" }}>Save preferences →</button>
        </div>
      </div>

      {/* TOAST */}
      <div className={`ff-toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
