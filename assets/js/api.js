// ===== Configuration =====
const API_BASE = '/api';

// ===== Compteur de visites =====
function trackVisit() {
  const path = window.location.pathname;
  let page = 'home';
  if (path.includes('formations')) page = 'formations';
  else if (path.includes('experiences')) page = 'experiences';
  else if (path.includes('projets')) page = 'projets';
  else if (path.includes('vie-associative')) page = 'vie-associative';
  else if (path.includes('passions')) page = 'passions';
  else if (path.includes('posts')) page = 'posts';

  fetch(`${API_BASE}/visits?page=${page}`, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('visit-count');
      if (el) el.textContent = data.count;
    })
    .catch(() => {});
}

// ===== Formulaire de contact =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const feedback = document.getElementById('contact-feedback');
    btn.disabled = true;
    btn.textContent = 'Envoi...';
    feedback.textContent = '';
    feedback.className = 'contact-feedback';

    const data = {
      nom: form.nom.value.trim(),
      email: form.email.value.trim(),
      sujet: form.sujet.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        feedback.textContent = 'Message envoyé avec succès !';
        feedback.classList.add('success');
        form.reset();
      } else {
        feedback.textContent = result.error || 'Erreur lors de l\'envoi.';
        feedback.classList.add('error');
      }
    } catch {
      feedback.textContent = 'Impossible de contacter le serveur.';
      feedback.classList.add('error');
    }

    btn.disabled = false;
    btn.textContent = 'Envoyer';
  });
}

// ===== Mini markdown -> HTML =====
function miniMarkdown(text) {
  return text
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// ===== Page Posts =====
async function loadPosts() {
  const container = document.getElementById('posts-grid');
  if (!container) return;

  // Check if URL has a slug param
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (slug) {
    await loadSinglePost(slug);
    return;
  }

  try {
    const tag = params.get('tag') || '';
    const url = tag ? `${API_BASE}/posts?tag=${encodeURIComponent(tag)}` : `${API_BASE}/posts`;
    const res = await fetch(url);
    const posts = await res.json();

    if (!posts.length) {
      container.innerHTML = '<p class="empty-state">Aucun post pour le moment. Revenez bientôt !</p>';
      return;
    }

    container.innerHTML = posts.map(post => {
      const tags = JSON.parse(post.tags || '[]');
      const date = new Date(post.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return `
        <article class="post-card" onclick="navigateToPost('${post.slug}')">
          <div class="post-card-body">
            <time class="post-date">${date}</time>
            <h2 class="post-title">${post.title}</h2>
            ${post.summary ? `<p class="post-summary">${post.summary}</p>` : ''}
          </div>
          ${tags.length ? `
            <div class="chips-footer">
              ${tags.map(t => `<span class="chip">${t}</span>`).join('')}
            </div>
          ` : ''}
        </article>
      `;
    }).join('');
  } catch {
    container.innerHTML = '<p class="empty-state">Impossible de charger les posts.</p>';
  }
}

async function loadSinglePost(slug) {
  const container = document.getElementById('posts-grid');
  const detail = document.getElementById('post-detail');
  if (!detail) return;

  try {
    const res = await fetch(`${API_BASE}/posts?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Not found');
    const post = await res.json();

    const tags = JSON.parse(post.tags || '[]');
    const date = new Date(post.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    container.style.display = 'none';
    detail.style.display = 'block';
    detail.innerHTML = `
      <a href="posts.html" class="back-link">&larr; Retour aux posts</a>
      <article class="post-full">
        <time class="post-date">${date}</time>
        <h1 class="post-full-title">${post.title}</h1>
        ${tags.length ? `
          <div class="chips-footer" style="margin-bottom: 1.5rem;">
            ${tags.map(t => `<span class="chip">${t}</span>`).join('')}
          </div>
        ` : ''}
        <div class="post-content"><p>${miniMarkdown(post.content)}</p></div>
      </article>
    `;
  } catch {
    detail.style.display = 'block';
    container.style.display = 'none';
    detail.innerHTML = `
      <a href="posts.html" class="back-link">&larr; Retour aux posts</a>
      <p class="empty-state">Post introuvable.</p>
    `;
  }
}

function navigateToPost(slug) {
  window.location.href = `posts.html?slug=${slug}`;
}

// ===== Filtrage des cartes par tag =====
function initCardFilters() {
  const filterContainer = document.getElementById('card-filters');
  const grid = document.querySelector('.experience-grid');
  if (!filterContainer || !grid) return;

  const cards = grid.querySelectorAll('.experience-card');
  const allTags = new Set();

  cards.forEach(card => {
    const chips = card.querySelectorAll('.chips-footer .chip');
    chips.forEach(chip => allTags.add(chip.textContent.trim()));
  });

  if (allTags.size === 0) return;

  filterContainer.innerHTML = `
    <button class="filter-chip active" data-tag="all">Tout</button>
    ${[...allTags].map(tag => `<button class="filter-chip" data-tag="${tag}">${tag}</button>`).join('')}
  `;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;

    filterContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tag = btn.dataset.tag;
    cards.forEach(card => {
      if (tag === 'all') {
        card.style.display = '';
        return;
      }
      const chips = card.querySelectorAll('.chips-footer .chip');
      const match = [...chips].some(c => c.textContent.trim() === tag);
      card.style.display = match ? '' : 'none';
    });
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  trackVisit();
  initContactForm();
  loadPosts();
  initCardFilters();
});
