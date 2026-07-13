import { getDb } from '../lib/db.js';
import { isAdmin, requireAdmin } from '../lib/auth.js';

// Normalise un champ liste : accepte un tableau (→ JSON) ou une chaîne déjà JSON.
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

    // ── Lecture (GET) ─────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { slug, tag, all } = req.query;
      const admin = isAdmin(req);

      // Diagnostic : indique si ADMIN_PASSWORD est configuré côté serveur et si
      // le header fourni correspond. Ne révèle jamais le mot de passe lui-même.
      if (req.query.authcheck) {
        return res.status(200).json({
          admin_configured: Boolean(process.env.ADMIN_PASSWORD),
          authenticated: admin,
        });
      }

      // Diagnostic (admin) : liste les colonnes réelles de chaque table pour
      // repérer un schéma déployé désynchronisé. Lecture seule, ne modifie rien.
      if (req.query.schema) {
        if (!admin) return res.status(401).json({ error: 'Non autorisé' });
        const tables = ['posts', 'cards', 'visits', 'sessions', 'page_views', 'messages'];
        const out = { columns: {}, probes: {} };
        for (const t of tables) {
          try {
            const info = await db.execute(`PRAGMA table_info(${t})`);
            out.columns[t] = info.rows.map(r => r.name);
          } catch (e) {
            out.columns[t] = `erreur: ${e.message}`;
          }
        }
        // Exécute les requêtes réelles qui plantent, pour capturer l'erreur exacte.
        const probes = {
          posts_public: `SELECT id, slug, title, summary, tags, image_url, context, category, languages, tools, libraries, featured, sort_order, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC`,
          posts_all: `SELECT * FROM posts ORDER BY created_at DESC`,
          visits_bypage: `SELECT page, COUNT(*) as count FROM visits GROUP BY page ORDER BY count DESC`,
          visits_recent: `SELECT page, session_code, visited_at FROM visits ORDER BY visited_at DESC LIMIT 50`,
        };
        for (const [name, sql] of Object.entries(probes)) {
          try {
            const r = await db.execute(sql);
            out.probes[name] = { ok: true, rows: r.rows.length };
          } catch (e) {
            out.probes[name] = { ok: false, error: e.message };
          }
        }
        return res.status(200).json(out);
      }

      // Un post précis par slug
      if (slug) {
        // L'admin peut voir un brouillon (non publié) ; le public non.
        const sql = admin
          ? 'SELECT * FROM posts WHERE slug = ?'
          : 'SELECT * FROM posts WHERE slug = ? AND published = 1';
        const result = await db.execute({ sql, args: [slug] });
        if (!result.rows.length) {
          return res.status(404).json({ error: 'Post non trouvé' });
        }
        return res.status(200).json(result.rows[0]);
      }

      // Vue admin : tous les posts (brouillons inclus), tous les champs.
      if (admin && all) {
        const result = await db.execute({
          sql: 'SELECT * FROM posts ORDER BY created_at DESC',
        });
        return res.status(200).json(result.rows);
      }

      // Vue publique : posts publiés uniquement (sans le contenu complet).
      const result = await db.execute({
        sql: `SELECT id, slug, title, summary, tags, image_url, context, category,
                     languages, tools, libraries, featured, sort_order, created_at
              FROM posts WHERE published = 1 ORDER BY created_at DESC`,
      });
      let posts = result.rows;

      if (tag) {
        posts = posts.filter(post => {
          const tags = JSON.parse(post.tags || '[]');
          return tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
        });
      }
      return res.status(200).json(posts);
    }

    // ── Création (POST) ───────────────────────────────────────────────────
    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const b = req.body || {};

      if (!b.slug || !b.title || !b.content) {
        return res.status(400).json({ error: 'Champs requis : slug, title, content' });
      }

      // Slug unique
      const dup = await db.execute({ sql: 'SELECT id FROM posts WHERE slug = ?', args: [b.slug] });
      if (dup.rows.length) {
        return res.status(409).json({ error: `Le slug « ${b.slug} » existe déjà.` });
      }

      const result = await db.execute({
        sql: `INSERT INTO posts
                (slug, title, summary, content, tags, image_url, context, category,
                 languages, tools, libraries, featured, sort_order, published, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          b.slug, b.title, b.summary || null, b.content,
          jsonField(b.tags), b.image_url || null, b.context || null, jsonField(b.category),
          jsonField(b.languages), jsonField(b.tools), jsonField(b.libraries),
          b.featured ? 1 : 0, Number(b.sort_order) || 0,
          b.published ? 1 : 0,
          b.created_at || new Date().toISOString().slice(0, 10),
        ],
      });
      return res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    }

    // ── Modification (PUT) ────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const b = req.body || {};
      if (!b.id) {
        return res.status(400).json({ error: 'Champ requis : id' });
      }
      if (!b.slug || !b.title || !b.content) {
        return res.status(400).json({ error: 'Champs requis : slug, title, content' });
      }

      // Slug unique (hors le post en cours)
      const dup = await db.execute({
        sql: 'SELECT id FROM posts WHERE slug = ? AND id != ?',
        args: [b.slug, b.id],
      });
      if (dup.rows.length) {
        return res.status(409).json({ error: `Le slug « ${b.slug} » est déjà pris par un autre post.` });
      }

      await db.execute({
        sql: `UPDATE posts SET
                slug = ?, title = ?, summary = ?, content = ?, tags = ?, image_url = ?,
                context = ?, category = ?, languages = ?, tools = ?, libraries = ?,
                featured = ?, sort_order = ?, published = ?, created_at = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [
          b.slug, b.title, b.summary || null, b.content, jsonField(b.tags), b.image_url || null,
          b.context || null, jsonField(b.category), jsonField(b.languages), jsonField(b.tools), jsonField(b.libraries),
          b.featured ? 1 : 0, Number(b.sort_order) || 0, b.published ? 1 : 0,
          b.created_at || new Date().toISOString().slice(0, 10),
          b.id,
        ],
      });
      return res.status(200).json({ success: true });
    }

    // ── Suppression (DELETE) ──────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Champ requis : id' });
      }
      await db.execute({ sql: 'DELETE FROM posts WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Erreur posts:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
