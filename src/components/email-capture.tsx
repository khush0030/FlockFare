"use client";

import { useState } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, home_airport: "BOM" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're in! Penny's on the case.");
        setEmail("");
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
      <div
        style={{
          background: "var(--color-lime)",
          border: "4px solid var(--color-ink)",
          borderRadius: 999,
          padding: "14px 26px",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
          boxShadow: "var(--shadow-brut)",
        }}
      >
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <input
        className="email-input"
        type="email"
        placeholder="you@wherever.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-lime" disabled={status === "loading"}>
        {status === "loading" ? "Joining..." : "Join the flock →"}
      </button>
      {status === "error" && (
        <p style={{ width: "100%", color: "var(--color-coral)", fontSize: 13, fontWeight: 700, marginTop: 4 }}>
          {message}
        </p>
      )}
    </form>
  );
}
