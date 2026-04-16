import Image from "next/image";
import { getActiveDeals } from "@/lib/supabase/deals";
import { getActiveHotelDeals } from "@/lib/supabase/hotels";
import { DealFilters } from "@/components/deal-filters";
import { Header } from "@/components/header";

export const revalidate = 300; // ISR: refresh every 5 minutes

export default async function DealsPage() {
  const [flightDeals, hotelDeals] = await Promise.all([
    getActiveDeals(30),
    getActiveHotelDeals(30),
  ]);

  const totalDeals = flightDeals.length + hotelDeals.length;

  return (
    <main className="flex-1">
      <Header variant="dark" />

      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <p className="ff-eyebrow mb-3">ALL ACTIVE DEALS</p>
        <h1 className="text-[clamp(2rem,4vw,3.75rem)] font-display font-black tracking-tight leading-tight">
          Penny&apos;s latest finds.
        </h1>
        <p className="mt-3 text-ffgray-500 max-w-lg">
          {totalDeals > 0
            ? "Every deal links straight to Google Flights or booking sites. Prices verified at crawl time."
            : "Penny is building her price baseline. Deals will appear here once she has enough data."}
        </p>

        {totalDeals > 0 ? (
          <div className="mt-8">
            <DealFilters
              flightDeals={flightDeals}
              hotelDeals={hotelDeals}
            />
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
