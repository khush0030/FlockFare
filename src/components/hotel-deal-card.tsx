import type { HotelDeal } from "@/lib/supabase/hotels";

function formatPrice(price: number): string {
  return `\u20B9${price.toLocaleString("en-IN")}`;
}

function starString(rating: number | null): string {
  if (!rating) return "";
  return "\u2605".repeat(rating);
}

const bannerColors = {
  common: "bg-violet-tint",
  rare: "bg-sun",
  unique: "bg-coral",
} as const;

export function HotelDealCard({ deal }: { deal: HotelDeal }) {
  const typeLabel =
    deal.deal_type === "unique"
      ? "STEAL"
      : deal.deal_type === "rare"
        ? "HOT DEAL"
        : `-${deal.pct_off}%`;

  return (
    <div className="bg-paper border-4 border-ink rounded-[20px] shadow-brut overflow-hidden flex flex-col">
      {/* Banner */}
      <div
        className={`${bannerColors[deal.deal_type]} border-b-4 border-ink px-5 py-4 flex justify-between items-start`}
      >
        <div>
          <div className="font-display font-black text-[24px] leading-none tracking-tight text-ink">
            {deal.city}
          </div>
          <div className="font-mono text-[11px] tracking-[0.12em] text-ink/60 mt-1">
            {deal.hotel_name}
          </div>
        </div>
        <span className="bg-ink text-lime px-3 py-1 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase">
          {typeLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="font-display font-black text-[36px] leading-none tracking-[-0.03em] text-ink">
          {formatPrice(deal.current_price_inr)}
          <span className="text-sm text-ffgray-500 ml-1 font-mono">
            /night
          </span>
        </div>
        <div className="line-through text-ffgray-400 text-sm mt-1.5 font-mono">
          {formatPrice(deal.baseline_price_inr)} usual
        </div>
        <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-500 mt-2.5">
          {deal.nights} nights &middot; {deal.checkin_date}
          {deal.star_rating ? ` \u00B7 ${starString(deal.star_rating)}` : ""}
        </div>
        <div className="flex gap-2.5 mt-auto pt-5">
          <a
            href={deal.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 font-display font-bold text-base
              px-5 py-3 rounded-full border-4 border-ink cursor-pointer no-underline
              transition-transform duration-[120ms] ease-[var(--ease-ff-out)]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg
              active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm
              bg-violet text-cream shadow-brut"
          >
            Book &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
