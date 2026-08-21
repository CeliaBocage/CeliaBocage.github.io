/**
 * Migration : compteur de visites vers journal daté, et colonnes d'état d'envoi
 * des emails sur les messages.
 *
 * Pourquoi : la table `visits` en production était `(page PRIMARY KEY, count)`,
 * un compteur, alors que api/visits.js y insère une ligne par vue. Chaque POST
 * violait donc la clé primaire, partait dans le catch et renvoyait 500 ; comme
 * l'upsert de `page_views` vient après cet insert, il ne s'exécutait jamais
 * (table vide). Résultat : aucune statistique datée, et impossible de savoir
 * quelles pages étaient lues.
 *
 * L'ancien compteur est conservé sous `visits_legacy` plutôt que converti :
 * il n'a pas de dates, et inventer des horodatages pour ses 48 vues
 * fabriquerait des statistiques fausses. Le journal repart donc de zéro, et
 * l'espace admin affiche l'ancien total à part.
 *
 * Idempotent : relançable sans risque, chaque étape vérifie d'abord l'état réel.
 *
 * Usage : node scripts/migrate-visits-journal.js
 * Variables requises : TURSO_DB_URL, TURSO_DB_TOKEN (ou un fichier secrets/.env).
 */

import { readFileSync } from 'fs';
import { createClient } from '@libsql/client/http';

// Chargement de secrets/.env si les variables ne sont pas déjà dans l'environnement.
if (!process.env.TURSO_DB_URL) {
  try {
    for (const line of readFileSync('secrets/.env', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // pas de fichier local : on compte sur l'environnement
  }
}

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

async function columns(table) {
  try {
    const r = await db.execute(`SELECT name FROM pragma_table_info('${table}')`);
    return r.rows.map((row) => row.name);
  } catch {
    return [];
  }
}

async function tableExists(name) {
  const r = await db.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [name],
  });
  return r.rows.length > 0;
}

// ---- 1. visits : compteur vers journal --------------------------------------

const visitsCols = await columns('visits');

if (!visitsCols.length) {
  console.log('visits : table absente, création du journal.');
} else if (visitsCols.includes('visited_at')) {
  console.log('visits : déjà un journal, rien à faire.');
} else {
  if (await tableExists('visits_legacy')) {
    // Une migration précédente s'est arrêtée en cours de route.
    console.log('visits_legacy existe déjà, suppression de la table intermédiaire.');
    await db.execute('DROP TABLE visits');
  } else {
    await db.execute('ALTER TABLE visits RENAME TO visits_legacy');
    console.log('visits : ancien compteur conservé sous visits_legacy.');
  }
}

if (!visitsCols.includes('visited_at')) {
  await db.execute(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    session_id INTEGER,
    session_code TEXT,
    visited_at TEXT DEFAULT (datetime('now'))
  )`);
  console.log('visits : journal créé.');
}

await db.execute('CREATE INDEX IF NOT EXISTS idx_visits_page ON visits(page)');
await db.execute('CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at)');

// ---- 2. messages : état d'envoi de l'email ---------------------------------

const messageCols = await columns('messages');
for (const [name, type] of [
  ['mail_status', 'TEXT'],
  ['mail_error', 'TEXT'],
]) {
  if (messageCols.includes(name)) {
    console.log(`messages.${name} : déjà présente.`);
  } else {
    await db.execute(`ALTER TABLE messages ADD COLUMN ${name} ${type}`);
    console.log(`messages.${name} : ajoutée.`);
  }
}

// ---- Vérification ----------------------------------------------------------

for (const t of ['visits', 'visits_legacy', 'messages', 'page_views']) {
  if (!(await tableExists(t))) {
    console.log(`${t} : absente.`);
    continue;
  }
  const count = await db.execute(`SELECT COUNT(*) AS n FROM ${t}`);
  console.log(`${t} : ${count.rows[0].n} lignes, colonnes [${(await columns(t)).join(', ')}]`);
}
