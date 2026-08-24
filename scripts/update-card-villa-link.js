/**
 * Met à jour le lien de la carte "Villa d'Audenge" (page projets) pour
 * pointer vers le site déployé plutôt que le dépôt GitHub. Ne touche
 * qu'à cette ligne (titre + link_url), rien d'autre n'est modifié.
 *
 * Utilisation :
 *   TURSO_DB_URL=libsql://... TURSO_DB_TOKEN=... node scripts/update-card-villa-link.js
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

const OLD_LINK = 'https://github.com/CeliaBocage/villa-d-audenge';
const NEW_LINK = 'https://villa-d-audenge.vercel.app/';
const NEW_TITLE = `<a href="${NEW_LINK}" target="_blank" style="color: inherit; text-decoration: underline;">Villa d'Audenge : site vitrine multilingue</a>`;

async function main() {
  const existing = await db.execute({
    sql: `SELECT id FROM cards WHERE page = 'projets' AND link_url = ?`,
    args: [OLD_LINK],
  });

  if (existing.rows.length === 0) {
    console.log('Aucune carte trouvée avec ce link_url, rien à faire.');
    return;
  }

  await db.execute({
    sql: `UPDATE cards SET title = ?, link_url = ? WHERE page = 'projets' AND link_url = ?`,
    args: [NEW_TITLE, NEW_LINK, OLD_LINK],
  });

  console.log(`Carte(s) mise(s) à jour : ${existing.rows.length}`);
}

main();
