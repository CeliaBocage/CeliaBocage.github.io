import { getDb } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';

async function getOrCreateSessionId(db, session_code) {
  if (!session_code) return null;

  const existing = await db.execute({
    sql: 'SELECT id FROM sessions WHERE session_code = ?',
    args: [session_code],
  });

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await db.execute({
    sql: 'INSERT INTO sessions (session_code) VALUES (?)',
    args: [session_code],
  });

  return Number(result.lastInsertRowid);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const page = req.query.page || 'home';
  const session_code = req.query.session || null;

  try {
    const db = getDb();

    if (req.method === 'POST') {
      const session_id = await getOrCreateSessionId(db, session_code);

      await db.execute({
        sql: 'INSERT INTO visits (page, session_id, session_code) VALUES (?, ?, ?)',
        args: [page, session_id, session_code],
      });

      // Upsert page_views: increment view_count or create new row
      if (session_code) {
        await db.execute({
          sql: `INSERT INTO page_views (session_id, session_code, page, view_count, first_visit, last_visit)
                VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
                ON CONFLICT(session_code, page)
                DO UPDATE SET view_count = view_count + 1, last_visit = datetime('now')`,
          args: [session_id, session_code, page],
        });
      }

      const result = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM visits WHERE page = ?',
        args: [page],
      });
      return res.status(200).json({ page, count: result.rows[0]?.count || 1 });
    }

    if (req.method === 'GET') {
      // Vue admin : statistiques globales (protégée par mot de passe)
      if (req.query.stats === '1') {
        if (!isAdmin(req)) {
          return res.status(401).json({ error: 'Non autorisé' });
        }
        const byPage = await db.execute(
          `SELECT page, COUNT(*) as count, COUNT(DISTINCT session_code) as visiteurs,
                  MAX(visited_at) as derniere
           FROM visits GROUP BY page ORDER BY count DESC`
        );
        // Par mois : c'est ce qui répond à « est-ce que des gens sont venus
        // ces derniers temps », impossible à savoir avec un simple compteur.
        const byMonth = await db.execute(
          `SELECT substr(visited_at, 1, 7) as mois, COUNT(*) as vues,
                  COUNT(DISTINCT session_code) as visiteurs
           FROM visits GROUP BY mois ORDER BY mois DESC LIMIT 24`
        );
        const totals = await db.execute(
          `SELECT (SELECT COUNT(*) FROM visits) as total_visits,
                  (SELECT COUNT(DISTINCT session_code) FROM visits) as total_visiteurs,
                  (SELECT COUNT(*) FROM sessions) as total_sessions,
                  (SELECT COUNT(*) FROM visits WHERE visited_at >= date('now', '-30 day')) as visites_30j,
                  (SELECT COUNT(DISTINCT session_code) FROM visits WHERE visited_at >= date('now', '-30 day')) as visiteurs_30j`
        );
        // Le compteur d'avant la migration en journal : pas de dates, donc pas
        // de statistiques possibles, mais le total reste affiché pour mémoire.
        let legacy = 0;
        try {
          const r = await db.execute('SELECT SUM(count) as total FROM visits_legacy');
          legacy = Number(r.rows[0]?.total || 0);
        } catch {
          legacy = 0; // table absente : rien à afficher
        }
        const recent = await db.execute(
          `SELECT page, session_code, visited_at FROM visits ORDER BY visited_at DESC LIMIT 50`
        );
        return res.status(200).json({
          pages: byPage.rows,
          months: byMonth.rows,
          total_visits: totals.rows[0]?.total_visits || 0,
          total_visiteurs: totals.rows[0]?.total_visiteurs || 0,
          total_sessions: totals.rows[0]?.total_sessions || 0,
          visites_30j: totals.rows[0]?.visites_30j || 0,
          visiteurs_30j: totals.rows[0]?.visiteurs_30j || 0,
          legacy_visits: legacy,
          recent: recent.rows,
        });
      }

      // If ?history=1&session=xxx, return pages viewed by this session
      if (req.query.history === '1' && session_code) {
        const result = await db.execute({
          sql: 'SELECT page, view_count, first_visit, last_visit FROM page_views WHERE session_code = ? ORDER BY last_visit DESC',
          args: [session_code],
        });
        return res.status(200).json({ session: session_code, pages: result.rows });
      }

      const result = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM visits WHERE page = ?',
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
