-- Rate limiting table for unauthenticated /check endpoint
create table if not exists check_usage (
  ip_hash text not null,
  date    text not null,
  count   integer not null default 1,
  primary key (ip_hash, date)
);
