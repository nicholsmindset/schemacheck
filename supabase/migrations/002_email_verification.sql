-- Email verification tokens
-- Created before issuing an API key; consumed on click to create the api_keys row.

CREATE TABLE IF NOT EXISTS email_verifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  token      text        UNIQUE NOT NULL,   -- 32 random hex chars
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,          -- created_at + 24 hours
  used_at    timestamptz                    -- NULL = unused/pending
);

CREATE INDEX IF NOT EXISTS email_verifications_token_idx ON email_verifications(token);
CREATE INDEX IF NOT EXISTS email_verifications_email_idx ON email_verifications(email);

-- Disable RLS — access only via service role key server-side
ALTER TABLE email_verifications DISABLE ROW LEVEL SECURITY;
