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

  // Vue admin : liste des messages reçus (protégée par mot de passe)
  if (req.method === 'GET') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    try {
      const db = getDb();
      const result = await db.execute(
        'SELECT id, nom, email, sujet, message, session_code, created_at FROM messages ORDER BY created_at DESC'
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Erreur contact (list):', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, email, sujet, message, session_code } = req.body;

  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Champs requis : nom, email, message' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    const db = getDb();
    const session_id = await getOrCreateSessionId(db, session_code);

    await db.execute({
      sql: 'INSERT INTO messages (session_id, session_code, nom, email, sujet, message) VALUES (?, ?, ?, ?, ?, ?)',
      args: [session_id, session_code || null, nom, email, sujet || null, message],
    });
    return res.status(200).json({ success: true, message: 'Message envoyé !' });
  } catch (err) {
    console.error('Erreur contact:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
