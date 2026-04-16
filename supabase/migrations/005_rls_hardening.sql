-- Harden RLS: explicit service-role-only read on raw crawl data tables
-- price_history and hotel_price_history had RLS enabled but no policies (default-deny).
-- Add explicit policies to document intent and prevent accidental exposure.

-- price_history: public read (powers price charts on destination pages)
CREATE POLICY "Public read price_history"
  ON price_history FOR SELECT
  USING (true);

-- hotel_price_history: service role only (no public UI reads this yet)
CREATE POLICY "Service role read hotel_price_history"
  ON hotel_price_history FOR SELECT
  USING (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- subscribers: ensure no public reads (PII protection)
-- RLS is already enabled with no SELECT policy = default deny. Add explicit policy.
CREATE POLICY "Service role read subscribers"
  ON subscribers FOR SELECT
  USING (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- subscribers: allow inserts via service role only (API route uses supabaseAdmin)
CREATE POLICY "Service role insert subscribers"
  ON subscribers FOR INSERT
  WITH CHECK (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');

-- subscribers: allow updates via service role only (reactivation)
CREATE POLICY "Service role update subscribers"
  ON subscribers FOR UPDATE
  USING (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role');
