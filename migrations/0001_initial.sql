-- Initial metadata for Mini Genspark's owner-only MVP.
-- No prompt or model output is stored in the quota table.
CREATE TABLE IF NOT EXISTS daily_usage (
  usage_date TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_events (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  duration_ms INTEGER,
  error_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_task_events_created_at ON task_events(created_at);
