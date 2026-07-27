create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  service text not null,
  budget integer default 0,
  status text not null default 'New',
  contact text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text not null,
  value integer default 0,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  service text,
  created_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  issue text not null,
  priority text not null default 'Medium',
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

create table if not exists pricing_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer default 0,
  timeline text,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
alter table projects enable row level security;
alter table clients enable row level security;
alter table support_tickets enable row level security;
alter table pricing_packages enable row level security;
alter table activity_log enable row level security;

create policy "Authenticated admins can manage leads"
  on leads for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can manage projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can manage clients"
  on clients for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can manage support tickets"
  on support_tickets for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can manage pricing packages"
  on pricing_packages for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated admins can manage activity log"
  on activity_log for all
  to authenticated
  using (true)
  with check (true);
