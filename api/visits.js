import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const page = req.query.page || 'home';

  try {
    const db = getDb();

    if (req.method === 'POST') {
      await db.execute({
        sql: `INSERT INTO visits (page, count) VALUES (?, 1)
              ON CONFLICT(page) DO UPDATE SET count = count + 1`,
        args: [page],
      });
      const result = await db.execute({
        sql: 'SELECT count FROM visits WHERE page = ?',
        args: [page],
      });
      return res.status(200).json({ page, count: result.rows[0]?.count || 1 });
    }

    if (req.method === 'GET') {
      const result = await db.execute({
        sql: 'SELECT count FROM visits WHERE page = ?',
        args: [page],
      });
      return res.status(200).json({ page, count: result.rows[0]?.count || 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Erreur visits:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
