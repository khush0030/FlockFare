"use client";

import { useState, useEffect } from "react";
import { buildCalendarUrl } from "@/lib/calendar";

export function DealActions({
  dealId,
  origin,
  destination,
  travelMonth,
  price,
  googleFlightsUrl,
  dealType,
}: {
  dealId: string;
  origin: string;
  destination: string;
  travelMonth: string;
  price: number;
  googleFlightsUrl: string;
  dealType: "common" | "rare" | "unique";
}) {
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteName, setVoteName] = useState("");
  const [showVoteInput, setShowVoteInput] = useState(false);

  const calendarUrl = buildCalendarUrl(origin, destination, travelMonth, price);
  const isSample = dealId.startsWith("sample-");

  // Load vote count
  useEffect(() => {
    if (isSample) return;
    fetch(`/api/vote?deal_id=${dealId}`)
      .then((r) => r.json())
      .then((d) => setVoteCount(d.count ?? 0))
      .catch(() => {});
  }, [dealId, isSample]);

  async function handleVote() {
    if (!voteName.trim()) return;
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal_id: dealId, voter_name: voteName.trim() }),
    });
    const data = await res.json();
    if (data.voted || data.duplicate) {
      setHasVoted(true);
      setVoteCount((c) => c + (data.duplicate ? 0 : 1));
      setShowVoteInput(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 mt-auto pt-5">
      {/* Primary CTA */}
      <a
        href={googleFlightsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex-1 inline-flex items-center justify-center gap-2 font-display font-bold text-base
          px-5 py-3 rounded-full border-4 border-ink cursor-pointer no-underline
          transition-transform duration-[120ms] ease-[var(--ease-ff-out)]
          hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg
          active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm
          ${
            dealType === "unique"
              ? "bg-lime text-ink shadow-brut"
              : "bg-violet text-cream shadow-brut"
          }`}
      >
        Grab &rarr;
      </a>

      {/* Secondary actions */}
      <div className="flex gap-2">
        {/* Calendar */}
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Add tentative trip to calendar"
          className="flex-1 inline-flex items-center justify-center gap-1.5 font-mono font-bold text-[11px] tracking-[0.1em] uppercase
            px-3 py-2 rounded-full border-2 border-ink bg-paper text-ink no-underline
            hover:bg-violet-tint transition-colors"
        >
          <span>&#128197;</span> Calendar
        </a>

        {/* Vote */}
        {!isSample && (
          <button
            onClick={() =>
              hasVoted ? null : setShowVoteInput(!showVoteInput)
            }
            className={`flex-1 inline-flex items-center justify-center gap-1.5 font-mono font-bold text-[11px] tracking-[0.1em] uppercase
              px-3 py-2 rounded-full border-2 border-ink cursor-pointer transition-colors
              ${hasVoted ? "bg-lime-tint text-ink" : "bg-paper text-ink hover:bg-lime-tint"}`}
          >
            <span>&#9995;</span>
            {hasVoted
              ? "Voted!"
              : voteCount > 0
                ? `${voteCount} in`
                : "I\u2019d book"}
          </button>
        )}
      </div>

      {/* Vote name input */}
      {showVoteInput && !hasVoted && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name"
            maxLength={30}
            value={voteName}
            onChange={(e) => setVoteName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVote()}
            className="flex-1 font-body text-sm px-3 py-2 bg-paper border-2 border-ink rounded-lg focus:outline-none focus:border-violet"
          />
          <button
            onClick={handleVote}
            className="font-display font-bold text-sm px-4 py-2 rounded-full border-2 border-ink bg-violet text-cream cursor-pointer"
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
}
