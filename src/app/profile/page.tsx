"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Header } from "@/components/header";

type TabId = "overview" | "saved" | "alerts" | "bookings" | "plan" | "settings";
type AlertType = "unique" | "rare" | "common";
type Billing = "monthly" | "yearly";

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
  { id: "saved", label: "Saved deals (8)" },
  { id: "alerts", label: "Alert history (47)" },
  { id: "bookings", label: "Bookings tracked" },
  { id: "plan", label: "Plan & billing" },
  { id: "settings", label: "Settings" },
];

const MONTHLY_BARS: { m: string; s: number; on: boolean }[] = [
  { m: "Jan", s: 37600, on: true },
  { m: "Feb", s: 11100, on: true },
  { m: "Mar", s: 33400, on: true },
  { m: "Apr", s: 0, on: false },
];

const ALERTS: { type: AlertType; t: string; m: string; active: boolean }[] = [
  { type: "unique", t: "BOM → LHR · -61% · ₹21,400", m: "TODAY 3:42 AM · AIR INDIA · UNIQUE · 82 MIN LEFT", active: true },
  { type: "rare", t: "DEL → ICN · -64% · ₹14,900", m: "YESTERDAY · KOREAN AIR · RARE · EXPIRED", active: false },
  { type: "common", t: "BOM → DPS · -49% · ₹11,600", m: "14 APR · AIR ASIA · COMMON · EXPIRED", active: false },
  { type: "unique", t: "DEL → NRT · -71% · ₹18,700", m: "12 APR 4:30 AM · ANA · UNIQUE · 12H LEFT", active: true },
  { type: "rare", t: "BOM → CDG · -62% · ₹24,800", m: "10 APR · AIR FRANCE · RARE · EXPIRED", active: false },
  { type: "common", t: "BLR → DXB · -47% · ₹8,400", m: "8 APR · EMIRATES · COMMON · EXPIRED", active: false },
  { type: "rare", t: "BOM → SIN · -73% · ₹8,200", m: "6 APR 3:55 AM · SINGAPORE AIR · RARE · ACTIVE", active: true },
  { type: "common", t: "DEL → BKK · -54% · ₹9,800", m: "3 APR · INDIGO · COMMON · EXPIRED", active: false },
  { type: "unique", t: "BLR → LHR · -58% · ₹19,600", m: "28 MAR · BRITISH AIRWAYS · RARE · EXPIRED", active: false },
  { type: "rare", t: "BOM → FCO · -52% · ₹19,200", m: "22 MAR · LUFTHANSA · COMMON · EXPIRED", active: false },
];

const ICON_MAP: Record<AlertType, { bg: string; emoji: string; size: number }> = {
  unique: { bg: violet, emoji: "⚡", size: 16 },
  rare: { bg: coralT, emoji: "🔥", size: 16 },
  common: { bg: limeT, emoji: "✓", size: 13 },
};

export default function ProfilePage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [billing, setBilling] = useState<Billing>("yearly");
  const [toast, setToast] = useState<string>("");
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({
    name: "Aryan Khanna",
    display: "aryan-khanna",
    email: "aryan@gmail.com",
    phone: "",
    tz: "IST (UTC+5:30)",
  });
  const [notif, setNotif] = useState({
    deals: true,
    digest: true,
    push: false,
    updates: true,
    analytics: true,
  });

  const switchTab = (id: TabId) => {
    setTab(id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  const copyRef = () => {
    navigator.clipboard?.writeText("flockfare.com/join/aryan-khanna");
    showToast("Referral link copied!");
  };

  const saveProfile = () => {
    setDirty(false);
    showToast("✓ Profile updated");
  };

  return (
    <div style={{ background: g50, minHeight: "100vh", color: ink, fontFamily: "var(--font-body)" }}>
      <Header />

      <ProfileHero tab={tab} switchTab={switchTab} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 40px 80px" }}>
        {tab === "overview" && (
          <Overview switchTab={switchTab} copyRef={copyRef} />
        )}
        {tab === "saved" && <SavedDeals />}
        {tab === "alerts" && <AlertHistory showToast={showToast} />}
        {tab === "bookings" && <Bookings />}
        {tab === "plan" && (
          <PlanBilling
            billing={billing}
            setBilling={setBilling}
            showToast={showToast}
          />
        )}
        {tab === "settings" && (
          <Settings
            form={form}
            setForm={(v) => {
              setForm(v);
              setDirty(true);
            }}
            dirty={dirty}
            saveProfile={saveProfile}
            notif={notif}
            setNotif={setNotif}
            showToast={showToast}
          />
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: ink,
            color: lime,
            fontFamily: fm,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".1em",
            padding: "12px 24px",
            borderRadius: 999,
            border: `3px solid ${lime}`,
            zIndex: 999,
            whiteSpace: "nowrap",
            boxShadow: brut,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────────
function ProfileHero({ tab, switchTab }: { tab: TabId; switchTab: (id: TabId) => void }) {
  return (
    <div
      style={{
        background: ink,
        borderBottom: `4px solid ${lime}`,
        padding: "0 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 350,
          height: 350,
          background: violet,
          opacity: 0.08,
          borderRadius: "50%",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -60,
          left: 240,
          width: 180,
          height: 180,
          background: lime,
          opacity: 0.05,
          borderRadius: "50%",
        }}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 0 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: violet,
                color: "#fff",
                fontFamily: fd,
                fontWeight: 900,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `4px solid ${cream}`,
                boxShadow: brut,
                flexShrink: 0,
              }}
            >
              AK
            </div>
            <div>
              <div
                style={{
                  fontFamily: fd,
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem,3vw,2.4rem)",
                  letterSpacing: "-.03em",
                  color: cream,
                  lineHeight: 1.04,
                }}
              >
                Aryan Khanna
              </div>
              <div style={{ fontFamily: fm, fontSize: 12, color: "rgba(246,243,236,.4)", letterSpacing: ".06em", marginTop: 4 }}>
                aryan@gmail.com
              </div>
              <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.25)", letterSpacing: ".1em", marginTop: 2 }}>
                MEMBER SINCE JAN 2026 · 3 MONTHS IN THE FLOCK
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                <Ubadge bg={lime} color={ink}>🐧 Flock member</Ubadge>
                <Ubadge bg="rgba(246,243,236,.1)" color="rgba(246,243,236,.6)" border="1.5px solid rgba(246,243,236,.15)">
                  FREE PLAN
                </Ubadge>
                <Ubadge bg="var(--color-success)" color="#fff" border={`1.5px solid ${success}`}>
                  ✓ Verified
                </Ubadge>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}>
            <button
              onClick={() => switchTab("settings")}
              style={{
                fontFamily: fd,
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 999,
                background: "transparent",
                color: cream,
                border: "3px solid rgba(246,243,236,.25)",
                cursor: "pointer",
              }}
            >
              Edit profile
            </button>
            <button
              onClick={() => switchTab("plan")}
              style={{
                fontFamily: fd,
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 999,
                background: lime,
                color: ink,
                border: `3px solid ${cream}`,
                boxShadow: `3px 3px 0 ${cream}`,
                cursor: "pointer",
              }}
            >
              ⚡ Upgrade to Pro
            </button>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 28, overflowX: "auto" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                style={{
                  fontFamily: fm,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  padding: "12px 20px",
                  cursor: "pointer",
                  color: active ? lime : "rgba(246,243,236,.4)",
                  borderBottom: `4px solid ${active ? lime : "transparent"}`,
                  background: "none",
                  border: "none",
                  borderBottomWidth: 4,
                  borderBottomStyle: "solid",
                  borderBottomColor: active ? "var(--color-lime)" : "transparent",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Ubadge({ children, bg, color, border }: { children: ReactNode; bg: string; color: string; border?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: fm,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".1em",
        padding: "4px 11px",
        borderRadius: 999,
        background: bg,
        color,
        border,
      }}
    >
      {children}
    </span>
  );
}

// ── CARD PRIMITIVES ──────────────────────────────────────
function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: paper,
        border: `4px solid ${ink}`,
        borderRadius: 20,
        boxShadow: brut,
        overflow: "hidden",
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div
      style={{
        background: ink,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: lime, marginBottom: 3 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: cream }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────
function Overview({ switchTab, copyRef }: { switchTab: (id: TabId) => void; copyRef: () => void }) {
  const max = useMemo(() => Math.max(...MONTHLY_BARS.map((d) => d.s), 1), []);
  return (
    <div style={twoCol}>
      <div>
        {/* Savings hero */}
        <div
          style={{
            background: ink,
            border: `4px solid ${ink}`,
            borderRadius: 24,
            boxShadow: brutLg,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: lime,
              padding: "20px 24px",
              borderBottom: `4px solid ${ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "rgba(11,11,15,.5)", marginBottom: 6 }}>
                ✦ TOTAL SAVINGS UNLOCKED
              </div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: "clamp(3rem,5vw,4.5rem)", letterSpacing: "-.04em", color: ink, lineHeight: 1 }}>
                ₹71,000
              </div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "rgba(11,11,15,.5)", marginTop: 4 }}>
                SAVED SINCE JOINING
              </div>
            </div>
            <div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 56, color: ink, letterSpacing: "-.04em", lineHeight: 1, textAlign: "right" }}>
                3
              </div>
              <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(11,11,15,.5)", letterSpacing: ".14em", textAlign: "right" }}>
                TRIPS BOOKED
              </div>
            </div>
          </div>
          <div style={{ padding: "22px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              <Stat val="₹33,400" lbl="Best single save" />
              <Stat val="62%" lbl="Avg discount" />
              <Stat val="47" lbl="Alerts received" />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60, marginBottom: 8 }}>
              {MONTHLY_BARS.map((d) => {
                const h = Math.max(Math.round((d.s / max) * 56), 4);
                return (
                  <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        borderRadius: "4px 4px 0 0",
                        height: h,
                        background: d.on ? lime : "rgba(246,243,236,.07)",
                        border: `2px solid ${d.on ? lime : "rgba(246,243,236,.12)"}`,
                      }}
                    />
                    <div style={{ fontFamily: fm, fontSize: 8, color: "rgba(246,243,236,.28)", letterSpacing: ".08em" }}>{d.m}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.3)", letterSpacing: ".06em", textAlign: "center" }}>
              Monthly savings · Jan – Apr 2026
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <Card>
          <CardHead
            eyebrow="✦ RECENT ACTIVITY"
            title="Latest from Penny"
            action={
              <button
                onClick={() => switchTab("alerts")}
                style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: lime, cursor: "pointer", background: "none", border: "none" }}
              >
                View all →
              </button>
            }
          />
          <div style={{ padding: "0 20px" }}>
            {ALERTS.slice(0, 3).map((a, i) => (
              <AlertRow key={i} a={a} onClick={() => (a.active ? window.open("#") : switchTab("alerts"))} />
            ))}
          </div>
        </Card>

        {/* Penny's take */}
        <div style={{ background: ink, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, overflow: "hidden" }}>
          <div
            style={{
              background: lime,
              padding: "14px 20px",
              borderBottom: `4px solid ${ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "rgba(11,11,15,.5)", marginBottom: 3 }}>
                ✦ PENNY&rsquo;S TAKE
              </div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: ink }}>Your flock report, Aryan</div>
            </div>
            <div style={{ fontSize: 28 }}>🐧</div>
          </div>
          <div style={{ padding: "20px 24px", fontSize: 14, color: "rgba(246,243,236,.7)", lineHeight: 1.75 }}>
            In 3 months you&rsquo;ve saved <strong style={{ color: lime }}>₹71,000</strong> — more than most spend on a whole Europe trip. Your best catch was BOM → LHR at ₹21,400 (was ₹54,800). You have <strong style={{ color: lime }}>3 active saved deals</strong> and 1 expiring in 82 minutes. On free plan, you missed 6 deals this month that Pro members caught 4 hours earlier. Upgrading would cost ₹799 and you&rsquo;d likely save ₹40k+ in year one.
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div>
        <Card>
          <CardHead eyebrow="✦ CURRENT PLAN" title="Free flock" />
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

        <div
          style={{
            background: violet,
            border: `4px solid ${ink}`,
            borderRadius: 20,
            boxShadow: brut,
            padding: 20,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <h3 style={{ fontFamily: fd, fontWeight: 900, fontSize: 17, color: "#fff", marginBottom: 6 }}>Missed 6 deals this month.</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.55, marginBottom: 14 }}>
            Pro members got instant access to 6 deals you would&rsquo;ve loved — including a BLR → NRT business class at -71%.
          </p>
          <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 28, color: "#fff", letterSpacing: "-.03em", marginBottom: 3 }}>
            ₹799<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.4)" }}>/year</span>
          </div>
          <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 12, letterSpacing: ".06em" }}>
            OR ₹99/MONTH · 7-DAY MONEY-BACK
          </div>
          <button
            onClick={() => switchTab("plan")}
            style={{
              display: "block",
              width: "100%",
              fontFamily: fd,
              fontWeight: 900,
              fontSize: 15,
              padding: 14,
              borderRadius: 999,
              background: lime,
              color: ink,
              border: `4px solid ${ink}`,
              boxShadow: brut,
              cursor: "pointer",
            }}
          >
            Upgrade to Pro →
          </button>
        </div>

        <ReferralCard onCopy={copyRef} />
      </div>
    </div>
  );
}

function Stat({ val, lbl }: { val: string; lbl: string }) {
  return (
    <div>
      <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, letterSpacing: "-.03em", color: cream }}>{val}</div>
      <div style={{ fontFamily: fm, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(246,243,236,.35)", marginTop: 3 }}>
        {lbl}
      </div>
    </div>
  );
}

function PlanLine({ children, on }: { children: ReactNode; on?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", color: on ? undefined : g400 }}>
      <span>{on ? "✓" : "🔐"}</span>
      <span>{children}</span>
    </div>
  );
}

function AlertRow({ a, onClick }: { a: { type: AlertType; t: string; m: string; active: boolean }; onClick: () => void }) {
  const i = ICON_MAP[a.type];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderBottom: `2px solid ${g100}`,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: `2.5px solid ${ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: i.size,
          flexShrink: 0,
          marginTop: 1,
          background: i.bg,
        }}
      >
        {i.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{a.t}</div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em" }}>{a.m}</div>
      </div>
      <button
        onClick={onClick}
        style={{
          fontFamily: fm,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".1em",
          padding: "6px 12px",
          borderRadius: 999,
          border: `2.5px solid ${ink}`,
          color: ink,
          background: paper,
          cursor: "pointer",
          boxShadow: brutSm,
        }}
      >
        {a.active ? "Book →" : "View →"}
      </button>
    </div>
  );
}

function ReferralCard({ onCopy }: { onCopy: () => void }) {
  return (
    <div style={{ background: sunT, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, padding: "18px 20px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: fd, fontWeight: 900, fontSize: 15, marginBottom: 5 }}>Invite friends. Earn months.</h3>
      <p style={{ fontSize: 13, color: g500, lineHeight: 1.5, marginBottom: 12 }}>
        Every friend who joins earns you 1 month of Pro free.
      </p>
      <div style={{ display: "flex", border: `3px solid ${ink}`, borderRadius: 10, overflow: "hidden", boxShadow: brutSm }}>
        <input
          readOnly
          value="flockfare.com/join/aryan-khanna"
          style={{
            flex: 1,
            fontFamily: fm,
            fontSize: 11,
            padding: "10px 12px",
            background: paper,
            border: "none",
            outline: "none",
            color: g600,
          }}
        />
        <button
          onClick={onCopy}
          style={{
            fontFamily: fm,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".1em",
            padding: "10px 14px",
            background: ink,
            color: lime,
            border: "none",
            cursor: "pointer",
          }}
        >
          COPY
        </button>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <RsItem v="4" l="Invited" />
        <RsItem v="2" l="Joined" />
        <RsItem v="2 mo" l="Pro earned" />
      </div>
    </div>
  );
}

function RsItem({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, letterSpacing: "-.02em" }}>{v}</div>
      <div style={{ fontFamily: fm, fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: g500, marginTop: 2 }}>{l}</div>
    </div>
  );
}

// ── SAVED DEALS ──────────────────────────────────────────
function SavedDeals() {
  return (
    <Card>
      <CardHead
        eyebrow="✦ SAVED DEALS"
        title="8 deals in your collection"
        action={
          <button
            onClick={() => window.open("#")}
            style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: lime, cursor: "pointer", background: "none", border: "none" }}
          >
            Browse all →
          </button>
        }
      />
      <div style={{ padding: "0 20px" }}>
        <SectionLabel color={violet}>✦ ACTIVE NOW</SectionLabel>
        <DealRow bar={coral} from="BOM" to="LHR" sub="AIR INDIA · DIRECT · ECONOMY · JUL 2026" chip={{ label: "⏰ Expires in 82 min", bg: coralT, color: coral }} price="₹21,400" save="Save ₹33,400" />
        <DealRow bar={lime} from="BOM" to="SIN" sub="SINGAPORE AIR · DIRECT · ECONOMY · AUG 2026" chip={{ label: "⏰ Expires in 4h 20m", bg: coralT, color: coral }} price="₹8,200" save="Save ₹20,400" />
        <DealRow bar={violet} from="DEL" to="NRT" sub="ANA · DIRECT · BUSINESS · SEP 2026" chip={{ label: "Active · 12h left", bg: coralT, color: coral }} price="₹18,700" save="Save ₹39,700" />
        <SectionLabel color={success}>✦ BOOKED</SectionLabel>
        <DealRow bar={success} from="BOM" to="LHR" sub="AIR INDIA · ECONOMY · MAR 2026 · BOOKED 25 JAN" chip={{ label: "✓ Booked", bg: "var(--color-success)", color: "#fff" }} price="₹21,400" save="Saved ₹33,400" />
        <DealRow bar={success} from="BOM" to="DPS" sub="AIR ASIA · 1 STOP · ECONOMY · FEB 2026 · BOOKED 10 JAN" chip={{ label: "✓ Booked", bg: "var(--color-success)", color: "#fff" }} price="₹11,600" save="Saved ₹11,100" />
        <SectionLabel color={g400}>✦ EXPIRED</SectionLabel>
        <DealRow bar={g300} from="DEL" to="BKK" sub="INDIGO · 1 STOP · ECONOMY · MAR 2026" chip={{ label: "Expired", bg: g100, color: g400 }} price="₹9,800" priceColor={g400} dim />
        <DealRow bar={g300} from="BLR" to="DXB" sub="EMIRATES · DIRECT · ECONOMY · APR 2026" chip={{ label: "Expired", bg: g100, color: g400 }} price="₹8,400" priceColor={g400} dim />
      </div>
    </Card>
  );
}

function SectionLabel({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div
      style={{
        fontFamily: fm,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".16em",
        padding: "12px 0 8px",
        borderBottom: `2px solid ${g200}`,
        color,
        marginTop: 10,
      }}
    >
      {children}
    </div>
  );
}

function DealRow({
  bar,
  from,
  to,
  sub,
  chip,
  price,
  save,
  priceColor,
  dim,
}: {
  bar: string;
  from: string;
  to: string;
  sub: string;
  chip: { label: string; bg: string; color: string };
  price: string;
  save?: string;
  priceColor?: string;
  dim?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: `2px solid ${g100}`,
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div style={{ width: 4, height: 48, borderRadius: 2, background: bar, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, letterSpacing: "-.02em" }}>
          {from} <span style={{ color: violet, margin: "0 4px" }}>→</span> {to}
        </div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em", marginTop: 2 }}>{sub}</div>
        <span
          style={{
            display: "inline-block",
            fontFamily: fm,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: ".1em",
            padding: "3px 8px",
            borderRadius: 999,
            marginTop: 4,
            textTransform: "uppercase",
            background: chip.bg,
            color: chip.color,
          }}
        >
          {chip.label}
        </span>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, letterSpacing: "-.02em", color: priceColor }}>{price}</div>
        {save && (
          <div
            style={{
              display: "inline-block",
              fontFamily: fm,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".08em",
              padding: "3px 8px",
              borderRadius: 999,
              background: limeT,
              color: ink,
              marginTop: 3,
            }}
          >
            {save}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ALERT HISTORY ────────────────────────────────────────
function AlertHistory({ showToast }: { showToast: (m: string) => void }) {
  return (
    <Card>
      <CardHead eyebrow="✦ ALERT HISTORY" title="47 alerts · 3 months" />
      <div style={{ padding: "0 20px" }}>
        {ALERTS.map((a, i) => (
          <AlertRow key={i} a={a} onClick={() => (a.active ? window.open("#") : showToast("Deal has expired."))} />
        ))}
      </div>
    </Card>
  );
}

// ── BOOKINGS ─────────────────────────────────────────────
function Bookings() {
  return (
    <div style={twoCol}>
      <Card>
        <CardHead eyebrow="✦ BOOKING TRACKER" title="Trips booked via FlockFare" />
        <div style={{ padding: "0 20px" }}>
          <SectionLabel color={g500}>2026</SectionLabel>
          <BkRow icon="✈" iconBg={limeT} title="Mumbai → London · Mar 2026" meta="AIR INDIA · AI 101 · ECONOMY · DIRECT · BOOKED 25 JAN 2026" price="₹21,400" saved="Saved ₹33,400" pct="-61%" />
          <BkRow icon="🌴" iconBg={coralT} title="Mumbai → Bali · Feb 2026" meta="AIR ASIA · 1 STOP · ECONOMY · BOOKED 10 JAN 2026" price="₹11,600" saved="Saved ₹11,100" pct="-49%" />
          <BkRow icon="🗼" iconBg={violetT} title="Delhi → Paris · Jan 2026" meta="AIR FRANCE · 1 STOP · ECONOMY · BOOKED 3 JAN 2026" price="₹24,800" saved="Saved ₹37,600" pct="-62%" />
        </div>
      </Card>
      <div>
        <Card>
          <CardHead eyebrow="✦ STATS" title="Lifetime numbers" />
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 0 }}>
            <StatRow l="Total trips" v="3" />
            <StatRow l="Total saved" v="₹82,100" valStyle={{ color: success, fontWeight: 900, fontSize: 16 }} />
            <StatRow l="Avg discount" v="57%" />
            <StatRow l="Best single save" v="₹37,600" />
            <StatRow l="Countries visited" v="3 🇬🇧🇮🇩🇫🇷" last />
          </div>
        </Card>
        <div style={{ background: lime, border: `4px solid ${ink}`, borderRadius: 20, boxShadow: brut, padding: 20 }}>
          <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 32, letterSpacing: "-.03em", marginBottom: 6 }}>₹82,100</div>
          <div style={{ fontSize: 14, color: "rgba(11,11,15,.6)", lineHeight: 1.6 }}>
            saved in 3 months. The average Indian family vacation costs ₹80k. You&rsquo;ve already saved that — and you haven&rsquo;t even gone Pro yet.
          </div>
        </div>
      </div>
    </div>
  );
}

function BkRow({
  icon,
  iconBg,
  title,
  meta,
  price,
  saved,
  pct,
}: {
  icon: string;
  iconBg: string;
  title: string;
  meta: string;
  price: string;
  saved: string;
  pct: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: `2px solid ${g100}` }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          border: `3px solid ${ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
          background: iconBg,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fd, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: fm, fontSize: 10, color: g500, letterSpacing: ".08em" }}>{meta}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 18, letterSpacing: "-.02em" }}>{price}</div>
        <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, color: success, marginTop: 2 }}>{saved}</div>
        <div style={{ display: "inline-block", fontFamily: fm, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: coral, color: "#fff", marginTop: 3 }}>
          {pct}
        </div>
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
function PlanBilling({
  billing,
  setBilling,
  showToast,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
  showToast: (m: string) => void;
}) {
  const proPrice = billing === "yearly" ? "₹799" : "₹99";
  const proPer = billing === "yearly" ? "/year" : "/month";
  return (
    <div style={twoCol}>
      <Card>
        <CardHead eyebrow="✦ PLANS" title="Choose your plan" />
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Free */}
            <div style={{ border: `4px solid ${g200}`, borderRadius: 16, padding: 20, background: g50 }}>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: g500, marginBottom: 5 }}>
                CURRENT PLAN
              </div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, marginBottom: 2 }}>Free flock</div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 30, letterSpacing: "-.03em", marginBottom: 12, color: g500 }}>
                ₹0<span style={{ fontSize: 14, fontWeight: 400 }}>/forever</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
                <Pf>✓ Deals feed</Pf>
                <Pf>✓ Email alerts (4h delay)</Pf>
                <Pf>✓ 1 home airport</Pf>
                <Pf>✓ 3 custom routes</Pf>
                <Pf off>✗ Instant alerts</Pf>
                <Pf off>✗ Business class</Pf>
                <Pf off>✗ Mistake fares (priority)</Pf>
                <Pf off>✗ Hotel drops</Pf>
              </div>
            </div>
            {/* Pro */}
            <div style={{ border: `4px solid ${ink}`, borderRadius: 16, padding: 20, background: ink, boxShadow: brutLg, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: lime,
                  border: `3px solid ${ink}`,
                  borderRadius: 999,
                  fontFamily: fm,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  padding: "4px 12px",
                  whiteSpace: "nowrap",
                  color: ink,
                }}
              >
                RECOMMENDED
              </div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: lime, marginBottom: 5 }}>
                UPGRADE TO
              </div>
              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 20, marginBottom: 2, color: cream }}>Pro bird</div>

              <div style={{ display: "flex", border: "2.5px solid rgba(246,243,236,.2)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                <BillBtn active={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</BillBtn>
                <BillBtn active={billing === "yearly"} onClick={() => setBilling("yearly")}>Yearly · -33%</BillBtn>
              </div>

              <div style={{ fontFamily: fd, fontWeight: 900, fontSize: 30, letterSpacing: "-.03em", marginBottom: 12, color: cream }}>
                {proPrice}
                <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(246,243,236,.4)" }}>{proPer}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13 }}>
                <Pf hi>✓ Everything in Free</Pf>
                <Pf on>✓ <strong>Instant</strong> alerts (no delay)</Pf>
                <Pf on>✓ <strong>Unlimited</strong> airports</Pf>
                <Pf on>✓ Business &amp; first class</Pf>
                <Pf on>✓ Priority mistake fares</Pf>
                <Pf on>✓ Hotel drops</Pf>
                <Pf on>✓ <strong>Unlimited</strong> routes</Pf>
                <Pf on>✓ 90-day price charts</Pf>
              </div>
              <button
                onClick={() => showToast("Redirecting to Razorpay checkout…")}
                style={{
                  display: "block",
                  width: "100%",
                  fontFamily: fd,
                  fontWeight: 900,
                  fontSize: 15,
                  padding: 14,
                  borderRadius: 999,
                  background: lime,
                  color: ink,
                  border: `4px solid ${cream}`,
                  boxShadow: `5px 5px 0 ${cream}`,
                  cursor: "pointer",
                  marginTop: 14,
                }}
              >
                Upgrade now →
              </button>
              <div style={{ fontFamily: fm, fontSize: 10, color: "rgba(246,243,236,.28)", textAlign: "center", marginTop: 8, letterSpacing: ".06em" }}>
                7-day money-back · Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <Card>
          <CardHead eyebrow="✦ BILLING" title="Payment history" />
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontFamily: fm, fontSize: 12, color: g400, letterSpacing: ".08em" }}>
              No payments yet · Free plan
            </div>
          </div>
        </Card>
        <ReferralCard onCopy={() => showToast("Copied!")} />
      </div>
    </div>
  );
}

function Pf({ children, off, on, hi }: { children: ReactNode; off?: boolean; on?: boolean; hi?: boolean }) {
  let color: string | undefined;
  if (off) color = g400;
  else if (hi) color = lime;
  else if (on) color = "rgba(246,243,236,.85)";
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color }}>{children}</div>;
}

function BillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontFamily: fm,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".08em",
        padding: 7,
        border: "none",
        cursor: "pointer",
        background: active ? lime : "rgba(246,243,236,.08)",
        color: active ? ink : "rgba(246,243,236,.5)",
      }}
    >
      {children}
    </button>
  );
}

// ── SETTINGS ─────────────────────────────────────────────
type FormState = { name: string; display: string; email: string; phone: string; tz: string };
type NotifState = { deals: boolean; digest: boolean; push: boolean; updates: boolean; analytics: boolean };

function Settings({
  form,
  setForm,
  dirty,
  saveProfile,
  notif,
  setNotif,
  showToast,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  dirty: boolean;
  saveProfile: () => void;
  notif: NotifState;
  setNotif: (n: NotifState) => void;
  showToast: (m: string) => void;
}) {
  return (
    <div style={twoCol}>
      <div>
        <Card>
          <CardHead eyebrow="✦ PROFILE" title="Personal info" />
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Display name" value={form.display} onChange={(v) => setForm({ ...form, display: v })} />
              <Field label="Email address" value={form.email} type="email" full onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone (optional)" value={form.phone} type="tel" placeholder="+91 98765 43210" onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Timezone" value={form.tz} onChange={(v) => setForm({ ...form, tz: v })} />
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                onClick={saveProfile}
                disabled={!dirty}
                style={{
                  fontFamily: fd,
                  fontWeight: 900,
                  fontSize: 15,
                  padding: "13px 28px",
                  borderRadius: 999,
                  background: lime,
                  color: ink,
                  border: `4px solid ${ink}`,
                  boxShadow: brut,
                  cursor: dirty ? "pointer" : "default",
                  opacity: dirty ? 1 : 0.35,
                  pointerEvents: dirty ? "auto" : "none",
                }}
              >
                Save changes →
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHead eyebrow="✦ NOTIFICATIONS" title="Privacy & comms" />
          <div style={{ padding: "0 20px" }}>
            <Tgl label="Deal alert emails" desc="Receive Penny's alerts in your inbox" on={notif.deals} onChange={(v) => setNotif({ ...notif, deals: v })} />
            <Tgl label="Weekly digest" desc="Best deals of the week, every Monday 8 AM" on={notif.digest} onChange={(v) => setNotif({ ...notif, digest: v })} />
            <Tgl label="Browser push notifications" desc="Pop-ups for urgent deals on this device" on={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
            <Tgl label="Product updates & tips" desc="Feature announcements from the team" on={notif.updates} onChange={(v) => setNotif({ ...notif, updates: v })} />
            <Tgl label="Anonymous analytics" desc="Help improve FlockFare (no personal data)" on={notif.analytics} onChange={(v) => setNotif({ ...notif, analytics: v })} last />
          </div>
        </Card>
      </div>
      <div>
        <Card>
          <div
            style={{
              background: ink,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `3px solid ${coral}`,
            }}
          >
            <div>
              <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: coral, marginBottom: 3 }}>
                ✦ DANGER ZONE
              </div>
              <h2 style={{ fontFamily: fd, fontWeight: 900, fontSize: 16, color: coral }}>Account actions</h2>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <DangerRow title="Export my data" desc="Download all history as JSON." action="Export" onClick={() => showToast("Export queued — check email in 5 min.")} />
            <DangerRow title="Pause all alerts" desc="Stop Penny without losing settings." action="Pause" onClick={() => showToast("Alerts paused. Resume anytime.")} />
            <DangerRow
              title="Delete account"
              desc="Permanently remove everything. Cannot be undone."
              action="Delete"
              onClick={() => {
                if (confirm("Delete your account? This cannot be undone.")) showToast("Deletion requested.");
              }}
            />
          </div>
        </Card>
        <div style={{ background: g50, border: `3px solid ${g200}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontFamily: fm, fontSize: 10, letterSpacing: ".08em", color: g400, lineHeight: 1.8 }}>
            Member since Jan 2026 · Account ID: ff_ak_8192
            <br />
            <a href="#" style={{ color: violet }}>Privacy policy</a> · <a href="#" style={{ color: violet }}>Terms of service</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontFamily: fm, fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: g600, marginBottom: 7 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          fontSize: 14,
          padding: "12px 16px",
          border: `3px solid ${ink}`,
          borderRadius: 12,
          background: paper,
          outline: "none",
          boxShadow: brutSm,
        }}
      />
    </div>
  );
}

function Tgl({
  label,
  desc,
  on,
  onChange,
  last,
}: {
  label: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: last ? "none" : `2px solid ${g100}`,
      }}
    >
      <div>
        <h4 style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</h4>
        <p style={{ fontSize: 12, color: g500 }}>{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        aria-pressed={on}
        style={{
          position: "relative",
          width: 48,
          height: 26,
          flexShrink: 0,
          background: on ? lime : "var(--color-ffgray-200)",
          border: `2.5px solid ${ink}`,
          borderRadius: 999,
          cursor: "pointer",
          boxShadow: brutSm,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: 1,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: ink,
            transform: on ? "translateX(22px)" : "translateX(0)",
            transition: "transform .2s cubic-bezier(.34,1.56,.64,1)",
          }}
        />
      </button>
    </div>
  );
}

function DangerRow({ title, desc, action, onClick }: { title: string; desc: string; action: string; onClick: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: 14,
        background: coralT,
        border: `3px solid ${coral}`,
        borderRadius: 12,
        marginBottom: 10,
      }}
    >
      <div>
        <h4 style={{ fontFamily: fd, fontWeight: 700, fontSize: 14, color: coral }}>{title}</h4>
        <p style={{ fontSize: 13, color: g500 }}>{desc}</p>
      </div>
      <button
        onClick={onClick}
        style={{
          fontFamily: fd,
          fontWeight: 700,
          fontSize: 13,
          padding: "9px 18px",
          borderRadius: 999,
          background: "transparent",
          color: coral,
          border: `3px solid ${coral}`,
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        {action}
      </button>
    </div>
  );
}

const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: 20,
  alignItems: "start",
};
