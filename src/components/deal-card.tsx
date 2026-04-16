import type { Deal } from "@/lib/supabase/deals";
import { DESTINATIONS } from "@/config/watchlist";

function formatPrice(price: number): string {
  return `\u20B9${price.toLocaleString("en-IN")}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function getDestinationName(code: string): string {
  return DESTINATIONS.find((d) => d.code === code)?.city ?? code;
}

const bannerColors = {
  common: "bg-lime",
  rare: "bg-sun",
  unique: "bg-coral",
} as const;

const badgeStyles = {
  common: "bg-coral text-white",
  rare: "bg-ink text-sun",
  unique: "bg-lime text-ink",
} as const;

export function DealCard({ deal }: { deal: Deal }) {
  const typeLabel =
    deal.deal_type === "unique"
      ? "MISTAKE FARE"
      : deal.deal_type === "rare"
        ? "FLASH SALE"
        : `-${deal.pct_off}%`;

  const stopsLabel =
    deal.stops === 0 ? "Direct" : `${deal.stops}-stop`;

  return (
    <div className="bg-paper border-4 border-ink rounded-[20px] shadow-brut overflow-hidden flex flex-col">
      {/* Banner */}
      <div
        className={`${bannerColors[deal.deal_type]} border-b-4 border-ink px-5 py-4 flex justify-between items-start`}
      >
        <div>
          <div className="font-display font-black text-[28px] leading-none tracking-tight text-ink">
            {deal.origin_code}{" "}
            <span className="text-violet mx-1">&rarr;</span>{" "}
            {deal.destination_code}
          </div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-ink/60 mt-1">
            {getDestinationName(deal.destination_code)}
          </div>
        </div>
        <span
          className={`${badgeStyles[deal.deal_type]} px-3 py-1 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase`}
        >
          {typeLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="font-display font-black text-[44px] leading-none tracking-[-0.03em] text-ink">
          {formatPrice(deal.current_price_inr)}
          <span className="text-base text-ffgray-500 ml-1 font-mono">
            round-trip
          </span>
        </div>
        <div className="line-through text-ffgray-400 text-sm mt-1.5 font-mono">
          {formatPrice(deal.baseline_price_inr)} usual &middot; {deal.travel_month}
        </div>
        <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-500 mt-2.5">
          {deal.airline ?? "Multiple"} &middot; {stopsLabel}
          {deal.duration_minutes ? ` \u00B7 ${formatDuration(deal.duration_minutes)}` : ""}
        </div>
        <div className="flex gap-2.5 mt-auto pt-5">
          <a
            href={deal.google_flights_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 font-display font-bold text-base
              px-5 py-3 rounded-full border-4 border-ink cursor-pointer no-underline
              transition-transform duration-[120ms] ease-[var(--ease-ff-out)]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm
              ${
                deal.deal_type === "unique"
                  ? "bg-lime text-ink shadow-brut"
                  : "bg-violet text-cream shadow-brut"
              }`}
          >
            Grab &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
