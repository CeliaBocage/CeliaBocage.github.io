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
    const { slug, tag } = req.query;

    // Single post by slug
    if (slug) {
      const result = await db.execute({
        sql: 'SELECT * FROM posts WHERE slug = ? AND published = 1',
        args: [slug],
      });
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }
      return res.status(200).json(result.rows[0]);
    }

    // List all published posts
    let sql = 'SELECT id, slug, title, summary, tags, image_url, context, category, languages, tools, libraries, featured, sort_order, created_at FROM posts WHERE published = 1';
    const args = [];

    sql += ' ORDER BY featured DESC, sort_order ASC, created_at DESC';

    const result = await db.execute({ sql, args });
    let posts = result.rows;

    // Filter by tag
    if (tag) {
      posts = posts.filter(post => {
        const tags = JSON.parse(post.tags || '[]');
        return tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
      });
    }

    return res.status(200).json(posts);
  } catch (err) {
    console.error('Erreur posts:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
