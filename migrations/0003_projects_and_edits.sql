-- Project = existing owner-scoped conversation aggregate; no duplicate project schema.
-- Extend additively without rewriting 0001/0002.
CREATE TABLE project_sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  ordinal INTEGER NOT NULL CHECK(ordinal > 0),
  title TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  evidence TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'provided-not-retrieved' CHECK(status='provided-not-retrieved'),
  provided_at TEXT NOT NULL,
  UNIQUE(project_id, ordinal)
);
CREATE INDEX idx_project_sources_owner ON project_sources(owner_id,project_id);
ALTER TABLE artifacts ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE artifacts ADD COLUMN updated_at TEXT;
UPDATE artifacts SET updated_at=created_at WHERE updated_at IS NULL;
CREATE TABLE usage_ledger (
  task_id TEXT PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('provider','manual-brief')),
  reserved_units INTEGER NOT NULL CHECK(reserved_units IN (0,1)),
  status TEXT NOT NULL CHECK(status IN ('reserved','consumed','released')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_usage_ledger_owner ON usage_ledger(owner_id,created_at);
