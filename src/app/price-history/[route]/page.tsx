import Link from "next/link";
import { notFound } from "next/navigation";
import { ORIGINS, DESTINATIONS } from "@/config/watchlist";
import { getPriceHistory } from "@/lib/supabase/price-history";
import { getActiveDeals } from "@/lib/supabase/deals";
import { Header } from "@/components/header";
import { PriceHistoryView, type RouteMeta } from "@/components/price-history-view";

export const revalidate = 300;

function parseRoute(input: string): { origin: string; destination: string } | null {
  const parts = input.toUpperCase().split("-");
  if (parts.length !== 2) return null;
  const [o, d] = parts;
  if (o.length !== 3 || d.length !== 3) return null;
  return { origin: o, destination: d };
}

export default async function PriceHistoryPage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const parsed = parseRoute(route);
  if (!parsed) notFound();

  const origin = ORIGINS.find((o) => o.code === parsed.origin);
  const destination = DESTINATIONS.find((d) => d.code === parsed.destination);
  if (!origin || !destination) notFound();

  const history = await getPriceHistory(origin.code, destination.code, undefined, 365);
  const activeDeals = await getActiveDeals(50);
  const currentDeal = activeDeals.find(
    (d) => d.origin_code === origin.code && d.destination_code === destination.code
  );

  const peerRoutes: RouteMeta[] = ORIGINS.flatMap((o) =>
    DESTINATIONS.map((d) => ({
      key: `${o.code}-${d.code}`,
      origin: o.code,
      destination: d.code,
      originCity: o.city,
      destinationCity: d.city,
    }))
  );

  const meta: RouteMeta = {
    key: `${origin.code}-${destination.code}`,
    origin: origin.code,
    destination: destination.code,
    originCity: origin.city,
    destinationCity: destination.city,
  };

  return (
    <main id="main" className="flex-1">
      <Header />
      <div className="ph-breadcrumb">
        <Link href="/">Home</Link>
        <span className="sep">›</span>
        <Link href="/deals">Deals</Link>
        <span className="sep">›</span>
        <Link href={`/deals/${destination.code}`}>{destination.region ?? destination.country}</Link>
        <span className="sep">›</span>
        <span className="cur">
          {origin.code} → {destination.code} · Price history
        </span>
      </div>

      <PriceHistoryView
        meta={meta}
        history={history}
        peerRoutes={peerRoutes}
        currentDeal={
          currentDeal
            ? {
                price: currentDeal.current_price_inr,
                baseline: currentDeal.baseline_price_inr,
                pctOff: currentDeal.pct_off,
                airline: currentDeal.airline,
                dealType: currentDeal.deal_type,
                googleFlightsUrl: currentDeal.google_flights_url,
              }
            : null
        }
      />
    </main>
  );
}
