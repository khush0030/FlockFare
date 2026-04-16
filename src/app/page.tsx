import type { Metadata } from "next";
import Image from "next/image";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";
import { getActiveDeals, type Deal } from "@/lib/supabase/deals";
import { DealCard } from "@/components/deal-card";
import { SubscribeForm } from "@/components/subscribe-form";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "FlockFare — Cheap Flight & Hotel Deals for Your Flock",
  description:
    "Penny watches hundreds of fare databases and alerts you when mistake fares, flash sales, and price drops appear. Join for free.",
  openGraph: {
    title: "FlockFare — Cheap Flight & Hotel Deals for Your Flock",
    description:
      "Penny watches hundreds of fare databases and alerts you when mistake fares, flash sales, and price drops appear. Join for free.",
  },
};

// Sample deals shown when no live deals exist yet (baseline building)
const SAMPLE_DEALS: Deal[] = [
  {
    id: "sample-1",
    origin_code: "BOM",
    destination_code: "LHR",
    travel_month: "2026-07",
    current_price_inr: 21400,
    baseline_price_inr: 46800,
    pct_off: 54,
    airline: "Air India",
    stops: 0,
    cabin_class: "economy",
    duration_minutes: 590,
    deal_type: "common",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BOM+to+LHR+in+July+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    origin_code: "DEL",
    destination_code: "BKK",
    travel_month: "2026-08",
    current_price_inr: 11900,
    baseline_price_inr: 19200,
    pct_off: 38,
    airline: "Vistara",
    stops: 1,
    cabin_class: "economy",
    duration_minutes: 425,
    deal_type: "rare",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+DEL+to+BKK+in+August+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    origin_code: "BLR",
    destination_code: "NRT",
    travel_month: "2026-09",
    current_price_inr: 18700,
    baseline_price_inr: 58400,
    pct_off: 68,
    airline: "ANA",
    stops: 0,
    cabin_class: "business",
    duration_minutes: 520,
    deal_type: "unique",
    google_flights_url: "https://www.google.com/travel/flights?q=Flights+from+BLR+to+NRT+in+September+2026",
    is_active: true,
    detected_at: new Date().toISOString(),
  },
];

export default async function Home() {
  const liveDeals = await getActiveDeals(6);
  const deals = liveDeals.length > 0 ? liveDeals : SAMPLE_DEALS;
  const isLive = liveDeals.length > 0;
  return (
    <main id="main" className="flex-1">
      <Header variant="dark" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-center gap-12">
            <div className="flex-1">
              <p className="ff-eyebrow text-lime mb-4">
                DEALS &middot; DROPS &middot; DEPARTURES
              </p>
              <h1 className="text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-[-0.04em] font-display font-black">
                Cheap flights,
                <br />
                <span className="text-lime">for your flock.</span>
              </h1>
              <p className="mt-6 text-lg text-ffgray-300 max-w-lg leading-relaxed font-body">
                Penny watches hundreds of fare databases so you don&apos;t have
                to. When a mistake fare or flash sale appears, you get a push in
                under five minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="inline-flex items-center gap-2 font-display font-bold text-base px-6 py-3.5 rounded-full border-4 border-cream bg-lime text-ink shadow-brut cursor-pointer transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm">
                  Join the flock &rarr;
                </button>
                <button className="inline-flex items-center gap-2 font-display font-bold text-base px-6 py-3.5 rounded-full border-4 border-cream bg-transparent text-cream cursor-pointer transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:bg-cream/10">
                  See latest deals
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-center">
              <Image
                src="/mascots/penny-hero-800.png"
                alt="Penny the Puffin — FlockFare mascot"
                width={320}
                height={320}
                priority
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-lime border-y-4 border-ink">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { value: "40\u201390%", label: "off published fares" },
            { value: `${ORIGINS.length}`, label: "home airports" },
            { value: `${DESTINATIONS.length}`, label: "destinations watched" },
            { value: "\u20B90", label: "subscription cost" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-2xl text-ink">
                {stat.value}
              </div>
              <div className="font-mono text-xs tracking-[0.15em] uppercase text-ink/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEALS */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <p className="ff-eyebrow mb-3">
          {isLive ? "LIVE DEALS" : "SAMPLE DEALS"}
        </p>
        <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-display font-black tracking-tight">
          What Penny found this week.
        </h2>
        <p className="mt-3 text-ffgray-500 max-w-lg">
          {isLive
            ? "Real deals from real price drops. Every card links straight to Google Flights."
            : "Penny is building her price baseline. These are examples of what you\u2019ll see soon."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {!isLive && (
          <div className="mt-8 bg-lime-tint border-4 border-ink rounded-[20px] p-6 flex items-center gap-4">
            <Image
              src="/mascots/penny-sleepy-600.png"
              alt="Penny sleeping"
              width={80}
              height={80}
              className="flex-shrink-0"
            />
            <div>
              <p className="font-display font-bold text-lg">
                Penny is napping on the job (for now).
              </p>
              <p className="text-ffgray-500 text-sm mt-1">
                Price baseline needs 2&ndash;4 weeks of data before real deals appear.
                The crawler is running &mdash; check back soon.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
          <p className="ff-eyebrow text-lime mb-3">HOW IT WORKS</p>
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-display font-black tracking-tight">
            Five steps. Zero effort.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
            {[
              {
                step: "01",
                title: "Crawl",
                desc: "Every few hours, fetch lowest fares on 480 route combos.",
              },
              {
                step: "02",
                title: "Compare",
                desc: "Stack today\u2019s price against a 90-day rolling baseline.",
              },
              {
                step: "03",
                title: "Detect",
                desc: "Flag anything 40%+ below baseline as a deal candidate.",
              },
              {
                step: "04",
                title: "Filter",
                desc: "Quality check: max 1 stop, no self-transfers, good airlines.",
              },
              {
                step: "05",
                title: "Alert",
                desc: "Push to Telegram + email with a Google Flights link.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-ink-soft border-4 border-cream/20 rounded-[20px] p-5"
              >
                <div className="w-10 h-10 rounded-full bg-violet flex items-center justify-center font-mono font-bold text-sm text-cream mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-black text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ffgray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PENNY CTA */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <div className="bg-violet-tint border-4 border-ink rounded-[20px] shadow-brut p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <Image
            src="/mascots/penny-waving-600.png"
            alt="Penny waving"
            width={200}
            height={200}
            className="flex-shrink-0"
          />
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2.75rem)] font-display font-black tracking-tight">
              Join the flock.
            </h2>
            <p className="mt-3 text-ffgray-600 max-w-md leading-relaxed">
              Drop your home airport and Penny gets to work. You&apos;ll get 3&ndash;5
              alerts a week &mdash; only when there&apos;s something worth grabbing.
            </p>
            <SubscribeForm />
            <p className="mt-3 font-mono text-xs tracking-[0.15em] uppercase text-ffgray-400">
              &le; 5 alerts / week &middot; unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink text-cream border-t-4 border-cream/20">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Image
            src="/logos/lockup-horizontal-reversed.svg"
            alt="FlockFare"
            width={140}
            height={32}
          />
          <p className="font-mono text-xs tracking-[0.15em] uppercase text-ffgray-500">
            Built for the flock &middot; 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
