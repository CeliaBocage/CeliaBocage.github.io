import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { page, tag } = req.query;

    let sql = 'SELECT * FROM cards';
    const args = [];
    const conditions = [];

    if (page) {
      conditions.push('page = ?');
      args.push(page);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const result = await db.execute({ sql, args });
    let cards = result.rows;

    if (tag) {
      cards = cards.filter(card => {
        const tags = JSON.parse(card.tags || '[]');
        return tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
      });
    }

    return res.status(200).json(cards);
  } catch (err) {
    console.error('Erreur cards:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
