// ===== Admin – tableau de bord =====
// Le mot de passe est saisi à la connexion, gardé en sessionStorage (effacé à la
// fermeture de l'onglet) et envoyé dans le header `x-admin-password` à chaque appel.

const API_BASE = 'https://celia-bocage-github-io.vercel.app/api';
const PW_KEY = 'admin_pw';

const getPw = () => sessionStorage.getItem(PW_KEY) || '';
const setPw = (pw) => sessionStorage.setItem(PW_KEY, pw);
const clearPw = () => sessionStorage.removeItem(PW_KEY);

// ---- Helpers ----------------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// "a, b , c" -> ["a","b","c"] ; renvoie une chaîne JSON prête pour la base.
function parseListToJson(str) {
  const arr = (str || '').split(',').map(s => s.trim()).filter(Boolean);
  return JSON.stringify(arr);
}
// '["a","b"]' -> "a, b"
function jsonToListStr(jsonStr) {
  try { return (JSON.parse(jsonStr || '[]')).join(', '); } catch { return ''; }
}

async function api(path, opts = {}) {
  const headers = { 'x-admin-password': getPw(), ...(opts.headers || {}) };
  if (opts.body) headers['Content-Type'] = 'application/json';
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ---- Connexion --------------------------------------------------------------

async function checkAuth() {
  if (!getPw()) return false;
  try {
    const res = await api('/posts?authcheck=1');
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch { return false; }
}

async function doLogin(e) {
  e.preventDefault();
  const err = document.getElementById('login-error');
  err.textContent = '';
  const pw = document.getElementById('login-pw').value;
  setPw(pw);
  try {
    const res = await api('/posts?authcheck=1');
    if (!res.ok) {
      clearPw();
      err.textContent = `Erreur serveur (${res.status}).`;
      return;
    }
    const data = await res.json();
    if (data.authenticated === true) {
      showApp();
    } else {
      clearPw();
      err.textContent = 'Mot de passe incorrect.';
    }
  } catch {
    clearPw();
    err.textContent = 'Impossible de contacter le serveur (réseau/CORS).';
  }
}

function logout() {
  clearPw();
  location.reload();
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  switchTab('posts');
}

// ---- Onglets ----------------------------------------------------------------

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = p.id === `tab-${tab}` ? 'block' : 'none');
  if (tab === 'posts') loadPosts();
  if (tab === 'cards') loadCards();
  if (tab === 'visits') loadVisits();
  if (tab === 'messages') loadMessages();
}

// ---- Générateur de formulaire (spec -> HTML, HTML -> objet) ------------------

const POST_FIELDS = [
  { key: 'title', label: 'Titre', type: 'text' },
  { key: 'slug', label: 'Slug (identifiant URL, ex: mon-post)', type: 'text' },
  { key: 'summary', label: 'Résumé', type: 'textarea', rows: 2 },
  { key: 'content', label: 'Contenu (HTML)', type: 'textarea', rows: 12 },
  { key: 'context', label: 'Contexte (ex: STAGE, ÉCOLE, PERSO)', type: 'text' },
  { key: 'category', label: 'Catégories (séparées par des virgules)', type: 'list' },
  { key: 'languages', label: 'Langages (virgules)', type: 'list' },
  { key: 'tools', label: 'Outils (virgules)', type: 'list' },
  { key: 'libraries', label: 'Bibliothèques (virgules)', type: 'list' },
  { key: 'tags', label: 'Tags (virgules)', type: 'list' },
  { key: 'image_url', label: "URL de l'image (optionnel)", type: 'text' },
  { key: 'created_at', label: 'Date (AAAA-MM-JJ)', type: 'text' },
  { key: 'sort_order', label: 'Ordre de tri', type: 'number' },
  { key: 'featured', label: 'Mettre en vedette (★)', type: 'checkbox' },
  { key: 'published', label: 'Publié (visible sur le site)', type: 'checkbox' },
];

const CARD_FIELDS = [
  { key: 'page', label: 'Page', type: 'select', options: ['formations', 'experiences', 'projets', 'vie-associative', 'passions'] },
  { key: 'title', label: 'Titre', type: 'text' },
  { key: 'subtitle', label: 'Sous-titre', type: 'text' },
  { key: 'location', label: 'Lieu', type: 'text' },
  { key: 'date_range', label: 'Période (ex: 2023 - Présent)', type: 'text' },
  { key: 'description', label: 'Description (HTML)', type: 'textarea', rows: 8 },
  { key: 'context', label: 'Contexte', type: 'text' },
  { key: 'category', label: 'Catégories (virgules)', type: 'list' },
  { key: 'languages', label: 'Langages (virgules)', type: 'list' },
  { key: 'tools', label: 'Outils (virgules)', type: 'list' },
  { key: 'libraries', label: 'Bibliothèques (virgules)', type: 'list' },
  { key: 'tags', label: 'Tags (virgules)', type: 'list' },
  { key: 'image_url', label: "URL image", type: 'text' },
  { key: 'link_url', label: 'URL lien', type: 'text' },
  { key: 'start_date', label: 'Date début (AAAA-MM)', type: 'text' },
  { key: 'end_date', label: 'Date fin (AAAA-MM, vide = en cours)', type: 'text' },
  { key: 'sort_order', label: 'Ordre de tri', type: 'number' },
  { key: 'featured', label: 'En vedette', type: 'checkbox' },
];

function renderForm(fields, data = {}) {
  const listKeys = ['category', 'languages', 'tools', 'libraries', 'tags'];
  return fields.map(f => {
    let value = data[f.key];
    if (listKeys.includes(f.key)) value = jsonToListStr(value);
    const id = `f-${f.key}`;
    if (f.type === 'checkbox') {
      return `<label class="form-check"><input type="checkbox" id="${id}" ${value ? 'checked' : ''}> ${escapeHtml(f.label)}</label>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form-row"><label for="${id}">${escapeHtml(f.label)}</label>
        <textarea id="${id}" rows="${f.rows || 4}">${escapeHtml(value)}</textarea></div>`;
    }
    if (f.type === 'select') {
      const opts = f.options.map(o => `<option value="${o}" ${value === o ? 'selected' : ''}>${o}</option>`).join('');
      return `<div class="form-row"><label for="${id}">${escapeHtml(f.label)}</label>
        <select id="${id}">${opts}</select></div>`;
    }
    const inputType = f.type === 'number' ? 'number' : 'text';
    return `<div class="form-row"><label for="${id}">${escapeHtml(f.label)}</label>
      <input type="${inputType}" id="${id}" value="${escapeHtml(value)}"></div>`;
}).join('');
}

function collectForm(fields) {
  const listKeys = ['category', 'languages', 'tools', 'libraries', 'tags'];
  const obj = {};
  for (const f of fields) {
    const el = document.getElementById(`f-${f.key}`);
    if (!el) continue;
    if (f.type === 'checkbox') obj[f.key] = el.checked ? 1 : 0;
    else if (listKeys.includes(f.key)) obj[f.key] = parseListToJson(el.value);
    else if (f.type === 'number') obj[f.key] = Number(el.value) || 0;
    else obj[f.key] = el.value.trim();
  }
  return obj;
}

// ---- Posts ------------------------------------------------------------------

let postsCache = [];

async function loadPosts() {
  const container = document.getElementById('posts-list');
  container.innerHTML = 'Chargement…';
  const res = await api('/posts?all=1');
  if (!res.ok) { container.innerHTML = 'Erreur de chargement.'; return; }
  postsCache = await res.json();
  container.innerHTML = postsCache.map(p => `
    <div class="item-row">
      <div class="item-main">
        <strong>${escapeHtml(p.title)}</strong>
        <span class="badges">
          ${p.published ? '<span class="badge ok">publié</span>' : '<span class="badge draft">brouillon</span>'}
          ${p.featured ? '<span class="badge star">★</span>' : ''}
        </span>
        <div class="item-sub">${escapeHtml(p.slug)} · ${escapeHtml(p.created_at || '')}</div>
      </div>
      <div class="item-actions">
        <button onclick="editPost(${p.id})">Modifier</button>
        <button class="danger" onclick="deletePost(${p.id})">Supprimer</button>
      </div>
    </div>`).join('') || '<p>Aucun post.</p>';
}

function newPost() { openPostForm({}); }

function editPost(id) {
  const p = postsCache.find(x => x.id === id);
  if (p) openPostForm(p);
}

function openPostForm(data) {
  document.getElementById('form-title').textContent = data.id ? 'Modifier le post' : 'Nouveau post';
  document.getElementById('form-fields').innerHTML = renderForm(POST_FIELDS, data);
  const form = document.getElementById('editor-form');
  form.dataset.kind = 'post';
  form.dataset.id = data.id || '';
  document.getElementById('editor').style.display = 'flex';
}

async function deletePost(id) {
  const p = postsCache.find(x => x.id === id);
  if (!confirm(`Supprimer définitivement le post « ${p?.title || id} » ?`)) return;
  const res = await api(`/posts?id=${id}`, { method: 'DELETE' });
  if (res.ok) { toast('Post supprimé.'); loadPosts(); }
  else toast('Erreur lors de la suppression.', true);
}

// ---- Cartes -----------------------------------------------------------------

let cardsCache = [];

async function loadCards() {
  const container = document.getElementById('cards-list');
  container.innerHTML = 'Chargement…';
  const res = await api('/cards');
  if (!res.ok) { container.innerHTML = 'Erreur de chargement.'; return; }
  cardsCache = await res.json();
  container.innerHTML = cardsCache.map(c => `
    <div class="item-row">
      <div class="item-main">
        <strong>${escapeHtml(c.title)}</strong>
        <span class="badges"><span class="badge">${escapeHtml(c.page)}</span>${c.featured ? '<span class="badge star">★</span>' : ''}</span>
        <div class="item-sub">${escapeHtml(c.date_range || '')}</div>
      </div>
      <div class="item-actions">
        <button onclick="editCard(${c.id})">Modifier</button>
        <button class="danger" onclick="deleteCard(${c.id})">Supprimer</button>
      </div>
    </div>`).join('') || '<p>Aucune carte.</p>';
}

function newCard() { openCardForm({}); }
function editCard(id) { const c = cardsCache.find(x => x.id === id); if (c) openCardForm(c); }

function openCardForm(data) {
  document.getElementById('form-title').textContent = data.id ? 'Modifier la carte' : 'Nouvelle carte';
  document.getElementById('form-fields').innerHTML = renderForm(CARD_FIELDS, data);
  const form = document.getElementById('editor-form');
  form.dataset.kind = 'card';
  form.dataset.id = data.id || '';
  document.getElementById('editor').style.display = 'flex';
}

async function deleteCard(id) {
  const c = cardsCache.find(x => x.id === id);
  if (!confirm(`Supprimer la carte « ${c?.title || id} » ?`)) return;
  const res = await api(`/cards?id=${id}`, { method: 'DELETE' });
  if (res.ok) { toast('Carte supprimée.'); loadCards(); }
  else toast('Erreur lors de la suppression.', true);
}

// ---- Sauvegarde du formulaire (post ou carte) -------------------------------

async function saveForm(e) {
  e.preventDefault();
  const form = document.getElementById('editor-form');
  const kind = form.dataset.kind;
  const id = form.dataset.id;
  const fields = kind === 'post' ? POST_FIELDS : CARD_FIELDS;
  const data = collectForm(fields);
  const endpoint = kind === 'post' ? '/posts' : '/cards';

  let res;
  if (id) {
    data.id = Number(id);
    res = await api(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  } else {
    res = await api(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  if (res.ok) {
    toast('Enregistré ✓');
    closeEditor();
    kind === 'post' ? loadPosts() : loadCards();
  } else {
    const err = await res.json().catch(() => ({}));
    toast(err.error || 'Erreur lors de l\'enregistrement.', true);
  }
}

function closeEditor() { document.getElementById('editor').style.display = 'none'; }

// ---- Visites ----------------------------------------------------------------

async function loadVisits() {
  const container = document.getElementById('visits-content');
  container.innerHTML = 'Chargement…';
  const res = await api('/visits?stats=1');
  if (!res.ok) { container.innerHTML = 'Erreur de chargement.'; return; }
  const d = await res.json();
  container.innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><span class="stat-num">${d.total_visits}</span><span class="stat-label">visites totales</span></div>
      <div class="stat-card"><span class="stat-num">${d.total_sessions}</span><span class="stat-label">visiteurs (sessions)</span></div>
    </div>
    <h3>Vues par page</h3>
    <table class="data-table"><thead><tr><th>Page</th><th>Vues</th></tr></thead><tbody>
      ${d.pages.map(p => `<tr><td>${escapeHtml(p.page)}</td><td>${p.count}</td></tr>`).join('')}
    </tbody></table>
    <h3>50 dernières visites</h3>
    <table class="data-table"><thead><tr><th>Date</th><th>Page</th><th>Session</th></tr></thead><tbody>
      ${d.recent.map(r => `<tr><td>${escapeHtml(r.visited_at)}</td><td>${escapeHtml(r.page)}</td><td>${escapeHtml(r.session_code || '')}</td></tr>`).join('')}
    </tbody></table>`;
}

// ---- Messages ---------------------------------------------------------------

async function loadMessages() {
  const container = document.getElementById('messages-content');
  container.innerHTML = 'Chargement…';
  const res = await api('/contact');
  if (!res.ok) { container.innerHTML = 'Erreur de chargement.'; return; }
  const msgs = await res.json();
  if (!msgs.length) { container.innerHTML = '<p>Aucun message.</p>'; return; }
  container.innerHTML = msgs.map(m => `
    <div class="msg-card">
      <div class="msg-head"><strong>${escapeHtml(m.nom)}</strong> · <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>
        <span class="msg-date">${escapeHtml(m.created_at)}</span></div>
      ${m.sujet ? `<div class="msg-subject">${escapeHtml(m.sujet)}</div>` : ''}
      <div class="msg-body">${escapeHtml(m.message)}</div>
    </div>`).join('');
}

// ---- Init -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  // Empêche le remplissage automatique du navigateur : champ en lecture seule
  // tant que l'utilisatrice ne clique pas dedans, et vidé au chargement.
  const pwInput = document.getElementById('login-pw');
  pwInput.value = '';
  const unlock = () => pwInput.removeAttribute('readonly');
  pwInput.addEventListener('focus', unlock);
  pwInput.addEventListener('mousedown', unlock);

  document.getElementById('login-form').addEventListener('submit', doLogin);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('editor-form').addEventListener('submit', saveForm);
  document.getElementById('editor-cancel').addEventListener('click', closeEditor);
  document.getElementById('new-post-btn').addEventListener('click', newPost);
  document.getElementById('new-card-btn').addEventListener('click', newCard);
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  if (await checkAuth()) showApp();
});
