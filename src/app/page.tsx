import Image from "next/image";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";

function DealCard({
  origin,
  destination,
  price,
  originalPrice,
  pctOff,
  airline,
  stops,
  duration,
  dealType,
}: {
  origin: string;
  destination: string;
  price: string;
  originalPrice: string;
  pctOff: number;
  airline: string;
  stops: string;
  duration: string;
  dealType: "common" | "rare" | "unique";
}) {
  const bannerColors = {
    common: "bg-lime",
    rare: "bg-sun",
    unique: "bg-coral",
  };
  const badgeLabels = {
    common: `-${pctOff}%`,
    rare: "FLASH SALE",
    unique: "MISTAKE FARE",
  };

  return (
    <div className="bg-paper border-4 border-ink rounded-[20px] shadow-brut overflow-hidden flex flex-col">
      <div
        className={`${bannerColors[dealType]} border-b-4 border-ink px-5 py-4 flex justify-between items-start`}
      >
        <div className="font-display font-black text-[28px] leading-none tracking-tight text-ink">
          {origin}{" "}
          <span className="text-violet mx-1">&rarr;</span>{" "}
          {destination}
        </div>
        <span
          className={`inline-flex items-center gap-1 ${
            dealType === "common"
              ? "bg-coral text-white"
              : dealType === "rare"
                ? "bg-ink text-sun"
                : "bg-lime text-ink"
          } px-3 py-1 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase`}
        >
          {badgeLabels[dealType]}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="font-display font-black text-[44px] leading-none tracking-[-0.03em] text-ink">
          {price}
          <span className="text-base text-ffgray-500 ml-1 font-mono">
            round-trip
          </span>
        </div>
        <div className="line-through text-ffgray-400 text-sm mt-1.5 font-mono">
          {originalPrice}
        </div>
        <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-500 mt-2.5">
          {airline} &middot; {stops} &middot; {duration}
        </div>
        <div className="flex gap-2.5 mt-5">
          <button
            className={`flex-1 inline-flex items-center justify-center gap-2 font-display font-bold text-base
              px-5 py-3 rounded-full border-4 border-ink cursor-pointer
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
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
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
              <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE DEALS */}
      <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <p className="ff-eyebrow mb-3">LATEST DEALS</p>
        <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-display font-black tracking-tight">
          What Penny found this week.
        </h2>
        <p className="mt-3 text-ffgray-500 max-w-lg">
          Real deals from real price drops. Every card links straight to Google
          Flights &mdash; we don&apos;t sell tickets, we find them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          <DealCard
            origin="BOM"
            destination="LHR"
            price={"\u20B921,400"}
            originalPrice={"\u20B946,800 \u00B7 Jul 12 departure"}
            pctOff={54}
            airline="Air India"
            stops="Direct"
            duration="9h 50m"
            dealType="common"
          />
          <DealCard
            origin="DEL"
            destination="BKK"
            price={"\u20B911,900"}
            originalPrice={"\u20B919,200 \u00B7 Aug 3-10"}
            pctOff={38}
            airline="Vistara"
            stops="1-stop"
            duration="7h 05m"
            dealType="rare"
          />
          <DealCard
            origin="BLR"
            destination="NRT"
            price={"\u20B918,700"}
            originalPrice={"\u20B958,400 \u00B7 Sep 18"}
            pctOff={68}
            airline="ANA"
            stops="Biz class"
            duration="8h 40m"
            dealType="unique"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
          <p className="ff-eyebrow text-lime mb-3">HOW IT WORKS</p>
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] font-display font-black tracking-tight">
            Five steps. Zero effort.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-10">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <input
                type="email"
                placeholder="you@flock.com"
                className="w-full max-w-xs font-body text-base px-4 py-3 bg-paper border-4 border-ink rounded-[12px] shadow-brut-sm focus:outline-none focus:shadow-brut-violet transition-shadow"
              />
              <button className="inline-flex items-center gap-2 font-display font-bold text-base px-6 py-3 rounded-full border-4 border-ink bg-violet text-cream shadow-brut cursor-pointer transition-transform duration-[120ms] ease-[var(--ease-ff-out)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brut-lg active:translate-x-[3px] active:translate-y-[3px] active:shadow-brut-sm">
                Join the flock &rarr;
              </button>
            </div>
            <p className="mt-3 font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-400">
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
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-500">
            Built for the flock &middot; 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
