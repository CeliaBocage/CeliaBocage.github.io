import { getDb } from '../lib/db.js';
import { isAdmin } from '../lib/auth.js';
import { mailConfigured, sendMessageEmail, sendTestEmail } from '../lib/mail.js';

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

    // Bouton de test de l'admin : envoie un email à CONTACT_TO_EMAIL sans
    // toucher à la base, pour vérifier la configuration Resend.
    if (req.query.test_email === '1') {
      const { status, error } = await sendTestEmail();
      if (status === 'disabled') {
        return res.status(200).json({
          status,
          message: "L'envoi d'emails n'est pas configuré : il manque RESEND_API_KEY ou CONTACT_TO_EMAIL.",
        });
      }
      if (status === 'failed') {
        return res.status(502).json({ status, error, message: "L'envoi a échoué." });
      }
      return res.status(200).json({ status, message: `Email de test envoyé à ${process.env.CONTACT_TO_EMAIL}.` });
    }

    try {
      const db = getDb();
      const result = await db.execute(
        'SELECT id, nom, email, sujet, message, session_code, created_at, mail_status, mail_error FROM messages ORDER BY created_at DESC'
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

    // L'ordre compte : le message est écrit en base d'abord, envoyé par email
    // ensuite. Si Resend tombe ou n'est pas encore configuré, le message est
    // toujours dans l'espace admin au lieu de disparaître, et la confirmation
    // affichée est vraie.
    const inserted = await db.execute({
      sql: `INSERT INTO messages (session_id, session_code, nom, email, sujet, message, mail_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        session_id,
        session_code || null,
        nom,
        email,
        sujet || null,
        message,
        mailConfigured() ? 'pending' : 'disabled',
      ],
    });
    const id = Number(inserted.lastInsertRowid);

    const { status, error } = await sendMessageEmail(
      { nom, email, sujet, message, session_code },
      id,
    );
    if (status !== 'disabled') {
      await db.execute({
        sql: 'UPDATE messages SET mail_status = ?, mail_error = ? WHERE id = ?',
        args: [status, error, id],
      });
    }
    if (status === 'failed') {
      // Le message est en sécurité en base, l'admin signale l'échec d'envoi.
      console.error('Erreur contact (email):', error);
    }

    return res.status(200).json({ success: true, message: 'Message envoyé !' });
  } catch (err) {
    console.error('Erreur contact:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
