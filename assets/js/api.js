// ===== Configuration =====
const API_BASE = 'https://celia-bocage-github-io.vercel.app/api';

// ===== Code session anonyme =====
function getSessionCode() {
  let code = sessionStorage.getItem('session_code');
  if (!code) {
    code = Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('session_code', code);
  }
  return code;
}

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

  const session = getSessionCode();
  fetch(`${API_BASE}/visits?page=${page}&session=${session}`, { method: 'POST' })
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
      session_code: getSessionCode(),
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
      container.innerHTML = '<p class="empty-state">Aucune publication pour le moment.</p>';
      return;
    }

    container.innerHTML = posts.map(post => {
      const tags = JSON.parse(post.tags || '[]');
      const date = new Date(post.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return `
        <article class="post-card${post.featured ? ' post-featured' : ''}" onclick="navigateToPost('${post.slug}')">
          ${post.featured ? '<span class="featured-badge">★</span>' : ''}
          ${post.image_url ? `<img src="${post.image_url}" alt="" class="post-card-image">` : ''}
          <div class="post-card-body">
            <time class="post-date">${date}</time>
            ${post.category ? `<span class="post-category">${post.category}</span>` : ''}
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

    // Init filters after cards are rendered
    initCardFilters();
  } catch {
    container.innerHTML = '<p class="empty-state">Impossible de charger les publications.</p>';
  }
}

async function loadSinglePost(slug) {
  const container = document.getElementById('posts-grid');
  const detail = document.getElementById('post-detail');
  const filters = document.getElementById('card-filters');
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
    if (filters) filters.style.display = 'none';
    detail.style.display = 'block';
    detail.querySelector('#post-detail-content').innerHTML = `
      <span class="post-date">${date}</span>
      <h1 class="post-full-title">${post.title}</h1>
      <div class="post-content">${post.content}</div>
      ${tags.length ? `
        <div class="post-chips">
          ${tags.map(t => `<span class="chip">#${t}</span>`).join('')}
        </div>
      ` : ''}
    `;
    window.scrollTo(0, 0);
  } catch {
    container.style.display = 'none';
    if (filters) filters.style.display = 'none';
    detail.style.display = 'block';
    detail.querySelector('#post-detail-content').innerHTML =
      '<p class="empty-state">Publication introuvable.</p>';
  }
}

function navigateToPost(slug) {
  window.location.href = `posts.html?slug=${slug}`;
}

// ===== Filtrage dynamique (multi-sélection, menus dépliants) =====

const FILTER_DIMENSIONS = [
  { name: 'Contexte', attr: 'context', isArray: false },
  { name: 'Catégorie', attr: 'category', isArray: true },
  { name: 'Langages', attr: 'languages', isArray: true },
  { name: 'Outils', attr: 'tools', isArray: true },
  { name: 'Bibliothèques', attr: 'libraries', isArray: true },
];

function buildStructuredCategories(cards) {
  const categories = [];
  for (const dim of FILTER_DIMENSIONS) {
    const values = new Set();
    cards.forEach(card => {
      if (dim.isArray) {
        JSON.parse(card.dataset[dim.attr] || '[]').forEach(v => values.add(v));
      } else {
        const val = card.dataset[dim.attr];
        if (val) values.add(val);
      }
    });
    if (values.size > 0) {
      categories.push({
        name: dim.name,
        tags: [...values].sort(),
        attr: dim.attr,
        isArray: dim.isArray,
      });
    }
  }
  return categories;
}

function buildFlatTagCategories(cards) {
  const allTags = new Set();
  cards.forEach(card => {
    card.querySelectorAll('.chips-footer .chip').forEach(chip => {
      allTags.add(chip.textContent.trim().replace(/^#/, ''));
    });
  });
  if (allTags.size === 0) return [];
  return [{ name: 'Tags', tags: [...allTags].sort(), attr: null, isArray: false }];
}

function initCardFilters() {
  const filterContainer = document.getElementById('card-filters');
  const grid = document.querySelector('.experience-grid') || document.querySelector('.posts-grid');
  if (!filterContainer || !grid) return;

  const cards = [...grid.querySelectorAll('.experience-card, .post-card')];
  if (cards.length === 0) return;

  // Structured data (cards pages) vs flat tags (posts page)
  const isStructured = cards[0].hasAttribute('data-context');
  const categories = isStructured
    ? buildStructuredCategories(cards)
    : buildFlatTagCategories(cards);

  if (categories.length === 0) return;

  // State: selected values per category
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
    const hasAnySelection = Object.values(selections).some(s => s.size > 0);
    if (!hasAnySelection) {
      cards.forEach(card => { card.style.display = ''; });
      return;
    }

    cards.forEach(card => {
      let visible = true;
      for (const cat of categories) {
        if (selections[cat.name].size === 0) continue;

        let cardValues;
        if (cat.attr) {
          // Structured mode (cards pages)
          if (cat.isArray) {
            cardValues = JSON.parse(card.dataset[cat.attr] || '[]');
          } else {
            const val = card.dataset[cat.attr];
            cardValues = val ? [val] : [];
          }
        } else {
          // Flat tag mode (posts page)
          cardValues = [...card.querySelectorAll('.chips-footer .chip')]
            .map(c => c.textContent.trim().replace(/^#/, ''));
        }

        const match = [...selections[cat.name]].some(v => cardValues.includes(v));
        if (!match) { visible = false; break; }
      }
      card.style.display = visible ? '' : 'none';
    });
  }
}

// ===== Chargement dynamique des cartes =====
async function loadCards(page, container) {
  try {
    const res = await fetch(`${API_BASE}/cards?page=${page}`);
    const cards = await res.json();

    if (!cards.length) {
      container.innerHTML = '<p class="empty-state">Aucun contenu pour le moment.</p>';
      return;
    }

    container.innerHTML = cards.map(card => {
      const tags = JSON.parse(card.tags || '[]');
      const catValues = JSON.parse(card.category || '[]');
      const languages = JSON.parse(card.languages || '[]');
      const tools = JSON.parse(card.tools || '[]');
      const libs = JSON.parse(card.libraries || '[]');
      const featuredClass = card.featured ? ' featured full-width' : '';

      const imageHtml = card.image_url
        ? (card.link_url
          ? `<a href="${card.link_url}" target="_blank"><img src="${card.image_url}" alt="" class="card-image"></a>`
          : `<img src="${card.image_url}" alt="" class="card-image">`)
        : '';

      // Build display chips
      const chips = [];
      if (card.context) chips.push(`<span class="chip chip-context">${card.context}</span>`);
      catValues.forEach(c => chips.push(`<span class="chip chip-category">${c}</span>`));
      languages.forEach(l => chips.push(`<span class="chip">${l}</span>`));
      tools.forEach(t => chips.push(`<span class="chip">${t}</span>`));
      libs.forEach(l => chips.push(`<span class="chip">${l}</span>`));
      tags.forEach(t => chips.push(`<span class="chip chip-soft">${t}</span>`));

      return `
        <section class="experience-card${featuredClass}"
          data-context="${card.context || ''}"
          data-category='${card.category || '[]'}'
          data-languages='${card.languages || '[]'}'
          data-tools='${card.tools || '[]'}'
          data-libraries='${card.libraries || '[]'}'>
          <div class="card-header">
            <h2 class="card-title">${card.title}</h2>
            ${imageHtml}
            <div class="card-details-wrapper">
              ${card.location ? `<span class="location">${card.location}</span>` : ''}
              ${card.date_range ? `<span class="date">${card.date_range}</span>` : ''}
            </div>
          </div>
          <div class="card-content">
            ${card.description || ''}
          </div>
          ${chips.length ? `
            <div class="chips-footer">
              ${chips.join('')}
            </div>
          ` : ''}
        </section>
      `;
    }).join('');

    initCardFilters();
  } catch {
    container.innerHTML = '<p class="empty-state">Impossible de charger le contenu.</p>';
  }
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  trackVisit();
  initContactForm();

  const postsGrid = document.getElementById('posts-grid');
  const cardsGrid = document.querySelector('[data-page]');

  if (postsGrid) {
    loadPosts();
  } else if (cardsGrid) {
    loadCards(cardsGrid.dataset.page, cardsGrid);
  } else {
    initCardFilters();
  }
});
