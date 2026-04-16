# Zomunk: Deep-Dive Business Model Analysis & Zero-Cost Clone Blueprint

**Prepared for:** Khush
**Date:** April 16, 2026
**Purpose:** Understand exactly how Zomunk.com works, why it works, and how you can build a near-identical personal version for friends and family at close to zero cost, with Claude Code doing the implementation.

---

## 1. Executive Summary

Zomunk is **not** a travel booking engine. It is a *deal-discovery newsletter dressed up as a consumer app*. The entire product is a curated feed of abnormally cheap international round-trip flights from Indian airports, delivered as push/email alerts, with a one-click hand-off to Google Flights for the actual booking.

The "magic" Zomunk sells is **filtering**, not inventory. They don't negotiate with airlines, don't hold inventory, don't take OTA commissions — they just watch prices and tell you when something is cheap. This is the *same* playbook as Going.com (formerly Scott's Cheap Flights, 2M+ members, ~$550 avg savings) and Jack's Flight Club — adapted for the Indian passport holder.

**Revenue model:** ₹1,499/year subscription (inclusive of GST). Free tier shows 1 in 10 deals (economy only). Premium shows 100% (incl. mistake fares, premium cabins, peak-season drops). 7-day no-questions refund. No booking commissions.

**The "how do they do it" answer, in one sentence:** They run automated price crawls across thousands of origin→destination pairs, compare today's lowest fare to a historical baseline, and human-review anything abnormally low before pushing an alert. That's it. Replicable.

**Bottom line:** For friends-and-family personal use, you can absolutely build a Zomunk-equivalent for roughly **$0–$15/year** in out-of-pocket cost (just a domain), using free API tiers and free hosting, with Claude Code writing all the code.

---

## 2. What Zomunk Actually Is — A Factual Breakdown

### 2.1 Company basics

- **Founder:** Karan Dembla
- **Founded:** 2022
- **Funding:** None disclosed (Crunchbase / Tracxn show no raise). Bootstrapped.
- **HQ / legal:** India
- **Platforms:** Web (zomunk.com), iOS, Android
- **Support phone:** +91 9355924966 | Email: support@zomunk.com

### 2.2 The product surface

The app / site has one job: show you a list of "deals," each one being a specific origin→destination round-trip at a price at least 40% below its usual fare. Each deal card shows:

- Destination + origin city
- Headline percent off (e.g., 70%, 55%)
- Crossed-out "normal" price + discounted price
- Airline + cabin class (Economy / Premium Economy / Business / First)
- Availability window (which months it's bookable in)
- A **"Book on Google Flights"** button with a pre-filled route + sample date

The user taps the button, lands on Google Flights with the search already populated, optionally tweaks dates, and books directly with the airline or an OTA (MakeMyTrip, Cleartrip, etc.) — not on Zomunk.

### 2.3 Subscription tiers (exact pricing)

| Tier | Price | What you get |
|---|---|---|
| **Free** | ₹0 | 1 in 10 curated **economy-only** deals. "A taste, not the full experience." |
| **Premium** | ₹1,499/year (incl. GST) | **100% of all deals** — economy, premium economy, business, first; mistake fares; peak-season drops; priority email alerts. 7-day no-questions refund. |

### 2.4 Deal taxonomy (their own language)

- **Common deals** — discounted popular routes out of major airports (BOM, DEL, BLR, MAA). Good savings, always visible to Premium.
- **Rare deals** — less popular destinations or peak-season (Christmas, Diwali, summer) drops that are hard to find manually.
- **Unique deals** — **mistake fares** (airline pricing errors), plus premium-cabin deals. Premium-only. Live for *hours*, not days.

Typical deal shelf-life: **2–3 days** for normal drops, **a few hours** for mistake fares.

### 2.5 Published examples they advertise

| Route | Normal fare | Zomunk fare | % off | Cabin |
|---|---|---|---|---|
| India ↔ Tokyo | ₹75,000 | ₹36,500 | 51% | Economy |
| India ↔ Berlin | ₹72,000 | ₹21,300 | 70% | Economy |
| India ↔ Athens | ₹65,000 | ₹24,000 | 63% | Economy |
| India ↔ Toronto | ₹1,35,000 | ₹69,700 | 48% | Economy |
| India ↔ Phnom Penh | ₹36,000 | ₹17,200 | 52% | Economy |
| India ↔ Hong Kong | ~₹36,000 | ~₹16,000 | 55% | Economy |
| India ↔ USA | ~₹70,000+ | ₹36,000 (non-stop) | ~50% | Economy |
| India ↔ USA (Business) | ~₹3L+ | ₹1.4L | ~50% | Business |
| India ↔ Vietnam (Business) | ~₹70k+ | ₹32,000 | ~55% | Business |

### 2.6 Quality criteria a deal must pass

- Non-stop **or** one-stop with a **short** layover
- No self-transfer routings (two separate tickets)
- No routes that force a transit visa on an Indian passport
- Full-service airlines preferred (9 out of 10 deals are with Etihad, Singapore, ANA, Qantas, Emirates, Vistara, etc.)
- Usually includes check-in baggage — and if not, that's disclosed upfront
- At least **40% cheaper** than the usual published fare (many 60–90%)

---

## 3. The Logic Behind It — How Do They Actually Do This?

This is the part that confuses most people. The answer is less glamorous than the marketing suggests.

### 3.1 The core loop (in plain English)

```
FOR every origin-destination-month combination you watch:
    1. Every few hours, fetch the current lowest round-trip fare
    2. Compare it against a rolling historical baseline for that route/month
    3. IF current_price <= baseline * (1 - discount_threshold):
           Flag as a candidate deal
    4. Human reviewer checks: airline, routing, bags, layover, visa
    5. IF it passes → write up a deal card + generate Google Flights link
    6. Push notification + email blast to subscribers
```

That's the whole algorithm. No AI. No machine learning wizardry. No partnership with airlines. Zomunk's marketing page says *"sophisticated algorithms and AI to find the lowest fares"* — but the truthful, boring version is **a price-watcher cron + a human editor**. This is exactly how the much larger Going.com works too. Scott Keyes (founder of Going / Scott's Cheap Flights, 2M+ members) said it plainly on The Points Guy podcast:

> "We do all of our searching by hand. Handpicked, artisanal… surprises a lot of people. We sent out about 700 cheap flights last month. We find these by hand rather than using algorithms. There is an extensive list of factors that people think about when they are booking a flight… humans are the best ones to actually judge these qualitative factors."

Zomunk likely has more automation than Going because they only cover ~4 Indian origin airports and a defined list of destinations, so the crawl space is small. But the *filter* is always human-assisted.

### 3.2 Where the deals actually come from

Cheap fares on the public internet originate from four buckets:

1. **Pricing/revenue-management releases** — airlines open up a temporary "bucket" of cheap seats to fill a flight. Totally intentional. Available to anyone with a tool to watch.
2. **Flash sales** — airline marketing promos (Singapore Airlines end-of-year sale, Emirates monsoon sale). Announced publicly; the trick is knowing where to look.
3. **Currency / tax arbitrage** — a fare may be priced cheaper when the point of sale is a different country. Example: a DEL–LHR–JFK fare may be 40% cheaper if priced in Euros from a European site. Harder for an individual to spot, easy for a price-watcher script.
4. **Mistake / error fares** — genuine airline pricing glitches (wrong currency conversion, missing fuel surcharge, a zero dropped, stale fare filing). Last hours. Airlines sometimes cancel them (DOT no longer forces them to be honored). These are the lottery tickets Zomunk markets hardest.

### 3.3 Why they don't sell tickets themselves

Because selling a ticket means:

- Becoming an IATA-accredited travel agent or working through a GDS (Amadeus, Sabre, Travelport) — lots of paperwork, deposits, insurance.
- Holding the merchant of record liability, payment gateway risk, chargebacks.
- Fighting for thin commissions (1–3%) against MakeMyTrip, EaseMyTrip, Cleartrip.

By handing the user off to Google Flights, Zomunk avoids **all of that**. Their entire operation is: price-watcher + CMS + notification + Stripe/Razorpay for subscriptions. It's a media business, not a travel business.

### 3.4 Why "₹1,499/year" is the sweet spot

- Average Indian international economy ticket: ₹40k–₹70k.
- If Zomunk saves you ₹10k on one trip, the subscription pays for itself 6–7x.
- Anchor works psychologically — one coffee a month.
- 7-day refund removes purchase friction.
- At ~10,000 paid subscribers (plausible for a 3-year-old niche), ARR ≈ ₹1.5 crore (~$180k) with ~2–3 people on payroll. Extremely healthy unit economics.

### 3.5 Why the "Google Flights hand-off" is brilliant UX, not laziness

- Google Flights is the fare-accuracy gold standard most users already trust.
- It handles the cabin class, date flexibility, multi-city search, and checkout redirect to airline/OTA.
- Zomunk avoids the "stale price on our page" problem — Google Flights always shows the current live fare.
- Users can't blame Zomunk if the price moved — "we find, you book."
- Massive reduction in liability and support burden.

---

## 4. Building Your Personal Equivalent — The Zero-Cost Blueprint

The objective: a private flight-deal alerter for **you, your family, and your friends** (~10–30 people), optimized to surface:

- Cheap **flights** from your home airports (BOM, DEL, BLR, HYD, etc.) to a watched list of destinations.
- Cheap **hotels** in a watched list of cities.

### 4.1 Architecture at a glance

```
┌────────────────────────────────────────────────────────────────┐
│                    THE DAILY PIPELINE                          │
│                                                                │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────────┐  │
│  │ Cron     │──▶│ Fare     │──▶│ Deal    │──▶│ Notification │  │
│  │ Scheduler│   │ Crawler  │   │ Detector│   │ Fan-out      │  │
│  │ (hourly) │   │          │   │         │   │              │  │
│  └──────────┘   └──────────┘   └─────────┘   └──────────────┘  │
│                      │              │              │           │
│                      ▼              ▼              ▼           │
│                 ┌────────┐    ┌─────────┐    ┌──────────┐      │
│                 │ APIs + │    │ Price   │    │ Telegram │      │
│                 │ Scraper│    │ History │    │ + Email  │      │
│                 │        │    │ (SQLite)│    │ + WebPush│      │
│                 └────────┘    └─────────┘    └──────────┘      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Thin web UI (Next.js on Vercel) — feed of active deals,  │  │
│  │ subscribe form, deal history, analytics for friends      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Data sources — comparison and recommendation

| Source | Free tier | Best for | Caveats |
|---|---|---|---|
| **Amadeus Self-Service API** | ~2,000 calls/month free, pay-as-you-go after | Real fares, 400+ airlines, includes baggage + cabin class + seat info | Sandbox data differs from prod; need prod key for real fares (free to request) |
| **Duffel API** | No monthly fee, pay $3/confirmed order only | Clean modern REST API, NDC airlines, flight search unlimited | Mostly shines when booking; search is also free |
| **Kiwi.com Tequila API** | Self-serve signup, free for search | Low-cost-carrier coverage, flexible date search | Commission-based for bookings; search is fine to use |
| **SerpAPI Google Flights** | 100 searches/month free, then $75/mo for 5k | Mirrors exact Google Flights results including booking URL | Cheapest paid tier is still \$75/mo — skip for personal use |
| **fast-flights (open-source Python lib)** | Completely free | Scrapes Google Flights directly, no API key | Unofficial, may break; rate-limit yourself; good enough for 10–30 users |
| **Aviationstack** | 100 calls/month free | Flight status, metadata | No pricing data — not useful for deals |
| **Hotelbeds** | Free sandbox | Wholesale hotel rates | Needs business application |
| **Makcorps Hotel Price API** | Free trial | Rate comparison across OTAs | Limited free usage |
| **Amadeus Hotels** | Same self-service free tier | Basic hotel search + rates | Less price-competitive than OTA wholesalers |

**Recommended stack for zero cost:**

- **Flights:** `fast-flights` (Python) as the primary crawler + **Amadeus Self-Service** free tier as a sanity-check / fallback.
- **Hotels:** **Amadeus Hotels** free tier + scraping of **Booking.com / Agoda** public search pages for a handful of friend-watched cities. Or use the RapidAPI Booking.com mirror (free 100 calls/month).
- **Currency / exchange rates:** `frankfurter.app` (completely free, no key).

### 4.3 The deal-detection logic

For each `(origin, destination, month)` tuple you watch:

```python
# Pseudocode
baseline = rolling_median(price_history, last_90_days, same_origin_dest_month)
current = fetch_current_lowest_fare(origin, destination, month)

if current <= baseline * (1 - 0.40):            # 40% drop threshold like Zomunk
    deal = {
        "route": f"{origin} → {destination}",
        "month": month,
        "price": current,
        "baseline": baseline,
        "pct_off": round((1 - current/baseline) * 100),
        "airline": ...,
        "stops": ...,
        "bags_included": ...,
        "google_flights_url": build_gfl_url(origin, destination, month),
    }
    if passes_quality_filter(deal):              # no self-transfer, no transit visa, ≤1 stop
        push_to_notification_queue(deal)
        store_to_db(deal)
```

**Key tricks:**

- **Rolling baseline per month** avoids false positives (e.g., Jan flights are always cheaper than Dec).
- **Tie-breakers:** if two deals same route, prefer fewer stops → full-service airline → shorter total duration.
- **Confidence score:** `pct_off × availability_days` — helps rank the feed.
- **Mistake-fare heuristic:** drop > 70% **and** available for < 24 hours → flag as UNIQUE / MISTAKE and push an urgent alert.

### 4.4 Notification delivery (all free)

| Channel | How | Cost |
|---|---|---|
| **Telegram bot** | Create a bot via @BotFather → one channel per persona ("Flockfare Alerts"). Friends join. | Free, unlimited |
| **WhatsApp group** | Manual copy-paste from a daily digest, or use WhatsApp Cloud API free tier (1k conv/mo) | Free |
| **Email** | Resend (3k emails/mo free) or Gmail SMTP (500/day free) | Free |
| **Web push** | OneSignal free tier (10k subscribers) | Free |
| **RSS feed** | Write atom.xml on publish | Free |

Recommendation: **Telegram channel + email digest**. Group chat is the path of least resistance for friends and family.

### 4.5 Hosting & storage (all free tiers)

| Component | Service | Free tier |
|---|---|---|
| **Web app (Next.js)** | **Vercel Hobby** | 100 GB bandwidth, unlimited deployments |
| **Cron / scheduled jobs** | **GitHub Actions** (schedule trigger) | 2,000 min/mo public repos, 500 min/mo private |
| **Database** | **Supabase free tier** or **Turso (SQLite)** | 500 MB Postgres / 9 GB SQLite — plenty for 2 years of price history |
| **Object storage (deal images)** | **Cloudflare R2** | 10 GB free |
| **DNS / CDN** | **Cloudflare** | Free |
| **Transactional email** | **Resend** | 3,000/mo |
| **Error tracking** | **Sentry free tier** | 5k events/mo |
| **Analytics** | **Plausible self-host** or **Umami** | Free on Vercel |

**Total recurring cost: domain only (~₹1,000/year or ~$11/yr).** Everything else is $0.

### 4.6 Tech stack I'd ask Claude Code to build

```
Frontend:   Next.js 15 (App Router) + Tailwind + shadcn/ui
Backend:    Next.js API routes + Supabase (Postgres)
Cron:       GitHub Actions → hits a signed webhook on Vercel
Crawler:    Python worker (fast-flights + httpx + pydantic)
            hosted on Render free tier or as GH Action matrix
Notifier:   Python / Node worker; Telegraf for TG; Resend SDK for email
Auth:       Supabase magic links (family can log in with email)
Deploy:     Vercel for web; Supabase-managed for DB; GH Actions for jobs
```

### 4.7 Build plan in phases (suggest 4–6 weekends of Claude Code time)

| Phase | Deliverable | Effort |
|---|---|---|
| **P1: Skeleton** | Repo + Next.js app + Supabase schema (`routes`, `price_history`, `deals`, `subscribers`) | ~4 hrs |
| **P2: Crawler MVP** | Watch 5 origin airports × 20 destinations × 6 months = 600 combos, hourly crawl via `fast-flights`, store snapshots | ~6 hrs |
| **P3: Deal Detector** | Rolling baseline + 40% threshold + quality filter + Google Flights URL builder | ~4 hrs |
| **P4: Notifications** | Telegram bot + email digest + web push | ~4 hrs |
| **P5: Web UI** | Deal feed, per-destination page, price chart (last 90 days via Recharts), subscribe form | ~8 hrs |
| **P6: Hotels** | Add hotel watchlist (Amadeus + Booking scrape) | ~6 hrs |
| **P7: Polish** | Branding, analytics, error handling, throttling, docs | ~4 hrs |

**Realistic wall-clock:** 3–4 weekends of focused work, or 1 week full-time, with Claude Code writing ~90% of the code.

### 4.8 What will cost money (so you're not surprised)

- **Domain:** ₹900–₹1,200/yr (one-time per year).
- **Telegram:** free.
- **SMS alerts** (if you add them later via Twilio): ~\$0.01/SMS.
- **Paid APIs if you outgrow scrapers:** Amadeus self-service is pay-as-you-go at fractions of a cent per call; for ~30 users you won't hit limits.
- **LLM for deal summaries** (optional): Claude Haiku at ~\$0.25 / 1M tokens — pennies per month.

### 4.9 Mistake-fare etiquette (important legal note)

Mistake fares are a gray area. In India there is no consumer-protection rule forcing airlines to honor them. Best practice:

- Book **directly** with the airline, not an OTA — chance of honoring is higher.
- Ticket immediately; don't wait.
- Don't call the airline to "confirm" — that tips them off.
- Hold off on hotels / non-refundable prep for 24–48 hours until ticketed.
- Use a credit card with chargeback protection.
- Tell friends it *might* get cancelled; set expectations.

---

## 5. Key Differences You Can Build In (vs. Zomunk)

Because this is *for you and friends*, you can be better than Zomunk on several dimensions:

1. **Actual price history charts** (Zomunk just shows a single crossed-out number). You show last 90 days for every route → proves the deal is real.
2. **Per-user home-airport preferences.** Amma wants MAA, cousin wants BOM — personalize per subscriber.
3. **Hotel deals too.** Zomunk doesn't do hotels; you can bundle city-break deals (flights + hotel for the same weekend).
4. **"Friend-group mode" voting.** One-click "I'd book this" button on Telegram; when 2+ friends react, DM them all to coordinate.
5. **Calendar sync.** Add tentative trip to Google Calendar for anyone interested.
6. **Zero lock-in.** Telegram link, Google Flights hand-off, no account needed for friends.

---

## 6. Branding — Name, Domain, Positioning

### 6.1 What makes Zomunk's name work (so we can do the same)

- 6 letters, 2 syllables → easy to say.
- Invented word → no trademark clash.
- "Zo-" borrows equity from Zomato (familiar-feeling for Indians).
- "-munk" evokes *monk* (wisdom/curator), *chipmunk* (scurry, cuteness) — playful mascot potential.

### 6.2 Recommended shortlist for you (all domain-availability-checked on 16 Apr 2026)

| # | Name | Domain | Status | Concept |
|---|---|---|---|---|
| 1 | **FlockFare** | **flockfare.com** (avail, \$11.25) + **flockfare.app** (avail, \$14.99) | ✅ **TOP PICK** | "Flock" = your friends & family group. Warm, bird-migration-evokes-travel. |
| 2 | **FarePigeon** | **farepigeon.com** (avail, \$11.25) + **farepigeon.app** (avail, \$14.99) | ✅ **TOP PICK** | Messenger pigeon that delivers fare alerts. Cute, memorable, great mascot. |
| 3 | **FareSage** | **faresage.com** (avail, \$11.25) + **faresage.app** (avail, \$14.99) | ✅ Strong | The wise one who knows when prices drop. Slightly more premium feel. |
| 4 | **PerchFare** | **perchfare.com** (avail, \$11.25) | ✅ Good | "We perch on prices and swoop when they drop." |
| 5 | **SwoopFare** | **swoopfare.com** (avail, \$11.25) | ✅ Good | Action-oriented. Bird-of-prey grabbing a bargain. |
| 6 | **MigrateFare** | **migratefare.com** (avail, \$11.25) | ⚠ OK | Travel = migration. A bit on-the-nose. |
| 7 | **HoppFlock** | **hoppflock.com** (avail, \$11.25) | ⚠ OK | Hop + flock. Playful but harder to spell. |
| 8 | **FareDodo** | **faredodo.com** (avail, \$11.25) | ⚠ Risky | Dodo = extinct, not ideal for a "fares you won't miss" brand. |
| 9 | **Savanah** | **savanah.app** (avail, \$14.99) | ⚠ OK | African savannah imagery. Less connected to price hunting. |
| 10 | **MyFlockFare** | **myflockfare.com** (avail, \$11.25) | ⚠ OK | Personalises #1. Useful as a fallback or marketing subdomain. |

**Not recommended (clash with existing brands / unavailable):**
~~farely.app, getfarely.com, beakon.app, trybeakon.com, nestfare.com, dealfinch.com, fareflick.com, fareglitch.com, paisajet.com, wayglow.com, dealperch.com, pricewing.com~~

### 6.3 Top 3 — deeper treatment

#### 🥇 FlockFare (flockfare.com + flockfare.app)

- **Tagline candidates:**
  - *"Cheap flights, for your flock."*
  - *"Where your people go when prices drop."*
  - *"The travel deals your WhatsApp group will thank you for."*
- **Visual:** Flat geometric birds in formation; sky-blue + warm coral accent.
- **Why it wins for your use case:** You explicitly said *"for my friends and family so we get the best deals possible."* "Flock" literally means your close-knit group, while the bird metaphor ties to flight. Dual meaning = sticky.

#### 🥈 FarePigeon (farepigeon.com + farepigeon.app)

- **Tagline candidates:**
  - *"We fly in cheap fares. You fly out happy."*
  - *"Your messenger for impossibly cheap flights."*
- **Visual:** Stylised pigeon carrying a ticket; slate + mustard palette.
- **Why it could win:** Mascot potential is off the charts. A cartoon pigeon becomes your UI personality (loading states, empty states, 404s). Instantly memorable.

#### 🥉 FareSage (faresage.com + faresage.app)

- **Tagline candidates:**
  - *"Wise to the cheapest fare in the sky."*
  - *"The elder that knows when to book."*
- **Visual:** Minimal wordmark, deep indigo + cream. More "premium" feel — good if you ever want to monetize.
- **Why it's in the shortlist:** Feels more serious/adult than the other bird brands. Better if you ever add a paid tier for people outside your close group.

### 6.4 My concrete recommendation

**Register both:** `flockfare.com` (primary) + `flockfare.app` (for the mobile install link). Total ≈ **\$26** for the first year.

Use **FlockFare** publicly, and tell Claude Code to build it with a playful bird mascot. If later you want to spin up a more serious/"paid" offshoot for extended family or colleagues, `faresage.com` is still available as a second brand.

---

## 7. Risks, Caveats, and Things Zomunk Quietly Deals With

| Risk | How Zomunk handles it | How you should handle it |
|---|---|---|
| **Scraping gets blocked** | Likely uses a mix of APIs + distributed scraping + CAPTCHA solvers | Start with `fast-flights` + Amadeus free tier; add proxies only if blocked |
| **Mistake fares cancelled by airline** | FAQ warns "prices can fluctuate"; no guarantee | Warn friends; tell them to wait 48 hr before booking hotels |
| **Subscriber demand varies** | Priority email + push alerts | For 10–30 friends, Telegram + email is enough |
| **Google Flights URL changes format** | They monitor and fix | Wrap the URL-builder in a single module so Claude Code can fix in one place |
| **Data freshness vs. API cost** | Tiered — free users get 1-in-10 | For personal use, crawl every 2–4 hours, not every 15 min |
| **Legal / ToS on scraping** | Low-key risk; private sites discourage scraping but rarely sue | Keep volume low; identify with a real User-Agent; cache aggressively |

---

## 8. What to Do Next (Action List)

1. **Pick a name.** My recommendation: **FlockFare**. Register `flockfare.com` + `flockfare.app` today (~$26).
2. **Define the watchlist.** List your friends' home airports (e.g., BOM, DEL, BLR, MAA, HYD). List 15–25 destinations that matter to your group.
3. **Spin up the repo.** Ask Claude Code to scaffold: Next.js + Supabase + GitHub Actions cron + Telegraf bot.
4. **Ship P1+P2 in a weekend.** Start watching prices; even if UI isn't done, the data will accumulate — baseline needs 2–4 weeks to mature.
5. **Invite 5 beta users** from your family. Iterate.
6. **Layer in hotels** only after flights are solid.
7. **Optional monetization later:** If friends-of-friends want in, you could soft-launch a ₹499/year tier to cover infra. Keep the core free for your "flock."

---

## Appendix A — Sources

Primary research pulled from:

- [Zomunk homepage](https://zomunk.com/)
- [Zomunk FAQ (main site)](https://zomunk.com/faq)
- [Zomunk Help: What's a Zomunk Deal?](https://help.zomunk.com/en/article/whats-a-zomunk-deal-x03h82/)
- [Zomunk Help: Premium Membership](https://help.zomunk.com/en/article/zomunk-premium-membership-1c3iky8/)
- [Zomunk Help: FAQ](https://help.zomunk.com/en/article/zomunk-faq-1p6xs94/)
- [Businessworld: Zomunk profile](https://www.businessworld.in/article/zomunk-revolutionising-affordable-air-travel-for-indian-families-530986)
- [Tracxn: ZoMunk company profile](https://tracxn.com/d/companies/zomunk/)
- [Crunchbase: Zomunk](https://www.crunchbase.com/organization/zomunk)
- [Going.com (Scott's Cheap Flights) origin story](https://www.going.com/scotts-cheap-flights)
- [The Points Guy: Scott Keyes interview on methodology](https://thepointsguy.com/airline/talking-points-episode-16-finding-mistake-fares-and-affordable-flights-with-scotts-cheap-flights/)
- [Going: How to Find Mistake Fares](https://www.going.com/guides/mistake-fares)
- [Time: How a Mistake Could Help You Save Hundreds on Flights](https://time.com/4957204/error-fares-save-money/)
- [Top 14 Travel APIs for Developers (2026)](https://api.market/blog/magicapi/travel-api/best-travel-apis-for-developers)
- [Skyscanner Flight API guide (2026)](https://www.oneclickitsolution.com/blog/skyscanner-flight-api)
- [Duffel pricing](https://duffel.com/pricing)
- [Hotel APIs comparison 2026](https://phptravels.com/wp/what-is-a-hotel-api-and-why-does-it-matter/)
- [Best Flight Data Providers 2026](https://brightdata.com/blog/web-data/best-flight-data-providers)

---

*Prepared using live web research on April 16, 2026. Fare numbers and API pricing were accurate as of that date; verify before committing capital.*
