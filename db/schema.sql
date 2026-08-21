-- Schéma de la base Turso, tel qu'il est en production.
--
-- Ce fichier avait divergé du code et de la base : la table `visits` y était
-- décrite comme un journal, la production était un compteur, et api/visits.js
-- écrivait un journal. Toute écriture de visite échouait donc en silence.
-- Il est désormais aligné sur la base réelle.
--
-- Pour appliquer une évolution sur une base existante, passer par un script de
-- migration idempotent (voir scripts/migrate-visits-journal.js) plutôt que par
-- ce fichier : il décrit l'état cible, il ne le fabrique pas.
--
-- Exécution sur une base neuve : turso db shell portfolio < db/schema.sql

-- Sessions : un code anonyme par navigateur (assets/js/api.js, localStorage)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_code TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Messages du formulaire de contact.
-- mail_status : sent | failed | pending | disabled (disabled = reçu alors que
-- Resend n'était pas configuré ; le message est conservé, sans alerte email).
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id INTEGER,
  session_code TEXT,
  mail_status TEXT,
  mail_error TEXT
);

-- Journal des visites : une ligne par vue, avec sa date. C'est cette date qui
-- permet les statistiques par mois ; un compteur ne peut pas les donner.
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  session_id INTEGER,
  session_code TEXT,
  visited_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_visits_page ON visits(page);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);

-- Ancien compteur, gardé pour mémoire : 48 vues cumulées sans dates, donc
-- inutilisable en statistiques. Affiché à part dans l'espace admin.
CREATE TABLE IF NOT EXISTS visits_legacy (
  page TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  session_id INTEGER,
  session_code TEXT
);

-- Résumé par visiteur et par page, alimenté en upsert à chaque vue.
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_code TEXT NOT NULL,
  page TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_id INTEGER,
  UNIQUE(session_code, page)
);

-- Cartes affichées sur les pages de navigation
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  location TEXT,
  date_label TEXT,
  date_range TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  context TEXT,
  category TEXT DEFAULT '[]',
  languages TEXT DEFAULT '[]',
  tools TEXT DEFAULT '[]',
  libraries TEXT DEFAULT '[]',
  tags TEXT,
  featured INTEGER DEFAULT 0,
  full_width INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  link_url TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Publications du blog
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  context TEXT,
  category TEXT,
  languages TEXT DEFAULT '[]',
  tools TEXT DEFAULT '[]',
  libraries TEXT,
  tags TEXT,
  image_url TEXT,
  featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
