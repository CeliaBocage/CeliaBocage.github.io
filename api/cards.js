import { getDb } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';

function jsonField(value, fallback = '[]') {
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return fallback;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();

    // ── Lecture (GET, public) ─────────────────────────────────────────────
    if (req.method === 'GET') {
      const { page, tag } = req.query;

      let sql = 'SELECT * FROM cards';
      const args = [];
      if (page) {
        sql += ' WHERE page = ?';
        args.push(page);
      }
      sql += ` ORDER BY CASE WHEN end_date IS NULL THEN 0 ELSE 1 END, COALESCE(end_date, start_date) DESC, start_date DESC`;

      const result = await db.execute({ sql, args });
      let cards = result.rows;

      if (tag) {
        cards = cards.filter(card => {
          const tags = JSON.parse(card.tags || '[]');
          return tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
        });
      }
      return res.status(200).json(cards);
    }

    // ── Création (POST) ───────────────────────────────────────────────────
    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const b = req.body || {};
      if (!b.page || !b.title) {
        return res.status(400).json({ error: 'Champs requis : page, title' });
      }
      const result = await db.execute({
        sql: `INSERT INTO cards
                (page, title, subtitle, location, date_range, description, tags, image_url, link_url,
                 featured, sort_order, start_date, end_date, context, category, languages, tools, libraries)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.page, b.title, b.subtitle || null, b.location || null, b.date_range || null,
          b.description || null, jsonField(b.tags), b.image_url || null, b.link_url || null,
          b.featured ? 1 : 0, Number(b.sort_order) || 0, b.start_date || null, b.end_date || null,
          b.context || null, jsonField(b.category), jsonField(b.languages), jsonField(b.tools), jsonField(b.libraries),
        ],
      });
      return res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    }

    // ── Modification (PUT) ────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const b = req.body || {};
      if (!b.id) return res.status(400).json({ error: 'Champ requis : id' });
      if (!b.page || !b.title) return res.status(400).json({ error: 'Champs requis : page, title' });

      await db.execute({
        sql: `UPDATE cards SET
                page = ?, title = ?, subtitle = ?, location = ?, date_range = ?, description = ?,
                tags = ?, image_url = ?, link_url = ?, featured = ?, sort_order = ?,
                start_date = ?, end_date = ?, context = ?, category = ?, languages = ?, tools = ?, libraries = ?
              WHERE id = ?`,
        args: [
          b.page, b.title, b.subtitle || null, b.location || null, b.date_range || null,
          b.description || null, jsonField(b.tags), b.image_url || null, b.link_url || null,
          b.featured ? 1 : 0, Number(b.sort_order) || 0, b.start_date || null, b.end_date || null,
          b.context || null, jsonField(b.category), jsonField(b.languages), jsonField(b.tools), jsonField(b.libraries),
          b.id,
        ],
      });
      return res.status(200).json({ success: true });
    }

    // ── Suppression (DELETE) ──────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Champ requis : id' });
      await db.execute({ sql: 'DELETE FROM cards WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Erreur cards:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
