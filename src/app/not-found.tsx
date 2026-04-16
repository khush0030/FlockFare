"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";

const REACTIONS = [
  "Oof.",
  "Not this way.",
  "Also wrong.",
  "Still nothing.",
  "You really clicked again?",
  "Penny is judging you.",
  "BOM → 404 isn't a real route.",
  "Have you tried the deals feed?",
  "Stop clicking. Nothing is here.",
  "Ok fine, have a ✨",
  "Seriously, go book a flight.",
  "I'm confused and so are you.",
  "This is the void.",
  "The void clicks back.",
  "You found the secret! ...just kidding. 404.",
];

const BURST_EMOJIS = ["✈", "🐧", "⚡", "💜", "🍋", "✨", "❓", "🔥", "💸"];

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Burst = { id: number; emoji: string; tx: string; ty: string; delay: number };

const BG_SHAPES = [
  { w: 180, top: "10%", left: "5%", dur: 18, delay: -4 },
  { w: 90, top: "60%", left: "80%", dur: 22, delay: -10 },
  { w: 50, top: "80%", left: "15%", dur: 14, delay: -6 },
  { w: 130, top: "20%", left: "72%", dur: 26, delay: -2 },
];

export default function NotFound() {
  const [clickCount, setClickCount] = useState(0);
  const [reaction, setReaction] = useState("Oof.");
  const [showReaction, setShowReaction] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [headline, setHeadline] = useState<"normal" | "void">("normal");
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const pennyRef = useRef<HTMLDivElement>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiIdx = useRef(0);
  const burstSeq = useRef(0);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const clickPenny = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      const phrase = REACTIONS[(next - 1) % REACTIONS.length];
      setReaction(phrase);
      setShowReaction(true);
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setShowReaction(false), 2200);

      const count = Math.min(next + 3, 10);
      const newBursts: Burst[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 360;
        const dist = 60 + Math.random() * 40;
        const tx = `${Math.cos((angle * Math.PI) / 180) * dist}px`;
        const ty = `${Math.sin((angle * Math.PI) / 180) * dist}px`;
        burstSeq.current += 1;
        newBursts.push({
          id: burstSeq.current,
          emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
          tx,
          ty,
          delay: i * 0.04,
        });
      }
      setBursts(newBursts);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBursts([]), 700);

      if (next === 5) showToast("You clicked 5 times. Penny is tired.");
      if (next === 10) showToast("10 clicks. Penny has given up on you.");
      if (next === 20) {
        showToast("20 clicks. Here's a deal: BOM → 404, ₹0, -100% off nothing.");
        setHeadline("void");
        if (headlineTimer.current) clearTimeout(headlineTimer.current);
        headlineTimer.current = setTimeout(() => setHeadline("normal"), 3000);
      }
      return next;
    });
  };

  const doSearch = () => {
    const q = search.trim();
    if (!q) return;
    showToast(`Searching for "${q}"…`);
    setTimeout(() => {
      showToast(`No page found. But Penny found a deal to ${q}!`);
    }, 1200);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdx.current]) {
        konamiIdx.current += 1;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          showToast("🐧 Konami code! Penny unlocks: a deal so good it doesn't exist.");
          const el = pennyRef.current;
          if (el) {
            el.style.animation = "none";
            el.style.transform = "rotate(360deg) scale(1.3)";
            setTimeout(() => {
              el.style.transform = "";
              el.style.animation = "";
            }, 1000);
          }
        }
      } else {
        konamiIdx.current = 0;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      if (headlineTimer.current) clearTimeout(headlineTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <main id="main" className="flex-1 flex flex-col">
      <Header />
      <div className="nf-scene">
        <div className="nf-bg-dots" />
        {BG_SHAPES.map((s, i) => (
          <div
            key={i}
            className="nf-bg-shape"
            style={{
              width: s.w,
              height: s.w,
              top: s.top,
              left: s.left,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        <div className="nf-four">404</div>

        <div className="nf-content">
          <div
            ref={pennyRef}
            className="nf-penny-wrap"
            onClick={clickPenny}
            role="button"
            tabIndex={0}
            aria-label="Click Penny"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                clickPenny();
              }
            }}
            title="Click me!"
          >
            <div className={`nf-reaction ${showReaction ? "show" : ""}`}>{reaction}</div>
            <div className="nf-q nf-q1">?</div>
            <div className="nf-q nf-q2">?</div>
            <div className="nf-q nf-q3">?</div>

            <div className="nf-burst">
              {bursts.map((b) => (
                <span
                  key={b.id}
                  className="nf-burst-item"
                  style={
                    {
                      "--tx": b.tx,
                      "--ty": b.ty,
                      animationDelay: `${b.delay}s`,
                    } as React.CSSProperties
                  }
                >
                  {b.emoji}
                </span>
              ))}
            </div>

            <svg
              viewBox="0 0 400 420"
              width="260"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Penny the Puffin, looking confused"
            >
              <defs>
                <radialGradient id="cfBody" cx="50%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#3F3F52" />
                  <stop offset="100%" stopColor="#15151E" />
                </radialGradient>
                <radialGradient id="cfBelly" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#F1F1F8" />
                </radialGradient>
                <radialGradient id="cfCheek" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF89A0" />
                  <stop offset="100%" stopColor="#FF89A0" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="cfBeak" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD166" />
                  <stop offset="45%" stopColor="#FF8A3D" />
                  <stop offset="100%" stopColor="#FF4E64" />
                </linearGradient>
              </defs>
              <ellipse cx="200" cy="402" rx="105" ry="9" fill="#0B0B0F" opacity=".12" />
              <rect x="163" y="360" width="30" height="18" rx="8" fill="#FFD166" stroke="#0B0B0F" strokeWidth="3.5" />
              <rect x="207" y="365" width="30" height="18" rx="8" fill="#FFD166" stroke="#0B0B0F" strokeWidth="3.5" />
              <path
                d="M90 218 Q90 128 200 126 Q310 128 310 218 Q310 318 200 340 Q90 318 90 218Z"
                fill="url(#cfBody)"
                stroke="#0B0B0F"
                strokeWidth="4"
              />
              <path
                d="M148 198 Q148 148 200 146 Q252 148 252 198 Q252 300 200 318 Q148 300 148 198Z"
                fill="url(#cfBelly)"
                stroke="#0B0B0F"
                strokeWidth="3"
              />
              <path
                d="M90 226 Q66 260 86 300 Q126 310 140 278 Q138 246 116 226Z"
                fill="#15151E"
                stroke="#0B0B0F"
                strokeWidth="4"
              />
              <g transform="rotate(-28 295 178)">
                <path
                  d="M280 195 Q298 128 316 106 Q348 110 338 156 Q326 184 304 208Z"
                  fill="#15151E"
                  stroke="#0B0B0F"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M309 128 L320 110 M316 150 L338 136"
                  stroke="rgba(255,255,255,.18)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
              <g transform="rotate(-10 200 136)">
                <ellipse cx="200" cy="136" rx="96" ry="92" fill="url(#cfBody)" stroke="#0B0B0F" strokeWidth="4" />
                <ellipse cx="200" cy="152" rx="68" ry="60" fill="url(#cfBelly)" stroke="#0B0B0F" strokeWidth="3" />
                <circle cx="148" cy="168" r="14" fill="url(#cfCheek)" />
                <circle cx="252" cy="168" r="14" fill="url(#cfCheek)" />
                <ellipse cx="171" cy="146" rx="14" ry="17" fill="#0B0B0F" />
                <ellipse cx="173" cy="141" rx="5" ry="5.5" fill="#FFFFFF" />
                <circle cx="167" cy="151" r="2.5" fill="#FFFFFF" />
                <path
                  d="M214 150 Q226 140 238 150"
                  stroke="#0B0B0F"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M153 120 Q170 108 191 116"
                  stroke="#0B0B0F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M209 112 Q228 108 244 118"
                  stroke="#0B0B0F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M167 182 Q200 170 233 182 Q222 214 200 218 Q178 214 167 182Z"
                  fill="url(#cfBeak)"
                  stroke="#0B0B0F"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <line x1="169" y1="188" x2="231" y2="188" stroke="#FFD166" strokeWidth="1.5" opacity=".5" />
                <line x1="173" y1="198" x2="227" y2="198" stroke="#FF8A3D" strokeWidth="1.5" opacity=".5" />
                <path
                  d="M188 210 Q200 205 212 210"
                  stroke="#0B0B0F"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M112 128 Q200 34 288 128"
                  stroke="#6D28FF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M112 128 Q200 40 288 128"
                  stroke="#D8FF3C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="108" cy="138" r="20" fill="#6D28FF" stroke="#0B0B0F" strokeWidth="3" />
                <circle cx="108" cy="138" r="10" fill="#D8FF3C" />
                <circle cx="292" cy="138" r="20" fill="#6D28FF" stroke="#0B0B0F" strokeWidth="3" />
                <circle cx="292" cy="138" r="10" fill="#D8FF3C" />
              </g>
              <g transform="translate(22, 306)">
                <rect width="92" height="36" rx="10" fill="#0B0B0F" />
                <text
                  x="46"
                  y="26"
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono',monospace"
                  fontWeight="800"
                  fontSize="20"
                  fill="#D8FF3C"
                  letterSpacing="3"
                >
                  404
                </text>
              </g>
              <path
                d="M340 58 l2.5 8 l8 2.5 l-8 2.5 l-2.5 8 l-2.5-8 l-8-2.5 l8-2.5z"
                fill="#FF4E64"
                stroke="#0B0B0F"
                strokeWidth="1.2"
              />
              <path
                d="M55 82 l2 6 l6 2 l-6 2 l-2 6 l-2-6 l-6-2 l6-2z"
                fill="#D8FF3C"
                stroke="#0B0B0F"
                strokeWidth="1.2"
              />
            </svg>

            <div className="nf-penny-shadow" />
          </div>

          <div className="nf-badge">🐧 ERROR 404 · PAGE NOT FOUND</div>

          <h1 className="nf-headline">
            {headline === "void" ? (
              <>
                You found <span className="nf-hl">the void.</span>
              </>
            ) : (
              <>
                This page <span className="nf-hl">flew off.</span>
              </>
            )}
          </h1>

          <div className="nf-quote">
            I looked <strong>everywhere</strong> — the departure board, the baggage claim, even gate 47B. Whatever you
            were looking for is not here. Maybe it got a better deal somewhere else.
          </div>

          <div className="nf-search-wrap">
            <div className="nf-search-form">
              <input
                className="nf-search-input"
                type="text"
                placeholder="Try searching for a destination…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
              />
              <button type="button" className="nf-search-btn" onClick={doSearch}>
                Search →
              </button>
            </div>
          </div>

          <div className="nf-btn-row">
            <Link href="/" className="nf-btn-primary">
              ✈ Back to home
            </Link>
            <Link href="/deals" className="nf-btn-secondary">
              See live deals
            </Link>
          </div>

          <div className="nf-quick-links">
            <Link href="/deals" className="nf-quick-link">
              Deals feed
            </Link>
            <Link href="/#how" className="nf-quick-link">
              How it works
            </Link>
            <Link href="/preferences" className="nf-quick-link">
              Alert prefs
            </Link>
            <Link href="/upgrade-pro" className="nf-quick-link">
              Upgrade to Pro
            </Link>
            <Link href="/profile" className="nf-quick-link">
              Profile
            </Link>
          </div>

          <div className="nf-egg">
            Click Penny — she has something to say.{" "}
            {clickCount > 0 && (
              <>
                Clicked <span>{clickCount}</span>x
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`nf-toast ${toast ? "show" : ""}`} aria-live="polite">
        {toast}
      </div>
    </main>
  );
}
