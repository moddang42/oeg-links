-- OEG Link Manager — initial schema
-- Tables: links (one row per short link), clicks (one row per click event)
-- Totals/last-click are computed from `clicks` via SQL, never stored on `links`.

CREATE TABLE IF NOT EXISTS links (
  code        TEXT PRIMARY KEY,
  target_url  TEXT NOT NULL,
  title       TEXT,
  category    TEXT,
  tags        TEXT,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TEXT NOT NULL,
  updated_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_links_status   ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);

CREATE TABLE IF NOT EXISTS clicks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL,
  clicked_at  TEXT NOT NULL,
  referer     TEXT,
  country     TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_code        ON clicks(code);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at  ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_code_time   ON clicks(code, clicked_at);
