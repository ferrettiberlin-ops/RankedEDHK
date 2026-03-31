-- Creates tables for email verification flow used by the app.
CREATE TABLE IF NOT EXISTS public.verified_emails (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  verified_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_verifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
