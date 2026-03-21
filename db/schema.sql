-- Exécuter dans le shell Turso : turso db shell portfolio
-- Ou copier-coller chaque CREATE TABLE une par une

-- Table des sessions (ID incrémental pour identifier chaque visiteur)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_code TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table des messages du formulaire de contact
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  session_code TEXT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Log de visites par page et session
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  session_id INTEGER,
  session_code TEXT,
  visited_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Résumé des pages vues par visiteur (session)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  session_code TEXT NOT NULL,
  page TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  first_visit TEXT DEFAULT (datetime('now')),
  last_visit TEXT DEFAULT (datetime('now')),
  UNIQUE(session_code, page),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
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
  context TEXT,
  category TEXT,
  languages TEXT,
  tools TEXT,
  libraries TEXT,
  featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Migration pour ajouter les colonnes structurées aux posts existants
-- ALTER TABLE posts ADD COLUMN context TEXT;
-- ALTER TABLE posts ADD COLUMN languages TEXT;
-- ALTER TABLE posts ADD COLUMN tools TEXT;
-- ALTER TABLE posts ADD COLUMN libraries TEXT;
