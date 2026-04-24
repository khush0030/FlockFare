"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Header } from "@/components/header";
import { DOMESTIC_AIRPORTS } from "@/lib/airports";

// ── Types ────────────────────────────────────────────────
type TabId = "overview" | "saved" | "trips" | "alerts" | "bookings" | "plan" | "settings";
type Billing = "monthly" | "yearly";

export type ProfileData = {
  user: {
    email: string;
    displayName: string;
    avatarUrl: string | null;
    memberSince: string;
    monthsInFlock: number;
    planTier: "free" | "pro";
    referralCode: string;
    homeAirport: string;
  };
  stats: {
    totalSavings: number;
    tripsBooked: number;
    bestSave: number;
    avgDiscount: number;
    alertsReceived: number;
    monthBars: { m: string; s: number; on: boolean }[];
  };
  savedDeals: {
    id: string;
    dealId: string;
    status: "active" | "booked" | "expired";
    savedAt: string;
    bookedAt: string | null;
    originCode: string;
    destCode: string;
    airline: string;
    cabin: string;
    travelMonth: string;
    currentPrice: number;
    baselinePrice: number;
    pctOff: number;
    dealType: string;
    stops: number;
    isActive: boolean;
    expiresAt: string | null;
  }[];
  bookings: {
    id: string;
    route: string;
    airline: string;
    cabin: string;
    travelMonth: string;
    pricePaid: number;
    baseline: number;
    bookedAt: string;
  }[];
  recentDeals: {
    id: string;
    originCode: string;
    destCode: string;
    pctOff: number;
    currentPrice: number;
    airline: string;
    dealType: string;
    detectedAt: string;
    isActive: boolean;
    expiresAt: string | null;
  }[];
  notifPrefs: {
    user_id?: string;
    email?: string;
    deals_email: boolean;
    weekly_digest: boolean;
    push: boolean;
    updates: boolean;
    analytics: boolean;
  };
  trips: {
    slug: string;
    label: string;
    outboundDestCode: string;
    returnOriginCode: string;
    outboundDate: string;
    returnDate: string;
    isOwn: boolean;
    legs: {
      originCode: string;
      outboundPrice: number | null;
      returnPrice: number | null;
      totalPrice: number | null;
      baselineTotal: number | null;
      pctOff: number | null;
      outboundAirline: string | null;
      returnAirline: string | null;
      outboundStops: number | null;
      returnStops: number | null;
      outboundUrl: string | null;
      returnUrl: string | null;
      dealType: "common" | "rare" | "unique" | null;
      detectedAt: string | null;
      alert: {
        maxTotalInr: number | null;
        minPctOff: number | null;
      } | null;
      typical: {
        outboundMedianInr: number | null;
        outboundSamples: number;
        returnMedianInr: number | null;
        returnSamples: number;
        outboundInfo: { distanceKm: number; minMin: number; maxMin: number; carriers: string[] } | null;
        returnInfo: { distanceKm: number; minMin: number; maxMin: number; carriers: string[] } | null;
      };
    }[];
  }[];
};

// ── Design tokens ────────────────────────────────────────
const ink = "var(--color-ink)";
const cream = "var(--color-cream)";
const paper = "var(--color-paper)";
const lime = "var(--color-lime)";
const limeT = "var(--color-lime-tint)";
const violet = "var(--color-violet)";
const violetT = "var(--color-violet-tint)";
const coral = "var(--color-coral)";
const coralT = "var(--color-coral-tint)";
const sunT = "var(--color-sun-tint)";
const success = "var(--color-success)";
const g50 = "var(--color-ffgray-50)";
const g100 = "var(--color-ffgray-100)";
const g200 = "var(--color-ffgray-200)";
const g300 = "var(--color-ffgray-300)";
const g400 = "var(--color-ffgray-400)";
const g500 = "var(--color-ffgray-500)";
const g600 = "var(--color-ffgray-600)";
const fd = "var(--font-display)";
const fm = "var(--font-mono)";
const brut = "var(--shadow-brut)";
const brutSm = "var(--shadow-brut-sm)";
const brutLg = "var(--shadow-brut-lg)";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "saved", label: "Saved deals" },
  { id: "trips", label: "My trips" },
  { id: "alerts", label: "Alert history" },
  { id: "bookings", label: "Bookings tracked" },
  { id: "plan", label: "Plan & billing" },
  { id: "settings", label: "Settings" },
];

const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: 20,
  alignItems: "start",
};

const fmt = (n: number) =>
  n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `₹${n.toLocaleString("en-IN")}`;
const fmtFull = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ── Main client ──────────────────────────────────────────
export function ProfileClient({ data }: { data: ProfileData }) {
  const { user, stats } = data;
  const [tab, setTab] = useState<TabId>("overview");
  const [billing, setBilling] = useState<Billing>("yearly");
  const [toast, setToast] = useState("");
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({
    name: user.displayName,
    email: user.email,
    homeAirport: user.homeAirport,
  });
  const [notif, setNotif] = useState(data.notifPrefs);

  const switchTab = (id: TabId) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };
  const copyRef = () => {
    navigator.clipboard?.writeText(`flockfare.com/join/${user.referralCode}`);
    showToast("Referral link copied!");
  };
  const saveProfile = async () => {
    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: form.name, home_airport: form.homeAirport }),
    });
    if (res.ok) {
      setDirty(false);
      showToast("✓ Profile updated");
    }
  };
  const savePrefs = async (updated: typeof notif) => {
    setNotif(updated);
    await fetch("/api/profile/prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ background: g50, minHeight: "100vh", color: ink, fontFamily: "var(--font-body)" }}>
      <Header activePage="profile" />

      {/* Hero */}
      <div style={{ background: ink, borderBottom: `4px solid ${lime}`, padding: "0 40px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -80, right: -80, width: 350, height: 350, background: violet, opacity: 0.08, borderRadius: "50%" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 0 0", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: violet, color: "#fff", fontFamily: fd, fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `4px solid ${cream}`, boxShadow: brut, flexShrink: 0, overflow: "hidden" }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" width={80} height={80} referrerPolicy="no-referrer" style={{ borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div style={{ fontFamily: fd, fontWeight: 900, fontSize: "clamp(1.8rem,3vw,2.4rem)", letterSpacing: "-.03em", color: cream, lineHeight: 1.04 }}>
                  {user.displayName}
                </div>
                <div style={{ fontFamily: fm, fontSize: 12, color: "rgba(246,243,236,.4)", letterSpacing: ".06em", marginTop: 4 }}>
                  {user.email}
                </div>
                <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.25)", letterSpacing: ".1em", marginTop: 2 }}>
                  MEMBER SINCE {user.memberSince.toUpperCase()} · {user.monthsInFlock} MONTH{user.monthsInFlock !== 1 ? "S" : ""} IN THE FLOCK
                </div>
                <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                  <Badge bg={lime} color={ink}>🐧 Flock member</Badge>
                  <Badge bg="rgba(246,243,236,.1)" color="rgba(246,243,236,.6)" border="1.5px solid rgba(246,243,236,.15)">
                    {user.planTier === "pro" ? "PRO PLAN" : "FREE PLAN"}
                  </Badge>
                  <Badge bg={success} color="#fff" border={`1.5px solid ${success}`}>✓ Verified</Badge>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}>
              <button onClick={() => switchTab("settings")} style={{ fontFamily: fd, fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 999, background: "transparent", color: cream, border: "3px solid rgba(246,243,236,.25)", cursor: "pointer" }}>
                Edit profile
              </button>
              {user.planTier === "free" && (
                <button onClick={() => switchTab("plan")} style={{ fontFamily: fd, fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 999, background: lime, color: ink, border: `3px solid ${cream}`, boxShadow: `3px 3px 0 ${cream}`, cursor: "pointer" }}>
                  ⚡ Upgrade to Pro
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 28, overflowX: "auto" }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => switchTab(t.id)} style={{ fontFamily: fm, fontSize: 11, fontWeight: 700, letterSpacing: ".12em", padding: "12px 20px", cursor: "pointer", color: active ? lime : "rgba(246,243,236,.4)", background: "none", border: "none", borderBottom: `4px solid ${active ? lime : "transparent"}`, whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  {t.label}
                  {t.id === "saved" && data.savedDeals.length > 0 ? ` (${data.savedDeals.length})` : ""}
                  {t.id === "alerts" ? ` (${data.recentDeals.length})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 40px 80px" }}>
        {tab === "overview" && <OverviewTab data={data} switchTab={switchTab} copyRef={copyRef} />}
        {tab === "saved" && <SavedTab deals={data.savedDeals} />}
        {tab === "trips" && <TripsTab trips={data.trips} />}
        {tab === "alerts" && <AlertsTab deals={data.recentDeals} showToast={showToast} />}
        {tab === "bookings" && <BookingsTab bookings={data.bookings} stats={stats} />}
        {tab === "plan" && <PlanTab billing={billing} setBilling={setBilling} showToast={showToast} referralCode={user.referralCode} planTier={user.planTier} />}
        {tab === "settings" && (
          <SettingsTab
            form={form}
            setForm={(f) => { setForm(f); setDirty(true); }}
            dirty={dirty}
            saveProfile={saveProfile}
            notif={notif}
            savePrefs={savePrefs}
            showToast={showToast}
            memberSince={user.memberSince}
          />
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: ink, color: lime, fontFamily: fm, fontSize: 12, fontWeight: 700, letterSpacing: ".1em", padding: "12px 24px", borderRadius: 999, border: `3px solid ${lime}`, zIndex: 999, whiteSpace: "nowrap", boxShadow: brut }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Primitives ───────────────────────────────────────────
function Badge({ children, bg, color, border }: { children: ReactNode; bg: string; color: string; border?: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", padding: "4px 11px", borderRadius: 999, background: bg, color, border }}>{children}</span>;
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: paper, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, overflow: "hidden", marginBottom: 20, ...style }}>{children}</div>;
}

function CardHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div style={{ background: ink, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
      <div>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: lime, marginBottom: 3 }}>{eyebrow}</div>
        <h2 style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: cream }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function HeadBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: lime, cursor: "pointer", background: "none", border: "none" }}>{children}</button>;
}

function SectionLabel({ children, color }: { children: ReactNode; color: string }) {
  return <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", padding: "12px 0 8px", borderBottom: `2px solid ${g200}`, color, marginTop: 10 }}>{children}</div>;
}

function Stat({ val, lbl }: { val: string; lbl: string }) {
  return (
    <div>
      <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, letterSpacing: "-.03em", color: cream }}>{val}</div>
      <div style={{ fontFamily: fm, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(246,243,236,.35)", marginTop: 3 }}>{lbl}</div>
    </div>
  );
}

function PlanLine({ children, on }: { children: ReactNode; on?: boolean }) {
  return <div style={{ display: "flex", gap: 8, alignItems: "center", color: on ? undefined : g400 }}><span>{on ? "✓" : "🔐"}</span><span>{children}</span></div>;
}

// ── OVERVIEW ─────────────────────────────────────────────
function OverviewTab({ data, switchTab, copyRef }: { data: ProfileData; switchTab: (id: TabId) => void; copyRef: () => void }) {
  const { stats, user } = data;
  const max = Math.max(...stats.monthBars.map((d) => d.s), 1);
  const hasData = stats.tripsBooked > 0;

  return (
    <div style={twoCol}>
      <div>
        {/* Savings hero */}
        <div style={{ background: ink, border: `4px solid ${ink}`, borderRadius: 24, boxShadow: brutLg, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: lime, padding: "20px 24px", borderBottom: `4px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "rgba(11,11,15,.5)", marginBottom: 6 }}>✦ TOTAL SAVINGS UNLOCKED</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: "clamp(3rem,5vw,4.5rem)", letterSpacing: "-.04em", color: ink, lineHeight: 1 }}>
                {hasData ? fmtFull(stats.totalSavings) : "₹0"}
              </div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "rgba(11,11,15,.5)", marginTop: 4 }}>
                {hasData ? "SAVED SINCE JOINING" : "START WATCHING DEALS →"}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 56, color: ink, letterSpacing: "-.04em", lineHeight: 1, textAlign: "right" }}>{stats.tripsBooked}</div>
              <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(11,11,15,.5)", letterSpacing: ".14em", textAlign: "right" }}>TRIPS BOOKED</div>
            </div>
          </div>
          <div style={{ padding: "22px 24px" }}>
            {hasData ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
                  <Stat val={fmtFull(stats.bestSave)} lbl="Best single save" />
                  <Stat val={`${stats.avgDiscount}%`} lbl="Avg discount" />
                  <Stat val={String(stats.alertsReceived)} lbl="Alerts received" />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60, marginBottom: 8 }}>
                  {stats.monthBars.map((d) => {
                    const h = Math.max(Math.round((d.s / max) * 56), 4);
                    return (
                      <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: h, background: d.on ? lime : "rgba(246,243,236,.07)", border: `2px solid ${d.on ? lime : "rgba(246,243,236,.12)"}` }} />
                        <div style={{ fontFamily: fm, fontSize: 8, color: "rgba(246,243,236,.28)", letterSpacing: ".08em" }}>{d.m}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.3)", letterSpacing: ".06em", textAlign: "center" }}>Monthly savings · last 4 months</div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: fm, fontSize: 12, color: "rgba(246,243,236,.4)", letterSpacing: ".06em" }}>
                  No bookings yet. Save a deal from the <button onClick={() => switchTab("saved")} style={{ color: lime, background: "none", border: "none", fontFamily: fm, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>deals page</button> to start tracking savings.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent deals */}
        <Card>
          <CardHead eyebrow="✦ RECENT ACTIVITY" title="Latest deals" action={<HeadBtn onClick={() => switchTab("alerts")}>View all →</HeadBtn>} />
          <div style={{ padding: "0 20px" }}>
            {data.recentDeals.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center", fontFamily: fm, fontSize: 12, color: g400 }}>No deals detected yet</div>
            ) : (
              data.recentDeals.slice(0, 3).map((d) => (
                <DealAlertRow key={d.id} d={d} />
              ))
            )}
          </div>
        </Card>

        {/* Penny's take */}
        {hasData && (
          <div style={{ background: ink, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, overflow: "hidden" }}>
            <div style={{ background: lime, padding: "14px 20px", borderBottom: `4px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "rgba(11,11,15,.5)", marginBottom: 3 }}>✦ PENNY&rsquo;S TAKE</div>
                <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: ink }}>Your flock report</div>
              </div>
              <div style={{ fontSize: 28 }}>🐧</div>
            </div>
            <div style={{ padding: "20px 24px", fontSize: 14, color: "rgba(246,243,236,.7)", lineHeight: 1.75 }}>
              In {user.monthsInFlock} month{user.monthsInFlock !== 1 ? "s" : ""} you&rsquo;ve saved <strong style={{ color: lime }}>{fmtFull(stats.totalSavings)}</strong> across {stats.tripsBooked} trip{stats.tripsBooked !== 1 ? "s" : ""}. Your best catch saved {fmtFull(stats.bestSave)}. You have <strong style={{ color: lime }}>{data.savedDeals.filter((s) => s.status === "active").length} active saved deal{data.savedDeals.filter((s) => s.status === "active").length !== 1 ? "s" : ""}</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div>
        <Card>
          <CardHead eyebrow="✦ CURRENT PLAN" title={user.planTier === "pro" ? "Pro bird" : "Free flock"} />
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 14 }}>
              <PlanLine on>Deals feed</PlanLine>
              <PlanLine on>Email alerts</PlanLine>
              <PlanLine on>1 home airport</PlanLine>
              <PlanLine on>3 custom routes</PlanLine>
              <PlanLine>Instant alerts (4h delay)</PlanLine>
              <PlanLine>Unlimited airports</PlanLine>
              <PlanLine>Business class &amp; mistake fares</PlanLine>
              <PlanLine>Hotel drops</PlanLine>
            </div>
          </div>
        </Card>

        {user.planTier === "free" && (
          <div style={{ background: violet, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, padding: 20, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <h3 style={{ fontFamily: fd, fontWeight: 900, fontSize: 17, color: "#fff", marginBottom: 6 }}>Unlock Pro features</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.55, marginBottom: 14 }}>Instant alerts, unlimited airports, business class deals, and more.</p>
            <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 28, color: "#fff", letterSpacing: "-.03em", marginBottom: 3 }}>₹799<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.4)" }}>/year</span></div>
            <button onClick={() => switchTab("plan")} style={{ display: "block", width: "100%", fontFamily: fd, fontWeight: 900, fontSize: 15, padding: 14, borderRadius: 999, background: lime, color: ink, border: `4px solid ${ink}`, boxShadow: brut, cursor: "pointer" }}>
              Upgrade to Pro →
            </button>
          </div>
        )}

        <ReferralCard code={user.referralCode} onCopy={copyRef} />
      </div>
    </div>
  );
}

function DealAlertRow({ d }: { d: ProfileData["recentDeals"][number] }) {
  const iconMap: Record<string, { bg: string; emoji: string; sz: number }> = {
    unique: { bg: violet, emoji: "⚡", sz: 16 },
    rare: { bg: coralT, emoji: "🔥", sz: 16 },
    common: { bg: limeT, emoji: "✓", sz: 13 },
  };
  const ic = iconMap[d.dealType] ?? iconMap.common;
  const ago = timeAgo(d.detectedAt);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: `2px solid ${g100}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, border: `2.5px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ic.sz, flexShrink: 0, background: ic.bg }}>{ic.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{d.originCode} → {d.destCode} · -{d.pctOff}% · {fmtFull(d.currentPrice)}</div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em" }}>{ago} · {d.airline.toUpperCase()} · {d.dealType.toUpperCase()} · {d.isActive ? "ACTIVE" : "EXPIRED"}</div>
      </div>
    </div>
  );
}

function ReferralCard({ code, onCopy }: { code: string; onCopy: () => void }) {
  return (
    <div style={{ background: sunT, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, padding: "18px 20px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: fd, fontWeight: 900, fontSize: 15, marginBottom: 5 }}>Invite friends. Earn months.</h3>
      <p style={{ fontSize: 13, color: g500, lineHeight: 1.5, marginBottom: 12 }}>Every friend who joins earns you 1 month of Pro free.</p>
      <div style={{ display: "flex", border: `3px solid ${ink}`, borderRadius: 10, overflow: "hidden", boxShadow: brutSm }}>
        <input readOnly value={`flockfare.com/join/${code}`} style={{ flex: 1, fontFamily: fm, fontSize: 11, padding: "10px 12px", background: paper, border: "none", outline: "none", color: g600 }} />
        <button onClick={onCopy} style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", padding: "10px 14px", background: ink, color: lime, border: "none", cursor: "pointer" }}>COPY</button>
      </div>
    </div>
  );
}

// ── SAVED DEALS ──────────────────────────────────────────
function SavedTab({ deals }: { deals: ProfileData["savedDeals"] }) {
  const active = deals.filter((d) => d.status === "active");
  const booked = deals.filter((d) => d.status === "booked");
  const expired = deals.filter((d) => d.status === "expired");

  return (
    <Card>
      <CardHead eyebrow="✦ SAVED DEALS" title={`${deals.length} deal${deals.length !== 1 ? "s" : ""} in your collection`} />
      <div style={{ padding: "0 20px" }}>
        {deals.length === 0 && (
          <div style={{ padding: "36px 0", textAlign: "center", fontFamily: fm, fontSize: 12, color: g400 }}>No saved deals yet. Browse deals and save ones you like.</div>
        )}
        {active.length > 0 && (
          <>
            <SectionLabel color={violet}>✦ ACTIVE NOW</SectionLabel>
            {active.map((d) => <SavedDealRow key={d.id} d={d} />)}
          </>
        )}
        {booked.length > 0 && (
          <>
            <SectionLabel color={success}>✦ BOOKED</SectionLabel>
            {booked.map((d) => <SavedDealRow key={d.id} d={d} />)}
          </>
        )}
        {expired.length > 0 && (
          <>
            <SectionLabel color={g400}>✦ EXPIRED</SectionLabel>
            {expired.map((d) => <SavedDealRow key={d.id} d={d} />)}
          </>
        )}
      </div>
    </Card>
  );
}

function TripsTab({ trips }: { trips: ProfileData["trips"] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <Card>
        <CardHead
          eyebrow="✦ MY TRIPS"
          title={trips.length === 0 ? "No tracked trips yet" : `${trips.length} trip${trips.length !== 1 ? "s" : ""}`}
          action={
            <HeadBtn onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "× Cancel" : "+ Add trip"}
            </HeadBtn>
          }
        />
        {showAdd && (
          <div style={{ padding: "16px 20px 22px", borderBottom: `2px solid ${g200}` }}>
            <AddTripForm onAdded={() => { setShowAdd(false); window.location.reload(); }} />
          </div>
        )}
        {trips.length === 0 && !showAdd && (
          <div style={{ padding: "36px 20px", textAlign: "center", fontFamily: fm, fontSize: 12, color: g400 }}>
            Click <strong style={{ color: ink }}>+ Add trip</strong> to start tracking flights for a custom destination + dates.
          </div>
        )}
      </Card>
      {trips.map((t) => (
        <Card key={t.slug}>
          <CardHead
            eyebrow={t.isOwn ? "✦ YOUR TRIP" : "✦ MULTI-CITY"}
            title={`${t.label} · ${t.outboundDate} → ${t.returnDate}`}
            action={
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <RefreshTripBtn slug={t.slug} />
                {t.isOwn && <DeleteTripBtn slug={t.slug} />}
              </div>
            }
          />
          <div style={{ padding: "16px 20px 22px" }}>
            <div style={{ fontFamily: fm, fontSize: 11, color: g500, letterSpacing: ".08em", marginBottom: 14 }}>
              IND → {t.outboundDestCode} (out) · {t.returnOriginCode} → IND (return)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {t.legs.map((leg) => (
                <TripLegCard key={leg.originCode} leg={leg} trip={t} />
              ))}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

const ALLOWED_ORIGINS = ["BOM", "DEL", "IDR", "BLR"] as const;

function AddTripForm({ onAdded }: { onAdded: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [label, setLabel] = useState("");
  const [outDest, setOutDest] = useState("");
  const [retOrig, setRetOrig] = useState("");
  const [outDate, setOutDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [origins, setOrigins] = useState<Set<string>>(new Set(["BOM"]));
  const [roundTrip, setRoundTrip] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const effectiveReturnOrigin = roundTrip ? outDest : retOrig;

  const toggleOrigin = (code: string) => {
    setOrigins((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const submit = async () => {
    setErr("");
    const finalRetOrig = effectiveReturnOrigin;
    if (!label.trim()) return setErr("Add a label (e.g. 'Bali honeymoon').");
    if (!/^[A-Z]{3}$/.test(outDest)) return setErr("Outbound destination must be 3-letter IATA code (e.g. HKT).");
    if (!/^[A-Z]{3}$/.test(finalRetOrig)) return setErr("Return origin must be 3-letter IATA code (e.g. BKK).");
    if (!outDate || !retDate) return setErr("Pick both dates.");
    if (origins.size === 0) return setErr("Select at least one home airport.");

    setBusy(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          outbound_dest_code: outDest,
          return_origin_code: finalRetOrig,
          outbound_date: outDate,
          return_date: retDate,
          origin_codes: [...origins],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error ?? "Failed to add trip.");
      } else {
        onAdded();
      }
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  };

  const inp: CSSProperties = {
    width: "100%", padding: "8px 10px", fontFamily: fm, fontSize: 13,
    border: `2px solid ${ink}`, borderRadius: 8, background: paper,
  };
  const lbl: CSSProperties = { fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: g500, marginBottom: 4, textTransform: "uppercase" };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label>
        <div style={lbl}>Trip label</div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Bali honeymoon" maxLength={80} style={inp} />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: fm, fontSize: 12, fontWeight: 700, color: ink, cursor: "pointer" }}>
        <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--color-violet)" }} />
        Round trip (return from same airport)
      </label>

      <div style={{ display: "grid", gridTemplateColumns: roundTrip ? "1fr" : "1fr 1fr", gap: 12 }}>
        <label>
          <div style={lbl}>Outbound dest (IATA)</div>
          <input value={outDest} onChange={(e) => setOutDest(e.target.value.toUpperCase().slice(0, 3))} placeholder="HKT" style={{ ...inp, fontWeight: 800 }} />
        </label>
        {!roundTrip && (
          <label>
            <div style={lbl}>Return origin (IATA)</div>
            <input value={retOrig} onChange={(e) => setRetOrig(e.target.value.toUpperCase().slice(0, 3))} placeholder="BKK (open-jaw)" style={{ ...inp, fontWeight: 800 }} />
          </label>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>
          <div style={lbl}>Outbound date</div>
          <input type="date" min={today} value={outDate} onChange={(e) => setOutDate(e.target.value)} style={inp} />
        </label>
        <label>
          <div style={lbl}>Return date</div>
          <input type="date" min={outDate || today} value={retDate} onChange={(e) => setRetDate(e.target.value)} style={inp} />
        </label>
      </div>

      <div>
        <div style={lbl}>Track from these home airports</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALLOWED_ORIGINS.map((c) => {
            const on = origins.has(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleOrigin(c)}
                style={{
                  padding: "6px 12px", fontFamily: fm, fontSize: 11, fontWeight: 800, letterSpacing: ".08em",
                  border: `2px solid ${ink}`, borderRadius: 999, cursor: "pointer",
                  background: on ? lime : "transparent", color: ink,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {err && <div style={{ fontFamily: fm, fontSize: 11, color: coral, fontWeight: 700 }}>{err}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={submit}
          disabled={busy}
          style={{
            padding: "10px 18px", fontFamily: fd, fontSize: 13, fontWeight: 900,
            background: lime, color: ink, border: `3px solid ${ink}`, borderRadius: 999,
            cursor: busy ? "wait" : "pointer", boxShadow: brutSm,
          }}
        >
          {busy ? "Adding…" : "Save trip"}
        </button>
        <div style={{ alignSelf: "center", fontFamily: fm, fontSize: 10, color: g500, lineHeight: 1.4 }}>
          Crawler picks it up on the next scheduled run. Set an alert from the leg cards once snapshots arrive.
        </div>
      </div>
    </div>
  );
}

function RefreshTripBtn({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const onClick = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/trips/refresh?slug=${encodeURIComponent(slug)}`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setMsg(`✓ ${json.refreshed} updated`);
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMsg(json.error ?? "Refresh failed");
        setTimeout(() => setMsg(""), 4000);
      }
    } catch (e) {
      setMsg(String(e));
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setBusy(false);
    }
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={onClick}
        disabled={busy}
        title="Fetch fresh prices from SerpApi (1 call per leg, throttled to 1×/hour)"
        style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: lime, cursor: busy ? "wait" : "pointer", background: "none", border: "none" }}
      >
        {busy ? "↻ Refreshing…" : "↻ Refresh now"}
      </button>
      {msg && <span style={{ fontFamily: fm, fontSize: 10, color: msg.startsWith("✓") ? lime : coral }}>{msg}</span>}
    </span>
  );
}

function DeleteTripBtn({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    if (!confirm("Stop tracking this trip? Snapshots stay in the DB but no new fares will be fetched.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/trips?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (res.ok) window.location.reload();
      else alert("Delete failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: coral, cursor: busy ? "wait" : "pointer", background: "none", border: "none" }}
    >
      {busy ? "Deleting…" : "Delete →"}
    </button>
  );
}

function TripLegCard({
  leg,
  trip,
}: {
  leg: ProfileData["trips"][number]["legs"][number];
  trip: ProfileData["trips"][number];
}) {
  const hasPrice = leg.totalPrice !== null;
  const hasDeal = leg.pctOff !== null && leg.pctOff > 0;
  const dealColor = leg.dealType === "unique" ? violet : leg.dealType === "rare" ? coral : lime;
  const dealBg = leg.dealType === "unique" ? violetT : leg.dealType === "rare" ? coralT : limeT;

  return (
    <div style={{ border: `3px solid ${ink}`, borderRadius: 16, padding: 16, background: paper, boxShadow: brutSm }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 22, color: ink, letterSpacing: "-.02em" }}>
          {leg.originCode}
        </div>
        {hasDeal && (
          <span style={{ fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", padding: "4px 10px", borderRadius: 999, background: dealBg, color: dealColor, border: `2px solid ${dealColor}` }}>
            -{leg.pctOff}% OFF
          </span>
        )}
      </div>

      <TypicalFare leg={leg} trip={trip} />

      <AlertControl tripSlug={trip.slug} originCode={leg.originCode} alert={leg.alert} />

      {hasPrice ? (
        <>
          <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 28, color: ink, letterSpacing: "-.03em", lineHeight: 1 }}>
            {fmtFull(leg.totalPrice ?? 0)}
          </div>
          {leg.baselineTotal !== null && hasDeal && (
            <div style={{ fontFamily: fm, fontSize: 11, color: g500, textDecoration: "line-through", marginTop: 4 }}>
              Baseline {fmtFull(Math.round(leg.baselineTotal))}
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `2px solid ${g200}`, display: "grid", gap: 8 }}>
            <LegRow
              label={`${leg.originCode} → ${trip.outboundDestCode}`}
              date={trip.outboundDate}
              price={leg.outboundPrice}
              airline={leg.outboundAirline}
              stops={leg.outboundStops}
              url={leg.outboundUrl}
            />
            <LegRow
              label={`${trip.returnOriginCode} → ${leg.originCode}`}
              date={trip.returnDate}
              price={leg.returnPrice}
              airline={leg.returnAirline}
              stops={leg.returnStops}
              url={leg.returnUrl}
            />
          </div>
        </>
      ) : (
        <div style={{ fontFamily: fm, fontSize: 12, color: g400, padding: "10px 0" }}>
          No fare snapshot yet — crawler will populate on next run.
        </div>
      )}
    </div>
  );
}

function TypicalFare({
  leg,
  trip,
}: {
  leg: ProfileData["trips"][number]["legs"][number];
  trip: ProfileData["trips"][number];
}) {
  const t = leg.typical;
  const fmtDur = (lo: number, hi: number) => {
    const h = (m: number) => (m / 60).toFixed(m % 60 === 0 ? 0 : 1).replace(/\.0$/, "");
    return lo === hi ? `${h(lo)}h` : `${h(lo)}–${h(hi)}h`;
  };

  const totalMedian =
    t.outboundMedianInr !== null && t.returnMedianInr !== null
      ? t.outboundMedianInr + t.returnMedianInr
      : null;

  return (
    <div style={{ marginBottom: 12, padding: 10, background: sunT, border: `2px solid ${ink}`, borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: ink }}>
          ✦ TYPICAL FARE · 90D
        </div>
        {totalMedian !== null && (
          <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, color: ink, letterSpacing: "-.02em" }}>
            {fmtFull(Math.round(totalMedian))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <TypicalLegRow
          dir="OUT"
          route={`${leg.originCode} → ${trip.outboundDestCode}`}
          medianInr={t.outboundMedianInr}
          samples={t.outboundSamples}
          info={t.outboundInfo}
          fmtDur={fmtDur}
        />
        <TypicalLegRow
          dir="RET"
          route={`${trip.returnOriginCode} → ${leg.originCode}`}
          medianInr={t.returnMedianInr}
          samples={t.returnSamples}
          info={t.returnInfo}
          fmtDur={fmtDur}
        />
      </div>

      {totalMedian === null && (
        <div style={{ fontFamily: fm, fontSize: 10, color: g600, marginTop: 8, lineHeight: 1.4 }}>
          Tracking — first snapshots populate after next crawler run. Need ≥3 per leg for a stable median.
        </div>
      )}
    </div>
  );
}

function TypicalLegRow({
  dir,
  route,
  medianInr,
  samples,
  info,
  fmtDur,
}: {
  dir: "OUT" | "RET";
  route: string;
  medianInr: number | null;
  samples: number;
  info: { distanceKm: number; minMin: number; maxMin: number; carriers: string[] } | null;
  fmtDur: (lo: number, hi: number) => string;
}) {
  return (
    <div style={{ background: paper, border: `1.5px solid ${g300}`, borderRadius: 8, padding: "6px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: ink }}>
          <span style={{ color: g500, marginRight: 4 }}>{dir}</span>
          {route}
        </div>
        <div style={{ fontFamily: fd, fontWeight: 800, fontSize: 13, color: ink }}>
          {medianInr !== null ? `${fmtFull(Math.round(medianInr))}` : <span style={{ color: g500, fontFamily: fm, fontSize: 10 }}>tracking…</span>}
        </div>
      </div>
      <div style={{ fontFamily: fm, fontSize: 9, color: g500, marginTop: 2, lineHeight: 1.4 }}>
        {info ? (
          <>
            ~{info.distanceKm.toLocaleString("en-IN")} km · {fmtDur(info.minMin, info.maxMin)} · {info.carriers.slice(0, 3).join(", ")}
          </>
        ) : (
          "route info unavailable"
        )}
        {medianInr !== null && (
          <span style={{ marginLeft: 6, color: g600 }}>
            · median over {samples} snapshot{samples === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

function AlertControl({
  tripSlug,
  originCode,
  alert,
}: {
  tripSlug: string;
  originCode: string;
  alert: { maxTotalInr: number | null; minPctOff: number | null } | null;
}) {
  const [open, setOpen] = useState(alert !== null);
  const [maxTotal, setMaxTotal] = useState(alert?.maxTotalInr?.toString() ?? "");
  const [minPct, setMinPct] = useState(alert?.minPctOff?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState<"ok" | "off" | "err" | null>(null);
  const [active, setActive] = useState(alert !== null);

  async function save() {
    const max = maxTotal.trim() ? Number(maxTotal) : null;
    const pct = minPct.trim() ? Number(minPct) : null;
    if (max == null && pct == null) {
      setSavedTick("err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/trip-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_slug: tripSlug,
          origin_code: originCode,
          max_total_inr: max,
          min_pct_off: pct,
        }),
      });
      setSavedTick(res.ok ? "ok" : "err");
      if (res.ok) setActive(true);
    } catch {
      setSavedTick("err");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedTick(null), 2000);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/trip-alerts?trip_slug=${encodeURIComponent(tripSlug)}&origin_code=${encodeURIComponent(originCode)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setActive(false);
        setMaxTotal("");
        setMinPct("");
        setSavedTick("off");
      } else {
        setSavedTick("err");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSavedTick(null), 2000);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", marginBottom: 12, padding: "8px 10px",
          fontFamily: fm, fontSize: 11, fontWeight: 800, letterSpacing: ".08em",
          background: limeT, color: ink, border: `2px dashed ${ink}`, borderRadius: 10, cursor: "pointer",
        }}
      >
        🔔 SET PRICE ALERT
      </button>
    );
  }

  return (
    <div style={{ marginBottom: 12, padding: 10, background: g100, border: `2px solid ${ink}`, borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: ink }}>
          🔔 PRICE ALERT {active ? "· ACTIVE" : ""}
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: fm, fontSize: 14, color: g500 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <label style={{ display: "block" }}>
          <div style={{ fontFamily: fm, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: g500, marginBottom: 4 }}>MAX TOTAL ₹</div>
          <input
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="35000"
            inputMode="numeric"
            style={{ width: "100%", padding: "6px 8px", fontFamily: fm, fontSize: 12, border: `2px solid ${ink}`, borderRadius: 6, background: paper }}
          />
        </label>
        <label style={{ display: "block" }}>
          <div style={{ fontFamily: fm, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: g500, marginBottom: 4 }}>MIN % OFF</div>
          <input
            value={minPct}
            onChange={(e) => setMinPct(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="40"
            inputMode="numeric"
            style={{ width: "100%", padding: "6px 8px", fontFamily: fm, fontSize: 12, border: `2px solid ${ink}`, borderRadius: 6, background: paper }}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ flex: 1, padding: "7px 10px", fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", background: lime, color: ink, border: `2px solid ${ink}`, borderRadius: 999, cursor: saving ? "wait" : "pointer" }}
        >
          {saving ? "..." : active ? "UPDATE" : "SAVE ALERT"}
        </button>
        {active && (
          <button
            onClick={remove}
            disabled={saving}
            style={{ padding: "7px 10px", fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", background: "transparent", color: coral, border: `2px solid ${coral}`, borderRadius: 999, cursor: saving ? "wait" : "pointer" }}
          >
            REMOVE
          </button>
        )}
        {savedTick === "ok" && <span style={{ fontFamily: fm, fontSize: 10, color: success, fontWeight: 800 }}>✓</span>}
        {savedTick === "off" && <span style={{ fontFamily: fm, fontSize: 10, color: g500, fontWeight: 800 }}>removed</span>}
        {savedTick === "err" && <span style={{ fontFamily: fm, fontSize: 10, color: coral, fontWeight: 800 }}>err</span>}
      </div>
      <div style={{ fontFamily: fm, fontSize: 10, color: g500, marginTop: 6, lineHeight: 1.4 }}>
        Email when total fare ≤ max OR drop ≥ min %.
      </div>
    </div>
  );
}

function LegRow({
  label,
  date,
  price,
  airline,
  stops,
  url,
}: {
  label: string;
  date: string;
  price: number | null;
  airline: string | null;
  stops: number | null;
  url: string | null;
}) {
  const stopsTxt = stops === null ? "" : stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: fm, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: ink }}>{label}</div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, marginTop: 2 }}>
          {date} · {airline ?? "—"} · {stopsTxt}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontFamily: fd, fontWeight: 800, fontSize: 14, color: ink }}>{price !== null ? fmtFull(price) : "—"}</div>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: fm, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", color: violet, textDecoration: "none", padding: "4px 8px", border: `2px solid ${violet}`, borderRadius: 999 }}>
            BOOK →
          </a>
        )}
      </div>
    </div>
  );
}

function SavedDealRow({ d }: { d: ProfileData["savedDeals"][number] }) {
  const saving = d.baselinePrice - d.currentPrice;
  const barColor = d.status === "booked" ? success : d.status === "expired" ? g300 : coral;
  const chipMap = {
    active: { label: "Active", bg: coralT, color: coral },
    booked: { label: "✓ Booked", bg: success, color: "#fff" },
    expired: { label: "Expired", bg: g100, color: g400 },
  };
  const chip = chipMap[d.status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `2px solid ${g100}`, opacity: d.status === "expired" ? 0.55 : 1 }}>
      <div style={{ width: 4, height: 48, borderRadius: 2, background: barColor, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, letterSpacing: "-.02em" }}>
          {d.originCode} <span style={{ color: violet, margin: "0 4px" }}>→</span> {d.destCode}
        </div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em", marginTop: 2 }}>
          {d.airline.toUpperCase()} · {d.stops === 0 ? "DIRECT" : `${d.stops} STOP`} · {d.cabin.toUpperCase()} · {d.travelMonth}
        </div>
        <span style={{ display: "inline-block", fontFamily: fm, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "3px 8px", borderRadius: 999, marginTop: 4, textTransform: "uppercase", background: chip.bg, color: chip.color }}>{chip.label}</span>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, letterSpacing: "-.02em", color: d.status === "expired" ? g400 : undefined }}>{fmtFull(d.currentPrice)}</div>
        {d.status !== "expired" && saving > 0 && (
          <div style={{ display: "inline-block", fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", padding: "3px 8px", borderRadius: 999, background: limeT, color: ink, marginTop: 3 }}>
            {d.status === "booked" ? "Saved" : "Save"} {fmtFull(saving)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ALERTS ───────────────────────────────────────────────
function AlertsTab({ deals, showToast }: { deals: ProfileData["recentDeals"]; showToast: (m: string) => void }) {
  return (
    <Card>
      <CardHead eyebrow="✦ ALERT HISTORY" title={`${deals.length} recent deals`} />
      <div style={{ padding: "0 20px" }}>
        {deals.length === 0 ? (
          <div style={{ padding: "36px 0", textAlign: "center", fontFamily: fm, fontSize: 12, color: g400 }}>No alerts yet — we&apos;ll ping you when a deal drops 40%+.</div>
        ) : (
          deals.map((d) => <DealAlertRow key={d.id} d={d} />)
        )}
      </div>
    </Card>
  );
}

// ── BOOKINGS ─────────────────────────────────────────────
function BookingsTab({ bookings, stats }: { bookings: ProfileData["bookings"]; stats: ProfileData["stats"] }) {
  return (
    <div style={twoCol}>
      <Card>
        <CardHead eyebrow="✦ BOOKING TRACKER" title="Trips booked via FlockFare" />
        <div style={{ padding: "0 20px" }}>
          {bookings.length === 0 ? (
            <div style={{ padding: "36px 0", textAlign: "center", fontFamily: fm, fontSize: 12, color: g400 }}>No bookings tracked yet.</div>
          ) : (
            bookings.map((b) => {
              const saving = b.baseline - b.pricePaid;
              const pct = Math.round((saving / b.baseline) * 100);
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: `2px solid ${g100}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, border: `3px solid ${ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, background: limeT }}>✈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fd, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{b.route} · {b.travelMonth}</div>
                    <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em" }}>{b.airline.toUpperCase()} · {b.cabin.toUpperCase()} · BOOKED {new Date(b.bookedAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, letterSpacing: "-.02em" }}>{fmtFull(b.pricePaid)}</div>
                    <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, color: success, marginTop: 2 }}>Saved {fmtFull(saving)}</div>
                    <div style={{ display: "inline-block", fontFamily: fm, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: coral, color: "#fff", marginTop: 3 }}>-{pct}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
      <div>
        <Card>
          <CardHead eyebrow="✦ STATS" title="Lifetime numbers" />
          <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
            <StatRow l="Total trips" v={String(stats.tripsBooked)} />
            <StatRow l="Total saved" v={fmtFull(stats.totalSavings)} valStyle={{ color: success, fontWeight: 900, fontSize: 16 }} />
            <StatRow l="Avg discount" v={`${stats.avgDiscount}%`} />
            <StatRow l="Best single save" v={fmtFull(stats.bestSave)} last />
          </div>
        </Card>
        {stats.totalSavings > 0 && (
          <div style={{ background: lime, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, padding: 20 }}>
            <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 32, letterSpacing: "-.03em", marginBottom: 6 }}>{fmtFull(stats.totalSavings)}</div>
            <div style={{ fontSize: 14, color: "rgba(11,11,15,.6)", lineHeight: 1.6 }}>saved in {stats.tripsBooked} trip{stats.tripsBooked !== 1 ? "s" : ""}. Not bad for a free plan.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ l, v, valStyle, last }: { l: string; v: string; valStyle?: CSSProperties; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: last ? "none" : `2px solid ${g100}` }}>
      <span style={{ fontFamily: fm, fontSize: 11, color: g500 }}>{l}</span>
      <span style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, ...valStyle }}>{v}</span>
    </div>
  );
}

// ── PLAN & BILLING ───────────────────────────────────────
function PlanTab({ billing, setBilling, showToast, referralCode, planTier }: { billing: Billing; setBilling: (b: Billing) => void; showToast: (m: string) => void; referralCode: string; planTier: "free" | "pro" }) {
  const proPrice = billing === "yearly" ? "₹799" : "₹99";
  const proPer = billing === "yearly" ? "/year" : "/month";

  if (planTier === "pro") {
    return (
      <div style={twoCol}>
        <Card>
          <CardHead eyebrow="✦ CURRENT PLAN" title="Pro bird" />
          <div style={{ padding: 20 }}>
            <div style={{ border: `4px solid ${ink}`, borderRadius: 16, padding: 24, background: ink, boxShadow: brutLg, position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: 20, background: lime, border: `3px solid ${ink}`, borderRadius: 999, fontFamily: fm, fontSize: 9, fontWeight: 800, letterSpacing: ".12em", padding: "4px 12px", color: ink }}>ACTIVE</div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: lime, marginBottom: 5 }}>YOU&apos;RE ON</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 28, marginBottom: 10, color: cream }}>Pro bird · Lifetime</div>
              <div style={{ fontFamily: fm, fontSize: 12, color: "rgba(246,243,236,.65)", marginBottom: 16, lineHeight: 1.6 }}>All Pro features unlocked. No renewal, no billing.</div>
              <PfList items={["✓ Instant alerts (no delay)", "✓ Unlimited home airports", "✓ Unlimited custom routes", "✓ Business & first class", "✓ Priority mistake fares", "✓ Hotel drops", "✓ 90-day price charts", "✓ Early access to new routes"]} on />
            </div>
          </div>
        </Card>
        <div>
          <Card>
            <CardHead eyebrow="✦ BILLING" title="Payment history" />
            <div style={{ padding: "36px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎟️</div>
              <div style={{ fontFamily: fm, fontSize: 12, color: g400, letterSpacing: ".08em" }}>Comped · no payments required</div>
            </div>
          </Card>
          <ReferralCard code={referralCode} onCopy={() => showToast("Copied!")} />
        </div>
      </div>
    );
  }

  return (
    <div style={twoCol}>
      <Card>
        <CardHead eyebrow="✦ PLANS" title="Choose your plan" />
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ border: `4px solid ${g200}`, borderRadius: 16, padding: 20, background: g50 }}>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: g500, marginBottom: 5 }}>CURRENT PLAN</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, marginBottom: 2 }}>Free flock</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 30, letterSpacing: "-.03em", marginBottom: 12, color: g500 }}>₹0<span style={{ fontSize: 14, fontWeight: 400 }}>/forever</span></div>
              <PfList items={["✓ Deals feed", "✓ Email alerts (4h delay)", "✓ 1 home airport", "✓ 3 custom routes", "✗ Instant alerts", "✗ Business class", "✗ Mistake fares", "✗ Hotel drops"]} offAfter={4} />
            </div>
            <div style={{ border: `4px solid ${ink}`, borderRadius: 16, padding: 20, background: ink, boxShadow: brutLg, position: "relative" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: lime, border: `3px solid ${ink}`, borderRadius: 999, fontFamily: fm, fontSize: 9, fontWeight: 800, letterSpacing: ".12em", padding: "4px 12px", whiteSpace: "nowrap", color: ink }}>RECOMMENDED</div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: lime, marginBottom: 5 }}>UPGRADE TO</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, marginBottom: 2, color: cream }}>Pro bird</div>
              <div style={{ display: "flex", border: "2.5px solid rgba(246,243,236,.2)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                <BillBtn active={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</BillBtn>
                <BillBtn active={billing === "yearly"} onClick={() => setBilling("yearly")}>Yearly · -33%</BillBtn>
              </div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 30, letterSpacing: "-.03em", marginBottom: 12, color: cream }}>{proPrice}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(246,243,236,.4)" }}>{proPer}</span></div>
              <PfList items={["✓ Everything in Free", "✓ Instant alerts", "✓ Unlimited airports", "✓ Business & first class", "✓ Priority mistake fares", "✓ Hotel drops", "✓ Unlimited routes", "✓ 90-day price charts"]} on />
              <button onClick={() => showToast("Redirecting to Razorpay checkout…")} style={{ display: "block", width: "100%", fontFamily: fd, fontWeight: 900, fontSize: 15, padding: 14, borderRadius: 999, background: lime, color: ink, border: `4px solid ${cream}`, boxShadow: `5px 5px 0 ${cream}`, cursor: "pointer", marginTop: 14 }}>Upgrade now →</button>
              <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.28)", textAlign: "center", marginTop: 8, letterSpacing: ".06em" }}>7-day money-back · Cancel anytime</div>
            </div>
          </div>
        </div>
      </Card>
      <div>
        <Card>
          <CardHead eyebrow="✦ BILLING" title="Payment history" />
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontFamily: fm, fontSize: 12, color: g400, letterSpacing: ".08em" }}>No payments yet · Free plan</div>
          </div>
        </Card>
        <ReferralCard code={referralCode} onCopy={() => showToast("Copied!")} />
      </div>
    </div>
  );
}

function PfList({ items, offAfter, on }: { items: string[]; offAfter?: number; on?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
      {items.map((it, i) => {
        const isOff = offAfter !== undefined && i >= offAfter;
        const clr = isOff ? g400 : on ? "rgba(246,243,236,.85)" : undefined;
        return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: clr }}>{it}</div>;
      })}
    </div>
  );
}

function BillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} style={{ flex: 1, fontFamily: fm, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", padding: 7, border: "none", cursor: "pointer", background: active ? lime : "rgba(246,243,236,.08)", color: active ? ink : "rgba(246,243,236,.5)" }}>{children}</button>;
}

// ── SETTINGS ─────────────────────────────────────────────
type FormState = { name: string; email: string; homeAirport: string };
type NotifState = ProfileData["notifPrefs"];

function SettingsTab({ form, setForm, dirty, saveProfile, notif, savePrefs, showToast, memberSince }: {
  form: FormState;
  setForm: (f: FormState) => void;
  dirty: boolean;
  saveProfile: () => void;
  notif: NotifState;
  savePrefs: (n: NotifState) => void;
  showToast: (m: string) => void;
  memberSince: string;
}) {
  return (
    <div style={twoCol}>
      <div>
        <Card>
          <CardHead eyebrow="✦ PROFILE" title="Personal info" />
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Display name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email address" value={form.email} type="email" disabled />
            </div>
            <div style={{ marginTop: 14 }}>
              <AirportSelect
                label="Home airport"
                value={form.homeAirport}
                onChange={(v) => setForm({ ...form, homeAirport: v })}
              />
            </div>
            <div style={{ marginTop: 18 }}>
              <button onClick={saveProfile} disabled={!dirty} style={{ fontFamily: fd, fontWeight: 900, fontSize: 15, padding: "13px 28px", borderRadius: 999, background: lime, color: ink, border: `4px solid ${ink}`, boxShadow: brut, cursor: dirty ? "pointer" : "default", opacity: dirty ? 1 : 0.35, pointerEvents: dirty ? "auto" : "none" }}>
                Save changes →
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead eyebrow="✦ NOTIFICATIONS" title="Privacy & comms" />
          <div style={{ padding: "0 20px" }}>
            <Tgl label="Deal alert emails" desc="Receive Penny's alerts in your inbox" on={notif.deals_email} onChange={(v) => savePrefs({ ...notif, deals_email: v })} />
            <Tgl label="Weekly digest" desc="Best deals of the week, every Monday 8 AM" on={notif.weekly_digest} onChange={(v) => savePrefs({ ...notif, weekly_digest: v })} />
            <Tgl label="Browser push notifications" desc="Pop-ups for urgent deals on this device" on={notif.push} onChange={(v) => savePrefs({ ...notif, push: v })} />
            <Tgl label="Product updates & tips" desc="Feature announcements from the team" on={notif.updates} onChange={(v) => savePrefs({ ...notif, updates: v })} />
            <Tgl label="Anonymous analytics" desc="Help improve FlockFare (no personal data)" on={notif.analytics} onChange={(v) => savePrefs({ ...notif, analytics: v })} last />
          </div>
        </Card>
      </div>
      <div>
        <Card>
          <div style={{ background: ink, padding: "14px 20px", borderBottom: `3px solid ${coral}` }}>
            <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: coral, marginBottom: 3 }}>✦ DANGER ZONE</div>
            <h2 style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: coral }}>Account actions</h2>
          </div>
          <div style={{ padding: 20 }}>
            <DangerRow title="Export my data" desc="Download all history as JSON." action="Export" onClick={() => showToast("Export queued — check email in 5 min.")} />
            <DangerRow title="Pause all alerts" desc="Stop Penny without losing settings." action="Pause" onClick={() => showToast("Alerts paused. Resume anytime.")} />
            <DangerRow title="Sign out" desc="Log out of FlockFare." action="Sign out" onClick={() => {
              window.location.href = "/api/auth/signout";
            }} />
            <DangerRow title="Delete account" desc="Permanently remove everything." action="Delete" onClick={() => { if (confirm("Delete your account? This cannot be undone.")) showToast("Deletion requested."); }} />
          </div>
        </Card>
        <div style={{ background: g50, border: `3px solid ${g200}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontFamily: fm, fontSize: 10, letterSpacing: ".08em", color: g400, lineHeight: 1.8 }}>
            Member since {memberSince}<br />
            <a href="#" style={{ color: violet }}>Privacy policy</a> · <a href="#" style={{ color: violet }}>Terms of service</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: g600, marginBottom: 7 }}>{label}</div>
      <input type={type} value={value} disabled={disabled} onChange={onChange ? (e) => onChange(e.target.value) : undefined} style={{ width: "100%", fontSize: 14, padding: "12px 16px", border: `3px solid ${ink}`, borderRadius: 12, background: disabled ? g100 : paper, outline: "none", boxShadow: brutSm, opacity: disabled ? 0.6 : 1 }} />
    </div>
  );
}

function AirportSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: g600, marginBottom: 7 }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", fontSize: 14, padding: "12px 16px", border: `3px solid ${ink}`, borderRadius: 12, background: paper, outline: "none", boxShadow: brutSm, cursor: "pointer" }}>
        {DOMESTIC_AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>{a.code} — {a.city} ({a.name})</option>
        ))}
      </select>
    </div>
  );
}

function Tgl({ label, desc, on, onChange, last }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: last ? "none" : `2px solid ${g100}` }}>
      <div>
        <h4 style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</h4>
        <p style={{ fontSize: 12, color: g500 }}>{desc}</p>
      </div>
      <button type="button" onClick={() => onChange(!on)} aria-pressed={on} style={{ position: "relative", width: 48, height: 26, flexShrink: 0, background: on ? lime : g200, border: `2.5px solid ${ink}`, borderRadius: 999, cursor: "pointer", boxShadow: brutSm, padding: 0 }}>
        <span style={{ position: "absolute", top: 1, left: 1, width: 16, height: 16, borderRadius: "50%", background: ink, transform: on ? "translateX(22px)" : "translateX(0)", transition: "transform .2s cubic-bezier(.34,1.56,.64,1)" }} />
      </button>
    </div>
  );
}

function DangerRow({ title, desc, action, onClick }: { title: string; desc: string; action: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: 14, background: coralT, border: `3px solid ${coral}`, borderRadius: 12, marginBottom: 10 }}>
      <div><h4 style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, color: coral }}>{title}</h4><p style={{ fontSize: 13, color: g500 }}>{desc}</p></div>
      <button onClick={onClick} style={{ fontFamily: fd, fontWeight: 700, fontSize: 13, padding: "9px 18px", borderRadius: 999, background: "transparent", color: coral, border: `3px solid ${coral}`, flexShrink: 0, cursor: "pointer" }}>{action}</button>
    </div>
  );
}

// ── Util ─────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}
