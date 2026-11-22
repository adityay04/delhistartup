ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_checked_at timestamptz;

CREATE TABLE public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  title text NOT NULL,
  location text,
  employment_type text,
  source_url text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  CONSTRAINT job_postings_source_url_http CHECK (source_url ~ '^https?://')
);

CREATE INDEX job_postings_active_entity_idx
  ON public.job_postings (entity_id, last_checked_at DESC)
  WHERE is_active = true;

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read current roles for sourced verified entities"
  ON public.job_postings
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND last_checked_at >= now() - interval '7 days'
    AND expires_at > now()
    AND EXISTS (
      SELECT 1
      FROM public.entities
      WHERE entities.id = job_postings.entity_id
        AND entities.is_verified = true
        AND entities.source_url IS NOT NULL
        AND entities.source_checked_at >= now() - interval '90 days'
    )
  );
