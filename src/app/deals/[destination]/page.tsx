import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";
import { getDealsByOrigin, getActiveDeals } from "@/lib/supabase/deals";
import { getPriceHistory } from "@/lib/supabase/price-history";
import { DealCard } from "@/components/deal-card";
import { PriceChart } from "@/components/price-chart";
import { Header } from "@/components/header";

export const revalidate = 300;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ destination: d.code }));
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination: destCode } = await params;
  const dest = DESTINATIONS.find(
    (d) => d.code === destCode.toUpperCase()
  );

  if (!dest) notFound();

  // Fetch deals for this destination from all origins
  const allDeals = await getActiveDeals(50);
  const destDeals = allDeals.filter(
    (d) => d.destination_code === dest.code
  );

  // Fetch price history for each origin→destination
  const priceHistories = await Promise.all(
    ORIGINS.map(async (origin) => ({
      origin,
      data: await getPriceHistory(origin.code, dest.code),
    }))
  );

  const historiesWithData = priceHistories.filter((h) => h.data.length > 0);

  return (
    <main id="main" className="flex-1">
      <Header />

      <section className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-400 mb-6">
          <Link href="/deals" className="hover:text-violet no-underline">
            Deals
          </Link>
          <span>&rarr;</span>
          <span className="text-ink">{dest.code}</span>
        </div>

        {/* Destination header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ff-eyebrow mb-2">{dest.region?.toUpperCase()}</p>
            <h1 className="text-[clamp(2rem,4vw,3.75rem)] font-display font-black tracking-tight leading-tight">
              {dest.city}
            </h1>
            <p className="text-ffgray-500 mt-1">
              {dest.country} &middot; {dest.code}
            </p>
          </div>
          {destDeals.length > 0 && (
            <div className="bg-coral text-white px-4 py-2 rounded-full font-mono font-bold text-sm">
              {destDeals.length} active deal{destDeals.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Price history charts */}
        {historiesWithData.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-black text-xl mb-4">
              Price history (last 90 days)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {historiesWithData.map(({ origin, data }) => (
                <Link
                  key={origin.code}
                  href={`/price-history/${origin.code}-${dest.code}`}
                  className="bg-paper border-4 border-ink rounded-[20px] shadow-brut-sm p-5 block no-underline text-ink hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-brut transition-transform"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-ffgray-500">
                      {origin.code} &rarr; {dest.code} &middot; {origin.city}
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-violet">
                      Open chart →
                    </span>
                  </div>
                  <PriceChart data={data} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active deals */}
        {destDeals.length > 0 ? (
          <div className="mt-10">
            <h2 className="font-display font-black text-xl mb-4">
              Active deals to {dest.city}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 bg-lime-tint border-4 border-ink rounded-[20px] p-8 flex flex-col items-center text-center">
            <Image
              src="/mascots/penny-sleepy-600.png"
              alt="Penny sleeping"
              width={120}
              height={120}
            />
            <h2 className="font-display font-black text-xl mt-4">
              No deals to {dest.city} right now.
            </h2>
            <p className="text-ffgray-500 mt-2 max-w-md text-sm">
              Penny is watching this route. When prices drop 40%+ below
              baseline, a deal card will appear here.
            </p>
          </div>
        )}

        {/* All destinations grid */}
        <div className="mt-16 pt-10 border-t-4 border-ink/10">
          <h3 className="font-display font-black text-lg mb-4">
            Other destinations
          </h3>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.filter((d) => d.code !== dest.code).map((d) => (
              <Link
                key={d.code}
                href={`/deals/${d.code}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-[11px] tracking-[0.15em] uppercase border-2 border-ink bg-paper text-ink hover:bg-violet-tint no-underline transition-colors"
              >
                {d.code}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
