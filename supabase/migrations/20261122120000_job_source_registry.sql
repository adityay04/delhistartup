CREATE TABLE public.job_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL UNIQUE
    REFERENCES public.entities(id) ON DELETE CASCADE,
  provider text NOT NULL
    CHECK (provider IN ('greenhouse', 'lever', 'ashby')),
  board_identifier text NOT NULL
    CHECK (length(trim(board_identifier)) > 0),
  source_url text NOT NULL
    CHECK (source_url ~ '^https?://'),
  is_active boolean NOT NULL DEFAULT true,
  last_attempted_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_sources_provider_board_unique
    UNIQUE (provider, board_identifier)
);

ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
