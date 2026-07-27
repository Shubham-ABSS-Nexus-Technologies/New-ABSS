PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  contact TEXT,
  service TEXT,
  package_name TEXT,
  budget INTEGER NOT NULL DEFAULT 0,
  budget_label TEXT,
  message TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  source TEXT NOT NULL DEFAULT 'Contact Form',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_service ON leads (service);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT,
  service TEXT,
  value INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  start_date TEXT,
  deadline TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  client_name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT,
  priority TEXT NOT NULL DEFAULT 'Normal',
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starting_price INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  features_json TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  type TEXT,
  message TEXT NOT NULL,
  entity_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL
);
