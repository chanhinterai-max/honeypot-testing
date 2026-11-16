-- Access control table (simplified)
CREATE TABLE IF NOT EXISTS access_log (
  id SERIAL PRIMARY KEY,
  username TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);
