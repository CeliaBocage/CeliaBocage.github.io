/**
 * Ajoute la carte "Plongée sous-marine" à la page passions, sans toucher
 * aux cartes existantes (idempotent : ne réinsère pas si déjà présente).
 *
 * Utilisation :
 *   TURSO_DB_URL=libsql://... TURSO_DB_TOKEN=... node scripts/add-card-plongee.js
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

const card = {
  page: 'passions',
  title: `Plongée sous-marine`,
  location: `Niveau 1 FFESSM`,
  date_range: `Continu`,
  image_url: null,
  link_url: null,
  context: `PERSO`,
  category: `["Sport"]`,
  languages: `[]`,
  tools: `[]`,
  libraries: `[]`,
  tags: `["Sang-froid","Curiosité","Rigueur"]`,
  featured: 0,
  sort_order: 5,
  start_date: null,
  end_date: null,
  description: `<ul class="card-description">
    <li><strong>Niveau 1 FFESSM</strong> obtenu, avec l'envie de continuer à me former sur les niveaux suivants.</li>
    <li>Une discipline qui m'a immédiatement captivée : un rapport au corps, à la pression et à l'environnement totalement différent de tous les autres sports que j'ai pratiqués, où le contrôle de la respiration et le calme priment sur la performance.</li>
    <li>Une manière d'apprendre à évoluer en équipe dans un milieu qui ne pardonne pas l'improvisation, avec un vrai plaisir à progresser palier par palier.</li>
</ul>`,
};

async function main() {
  const existing = await db.execute({
    sql: `SELECT id FROM cards WHERE page = ? AND title = ?`,
    args: [card.page, card.title],
  });

  if (existing.rows.length > 0) {
    console.log('Carte déjà présente, rien à faire.');
    return;
  }

  await db.execute({
    sql: `INSERT INTO cards (page, title, subtitle, location, date_range, description, tags, image_url, link_url, featured, sort_order, start_date, end_date, context, category, languages, tools, libraries)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      card.page, card.title, card.subtitle || null, card.location || null,
      card.date_range || null, card.description, card.tags || '[]',
      card.image_url || null, card.link_url || null, card.featured || 0, card.sort_order,
      card.start_date || null, card.end_date || null, card.context || null,
      card.category || '[]', card.languages || '[]', card.tools || '[]', card.libraries || '[]',
    ],
  });

  console.log('Carte "Plongée sous-marine" insérée.');
}

main();
