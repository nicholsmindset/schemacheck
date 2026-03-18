-- SchemaCheck initial database schema
-- Run in Supabase SQL Editor or via supabase db push

-- =========================================
-- api_keys
-- =========================================
CREATE TABLE IF NOT EXISTS api_keys (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key                    text UNIQUE NOT NULL,
  email                  text NOT NULL,
  plan                   text NOT NULL DEFAULT 'free'
                           CHECK (plan IN ('free', 'basic', 'growth', 'scale')),
  requests_used          int NOT NULL DEFAULT 0,
  requests_limit         int NOT NULL DEFAULT 100,
  overage_rate           decimal(6,4) NOT NULL DEFAULT 0.0000,
  created_at             timestamptz NOT NULL DEFAULT now(),
  stripe_customer_id     text,
  stripe_subscription_id text,
  is_active              bool NOT NULL DEFAULT true,
  notified_90            bool NOT NULL DEFAULT false,
  notified_100           bool NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys (key);
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys (email);
CREATE INDEX IF NOT EXISTS idx_api_keys_stripe_customer ON api_keys (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- =========================================
-- usage_logs
-- =========================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id       uuid NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint         text NOT NULL,
  input_type       text NOT NULL CHECK (input_type IN ('url', 'jsonld')),
  schemas_found    int NOT NULL DEFAULT 0,
  errors_found     int NOT NULL DEFAULT 0,
  response_time_ms int NOT NULL,
  cached           bool NOT NULL DEFAULT false,
  credited         bool NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key_id ON usage_logs (api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs (created_at DESC);

-- =========================================
-- validation_cache
-- =========================================
CREATE TABLE IF NOT EXISTS validation_cache (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash    text UNIQUE NOT NULL,
  url         text NOT NULL,
  result      jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_validation_cache_url_hash ON validation_cache (url_hash);
CREATE INDEX IF NOT EXISTS idx_validation_cache_expires_at ON validation_cache (expires_at);

-- Auto-purge expired cache entries (optional: run via pg_cron or Supabase scheduled functions)
-- DELETE FROM validation_cache WHERE expires_at < now();

-- =========================================
-- Row Level Security (RLS)
-- =========================================
-- Disable RLS — all access via service role key from server-side only
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE validation_cache DISABLE ROW LEVEL SECURITY;
