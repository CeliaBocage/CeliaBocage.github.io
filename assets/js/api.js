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

  // If static post cards already exist, skip the API fetch
  if (container.querySelectorAll('.post-card').length > 0) return;

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

// ===== Filtrage des cartes par tag (multi-sélection, menus dépliants) =====

const TAG_CATEGORIES = {
  'Langages & Technologies': [
    'C', 'C#', 'Python', 'SQL', 'HTML', 'CSS', 'JSON', 'XAML', 'LINQ',
    'Makefile', 'Git', 'GTK', 'Godot', 'Blender', 'Maya', 'Unreal Engine',
    'Dash', 'BERT'
  ],
  'Domaine': [
    'Machine Learning', 'Analyse d\'Image', 'Game Design', 'Web Design',
    'Data Science'
  ],
  'Compétences': [
    'Autonomie', 'Adaptation', 'Dynamisme', 'Rigueur', 'Organisation',
    'Gestion de stock', 'Stratégie'
  ],
  'Data & Analytics': [
    'Data', 'DataAnalytics', 'DataAnalysis', 'DataScience', 'DataDriven',
    'DataQuality', 'DataPreparation', 'BusinessIntelligence', 'Analytics',
    'AnalyseDeDonnées'
  ],
  'IA & Outils': [
    'IA', 'VibeCoding', 'ClaudeAI', 'Anthropic', 'GoogleGemini',
    'Cursor', 'DashPlotly', 'TechReview'
  ],
  'Thème': [
    'Stage', 'Internship', 'Artmajeur', 'FutureOfWork', 'EPITA',
    'SalonÉtudiant', 'Radio', 'Franceinfo', 'Restauration',
    'Leadership', 'SoftSkills', 'JobÉtudiant'
  ],
};

const CONTEXT_RULES = {
  'EPITA': (loc) => loc.includes('EPITA'),
  'International': (loc) => loc.includes('Irlande') || loc.includes('Sligo'),
  'Personnel': (loc) => loc.includes('Kremlin') || loc.includes('Continu'),
  'Professionnel': (loc) =>
    loc.includes('Levallois') || loc.includes('Paris') || loc.includes('Gaillac'),
};

function initCardFilters() {
  const filterContainer = document.getElementById('card-filters');
  const grid = document.querySelector('.experience-grid') || document.querySelector('.posts-grid');
  if (!filterContainer || !grid) return;

  const cards = [...grid.querySelectorAll('.experience-card, .post-card')];
  const allTags = new Set();

  cards.forEach(card => {
    card.querySelectorAll('.chips-footer .chip').forEach(chip => {
      allTags.add(chip.textContent.trim());
    });
  });

  if (allTags.size === 0) return;

  // Build tag-based categories (only include tags present on this page)
  const categories = [];
  for (const [catName, catTags] of Object.entries(TAG_CATEGORIES)) {
    const present = catTags.filter(t => allTags.has(t));
    if (present.length > 0) {
      categories.push({ name: catName, tags: present, type: 'chip' });
    }
  }

  // Build context category from location spans
  const contextSet = new Set();
  const cardContexts = new Map();
  cards.forEach(card => {
    const loc = card.querySelector('.location')?.textContent.trim() || '';
    const matched = [];
    for (const [ctx, matcher] of Object.entries(CONTEXT_RULES)) {
      if (matcher(loc)) {
        contextSet.add(ctx);
        matched.push(ctx);
      }
    }
    cardContexts.set(card, matched);
  });
  if (contextSet.size > 1) {
    categories.push({ name: 'Contexte', tags: [...contextSet], type: 'context' });
  }

  // State: selected tags per category
  const selections = {};
  categories.forEach(cat => { selections[cat.name] = new Set(); });

  // Render filter bar
  const barHTML = categories.map((cat, i) => `
    <div class="filter-group" data-cat-index="${i}">
      <button class="filter-group-toggle" type="button">
        ${cat.name}
        <span class="filter-badge" data-badge="${i}">0</span>
        <span class="filter-arrow">▾</span>
      </button>
      <div class="filter-group-panel">
        ${cat.tags.map(tag =>
          `<button class="filter-chip" type="button" data-tag="${tag}" data-cat="${cat.name}">${tag}</button>`
        ).join('')}
      </div>
    </div>
  `).join('');

  filterContainer.innerHTML = `
    <div class="filter-bar">
      ${barHTML}
      <button class="filter-reset" type="button">Réinitialiser</button>
    </div>
    <div class="filter-active-tags" id="filter-active-tags"></div>
  `;

  // Close panels when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-group')) {
      filterContainer.querySelectorAll('.filter-group').forEach(g => g.classList.remove('open'));
    }
  });

  // Toggle panel open/close
  filterContainer.querySelectorAll('.filter-group-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.closest('.filter-group');
      const wasOpen = group.classList.contains('open');
      filterContainer.querySelectorAll('.filter-group').forEach(g => g.classList.remove('open'));
      if (!wasOpen) group.classList.toggle('open');
    });
  });

  // Chip click: toggle selection
  filterContainer.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = chip.dataset.tag;
      const catName = chip.dataset.cat;
      if (selections[catName].has(tag)) {
        selections[catName].delete(tag);
        chip.classList.remove('active');
      } else {
        selections[catName].add(tag);
        chip.classList.add('active');
      }
      updateBadges();
      updateActiveTags();
      applyFilters();
    });
  });

  // Reset button
  filterContainer.querySelector('.filter-reset').addEventListener('click', () => {
    for (const catName of Object.keys(selections)) {
      selections[catName].clear();
    }
    filterContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    updateBadges();
    updateActiveTags();
    applyFilters();
  });

  function updateBadges() {
    categories.forEach((cat, i) => {
      const badge = filterContainer.querySelector(`[data-badge="${i}"]`);
      const count = selections[cat.name].size;
      badge.textContent = count;
      badge.classList.toggle('visible', count > 0);
    });
  }

  function updateActiveTags() {
    const container = document.getElementById('filter-active-tags');
    const allSelected = [];
    for (const [catName, tags] of Object.entries(selections)) {
      tags.forEach(tag => allSelected.push({ catName, tag }));
    }
    if (allSelected.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = allSelected.map(({ catName, tag }) =>
      `<span class="filter-active-tag" data-cat="${catName}" data-tag="${tag}">
        ${tag} <span class="remove-tag">&times;</span>
      </span>`
    ).join('');
    container.querySelectorAll('.filter-active-tag').forEach(el => {
      el.addEventListener('click', () => {
        const catName = el.dataset.cat;
        const tag = el.dataset.tag;
        selections[catName].delete(tag);
        const chip = filterContainer.querySelector(`.filter-chip[data-tag="${tag}"][data-cat="${catName}"]`);
        if (chip) chip.classList.remove('active');
        updateBadges();
        updateActiveTags();
        applyFilters();
      });
    });
  }

  function applyFilters() {
    // Check if any filters are active
    const hasAnySelection = Object.values(selections).some(s => s.size > 0);
    if (!hasAnySelection) {
      cards.forEach(card => { card.style.display = ''; });
      return;
    }

    cards.forEach(card => {
      const cardTags = new Set();
      card.querySelectorAll('.chips-footer .chip').forEach(c => {
        cardTags.add(c.textContent.trim());
      });
      const cardCtx = cardContexts.get(card) || [];

      // AND between categories, OR within a category
      let visible = true;
      for (const cat of categories) {
        if (selections[cat.name].size === 0) continue;
        if (cat.type === 'context') {
          const match = [...selections[cat.name]].some(ctx => cardCtx.includes(ctx));
          if (!match) { visible = false; break; }
        } else {
          const match = [...selections[cat.name]].some(tag => cardTags.has(tag));
          if (!match) { visible = false; break; }
        }
      }
      card.style.display = visible ? '' : 'none';
    });
  }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  trackVisit();
  initContactForm();
  loadPosts();
  initCardFilters();
});
