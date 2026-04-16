-- Deal voting — "I'd book this"
CREATE TABLE deal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,          -- name or emoji, no auth needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (deal_id, voter_name)       -- one vote per name per deal
);

CREATE INDEX idx_deal_votes_deal ON deal_votes (deal_id);

-- RLS
ALTER TABLE deal_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read votes" ON deal_votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes" ON deal_votes FOR INSERT WITH CHECK (true);
