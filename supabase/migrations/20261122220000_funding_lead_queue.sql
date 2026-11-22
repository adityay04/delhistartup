CREATE TABLE public.funding_leads (
  lead_key text PRIMARY KEY
    CHECK (lead_key ~ '^[0-9a-f]{64}$'),
  company_name text NOT NULL,
  headline text NOT NULL,
  source_url text,
  source_name text,
  source_published_at timestamptz,
  raw_record jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'needs_review', 'published', 'ignored')),
  entity_id uuid REFERENCES public.entities(id) ON DELETE SET NULL,
  attempt_count integer NOT NULL DEFAULT 0
    CHECK (attempt_count >= 0),
  last_attempted_at timestamptz,
  last_error text,
  review_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT funding_leads_source_url_https
    CHECK (source_url IS NULL OR source_url ~ '^https://')
);

CREATE INDEX funding_leads_pending_idx
  ON public.funding_leads (created_at)
  WHERE status = 'pending';

CREATE INDEX funding_leads_review_idx
  ON public.funding_leads (source_published_at DESC)
  WHERE status = 'needs_review';

ALTER TABLE public.funding_leads ENABLE ROW LEVEL SECURITY;
