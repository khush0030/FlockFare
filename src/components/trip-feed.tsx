import type { TripCard } from "@/lib/supabase/trip-feed";

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function prettyDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function buildMultiCityUrl(q: {
  origin_code: string;
  outbound_dest_code: string;
  outbound_date: string;
  return_origin_code: string;
  return_date: string;
}): string {
  const tfu =
    `[null,null,2,null,[],1,[1,0,0,0],null,null,null,null,null,null,` +
    `[[[["${q.origin_code}",0]],[["${q.outbound_dest_code}",0]],null,0,[],[],"${q.outbound_date}",null,[],[],[],null,null,[],3],` +
    `[[["${q.return_origin_code}",0]],[["${q.origin_code}",0]],null,0,[],[],"${q.return_date}",null,[],[],[],null,null,[],3]]]`;
  return `https://www.google.com/travel/flights?tfs=${encodeURIComponent(tfu)}`;
}

export function TripFeed({ trips }: { trips: TripCard[] }) {
  if (!trips.length) return null;

  return (
    <section style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: ".12em",
            color: "rgba(11,11,15,.55)",
            marginBottom: 6,
          }}
        >
          ✦ TRIPS YOU&apos;RE TRACKING
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 900,
            margin: 0,
          }}
        >
          Live fares for your multi-city trips.
        </h2>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {trips.map((trip) => (
          <TripBlock key={trip.trip_slug} trip={trip} />
        ))}
      </div>
    </section>
  );
}

function TripBlock({ trip }: { trip: TripCard }) {
  if (!trip.quotes.length) {
    return (
      <div
        style={{
          border: "2px solid rgba(11,11,15,.1)",
          borderRadius: 16,
          padding: "24px",
          background: "var(--color-paper)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 900,
            margin: 0,
            marginBottom: 8,
          }}
        >
          {trip.trip_label}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(11,11,15,.55)",
            margin: 0,
          }}
        >
          No snapshots yet — crawler runs on schedule.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "2px solid rgba(11,11,15,.12)",
        borderRadius: 16,
        padding: "20px",
        background: "var(--color-paper)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 900,
              margin: 0,
            }}
          >
            {trip.trip_label}
          </h3>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "rgba(11,11,15,.6)",
              marginTop: 4,
            }}
          >
            {prettyDate(trip.outbound_date)} → {trip.outbound_dest_code} ·{" "}
            {trip.return_origin_code} → {prettyDate(trip.return_date)}
          </div>
        </div>
        {trip.cheapest && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: ".1em",
              color: "rgba(11,11,15,.55)",
            }}
          >
            CHEAPEST: {trip.cheapest.origin_code} · {fmt(trip.cheapest.total_price_inr)}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {trip.quotes.map((q) => (
          <a
            key={q.origin_code}
            href={buildMultiCityUrl(q)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              border: "1.5px solid rgba(11,11,15,.1)",
              borderRadius: 12,
              padding: "14px",
              background: "var(--color-cream)",
              transition: "border-color .15s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                {q.origin_code}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                {fmt(q.total_price_inr)}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(11,11,15,.6)",
                lineHeight: 1.6,
              }}
            >
              Out {fmt(q.outbound_price_inr)} · {q.outbound_airline ?? "Multi"} ·{" "}
              {q.outbound_stops === 0 ? "Direct" : `${q.outbound_stops ?? "?"} stop`}
              <br />
              Back {fmt(q.return_price_inr)} · {q.return_airline ?? "Multi"} ·{" "}
              {q.return_stops === 0 ? "Direct" : `${q.return_stops ?? "?"} stop`}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
