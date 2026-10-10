-- Additive owner sessions and audit metadata. Legacy sessions require re-login.
ALTER TABLE sessions ADD COLUMN credential_hash TEXT;
ALTER TABLE sessions ADD COLUMN audit_id TEXT;
ALTER TABLE sessions ADD COLUMN created_at INTEGER;
CREATE UNIQUE INDEX idx_sessions_audit_id ON sessions(audit_id);
CREATE TABLE owner_credentials (
  fingerprint TEXT PRIMARY KEY,
  created_at TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending','active','rotated','cancelled','revoked'))
);
CREATE TABLE access_counts (
  hour TEXT NOT NULL,
  category TEXT NOT NULL,
  event_count INTEGER NOT NULL CHECK(event_count>0),
  last_at TEXT NOT NULL,
  PRIMARY KEY(hour,category)
);
CREATE TABLE access_events (
  id TEXT PRIMARY KEY,
  hour TEXT NOT NULL,
  created_at TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('success','failure')),
  session_label TEXT,
  request_id TEXT NOT NULL,
  reason TEXT
);
CREATE INDEX idx_access_events_hour ON access_events(hour,created_at);
