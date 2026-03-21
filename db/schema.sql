-- Exécuter dans le shell Turso : turso db shell portfolio
-- Ou copier-coller chaque CREATE TABLE une par une

-- Table des messages du formulaire de contact
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_code TEXT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Log de visites par page et session
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  session_code TEXT,
  visited_at TEXT DEFAULT (datetime('now'))
);

-- Résumé des pages vues par visiteur (session)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_code TEXT NOT NULL,
  page TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  first_visit TEXT DEFAULT (datetime('now')),
  last_visit TEXT DEFAULT (datetime('now')),
  UNIQUE(session_code, page)
);

-- Cartes dynamiques pour chaque page (formations, experiences, projets, etc.)
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  date_label TEXT,
  description TEXT,
  tags TEXT,
  featured INTEGER DEFAULT 0,
  full_width INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  link_url TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Articles / posts du blog
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  image_url TEXT,
  category TEXT,
  featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
