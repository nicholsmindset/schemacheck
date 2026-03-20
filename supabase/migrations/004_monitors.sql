create table if not exists monitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references api_keys(id) on delete cascade,
  url text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  last_checked_at timestamptz,
  last_score int,
  last_status text check (last_status in ('healthy', 'degraded', 'broken')),
  last_result jsonb,
  paused boolean not null default false,
  alert_on text not null default 'all' check (alert_on in ('all', 'errors', 'digest')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists monitor_events (
  id uuid primary key default gen_random_uuid(),
  monitor_id uuid not null references monitors(id) on delete cascade,
  event_type text not null check (event_type in (
    'score_drop',
    'new_error',
    'eligibility_lost',
    'schema_removed',
    'recovered',
    'check_failed',
    'check_result'
  )),
  previous_value jsonb,
  new_value jsonb,
  details jsonb,
  created_at timestamptz default now()
);

create index if not exists monitors_user_id_idx on monitors(user_id);
create index if not exists monitors_last_checked_idx on monitors(last_checked_at);
create index if not exists monitor_events_monitor_id_idx on monitor_events(monitor_id);
create index if not exists monitor_events_created_at_idx on monitor_events(created_at);
