-- PostgreSQL schema for MarketMap when DATABASE_URL is connected.
-- The founding app boots on a local file store so it runs without a database.
-- Apply this migration with a direct role, then point the API at the same model.

create table users (
  id text primary key,
  provider_subject text,
  email text not null unique,
  name text not null,
  password_hash text,
  role text not null check (role in ('buyer', 'researcher', 'publisher', 'admin'))
);

create table businesses (
  id text primary key,
  owner_id text not null references users(id),
  name text not null,
  category text not null,
  zip text not null,
  time_zone text not null,
  offerings text not null default '',
  tone text not null,
  reminders_opt_in boolean not null default false
);

create table groups (
  id text primary key,
  name text not null,
  url text not null,
  city text not null,
  county text not null,
  locality text not null,
  distance_miles numeric,
  distance_method text not null,
  member_count integer,
  count_checked_on date,
  count_provenance text,
  privacy text not null,
  join_access text not null,
  promotion_status text not null,
  rule_summary text not null,
  audience text not null,
  evidence_date date,
  confidence text not null,
  listing_status text not null,
  stale boolean not null default false,
  correction text,
  evidence_summary text not null,
  internal_notes text not null default '',
  ambiguous_recurrence text,
  fixture boolean not null default false
);

create table rule_windows (
  id text primary key,
  group_id text not null references groups(id),
  weekdays integer[] not null,
  start_local time,
  end_local time,
  time_zone text not null,
  max_per_week integer not null,
  conditions text not null
);

create table editions (
  id text primary key,
  name text not null,
  version text not null,
  status text not null,
  published_on date not null,
  anchor_zip text not null,
  coverage text[] not null,
  edge text[] not null
);

create table edition_assets (
  id text primary key,
  edition_id text not null references editions(id),
  kind text not null,
  checksum text not null,
  storage_key text not null
);

create table orders (
  id text primary key,
  user_id text not null references users(id),
  offer_id text not null,
  status text not null,
  mode text not null,
  amount_cents integer not null,
  currency text not null,
  stripe_session_id text unique,
  created_at timestamptz not null
);

create table stripe_events (
  id text primary key,
  received_at timestamptz not null default now()
);

create table entitlements (
  id text primary key,
  user_id text not null references users(id),
  edition_id text not null references editions(id),
  order_id text not null unique references orders(id),
  status text not null
);

create table plan_items (
  id text primary key,
  business_id text not null references businesses(id),
  edition_id text not null references editions(id),
  group_id text not null references groups(id),
  window_id text references rule_windows(id),
  plan_date date not null,
  start_local time,
  end_local time,
  time_zone text not null,
  kind text not null,
  status text not null,
  notes text not null default '',
  revision integer not null
);

create table drafts (
  id text primary key,
  business_id text not null references businesses(id),
  plan_item_id text references plan_items(id),
  group_id text references groups(id),
  title text not null,
  body text not null,
  revision integer not null,
  created_at timestamptz not null
);

create unique index entitlements_active_owner_edition
  on entitlements (user_id, edition_id)
  where status = 'active';

create index plan_items_business_date on plan_items (business_id, plan_date);
create index groups_status_name on groups (listing_status, name);
