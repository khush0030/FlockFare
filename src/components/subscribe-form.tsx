"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [airport, setAirport] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          home_airport: airport || "BOM",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        setAirport("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-lime-tint border-4 border-ink rounded-[12px] p-4 mt-2">
        <p className="font-display font-bold text-lg">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap gap-3">
      <input
        type="email"
        placeholder="you@flock.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full max-w-xs font-body text-base px-4 py-3 bg-paper border-4 border-ink rounded-[12px] shadow-brut-sm focus:outline-none focus:shadow-brut-violet transition-shadow"
      />
      <input
        type="text"
        placeholder="BOM"
        maxLength={3}
        value={airport}
        onChange={(e) => setAirport(e.target.value.toUpperCase())}
        className="w-20 font-mono font-bold text-base text-center px-3 py-3 bg-paper border-4 border-ink rounded-[12px] shadow-brut-sm focus:outline-none focus:shadow-brut-violet transition-shadow uppercase tracking-wider"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 font-display font-bold text-base px-6 py-3 rounded-full border-4 border-ink bg-violet text-cream shadow-brut cursor-pointer transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm disabled:opacity-50"
      >
        {status === "loading" ? "Joining..." : "Join the flock \u2192"}
      </button>
      {status === "error" && (
        <p className="w-full text-coral text-sm font-bold mt-1">{message}</p>
      )}
    </form>
  );
}
