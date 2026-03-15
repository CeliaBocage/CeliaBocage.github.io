import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, email, sujet, message } = req.body;

  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Champs requis : nom, email, message' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    const db = getDb();
    await db.execute({
      sql: 'INSERT INTO messages (nom, email, sujet, message) VALUES (?, ?, ?, ?)',
      args: [nom, email, sujet || null, message],
    });
    return res.status(200).json({ success: true, message: 'Message envoyé !' });
  } catch (err) {
    console.error('Erreur contact:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
