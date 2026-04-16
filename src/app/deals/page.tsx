import Image from "next/image";
import { getActiveDeals } from "@/lib/supabase/deals";
import { DealCard } from "@/components/deal-card";
import { ORIGINS } from "@/config/watchlist";
import Link from "next/link";

export const revalidate = 300; // ISR: refresh every 5 minutes

export default async function DealsPage() {
  const deals = await getActiveDeals(30);

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="bg-ink text-cream border-b-4 border-cream/20">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logos/lockup-horizontal-reversed.svg"
              alt="FlockFare"
              width={130}
              height={30}
            />
          </Link>
          <nav className="flex gap-5 items-center">
            <Link
              href="/deals"
              className="font-display font-bold text-sm text-lime no-underline"
            >
              Deals
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <p className="ff-eyebrow mb-3">ALL ACTIVE DEALS</p>
        <h1 className="text-[clamp(2rem,4vw,3.75rem)] font-display font-black tracking-tight leading-tight">
          Penny&apos;s latest finds.
        </h1>
        <p className="mt-3 text-ffgray-500 max-w-lg">
          Every deal links straight to Google Flights. Prices verified at crawl
          time &mdash; availability can change fast.
        </p>

        {/* Origin filter pills */}
        <div className="flex flex-wrap gap-2 mt-8">
          {ORIGINS.map((origin) => {
            const count = deals.filter(
              (d) => d.origin_code === origin.code
            ).length;
            return (
              <span
                key={origin.code}
                className="inline-flex items-center gap-1.5 bg-ink text-lime px-3 py-1.5 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase"
              >
                {origin.code}
                <span className="bg-lime text-ink w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                  {count}
                </span>
              </span>
            );
          })}
        </div>

        {deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="mt-12 bg-lime-tint border-4 border-ink rounded-[20px] p-8 flex flex-col items-center text-center">
            <Image
              src="/mascots/penny-sleepy-600.png"
              alt="Penny sleeping"
              width={160}
              height={160}
            />
            <h2 className="font-display font-black text-2xl mt-6">
              Nothing cheap yet.
            </h2>
            <p className="text-ffgray-500 mt-2 max-w-md">
              Penny is napping on your suitcase. She&apos;s building a price
              baseline &mdash; give her 2&ndash;4 weeks of data and deals will
              start showing up here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
