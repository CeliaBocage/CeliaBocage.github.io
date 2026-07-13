/**
 * Authentification admin — protège les endpoints d'écriture.
 *
 * Le mot de passe admin est lu depuis la variable d'environnement ADMIN_PASSWORD
 * (à définir dans Vercel, jamais dans le code). Le front l'envoie dans le header
 * `x-admin-password`. Comparaison à temps constant pour éviter les attaques
 * par mesure de temps.
 *
 * Sécurité par défaut : si ADMIN_PASSWORD n'est PAS défini, l'admin est
 * désactivé (toute écriture est refusée). Impossible d'exposer les écritures
 * par oubli de configuration.
 */

function safeEqual(a, b) {
  // Comparaison à temps constant : ne court-circuite pas au premier caractère.
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // pas de mot de passe configuré → admin désactivé
  const provided = req.headers['x-admin-password'] || '';
  return safeEqual(provided, expected);
}

/**
 * À appeler en début de handler pour les actions protégées.
 * Renvoie true si autorisé ; sinon répond 401 et renvoie false.
 */
export function requireAdmin(req, res) {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Non autorisé — mot de passe admin requis ou invalide.' });
    return false;
  }
  return true;
}
