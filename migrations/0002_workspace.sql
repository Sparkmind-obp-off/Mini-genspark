-- Additive owner-only workspace; preserves initial quota/event tables.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);
CREATE TABLE request_limits (
  bucket TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL CHECK(request_count >= 0)
);
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('chat','research','create','analyze','build')),
  title TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_conversations_owner ON conversations(owner_id, created_at);
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  mode TEXT NOT NULL,
  prompt TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT '',
  sources_json TEXT NOT NULL DEFAULT '[]',
  analysis_json TEXT,
  status TEXT NOT NULL CHECK(status IN ('running','succeeded','failed')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  error_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(owner_id, idempotency_key)
);
CREATE INDEX idx_tasks_conversation ON tasks(conversation_id, created_at);
CREATE INDEX idx_tasks_active ON tasks(status, updated_at);
CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  task_id TEXT UNIQUE NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_artifacts_owner ON artifacts(owner_id, created_at);
