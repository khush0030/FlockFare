"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";
import { PennySvg } from "@/components/penny-svg";

/* ─── Destination flag map (fallback — config has no flag field) ─── */
const FLAG_MAP: Record<string, string> = {
  BKK: "🇹🇭",
  DPS: "🇮🇩",
  SGN: "🇻🇳",
  SIN: "🇸🇬",
  KUL: "🇲🇾",
  CMB: "🇱🇰",
  MLE: "🇲🇻",
  DXB: "🇦🇪",
  IST: "🇹🇷",
  NRT: "🇯🇵",
  ICN: "🇰🇷",
  LHR: "🇬🇧",
  CDG: "🇫🇷",
  FCO: "🇮🇹",
  ZRH: "🇨🇭",
  JFK: "🇺🇸",
  SFO: "🇺🇸",
  YYZ: "🇨🇦",
  SYD: "🇦🇺",
  AKL: "🇳🇿",
};

/* ─── Origin tags (region label shown on the airport tile) ─── */
const ORIGIN_TAG: Record<string, string> = {
  BOM: "Maharashtra",
  DEL: "NCR",
  BLR: "Karnataka",
  IDR: "Madhya Pradesh",
};

const STEP_LABELS = [
  "Account",
  "Home airport",
  "Destinations",
  "Alerts",
  "Channels",
] as const;

const TOTAL_STEPS = 5;

type Threshold = "common" | "rare" | "unique";
type Channel = "email" | "push" | "telegram" | "whatsapp";

interface ConfettiBit {
  id: number;
  left: number;
  color: string;
  width: number;
  height: number;
  radius: string;
  duration: number;
  delay: number;
  rotate: number;
}

export default function OnboardingPage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [airports, setAirports] = useState<string[]>(["BOM"]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [threshold, setThreshold] = useState<Threshold>("rare");
  const [channels, setChannels] = useState<Channel[]>(["email"]);
  const [telegramHandle, setTelegramHandle] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [confetti, setConfetti] = useState<ConfettiBit[]>([]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );
  const emailError = emailTouched && email.length > 4 && !emailValid;

  const regions = useMemo(() => {
    const set = new Set<string>();
    DESTINATIONS.forEach((d) => d.region && set.add(d.region));
    // Preserve order that roughly matches the reference tabs
    const preferred = [
      "Southeast Asia",
      "Europe",
      "East Asia",
      "Middle East",
      "North America",
      "Oceania",
      "South Asia",
    ];
    return preferred.filter((r) => set.has(r));
  }, []);

  const visibleDests = useMemo(() => {
    if (activeRegion === "all") return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.region === activeRegion);
  }, [activeRegion]);

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  /* ── Handlers ───────────────────────────────────────── */
  function toggleAirport(code: string) {
    setAirports((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // keep ≥1
        return prev.filter((c) => c !== code);
      }
      return [...prev, code];
    });
  }

  function toggleDest(code: string) {
    setDestinations((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function selectAllDests() {
    setDestinations(DESTINATIONS.map((d) => d.code));
  }

  function toggleChannel(ch: Channel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function goNext() {
    if (step === 0 && !emailValid) return;
    if (step === 2 && destinations.length === 0) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function skipStep() {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function googleSignIn() {
    const fake = "you@gmail.com";
    setEmail(fake);
    setEmailTouched(true);
    // Small delay to let the input animate then advance
    setTimeout(() => setStep(1), 200);
  }

  /* ── Confetti on reaching done step ─────────────────── */
  useEffect(() => {
    if (step !== TOTAL_STEPS) return;
    const colors = [
      "#D8FF3C",
      "#FF4E64",
      "#6D28FF",
      "#FFD166",
      "#00B775",
      "#F6F3EC",
    ];
    const bits: ConfettiBit[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: 6 + Math.random() * 10,
      height: 6 + Math.random() * 10,
      radius: Math.random() > 0.5 ? "50%" : "2px",
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 0.6,
      rotate: Math.random() * 360,
    }));
    queueMicrotask(() => setConfetti(bits));
  }, [step]);

  /* ── Rendering helpers ──────────────────────────────── */
  const thresholdLabel: Record<Threshold, string> = {
    common: "Common · 40%+ off",
    rare: "Rare · 60%+ off ⭐",
    unique: "Unique · 70%+ off (mistake fares)",
  };

  return (
    <div style={{ background: "var(--color-ink)", minHeight: "100vh" }}>
      <div className="onb-shell">
        {/* ── LEFT PANEL ─────────────────────────────── */}
        <aside className="onb-left">
          <div
            className="nav-logo"
            style={{ position: "relative", zIndex: 2 }}
          >
            Flock<span>Fare</span>
          </div>

          <div className="onb-left-content">
            <div
              style={{
                marginBottom: "28px",
                transform: "scale(0.47)",
                transformOrigin: "top left",
                width: "300px",
                height: "160px",
                overflow: "visible",
              }}
            >
              <PennySvg />
            </div>

            <h2 className="onb-left-headline">
              Cheap flights.
              <br />
              Straight to
              <br />
              your <span className="hl">pocket.</span>
            </h2>
            <p className="onb-left-sub">
              Takes 90 seconds. Penny will be watching your routes within the
              hour.
            </p>

            <div>
              <div className="onb-left-stat">
                <div
                  className="onb-left-stat-dot"
                  style={{ background: "var(--color-lime)" }}
                />
                <p>
                  <strong>₹0</strong> to join — always
                </p>
              </div>
              <div className="onb-left-stat">
                <div
                  className="onb-left-stat-dot"
                  style={{ background: "var(--color-coral)" }}
                />
                <p>
                  Alerts in <strong>&lt;5 minutes</strong> of a drop
                </p>
              </div>
              <div className="onb-left-stat">
                <div
                  className="onb-left-stat-dot"
                  style={{ background: "var(--color-violet)" }}
                />
                <p>
                  <strong>40–90% off</strong> on real flights
                </p>
              </div>
              <div className="onb-left-stat">
                <div
                  className="onb-left-stat-dot"
                  style={{ background: "var(--color-sun)" }}
                />
                <p>
                  <strong>12,400+</strong> flock members saving
                </p>
              </div>
            </div>
          </div>

          <div className="onb-left-footer">
            © 2026 FLOCKFARE · DEALS. DROPS. DEPARTURES.
          </div>
        </aside>

        {/* ── RIGHT PANEL ────────────────────────────── */}
        <section
          style={{
            flex: 1,
            background: "var(--color-cream)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Step header */}
          <div className="step-header">
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {STEP_LABELS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <span
                    key={label}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <div
                      className={`step-chip${active ? " active" : ""}${
                        done ? " done" : ""
                      }`}
                    >
                      <div className="chip-num">{done ? "✓" : i + 1}</div>
                      <span>{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <span className="step-chip-sep">›</span>
                    )}
                  </span>
                );
              })}
            </div>
            {step > 0 && step < TOTAL_STEPS && (
              <span
                className="skip-link"
                onClick={skipStep}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") skipStep();
                }}
              >
                Skip this step →
              </span>
            )}
          </div>

          {/* Step content */}
          <div className="step-content">
            <div className="step-inner">
              {/* ── STEP 0: EMAIL ───────────────────── */}
              {step === 0 && (
                <div className="step-panel active">
                  <div className="step-eyebrow">✦ Step 1 of 5</div>
                  <h1 className="step-title">
                    First, where do we<br />send the alerts?
                  </h1>
                  <p className="step-subtitle">
                    Your email. No password needed — we&apos;ll magic-link you
                    in. Takes 10 seconds.
                  </p>

                  <label className="onb-email-label" htmlFor="onb-email">
                    Your email address
                  </label>
                  <div style={{ position: "relative", marginBottom: "14px" }}>
                    <input
                      id="onb-email"
                      className="onb-email-input"
                      type="email"
                      placeholder="you@wherever.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailTouched(true);
                      }}
                    />
                  </div>
                  <div className={`field-error${emailError ? " show" : ""}`}>
                    Enter a valid email address.
                  </div>

                  <div className="or-divider">
                    <span>OR</span>
                  </div>

                  <button className="google-btn" onClick={googleSignIn}>
                    <div className="google-icon" />
                    Continue with Google
                  </button>

                  <p
                    style={{
                      marginTop: "16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--color-ffgray-400)",
                      letterSpacing: ".06em",
                      lineHeight: 1.6,
                    }}
                  >
                    By joining you agree to our Terms of Service and Privacy
                    Policy. We&apos;ll send ≤5 alerts per week. Unsubscribe in
                    one click, always.
                  </p>

                  <div className="cta-row" style={{ marginTop: "28px" }}>
                    <button
                      className="btn-primary"
                      onClick={goNext}
                      disabled={!emailValid}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 1: HOME AIRPORTS ────────────── */}
              {step === 1 && (
                <div className="step-panel active">
                  <div className="step-eyebrow">✦ Step 2 of 5</div>
                  <h1 className="step-title">
                    Where do you<br />usually fly from?
                  </h1>
                  <p className="step-subtitle">
                    Pick all that apply. Penny will watch deals from every
                    airport you select.
                  </p>

                  <div className="airport-grid">
                    {ORIGINS.map((o) => {
                      const selected = airports.includes(o.code);
                      return (
                        <div
                          key={o.code}
                          className={`airport-tile${
                            selected ? " selected" : ""
                          }`}
                          onClick={() => toggleAirport(o.code)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              toggleAirport(o.code);
                          }}
                        >
                          <div className="check">{selected ? "✓" : ""}</div>
                          <div className="airport-code-lg">{o.code}</div>
                          <div className="airport-city-sm">{o.city}</div>
                          <span className="airport-tag">
                            {ORIGIN_TAG[o.code] ?? o.country}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-ffgray-500)",
                      letterSpacing: ".06em",
                      marginTop: "6px",
                    }}
                  >
                    More airports coming — MAA, HYD, CCU, PNQ, AMD, COK.
                  </p>

                  <div className="cta-row" style={{ marginTop: "28px" }}>
                    <button className="btn-back" onClick={goBack}>
                      ← Back
                    </button>
                    <button className="btn-primary" onClick={goNext}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: DESTINATIONS ─────────────── */}
              {step === 2 && (
                <div className="step-panel active">
                  <div className="step-eyebrow">✦ Step 3 of 5</div>
                  <h1 className="step-title">Dream destinations?</h1>
                  <p className="step-subtitle">
                    Pick the places you&apos;d love to fly to.{" "}
                    <span>
                      {destinations.length === 0
                        ? "Select at least one."
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={selectAllDests}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: ".1em",
                        color: "var(--color-violet)",
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        background: "none",
                        border: "none",
                        marginLeft: "8px",
                      }}
                    >
                      Select all
                    </button>
                  </p>

                  <div className="region-tabs">
                    <button
                      className={`rtab${
                        activeRegion === "all" ? " active" : ""
                      }`}
                      onClick={() => setActiveRegion("all")}
                    >
                      All
                    </button>
                    {regions.map((r) => (
                      <button
                        key={r}
                        className={`rtab${
                          activeRegion === r ? " active" : ""
                        }`}
                        onClick={() => setActiveRegion(r)}
                      >
                        {r === "Southeast Asia"
                          ? "SE Asia"
                          : r === "North America"
                            ? "N. America"
                            : r === "South Asia"
                              ? "S. Asia"
                              : r}
                      </button>
                    ))}
                  </div>

                  <div className="dest-grid-onb">
                    {visibleDests.map((d) => {
                      const selected = destinations.includes(d.code);
                      return (
                        <div
                          key={d.code}
                          className={`dest-tile${
                            selected ? " selected" : ""
                          }`}
                          onClick={() => toggleDest(d.code)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              toggleDest(d.code);
                          }}
                        >
                          <div className="dest-check">
                            {selected ? "✓" : ""}
                          </div>
                          <div className="dest-flag">
                            {FLAG_MAP[d.code] ?? "🌍"}
                          </div>
                          <div className="dest-code">{d.code}</div>
                          <div className="dest-city-label">{d.city}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-ffgray-500)",
                      letterSpacing: ".06em",
                    }}
                  >
                    <strong style={{ color: "var(--color-ink)" }}>
                      {destinations.length}
                    </strong>{" "}
                    destination{destinations.length === 1 ? "" : "s"} selected
                  </div>

                  <div className="cta-row" style={{ marginTop: "24px" }}>
                    <button className="btn-back" onClick={goBack}>
                      ← Back
                    </button>
                    <button
                      className="btn-primary"
                      onClick={goNext}
                      disabled={destinations.length === 0}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: THRESHOLD ────────────────── */}
              {step === 3 && (
                <div className="step-panel active">
                  <div className="step-eyebrow">✦ Step 4 of 5</div>
                  <h1 className="step-title">
                    How aggressive<br />should Penny be?
                  </h1>
                  <p className="step-subtitle">
                    We&apos;ll only ping you when a deal hits your threshold.
                    Less noise, more signal.
                  </p>

                  <div className="threshold-cards">
                    <div
                      className={`threshold-card sel-common${
                        threshold === "common" ? " selected" : ""
                      }`}
                      onClick={() => setThreshold("common")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setThreshold("common");
                      }}
                    >
                      <div className="threshold-radio" />
                      <div className="threshold-body">
                        <h3>Any good deal</h3>
                        <p>
                          Get alerted for all deals 40%+ below the baseline.
                          You&apos;ll get 3–5 alerts per week on popular routes.
                        </p>
                        <span className="threshold-tag tag-lime">
                          COMMON · 40%+ OFF
                        </span>
                      </div>
                      <div
                        className="threshold-pct"
                        style={{ color: "var(--color-ffgray-500)" }}
                      >
                        40%
                      </div>
                    </div>

                    <div
                      className={`threshold-card sel-rare${
                        threshold === "rare" ? " selected" : ""
                      }`}
                      onClick={() => setThreshold("rare")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setThreshold("rare");
                      }}
                    >
                      <div className="threshold-radio" />
                      <div className="threshold-body">
                        <h3>
                          Rare deals only{" "}
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--color-ffgray-400)",
                              fontWeight: 400,
                            }}
                          >
                            (recommended)
                          </span>
                        </h3>
                        <p>
                          Only deals 60%+ below baseline. Usually 1–2 per week.
                          These are genuinely exceptional prices.
                        </p>
                        <span className="threshold-tag tag-coral">
                          RARE · 60%+ OFF
                        </span>
                      </div>
                      <div
                        className="threshold-pct"
                        style={{ color: "var(--color-coral)" }}
                      >
                        60%
                      </div>
                    </div>

                    <div
                      className={`threshold-card sel-unique${
                        threshold === "unique" ? " selected" : ""
                      }`}
                      onClick={() => setThreshold("unique")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setThreshold("unique");
                      }}
                    >
                      <div className="threshold-radio" />
                      <div className="threshold-body">
                        <h3>Mistake fares only</h3>
                        <p>
                          Alerts only for 70%+ drops — mistake fares and pricing
                          errors. Rare but extraordinary. Act in minutes.
                        </p>
                        <span className="threshold-tag tag-violet">
                          UNIQUE · 70%+ OFF
                        </span>
                      </div>
                      <div
                        className="threshold-pct"
                        style={{ color: "var(--color-violet)" }}
                      >
                        70%
                      </div>
                    </div>
                  </div>

                  <div className="cta-row" style={{ marginTop: "8px" }}>
                    <button className="btn-back" onClick={goBack}>
                      ← Back
                    </button>
                    <button className="btn-primary" onClick={goNext}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: CHANNELS ─────────────────── */}
              {step === 4 && (
                <div className="step-panel active">
                  <div className="step-eyebrow">✦ Step 5 of 5</div>
                  <h1 className="step-title">
                    How should Penny<br />reach you?
                  </h1>
                  <p className="step-subtitle">
                    Pick at least one channel. Email is already set — the others
                    are optional but fast.
                  </p>

                  <div className="channel-grid">
                    {/* Email — always selected, not toggleable */}
                    <div className="channel-card selected">
                      <div
                        className="channel-icon"
                        style={{ background: "var(--color-lime-tint)" }}
                      >
                        📧
                      </div>
                      <div className="channel-body">
                        <h3>Email</h3>
                        <p>
                          Weekly digest + instant alerts for urgent deals.
                          Already set up from your email.
                        </p>
                      </div>
                      <div className="channel-toggle">✓</div>
                    </div>

                    {/* Push */}
                    <div
                      className={`channel-card${
                        channels.includes("push") ? " selected" : ""
                      }`}
                      onClick={() => toggleChannel("push")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          toggleChannel("push");
                      }}
                    >
                      <div
                        className="channel-icon"
                        style={{ background: "var(--color-violet-tint)" }}
                      >
                        🔔
                      </div>
                      <div className="channel-body">
                        <h3>Browser push notifications</h3>
                        <p>
                          Instant pop-up on desktop and mobile. Best for
                          mistake fares — they&apos;re gone in hours.
                        </p>
                      </div>
                      <div className="channel-toggle">
                        {channels.includes("push") ? "✓" : ""}
                      </div>
                    </div>

                    {/* Telegram */}
                    <div
                      className={`channel-card${
                        channels.includes("telegram") ? " selected" : ""
                      }`}
                      onClick={() => toggleChannel("telegram")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          toggleChannel("telegram");
                      }}
                    >
                      <div
                        className="channel-icon"
                        style={{ background: "#e8f4fd" }}
                      >
                        ✈
                      </div>
                      <div className="channel-body">
                        <h3>Telegram</h3>
                        <p>
                          Join the FlockFare channel for real-time deal cards
                          with one-tap booking links.
                        </p>
                        {channels.includes("telegram") && (
                          <div style={{ marginTop: "10px" }}>
                            <input
                              type="text"
                              placeholder="@yourusername (optional)"
                              value={telegramHandle}
                              onChange={(e) =>
                                setTelegramHandle(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: "100%",
                                fontSize: "14px",
                                padding: "10px 14px",
                                border: "3px solid var(--color-ink)",
                                borderRadius: "10px",
                                background: "var(--color-paper)",
                                outline: "none",
                                boxShadow: "3px 3px 0 var(--color-ink)",
                                fontFamily: "inherit",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="channel-toggle">
                        {channels.includes("telegram") ? "✓" : ""}
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div
                      className={`channel-card${
                        channels.includes("whatsapp") ? " selected" : ""
                      }`}
                      onClick={() => toggleChannel("whatsapp")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          toggleChannel("whatsapp");
                      }}
                    >
                      <div
                        className="channel-icon"
                        style={{ background: "#dcfce7" }}
                      >
                        💬
                      </div>
                      <div className="channel-body">
                        <h3>WhatsApp</h3>
                        <p>
                          Get deals sent directly to WhatsApp. Perfect for
                          sharing with travel buddies instantly.
                        </p>
                        {channels.includes("whatsapp") && (
                          <div style={{ marginTop: "10px" }}>
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={whatsappNumber}
                              onChange={(e) =>
                                setWhatsappNumber(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: "100%",
                                fontSize: "14px",
                                padding: "10px 14px",
                                border: "3px solid var(--color-ink)",
                                borderRadius: "10px",
                                background: "var(--color-paper)",
                                outline: "none",
                                boxShadow: "3px 3px 0 var(--color-ink)",
                                fontFamily: "inherit",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="channel-toggle">
                        {channels.includes("whatsapp") ? "✓" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="freq-note-box">
                    ⏱ &nbsp;
                    <span>
                      Penny sends <strong>≤5 alerts/week</strong> on free plan.
                      Pro members get instant alerts the moment a deal is
                      detected — usually 4 hours earlier.
                    </span>
                  </div>

                  <div className="cta-row" style={{ marginTop: "20px" }}>
                    <button className="btn-back" onClick={goBack}>
                      ← Back
                    </button>
                    <button className="btn-primary" onClick={goNext}>
                      Join the flock →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 5: DONE ─────────────────────── */}
              {step === 5 && (
                <div
                  className="step-panel active"
                  style={{ textAlign: "center" }}
                >
                  <div
                    style={{
                      margin: "0 auto 24px",
                      width: "160px",
                      transform: "scale(0.5)",
                      transformOrigin: "top center",
                      height: "170px",
                    }}
                  >
                    <PennySvg />
                  </div>

                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "clamp(2rem,4vw,2.8rem)",
                      letterSpacing: "-.035em",
                      lineHeight: 1.04,
                      marginBottom: "12px",
                    }}
                  >
                    You&apos;re in the flock! 🎉
                  </h1>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--color-ffgray-500)",
                      lineHeight: 1.65,
                      marginBottom: "32px",
                      maxWidth: "400px",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    Penny&apos;s already scanning fares from your airports. Your
                    first alert could arrive within the hour — or it could be
                    tomorrow. Either way, you&apos;ll never miss a deal again.
                  </p>

                  <div className="done-summary">
                    <div className="done-summary-row">
                      <span className="done-summary-key">Email</span>
                      <span className="done-summary-val">
                        {email || "your email"}
                      </span>
                    </div>
                    <div className="done-summary-row">
                      <span className="done-summary-key">Home airports</span>
                      <div className="done-chips">
                        {airports.map((a) => (
                          <span
                            key={a}
                            className="done-chip"
                            style={{ background: "var(--color-lime)" }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="done-summary-row">
                      <span className="done-summary-key">Destinations</span>
                      <span className="done-summary-val">
                        {destinations.length === 0
                          ? "All destinations"
                          : `${destinations.length} destination${
                              destinations.length === 1 ? "" : "s"
                            } selected`}
                      </span>
                    </div>
                    <div className="done-summary-row">
                      <span className="done-summary-key">Alert threshold</span>
                      <span className="done-summary-val">
                        {thresholdLabel[threshold]}
                      </span>
                    </div>
                    <div className="done-summary-row">
                      <span className="done-summary-key">Channels</span>
                      <div className="done-chips">
                        {channels.length === 0 ? (
                          <span className="done-chip">Email only</span>
                        ) : (
                          channels.map((c) => (
                            <span
                              key={c}
                              className="done-chip"
                              style={{
                                background: "var(--color-violet)",
                                color: "#fff",
                                borderColor: "var(--color-violet)",
                              }}
                            >
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await fetch("/api/profile/onboarded", { method: "POST" });
                      router.push("/deals");
                    }}
                    style={{
                      width: "100%",
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "18px",
                      padding: "18px",
                      borderRadius: "999px",
                      background: "var(--color-ink)",
                      color: "var(--color-lime)",
                      border: "4px solid var(--color-ink)",
                      boxShadow: "6px 6px 0 var(--color-ink)",
                      marginBottom: "12px",
                      cursor: "pointer",
                    }}
                  >
                    See live deals →
                  </button>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-ffgray-500)",
                      letterSpacing: ".08em",
                    }}
                  >
                    Check your inbox for a confirmation email from Penny.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Confetti overlay */}
      {step === TOTAL_STEPS && (
        <div className="confetti-wrap">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.left}vw`,
                background: p.color,
                width: `${p.width}px`,
                height: `${p.height}px`,
                borderRadius: p.radius,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
