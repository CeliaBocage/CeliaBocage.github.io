/**
 * Setup script: creates tables and seeds existing posts + cards into Turso DB.
 *
 * Usage:
 *   TURSO_DB_URL=libsql://... TURSO_DB_TOKEN=... node scripts/setup-db.js
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

// ── Schema ──────────────────────────────────────────────────────────────────

async function migrate() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      tags TEXT DEFAULT '[]',
      image_url TEXT,
      context TEXT,
      category TEXT,
      languages TEXT DEFAULT '[]',
      tools TEXT DEFAULT '[]',
      libraries TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      location TEXT,
      date_range TEXT,
      description TEXT,
      tags TEXT DEFAULT '[]',
      image_url TEXT,
      link_url TEXT,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add columns for existing databases
  for (const col of ['subtitle TEXT', 'date_range TEXT', 'start_date TEXT', 'end_date TEXT']) {
    try { await db.execute(`ALTER TABLE cards ADD COLUMN ${col}`); } catch { /* already exists */ }
  }

  // Add featured column for existing databases
  try {
    await db.execute('ALTER TABLE cards ADD COLUMN featured INTEGER DEFAULT 0');
    console.log('Added featured column to cards.');
  } catch { /* column already exists */ }

  // Posts: add sort/display columns for existing databases
  for (const col of [
    'category TEXT',
    'featured INTEGER DEFAULT 0',
    'sort_order INTEGER DEFAULT 0',
    'context TEXT',
    "languages TEXT DEFAULT '[]'",
    "tools TEXT DEFAULT '[]'",
    "libraries TEXT DEFAULT '[]'",
  ]) {
    try { await db.execute(`ALTER TABLE posts ADD COLUMN ${col}`); } catch { /* already exists */ }
  }

  // Classification columns
  for (const col of [
    'context TEXT',
    "category TEXT DEFAULT '[]'",
    "languages TEXT DEFAULT '[]'",
    "tools TEXT DEFAULT '[]'",
    "libraries TEXT DEFAULT '[]'",
  ]) {
    try { await db.execute(`ALTER TABLE cards ADD COLUMN ${col}`); } catch { /* already exists */ }
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      session_id INTEGER,
      session_code TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      session_code TEXT NOT NULL,
      page TEXT NOT NULL,
      view_count INTEGER DEFAULT 1,
      first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_code, page),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    )
  `);

  // Migration: add session_code and session_id columns to existing tables
  for (const table of ['visits', 'page_views', 'messages']) {
    try { await db.execute(`ALTER TABLE ${table} ADD COLUMN session_code TEXT`); } catch { /* already exists */ }
    try { await db.execute(`ALTER TABLE ${table} ADD COLUMN session_id INTEGER`); } catch { /* already exists */ }
  }

  // Backfill: create sessions for existing session_codes and update session_id
  const existingCodes = await db.execute(
    `SELECT DISTINCT session_code FROM visits WHERE session_code IS NOT NULL AND session_id IS NULL`
  );
  for (const row of existingCodes.rows) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO sessions (session_code) VALUES (?)`,
      args: [row.session_code],
    });
    const sess = await db.execute({
      sql: `SELECT id FROM sessions WHERE session_code = ?`,
      args: [row.session_code],
    });
    const sid = sess.rows[0].id;
    for (const table of ['visits', 'page_views', 'messages']) {
      await db.execute({
        sql: `UPDATE ${table} SET session_id = ? WHERE session_code = ? AND session_id IS NULL`,
        args: [sid, row.session_code],
      });
    }
  }

  // Backfill: set structured metadata on existing posts
  const postsMeta = [
    {
      slug: 'quand-ia-ferme-une-boucle',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '["Python"]', tools: '["Claude Code","Dash Plotly"]', libraries: '["Dash","Plotly"]',
      featured: 1, sort_order: 1,
    },
    {
      slug: 'courbes-histoire-incomplete',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 2,
    },
    {
      slug: 'faire-parler-les-chiffres',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 3,
    },
    {
      slug: 'gemini-3-pro-sprinter',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '["Python"]', tools: '["Cursor","Gemini 3 Pro","Claude"]', libraries: '[]',
      featured: 0, sort_order: 4,
    },
    {
      slug: 'pire-erreur-data',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 5,
    },
    {
      slug: 'vibe-coding-ia-remplacement',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '["Python","SQL"]', tools: '["Cursor"]', libraries: '[]',
      featured: 1, sort_order: 6,
    },
    {
      slug: 'salon-etudiant-radio-franceinfo',
      context: 'ÉCOLE', category: '["Communication"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 7,
    },
    {
      slug: 'ce-que-jai-appris-restauration',
      context: 'CDD', category: '["Hôtellerie-Restauration","Service"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 8,
    },
    {
      slug: 'data-inspecteur-anomalies',
      context: 'STAGE', category: '["Data / IA"]',
      languages: '[]', tools: '[]', libraries: '[]',
      featured: 0, sort_order: 9,
    },
  ];

  for (const p of postsMeta) {
    await db.execute({
      sql: `UPDATE posts SET context = ?, category = ?, languages = ?, tools = ?, libraries = ?, featured = ?, sort_order = ?
            WHERE slug = ? AND context IS NULL`,
      args: [p.context, p.category, p.languages, p.tools, p.libraries, p.featured, p.sort_order, p.slug],
    });
  }

  console.log('Tables created.');
}

// ── Seed posts ──────────────────────────────────────────────────────────────

const posts = [
  {
    slug: 'quand-ia-ferme-une-boucle',
    title: `Quand l'IA ferme une boucle. \u{1F504}`,
    summary: `L'humain l'a cr\u00E9\u00E9e pour gagner du temps face \u00E0 la documentation. Aujourd'hui, elle-m\u00EAme ne cherche plus \u00E0 la lire...`,
    image_url: null,
    tags: '["IA","DataAnalytics","VibeCoding","ClaudeAI","Stage","DashPlotly"]',
    created_at: '2026-03-07',
    content: `<p>L'humain l'a cr\u00E9\u00E9e pour gagner du temps face \u00E0 la documentation.<br>
Aujourd'hui, elle-m\u00EAme ne cherche plus \u00E0 la lire.</p>

<p>Hier, pendant mon stage chez <strong>ArtMajeur</strong>, je demande \u00E0 Claude Code d'ajouter un dropdown dans une data table Dash Plotly. Simple, non\u00A0?</p>

<p>Premier essai \u2192 dropdown <strong>AU-DESSUS</strong> du tableau.<br>
Deuxi\u00E8me essai \u2192 dropdown <strong>EN-DESSOUS</strong> du tableau.</p>

<p>En plus d'\u00EAtre moche, c'est tout sauf intuitif quand tu d\u00E9veloppes un dashboard pour une \u00E9quipe non-tech.</p>

<p>Je reformule mon prompt. Parce qu'un mauvais prompt = une mauvaise r\u00E9ponse. C'est le principe de base du vibe coding\u00A0: ce n'est pas l'IA qui est nulle, c'est la demande qui manque de pr\u00E9cision.</p>

<p>Troisi\u00E8me essai\u00A0: Claude comprend enfin ce que je veux\u2026 et m'affirme que <strong>c'est impossible</strong>.</p>

<p>Je perds patience. Je cherche sur internet. Premier lien\u00A0: la doc officielle de Dash Plotly. Tout y est expliqu\u00E9, clairement.</p>

<p><strong>R\u00E9sultat\u00A0: 30 minutes perdues</strong> \u00E0 me d\u00E9battre avec une IA pour une t\u00E2che que j'ai finie seule en quelques minutes.</p>

<p><strong>La le\u00E7on\u00A0?</strong></p>

<p>L'IA est un acc\u00E9l\u00E9rateur incroyable. Claude Code m'a fait gagner un temps consid\u00E9rable tout au long de mon stage, et c'est un outil que je recommande \u00E0 quiconque travaille dans la tech.</p>

<p>Mais elle ne remplace pas la comp\u00E9tence. Elle ne remplace pas le r\u00E9flexe d'aller lire la doc. Et surtout, elle ne remplace pas le sens critique de savoir quand arr\u00EAter de prompter et reprendre la main.</p>

<p><strong>L'IA est un outil. Pas une b\u00E9quille.</strong></p>`,
  },
  {
    slug: 'courbes-histoire-incomplete',
    title: `Quand tes courbes racontent une histoire\u2026 incompl\u00E8te \u{1F4CA}`,
    summary: `Un trou b\u00E9ant. Puis une explosion de donn\u00E9es. Bienvenue dans la r\u00E9alit\u00E9 des bases qui ont \u00E9volu\u00E9 au fil du temps.`,
    image_url: '/assets/Images/post_dashboard_timeline.jpg',
    tags: '["Data","Analytics","Internship","BusinessIntelligence","DataQuality"]',
    created_at: '2026-02-26',
    content: `<p>En stage data, il y a ce moment qu'on conna\u00EEt tous\u00A0:</p>

<p>Tu construis ton dashboard.<br>
Tu lances ta requ\u00EAte.<br>
Tu traces la courbe.</p>

<p>Et l\u00E0\u2026<br>
<strong>Un trou b\u00E9ant. Puis une explosion de donn\u00E9es.</strong></p>

<img src="/assets/Images/post_dashboard_timeline.jpg" alt="Dashboard avec timeline cumulative montrant un trou puis une explosion de donn\u00E9es">

<p>Bienvenue dans la r\u00E9alit\u00E9 des bases qui ont \u00E9volu\u00E9 au fil du temps.</p>

<p>Des \u00E9v\u00E9nements ont eu lieu avant la mise en place du tracking.<br>
On sait que des choses se sont pass\u00E9es.<br>
On en voit les traces indirectes.<br>
Mais on n'a pas la granularit\u00E9 pour raconter l'histoire correctement.</p>

<p>C'est frustrant.<br>
Mais c'est aussi ce qui rend le travail int\u00E9ressant.</p>

<p>\u00C7a oblige \u00E0 se poser les bonnes questions\u00A0:</p>

<p>\u2192 Comment interpr\u00E9ter une m\u00E9trique avec un historique incomplet\u00A0?<br>
\u2192 Comment \u00E9viter des conclusions biais\u00E9es\u00A0?<br>
\u2192 Comment s'assurer que demain, on mesure mieux qu'hier\u00A0?</p>

<p><strong>Parce que la data, ce n'est pas seulement des chiffres.<br>
C'est aussi comprendre ce qui manque.</strong></p>`,
  },
  {
    slug: 'faire-parler-les-chiffres',
    title: `Comment faire parler les chiffres pour mieux les interpr\u00E9ter\u00A0? \u{1F4CA}`,
    summary: `Un r\u00E9sultat faible n'est pas forc\u00E9ment un r\u00E9sultat inutile. Parfois, ce n'est pas l'effet qui est petit, c'est le signal qui est noy\u00E9.`,
    image_url: '/assets/Images/post_courbes_centiles.png',
    tags: '["DataAnalysis","DataScience","AnalyseDeDonnées","DataDriven"]',
    created_at: '2025-12-15',
    content: `<p>Depuis le d\u00E9but de mon stage en data analysis chez <strong>ArtMajeur</strong>, je me rends compte d'une chose\u00A0: les chiffres ne mentent pas\u2026 mais ils peuvent se r\u00E9v\u00E9ler difficiles \u00E0 comprendre.</p>

<p>Une fois les chiffres extraits des bons jeux de donn\u00E9es (sets performants vs non performants, en excluant l'irrelevant), l'\u00E9tude peut commencer.</p>

<p>\u{1F449} Et l\u00E0, trois cas de figure.</p>

<p><strong>1. R\u00E9sultats tr\u00E8s polaris\u00E9s</strong> (uplift fortement positif ou n\u00E9gatif)</p>

<p>\u2192 L'\u00E9tude est probablement robuste. Mais une v\u00E9rification reste indispensable\u00A0:</p>
<ul>
  <li>Est-ce coh\u00E9rent avec l'hypoth\u00E8se initiale\u00A0?</li>
  <li>Est-ce que \u00E7a fait sens m\u00E9tier\u00A0?</li>
</ul>

<p>Si \u00E7a ne colle pas du tout\u00A0:</p>
<ul>
  <li>soit notre intuition \u00E9tait mauvaise,</li>
  <li>soit la m\u00E9thode ou les jeux de donn\u00E9es ne sont pas les bons.</li>
</ul>

<p>\u{1F449} Dans ce cas, pendant mon stage, j'ai appris qu'il faut changer d'angle d'analyse\u00A0: refaire l'\u00E9tude sur d'autres sets, ou utiliser une autre m\u00E9thode pour confirmer (ou invalider) le r\u00E9sultat.</p>

<p><strong>2. R\u00E9sultats faibles</strong> (un +2\u00A0% qui semble insignifiant)</p>

<p>Deux possibilit\u00E9s\u00A0:</p>
<ul>
  <li>On ne peut rien conclure</li>
  <li>Ou ce +2\u00A0% cache un effet plus important sur une partie sp\u00E9cifique des donn\u00E9es (ex\u00A0: +15\u00A0% sur certains profils)</li>
</ul>

<p>Comment lever l'ambigu\u00EFt\u00E9\u00A0?</p>

<p>\u{1F449} <strong>En traitant les valeurs extr\u00EAmes</strong></p>

<p>On retire le premier et le dernier centile (ou d\u00E9cile).<br>
Objectif\u00A0: r\u00E9duire le bruit et faire \u00E9merger les tendances r\u00E9elles. C'est une approche que j'utilise r\u00E9guli\u00E8rement dans mes analyses de stage.</p>

<img src="/assets/Images/post_courbes_centiles.png" alt="Courbes performants vs non-performants avec centiles C1 et C99">

<p><strong>\u{1F4A1} M\u00E9thode concr\u00E8te</strong></p>

<p>On trace deux courbes\u00A0: non performante et performante, en fonction de la variable \u00E9tudi\u00E9e.</p>

<p>Deux sc\u00E9narios\u00A0:</p>

<p><strong>1 \u2014 Les courbes se confondent</strong><br>
\u2192 on choisit les centiles/d\u00E9ciles qui suppriment les valeurs aberrantes<br>
\u2192 on conserve\u00A0: le minimum du premier centile/d\u00E9cile et le maximum du dernier centile/d\u00E9cile</p>

<p><strong>2 \u2014 Les courbes sont clairement s\u00E9par\u00E9es</strong> (non performante tr\u00E8s basse, performante tr\u00E8s haute ou l'inverse)</p>

<p>\u27A1\uFE0F Ce cas correspond en g\u00E9n\u00E9ral \u00E0 des r\u00E9sultats d\u00E9j\u00E0 polaris\u00E9s. Mais lorsqu'il est noy\u00E9 parmi des r\u00E9sultats faibles, on affine en s\u00E9lectionnant les centiles de la non-performante qui convergent vers la performante.</p>

<p><strong>Conclusion\u00A0:</strong></p>

<p>Ce que j'apprends chez ArtMajeur\u00A0: un r\u00E9sultat faible n'est pas forc\u00E9ment un r\u00E9sultat inutile.</p>

<p><strong>Parfois, ce n'est pas l'effet qui est petit, c'est le signal qui est noy\u00E9.</strong></p>`,
  },
  {
    slug: 'gemini-3-pro-sprinter',
    title: `Gemini 3 Pro\u00A0: Un sprinter, pas un marathonien\u00A0? \u{1F3C3}`,
    summary: `J'ai test\u00E9 la nouveaut\u00E9 de Google pour trouver une alternative plus \u00E9conomique \u00E0 Claude. Voici mon retour terrain.`,
    image_url: null,
    tags: '["VibeCoding","TechReview","DataAnalytics","GoogleGemini","Anthropic"]',
    created_at: '2025-11-20',
    content: `<p>Durant mon stage chez <strong>ArtMajeur</strong>, j'utilise intensivement Cursor. On le sait, les mod\u00E8les comme Claude Opus ou Sonnet de chez Anthropic sont des monstres, mais ils co\u00FBtent cher en tokens sur des contextes longs.</p>

<p>J'ai donc test\u00E9 la nouveaut\u00E9 de Google, <strong>Gemini 3 Pro</strong>, pour trouver une alternative plus \u00E9conomique.</p>

<p><strong>\u{1F4C9} La r\u00E9alit\u00E9 du terrain\u00A0:</strong></p>

<p><strong>1\uFE0F\u20E3 Le d\u00E9marrage\u00A0:</strong> Tr\u00E8s fort. Il surclasse clairement un mod\u00E8le l\u00E9ger comme Haiku sur des t\u00E2ches simples.</p>

<p><strong>2\uFE0F\u20E3 L'endurance\u00A0:</strong> C'est la chute. Son contexte sature vite. Il devient "b\u00EAte" apr\u00E8s quelques \u00E9changes, l\u00E0 o\u00F9 Claude reste stable et coh\u00E9rent. Et surtout \u00E7a le rend tr\u00E8s vite plus cher en tokens.</p>

<p><strong>3\uFE0F\u20E3 Le bug qui tue le flow (Data Viz)\u00A0:</strong><br>
C'est le plus gros frein pour l'analyse de donn\u00E9es\u00A0: la confusion multimodale. Si je lui demande de modifier une couleur sur un graphique de sortie d'un script python, il ne touche pas \u00E0 mon code... Il m'envoie une image g\u00E9n\u00E9r\u00E9e du r\u00E9sultat esp\u00E9r\u00E9\u00A0!</p>

<p>C'est joli, mais inutilisable dans mon pipeline.</p>

<p><strong>Conclusion\u00A0:</strong> Le prix est attractif, mais pour bosser s\u00E9rieusement sur de la Data, Claude garde sa couronne. \u{1F451}</p>`,
  },
  {
    slug: 'pire-erreur-data',
    title: `La pire erreur en data\u00A0? Croire que l'analyse commence avec les chiffres. \u{1F4CA}`,
    summary: `Avant d'analyser quoi que ce soit, je me pose toujours les quatre m\u00EAmes questions...`,
    image_url: '/assets/Images/post_sets_diagram.png',
    tags: '["DataAnalysis","DataScience","DataQuality","DataPreparation"]',
    created_at: '2025-11-15',
    content: `<p>En r\u00E9alit\u00E9\u2026 tout se joue avant m\u00EAme de lancer la premi\u00E8re requ\u00EAte.</p>

<p>Avant d'analyser quoi que ce soit, je me pose toujours les quatre m\u00EAmes questions\u00A0:</p>
<p>\u27A1\uFE0F Quelle population je veux vraiment analyser\u00A0?<br>
\u27A1\uFE0F Dans quel set je range la donn\u00E9e\u00A0?<br>
\u27A1\uFE0F Avec quel set je la compare\u00A0?<br>
\u27A1\uFE0F Existe-t-il un set qu'il faut retirer pour \u00E9viter le bruit\u00A0?</p>

<p>Pendant mon stage chez <strong>ArtMajeur</strong>, je travaille presque toujours avec trois ensembles\u00A0:</p>
<ul>
  <li><strong>Set performant</strong> \u2014 ce qui marche vraiment\u00A0: la donn\u00E9e positive.</li>
  <li><strong>Set non performant</strong> \u2014 ce qui freine, sous-performe, ou tire les r\u00E9sultats vers le bas\u00A0: la donn\u00E9e n\u00E9gative.</li>
  <li><strong>Set irrelevant / inexploitable</strong> \u2014 ce qu'on d\u00E9cide d'exclure car \u00E7a n'apporte rien\u2026 ou fausse tout.</li>
</ul>

<img src="/assets/Images/post_sets_diagram.png" alt="Diagramme : DB \u2192 Irrelevant Set (poubelle), Performant Set et Non performant Set \u2192 Analyse Graphiques/Insights">

<p><strong>C'est l\u00E0 que se joue 80% de la qualit\u00E9 d'une analyse.</strong></p>

<p>Se tromper \u00E0 la fin n'est pas grave\u00A0: on ajuste un graphique, on reformule un insight, on affine une comparaison.</p>

<p>\u274C <strong>Mais se tromper au d\u00E9but\u00A0?</strong><br>
Mal d\u00E9finir les sets, m\u00E9langer les populations, garder des donn\u00E9es bruyantes\u2026<br>
\u2192 Et c'est toute l'analyse qu'il faut recommencer\u00A0: extraction, nettoyage, filtres, visu, conclusions.<br>
R\u00E9sultat\u00A0: 2 \u00E0 3 jours de travail qu'il faut reprendre de z\u00E9ro.</p>

<p>Et honn\u00EAtement\u00A0:<br>
\u{1F4C9} Se jeter directement sur les chiffres, c'est aller trop vite.<br>
Avant de les analyser, il faut d\u00E9j\u00E0 les d\u00E9finir.</p>

<p>C'est comme comparer la temp\u00E9rature de deux ann\u00E9es\u2026 mais dans deux zones diff\u00E9rentes\u00A0: le chiffre a l'air coh\u00E9rent, mais il ne veut rien dire.</p>

<p><strong>Une bonne analyse ne commence pas avec les donn\u00E9es.<br>
\u{1F449} Elle commence avec le cadre que l'on pose d\u00E8s le d\u00E9part.</strong></p>`,
  },
  {
    slug: 'vibe-coding-ia-remplacement',
    title: `\u{1F4BB} Vibe Coding & IA\u00A0: Et si on arr\u00EAtait de parler de "remplacement"\u00A0?`,
    summary: `Dans mon quotidien, je vois exactement l'inverse. L'IA ne remplace pas, elle transforme nos m\u00E9tiers.`,
    image_url: null,
    tags: '["VibeCoding","IA","DataScience","FutureOfWork","Artmajeur","Cursor"]',
    created_at: '2025-11-10',
    content: `<p>Durant mon stage, je travaille sur un projet d'analyse s\u00E9mantique des descriptions d'\u0153uvres sur <strong>Artmajeur</strong>. Une exp\u00E9rience qui me fait repenser totalement ma fa\u00E7on de coder\u2026 et le r\u00F4le de l'IA dans nos m\u00E9tiers.</p>

<p>\u{1F525} On parle beaucoup du remplacement des d\u00E9veloppeurs par l'IA.<br>
Dans mon quotidien, je vois exactement l'inverse.</p>

<p>\u{1F4AD} <strong>Le d\u00E9bat habituel\u00A0:</strong> "L'IA va remplacer les d\u00E9veloppeurs/data scientists/analystes\u2026"<br>
<strong>Ma conviction\u00A0:</strong> L'IA ne remplace pas, elle transforme nos m\u00E9tiers. Bienvenue dans l'\u00E8re du Vibe Coding.</p>

<p><strong>\u2753 Concr\u00E8tement, \u00E7a change quoi\u00A0?</strong></p>

<p><strong>Avant\u00A0:</strong> je passais 30 minutes voire 1 heure \u00E0 \u00E9crire une requ\u00EAte SQL complexe, \u00E0 l'appeler dans un script python, \u00E0 d\u00E9bugger, \u00E0 optimiser\u2026</p>

<p><strong>Maintenant\u00A0:</strong> avec des outils comme Cursor, j'\u00E9cris un bon prompt, l'IA g\u00E9n\u00E8re la requ\u00EAte, et je passe ce temps \u00E0 faire ce qui a vraiment de la valeur\u00A0:</p>
<ul>
  <li>Lire et comprendre le code produit</li>
  <li>Valider la logique</li>
  <li>Ajuster selon le contexte m\u00E9tier</li>
  <li>It\u00E9rer rapidement sur plusieurs approches</li>
  <li>Approfondir l'analyse au lieu de rester coinc\u00E9e sur des obstacles techniques</li>
</ul>

<p><strong>\u{1F4A1} La vraie comp\u00E9tence aujourd'hui\u00A0?</strong><br>
Poser les bonnes questions. Formuler pr\u00E9cis\u00E9ment ce que l'on veut.<br>
C'est bien plus rapide de lire, comprendre et modifier du code que de le produire from scratch.<br>
L'IA devient mon pair programmer, pas mon rempla\u00E7ant.</p>

<p>\u2728 <strong>L'IA acc\u00E9l\u00E8re le <em>comment</em>, mais elle ne comprend pas le <em>pourquoi</em>.</strong><br>
Et c'est dans ce <em>pourquoi</em> que se cr\u00E9e la valeur.</p>

<p><strong>\u26A1 Le vrai gain\u00A0?</strong><br>
Quand on vous demande des r\u00E9sultats rapidement, vous gagnez un temps pr\u00E9cieux sur l'ex\u00E9cution technique pour le r\u00E9investir l\u00E0 o\u00F9 vous faites la diff\u00E9rence\u00A0: l'analyse approfondie, l'interpr\u00E9tation, la strat\u00E9gie.</p>

<p><strong>\u{1F4CA} Sur mon stage chez ArtMajeur\u00A0:</strong><br>
J'analyse comment les descriptions d'\u0153uvres impactent les ventes. Gr\u00E2ce au vibe coding et \u00E0 Cursor, je peux tester 10 hypoth\u00E8ses dans le temps o\u00F9 j'en aurais cod\u00E9 2 manuellement. Mon cerveau reste concentr\u00E9 sur l'essentiel\u00A0: comprendre les patterns, questionner les donn\u00E9es, extraire du sens.</p>

<p><strong>\u{1F3AF} Le m\u00E9tier \u00E9volue\u00A0:</strong><br>
De "celui qui code" \u00E0 "celui qui orchestre, comprend et d\u00E9cide".<br>
Et c'est passionnant.</p>

<p><strong>L'IA n'est pas une menace.<br>
C'est un levier. \u00C0 nous de le saisir.</strong></p>`,
  },
  {
    slug: 'salon-etudiant-radio-franceinfo',
    title: `Salon \u00E9tudiant & atelier radio franceinfo \u{1F399}\uFE0F`,
    summary: `Pr\u00E9sente sur le stand EPITA, j'ai \u00E9chang\u00E9 avec de nombreux lyc\u00E9ens et particip\u00E9 \u00E0 un atelier radio en direct.`,
    image_url: null,
    tags: '["EPITA","SalonÉtudiant","Radio","Franceinfo"]',
    created_at: '2025-11-05',
    content: `<p>Pr\u00E9sente vendredi et dimanche sur le stand <strong>EPITA</strong>, j'ai pu \u00E9changer avec de nombreux lyc\u00E9ens curieux de d\u00E9couvrir les \u00E9tudes en informatique.</p>

<p>\u{1F399}\uFE0F J'ai aussi particip\u00E9 \u00E0 un <strong>atelier radio en direct avec franceinfo</strong>, aux c\u00F4t\u00E9s d'un journaliste et de Lina Godefroy. Une belle exp\u00E9rience pour apprendre \u00E0 prendre la parole de fa\u00E7on claire et structur\u00E9e\u2026 tout en pr\u00E9sentant notre \u00E9cole\u00A0!</p>

<p><strong>Une immersion intense mais tr\u00E8s enrichissante.</strong></p>`,
  },
  {
    slug: 'ce-que-jai-appris-restauration',
    title: `\u{1F37D}\uFE0F Ce que j'ai appris apr\u00E8s quelques mois en restauration`,
    summary: `"C'est juste un job d'\u00E9tudiant", para\u00EEt-il. Pourtant, j'y ai appris \u00E0 g\u00E9rer le stress, prendre le lead, et ne jamais rester passif\u00B7ve.`,
    image_url: null,
    tags: '["Restauration","Leadership","SoftSkills","JobÉtudiant"]',
    created_at: '2025-08-01',
    content: `<p><em>"C'est juste un job d'\u00E9tudiant", para\u00EEt-il. Pourtant, j'y ai appris \u00E0 g\u00E9rer le stress, prendre le lead, et ne jamais rester passif\u00B7ve.</em></p>

<p>Travailler en restauration, c'est intense. Vraiment intense.</p>

<p>J'y ai d\u00E9couvert que\u00A0:</p>

<p>\u{1F539} Anticiper un maximum de choses permet d'\u00E9viter la confusion pendant le service<br>
\u{1F539} Le travail d'\u00E9quipe est essentiel \u2013 si une personne d\u00E9croche, tout le service en souffre<br>
\u{1F539} Il faut savoir garder son calme, m\u00EAme quand la salle est pleine et que tout s'acc\u00E9l\u00E8re<br>
\u{1F539} Il y a toujours quelque chose \u00E0 faire\u00A0: ranger des verres, nettoyer le passe au vinaigre, trier les couverts\u2026<br>
\u{1F539} \u00C0 moins de choisir consciemment de faire une pause, on n'en prend pas<br>
\u{1F539} Et surtout\u00A0: quand la pression monte, quelqu'un doit prendre le lead</p>

<p>J'ai appris \u00E0 le faire. Pas en criant plus fort, mais en gardant une vue d'ensemble, en annon\u00E7ant les commandes, en redistribuant les t\u00E2ches, en rassurant les autres.</p>

<p>Ce n'est peut-\u00EAtre pas le m\u00E9tier que je vise \u00E0 long terme.<br>
Mais cette exp\u00E9rience m'a appris des choses qu'aucune formation ne m'aurait transmises aussi vite.</p>

<p><strong>Et franchement\u00A0: tout le monde devrait passer par l\u00E0 au moins une fois.</strong></p>`,
  },
  {
    slug: 'data-inspecteur-anomalies',
    title: `\u{1F50D} Travailler dans la Data, parfois c'est \u00EAtre inspecteur.`,
    summary: `Tu ouvres ton dashboard, tu rep\u00E8res une anomalie. Et personne ne sait pourquoi. Alors tu enfiles ta casquette d'enqu\u00EAtrice.`,
    image_url: null,
    tags: '["DataAnalysis","DataScience","Organisation","Artmajeur"]',
    created_at: '2025-11-20',
    content: `<p>Tu ouvres ton dashboard, tu rep\u00E8res une anomalie.</p>

<p>Un pic de ventes ici.<br>
Une chute de trafic l\u00E0.</p>

<p>Et personne ne sait pourquoi.</p>

<p>Alors tu enfiles ta casquette d'enqu\u00EAtrice.<br>
Tu poses des questions. Tu fouilles dans les mails, les souvenirs des uns et des autres.</p>

<p><em>\u00AB\u00A0Il y avait pas une promo ce jour-l\u00E0\u00A0?\u00A0\u00BB</em></p>

<p><em>\u00AB\u00A0On avait chang\u00E9 un truc sur le site non\u00A0?\u00A0\u00BB</em></p>

<p><em>\u00AB\u00A0Ah si, je crois qu'une newsletter avait \u00E9t\u00E9 envoy\u00E9e\u2026\u00A0\u00BB</em></p>

<p>Et tu finis par reconstituer le puzzle. Avec des bouts de m\u00E9moire collective.</p>

<p>Le probl\u00E8me\u00A0? Cette information, elle n'existe nulle part. Elle est dans la t\u00EAte de 4 personnes diff\u00E9rentes, r\u00E9parties entre la com', la tech, le commerce et la compta.</p>

<p>Alors \u00E9videmment, en tant que profil Data, tu ne laisses pas la chose en l'\u00E9tat.</p>

<p>Tu proposes une base simple, claire, accessible \u00E0 tous. Un endroit unique o\u00F9 chaque \u00E9quipe pourrait renseigner ses \u00E9v\u00E9nements\u00A0: une campagne marketing, une mise en prod, un changement de prix, un test A/B.</p>

<p>Pas besoin d'\u00EAtre technique pour y contribuer. C'est justement tout l'int\u00E9r\u00EAt.</p>

<p>Parce qu'au fond, le vrai travail de la Data ce n'est pas juste analyser des chiffres.</p>

<p><strong>C'est structurer l'information qui n'existait pas encore pour que ceux qui viendront apr\u00E8s n'aient plus \u00E0 jouer les d\u00E9tectives.</strong></p>

<p>\u{1F4A1} <strong>La donn\u00E9e la plus pr\u00E9cieuse d'une entreprise est parfois celle qui n'a jamais \u00E9t\u00E9 enregistr\u00E9e.</strong></p>`,
  },
];

async function seedPosts() {
  const existing = await db.execute('SELECT COUNT(*) as cnt FROM posts');
  if (existing.rows[0].cnt > 0) {
    console.log(`Posts table already has ${existing.rows[0].cnt} rows. Skipping seed.`);
    return;
  }

  for (const post of posts) {
    await db.execute({
      sql: `INSERT INTO posts (slug, title, summary, content, tags, image_url, published, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [post.slug, post.title, post.summary, post.content, post.tags, post.image_url, post.created_at],
    });
    console.log(`  + ${post.slug}`);
  }
  console.log('Posts seeded.');
}

// ── Seed cards ──────────────────────────────────────────────────────────────

const cards = [
  // === EXPERIENCES ===
  {
    page: 'experiences',
    title: `Stage Tech, AI Governance &amp; Citizen Developers - <a href="https://weborama.com" target="_blank" style="color: inherit; text-decoration: underline;">Weborama</a>`,
    location: `Levallois-Perret`,
    date_range: `4 mois`,
    image_url: null,
    link_url: `https://weborama.com`,
    context: `STAGE`,
    category: `["Cybersécurité","Data / IA"]`,
    languages: `["Python","TypeScript"]`,
    tools: `["MongoDB","Docker","Grafana","Claude Code","MCP","GitHub Actions","Git"]`,
    libraries: `["Node.js","API REST"]`,
    tags: `["DB360","Gouvernance IA","CI/CD","Sécurité","Management"]`,
    featured: 1,
    sort_order: 0,
    start_date: `2026-05`,
    end_date: `2026-08`,
    description: `<ul class="card-description">
    <li><strong>DB360</strong>, mon initiative, portée du constat au <strong>déploiement en production</strong> : une base d'événements horodatés (releases, downtimes, campagnes, incidents, faits extérieurs), <strong>corrélable aux métriques</strong>, pour expliquer les écarts de trafic que les chiffres seuls ne justifient pas.</li>
    <li>Sur DB360, la <strong>chaîne complète</strong> : conception du <strong>schéma</strong> depuis la page blanche (entités, relations, contraintes), exposition par des <strong>routes API</strong> plutôt qu'un accès direct à la base, puis <strong>alimentation automatique</strong> (j'ai raccordé un agent IA à la base via <strong>MCP</strong>), aucune saisie manuelle. <strong>MongoDB</strong>, Node.js, API REST, <strong>Docker</strong>, source de données <strong>Grafana</strong>.</li>
    <li><strong>Gouvernance Claude Code</strong> : revue de <strong>PRs sur le MCP interne</strong> (Python, TypeScript), développement de <em>skills</em>, validation des solutions produites par les <strong>citizen developers</strong>.</li>
    <li><strong>Hygiène des secrets</strong> et vérification de l'absence de failles de sécurité dans les solutions développées hors des équipes tech ; rôle technique de management des différents pôles.</li>
    <li><strong>CI/CD</strong> et <strong>GitHub Actions</strong> ; intégration d'<strong>API LLM</strong> dans les workflows développeurs.</li>
    <li><strong>Synchronisation des configurations</strong> Claude / skills / MCP sur les postes de travail (crons &amp; hooks).</li>
    <li>Suivi hebdomadaire et <strong>animation de workshops</strong> : bases de l'informatique, <em>vibe coding</em>, gouvernance IA ; sensibilisation aux risques, déblocage, montée en autonomie.</li>
</ul>`,
  },
  {
    page: 'experiences',
    title: `Stage Data Science - <a href="https://www.artmajeur.com" target="_blank" style="color: inherit; text-decoration: underline;">ArtMajeur</a>`,
    location: `Levallois-Perret`,
    date_range: `8 mois`,
    image_url: `../assets/Images/ArtMajeur.jpeg`,
    link_url: `https://www.artmajeur.com`,
    context: `STAGE`,
    category: `["Data / IA"]`,
    languages: `["Python","SQL"]`,
    tools: `["PostgreSQL","Cursor","Claude Code"]`,
    libraries: `["BERT","pandas","Dash","Plotly"]`,
    tags: `["Stratégie","BERT","A/B testing"]`,
    featured: 1,
    sort_order: 1,
    start_date: `2025-10`,
    end_date: `2026-05`,
    description: `<ul class="card-description">
    <li><strong>Analyse du comportement utilisateur</strong> sur une plateforme de ~3,5 millions d'œuvres et ~1 million de comptes (acheteurs et artistes) : <strong>SQL (PostgreSQL)</strong>, <strong>Python</strong> (pandas, statistiques).</li>
    <li>Développement d'un <strong>pipeline d'embeddings BERT</strong> pour l'analyse sémantique des descriptions d'œuvres et des biographies d'artistes (classification thématique), au service du référencement et de la recherche.</li>
    <li>Production de <strong>dashboards et visualisations</strong> (<strong>Plotly/Dash</strong>, radar charts, courbes de percentiles) comparant les œuvres vendues et non vendues, pour les équipes produit, dev et communication.</li>
    <li>Mise en évidence de <strong>leviers d'amélioration</strong> pour maximiser la visibilité, l'engagement et les ventes des artistes.</li>
    <li>Conception de <strong>requêtes SQL complexes</strong> avec traitement des données directement dans la requête ; gestion, maintenance et optimisation de la <strong>base de données</strong> de la plateforme.</li>
    <li>Étude ayant conduit à un <strong>changement sur la plateforme</strong> pour améliorer les ventes, proposition validée par <strong>A/B testing</strong> puis déployée à l'ensemble des utilisateurs.</li>
    <li><strong>Sensibilisation des équipes aux risques de sécurité</strong> : clés d'API, hygiène des secrets.</li>
</ul>`,
  },
  {
    page: 'experiences',
    title: `Commis de salle - <a href="https://hoteleldoradoparis.com/" target="_blank" style="color: inherit; text-decoration: underline;">Hôtel Eldorado, 4*</a>`,
    location: `Paris 18`,
    date_range: `3 mois`,
    image_url: `../assets/Images/Eldorado.jpg`,
    link_url: `https://hoteleldoradoparis.com/`,
    context: `CDD`,
    category: `["Hôtellerie-Restauration","Service"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Autonomie","Adaptation","Dynamisme"]`,
    featured: 0,
    sort_order: 2,
    start_date: `2025-05`,
    end_date: `2025-07`,
    description: `<ul class="card-description">
    <li>Service de <strong>~75 couverts par service</strong> (salle de 40 places, 2 services par repas) dans un hôtel 4 étoiles parisien.</li>
    <li>Mise en place <strong>autonome</strong> de la salle, gestion du service en toute polyvalence au contact d'une clientèle internationale.</li>
</ul>
<div class="card-illustrated right">
    <ul class="illustrated-text">
        <li>Réalisation du <strong>service en chambre</strong> avec attention au détail et respect des standards de l'établissement.</li>
    </ul>
    <img src="../assets/Images/HotelEldorado2.jpg" alt="Jardin de l'Hôtel Eldorado">
</div>
<ul class="card-description">
    <li>Développement du sens du <strong>travail en équipe</strong> et de la gestion du stress en période d'affluence.</li>
</ul>`,
  },
  {
    page: 'experiences',
    title: `Réceptionniste - Pharmacie de Piquerouge`,
    location: `Gaillac`,
    date_range: `2 mois`,
    image_url: `../assets/Images/Pharmacie_de_piquerouge.jpg`,
    link_url: null,
    context: `CDD`,
    category: `["Santé / Pharmacie"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Rigueur","Organisation","Gestion de stock"]`,
    featured: 0,
    sort_order: 3,
    start_date: `2024-07`,
    end_date: `2024-08`,
    description: `<ul class="card-description">
    <li>Réception des livraisons, <strong>gestion de stock</strong> et mise en rayon dans une pharmacie de grande envergure (~2/3 des références en parapharmacie).</li>
    <li>Forte <strong>rigueur</strong> et rapidité d'exécution dans le respect des normes de traçabilité, avec un volume nécessitant depuis l'installation d'un robot de stockage.</li>
    <li>Sens de l'<strong>organisation</strong> développé au contact d'un environnement professionnel réglementé et à fort volume.</li>
</ul>`,
  },
  {
    page: 'experiences',
    title: `Réceptionniste - Pharmacie de Piquerouge`,
    location: `Gaillac`,
    date_range: `4 mois`,
    image_url: `../assets/Images/Pharmacie_de_piquerouge.jpg`,
    link_url: null,
    context: `CDD`,
    category: `["Santé / Pharmacie"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Rigueur","Organisation","Gestion de stock"]`,
    featured: 0,
    sort_order: 4,
    start_date: `2022-05`,
    end_date: `2022-08`,
    description: `<ul class="card-description">
    <li>Réception des livraisons, <strong>gestion de stock</strong> et mise en rayon dans une pharmacie de grande envergure (~2/3 des références en parapharmacie).</li>
    <li>Forte <strong>rigueur</strong> et rapidité d'exécution dans le respect des normes de traçabilité, avec un volume nécessitant depuis l'installation d'un robot de stockage.</li>
    <li>Sens de l'<strong>organisation</strong> développé au contact d'un environnement professionnel réglementé et à fort volume.</li>
</ul>`,
  },

  // === FORMATIONS ===
  {
    page: 'formations',
    title: `Cycle ingénieur en apprentissage - École d'ingénieurs EPITA`,
    location: `Villejuif`,
    date_range: `2023 - 2029`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Informatique","Cybersécurité"]`,
    languages: `["C","C#","Python","Rust","Assembly","SQL"]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Algorithmique","Mathématiques","Cybersécurité","Réseaux","Systèmes"]`,
    featured: 1,
    sort_order: 0,
    start_date: `2023-09`,
    end_date: `2029-07`,
    description: `<ul class="card-description">
    <li>Formation d'ingénieur en informatique : <strong>cycle préparatoire</strong> (2023 - 2026) puis <strong>cycle ingénieur en apprentissage</strong>, majeure <strong>Cybersécurité &amp; Système</strong> (sept. 2026 - juil. 2029).</li>
    <li>Tronc commun intensif en <strong>algorithmique</strong>, <strong>mathématiques</strong>, <strong>systèmes</strong>, <strong>réseaux</strong> et <strong>sécurité</strong>.</li>
    <li>Apprentissage approfondi des langages <strong>C</strong>, <strong>C#</strong>, <strong>Python</strong>, <strong>Assembly</strong> et <strong>SQL</strong> à travers de nombreux travaux pratiques.</li>
    <li>Projets techniques majeurs chaque semestre : <strong>jeu vidéo 3D multijoueur</strong> (S2), <strong>OCR par réseau de neurones</strong> à 99,9 % (S3).</li>
    <li>Semestre d'échange international en <strong>Game Design</strong> en Irlande, renforçant autonomie et ouverture culturelle.</li>
</ul>`,
  },
  {
    page: 'formations',
    title: `Permis, Licences & Certificats`,
    location: null,
    date_range: `2021 - 2025`,
    image_url: null,
    link_url: null,
    context: `CERTIF`,
    category: `[]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Permis B","Permis A2","Bateau","PSC1","Prévention VSS"]`,
    featured: 0,
    sort_order: 1,
    start_date: `2021-01`,
    end_date: `2025-12`,
    description: `<ul class="card-description">
    <li><strong>Permis B</strong> : permis de conduire automobile.</li>
    <li><strong>Permis A2</strong> : permis moto (motocyclettes de puissance intermédiaire).</li>
    <li><strong>Permis bateau fluvial & côtier</strong> : navigation en eaux intérieures et en mer.</li>
    <li><strong>Certificat de formation contre les VSS</strong> : formation à la prévention et à la prise en charge des violences sexistes et sexuelles.</li>
    <li><strong>PSC1</strong> : Prévention et Secours Civiques de niveau 1, formation aux premiers secours (massage cardiaque, PLS, gestion des hémorragies, etc.).</li>
</ul>`,
  },
  {
    page: 'formations',
    title: `Semestre à l'étranger - Game Design`,
    location: `ATU Sligo, Irlande`,
    date_range: `Janv. 2025 - Juin 2025`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Game Design","Informatique"]`,
    languages: `["C#","SQL","LINQ","XAML"]`,
    tools: `["Photoshop","Maya","Unreal Engine"]`,
    libraries: `[]`,
    tags: `["International","Anglais"]`,
    featured: 0,
    sort_order: 2,
    start_date: `2025-01`,
    end_date: `2025-06`,
    description: `<ul class="card-description">
    <li>Semestre d'échange dédié au <strong>Game Design</strong>, à la <strong>modélisation 3D</strong> et au développement logiciel.</li>
    <li>Immersion anglophone complète pendant 6 mois, consolidant un <strong>niveau courant</strong> à l'oral et à l'écrit.</li>
    <li>Conception et développement d'un <strong>logiciel de recettes de cuisine</strong> avec base de données relationnelle.</li>
    <li>Création d'un <strong>jeu vidéo 3D</strong> complet sur <strong>Unreal Engine</strong>, de la modélisation au gameplay.</li>
    <li>Apprentissage de <strong>Maya</strong> et <strong>Photoshop</strong> pour la création d'assets graphiques.</li>
</ul>`,
  },
  {
    page: 'formations',
    title: `BAFA`,
    location: `Gaillac`,
    date_range: `2024`,
    image_url: null,
    link_url: null,
    context: `CERTIF`,
    category: `["Animation / Jeunesse"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Pédagogie","Responsabilité"]`,
    featured: 0,
    sort_order: 3,
    start_date: `2024-04`,
    end_date: `2024-04`,
    description: `<ul class="card-description">
    <li>Obtention du <strong>Brevet d'Aptitude aux Fonctions d'Animateur</strong>, diplôme national d'encadrement de mineurs.</li>
    <li>Spécialisation <strong>accueil de scoutisme</strong> : encadrement de camps et de week-ends avec des jeunes de 8 à 11 ans.</li>
    <li>Formation aux techniques d'animation, à la gestion de groupes et aux responsabilités de sécurité.</li>
</ul>`,
  },
  {
    page: 'formations',
    title: `Baccalauréat Général, Mention`,
    location: `Lycée St Joseph, Gaillac`,
    date_range: `2023`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Sciences"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Mathématiques","Physique-Chimie"]`,
    featured: 0,
    sort_order: 4,
    start_date: `2020-09`,
    end_date: `2023-08`,
    description: `<ul class="card-description">
    <li>Baccalauréat général obtenu <strong>avec mention</strong>.</li>
    <li>Spécialités <strong>Mathématiques</strong> et <strong>Physique-Chimie</strong>, avec l'option <strong>Maths Expertes</strong>.</li>
    <li>Profil scientifique solide ayant préparé l'entrée en école d'ingénieurs.</li>
</ul>`,
  },

  // === PROJETS ===
  {
    page: 'projets',
    title: `DB360 : base d'événements 360`,
    location: `Weborama, Levallois-Perret`,
    date_range: `Mai - Août 2026`,
    image_url: null,
    link_url: null,
    context: `STAGE`,
    category: `["Data / IA","Informatique"]`,
    languages: `["JavaScript","SQL"]`,
    tools: `["MongoDB","Docker","Railway","Grafana","MCP"]`,
    libraries: `["Node.js","API REST"]`,
    tags: `["Traçabilité","Data Engineering","IA agentique","Mise en production"]`,
    featured: 1,
    sort_order: 0,
    start_date: `2026-05`,
    end_date: `2026-08`,
    description: `<ul class="card-description">
    <li><strong>Mon initiative</strong>, portée du constat au déploiement en production : identification du besoin, conception du modèle, développement et mise en production.</li>
    <li><strong>Le problème :</strong> l'analytics montre <em>que</em> quelque chose s'est passé, jamais <em>pourquoi</em>. Les causes (campagnes, releases, incidents, actualité extérieure, décisions de réunion) ne sont écrites nulle part : elles vivent dans la mémoire de deux ou trois personnes.</li>
    <li><strong>La réponse :</strong> un <strong>journal d'événements horodatés</strong>, internes et externes, corrélable aux métriques, pour que la cause d'un écart de trafic soit interrogeable au lieu d'être recollée à l'oral.</li>
    <li><strong>La chaîne complète, de A à Z :</strong> conception du <strong>schéma</strong> depuis la page blanche (entités, relations, contraintes), exposition par des <strong>routes API</strong> plutôt qu'un accès direct à la base, puis <strong>alimentation automatique</strong>, aucune saisie manuelle.</li>
    <li>L'alimentation passe par une instance de <strong>Kōan</strong> (agent IA autonome) à laquelle on confie des missions précises : j'ai <strong>raccordé l'agent à la base via MCP</strong>. C'est exactement le sujet des architectures agentiques actuelles, sur un système réel.</li>
    <li><strong>MongoDB</strong>, Node.js, API REST, conteneurisation <strong>Docker</strong>, déploiement <strong>Railway</strong>, exposition en source de données <strong>Grafana</strong>.</li>
    <li>Besoin né de mes analyses chez <strong>ArtMajeur</strong> ; conception et mise en production pendant le stage Tech chez <strong>Weborama</strong>.</li>
    <li>La compétence de fond : <strong>traçabilité et mémoire organisationnelle</strong>, cousine directe de la démarche de journalisation et d'audit en sécurité.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `<a href="https://villa-d-audenge.vercel.app/" target="_blank" style="color: inherit; text-decoration: underline;">Villa d'Audenge : site vitrine multilingue</a>`,
    location: `Projet personnel`,
    date_range: `Continu`,
    image_url: null,
    link_url: `https://villa-d-audenge.vercel.app/`,
    context: `PERSO`,
    category: `["Informatique","Web"]`,
    languages: `["TypeScript","SQL"]`,
    tools: `["Next.js 15","Tailwind CSS 4","Turso/libSQL","Vercel","sharp"]`,
    libraries: `["React 19","@libsql/client"]`,
    tags: `["i18n","Full-stack","Analytics","RGPD"]`,
    featured: 0,
    sort_order: 1,
    start_date: `2026-08`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Site vitrine d'une maison de vacances sur le <strong>Bassin d'Arcachon</strong>, avec un <strong>espace propriétaire protégé</strong> pour changer les photos, fixer les tarifs et suivre le trafic.</li>
    <li><strong>Quatre langues</strong> (français, anglais, espagnol, allemand) avec des URL traduites par page, et un sélecteur qui renvoie vers <em>la même page</em> dans l'autre langue, pas vers l'accueil.</li>
    <li><strong>Next.js 15</strong> / <strong>React 19</strong> / <strong>TypeScript</strong>, <strong>Tailwind CSS 4</strong>, base <strong>Turso/libSQL</strong>, images redimensionnées et ré-encodées côté navigateur avant envoi, déploiement <strong>Vercel</strong>.</li>
    <li>Analytics maison avec <strong>salage des identifiants</strong> plutôt qu'un traceur tiers, et pages mentions légales / confidentialité conformes.</li>
    <li><strong>Aucun contenu inventé :</strong> capacité, équipements, distances, tarifs et conditions sont transcrits de l'annonce et des échanges avec la propriétaire, centralisés dans un seul fichier de contenu.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Contribution open source à <a href="https://github.com/Anantys-oss/koan" target="_blank" style="color: inherit; text-decoration: underline;">Kōan</a> (Anantys)`,
    location: `Open source`,
    date_range: `Contribution`,
    image_url: null,
    link_url: `https://github.com/Anantys-oss/koan`,
    context: `PERSO`,
    category: `["Informatique","Data / IA"]`,
    languages: `["Python"]`,
    tools: `["Git","Docker","GitHub"]`,
    libraries: `[]`,
    tags: `["Open source","Automatisation","IA agentique"]`,
    featured: 1,
    sort_order: 2,
    start_date: `2026-06`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Kōan</strong> est un <strong>agent IA autonome open source</strong> publié par <strong>Anantys</strong> : il exécute en tâche de fond des revues de code, des corrections de bugs et des analyses de codebase. ~24 000 lignes de Python. <em>Je n'en suis pas l'autrice : j'y ai contribué.</em></li>
    <li><strong>Le point de friction :</strong> l'outil ne traitait qu'<strong>un dépôt par exécution</strong>. Pour couvrir tout le parc, il fallait le relancer <strong>72 fois à la main</strong>.</li>
    <li><strong>Ma contribution :</strong> la <strong>boucle d'itération sur les dépôts</strong>, qui supprime cette manipulation : une seule exécution couvre l'ensemble. Peu de code, mais c'est ce qui fait passer un outil du stade démonstration au stade exploitable.</li>
    <li>Ce que ça a demandé : lire et modifier une base de code Python conséquente écrite par quelqu'un d'autre, identifier le <strong>vrai</strong> point de friction plutôt que le symptôme, et travailler sous les conventions et le processus de revue du projet.</li>
    <li><strong>Lecture sécurité :</strong> un agent autonome avec accès en écriture à des dépôts Git est une surface à encadrer. Les garde-fous de Kōan (branches <code>koan/*</code>, pull requests en brouillon uniquement, jamais de commit direct sur <code>main</code>) sont exactement ce qu'il faut savoir défendre.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `<a href="https://github.com/CeliaBocage/Projet-Preparation-Piscine-Avant-L-Ing-1" target="_blank" style="color: inherit; text-decoration: underline;">Préparation Piscine – Avant l'Ing 1</a>`,
    location: `EPITA`,
    date_range: `Projet personnel`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Informatique"]`,
    languages: `["C","SQL","Makefile"]`,
    tools: `["PostgreSQL"]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 0,
    sort_order: 3,
    start_date: `2026-02`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Projet de préparation à la <strong>piscine</strong> du cycle ingénieur : exploration des différents langages et concepts abordés pendant la piscine.</li>
    <li>Réalisation d'une <strong>calculatrice en ligne de commande</strong> en <strong>C</strong> avec opérations arithmétiques (+, -, *, /, %), validation des arguments et fonctions d'affichage réimplémentées sans utiliser la bibliothèque standard.</li>
    <li>Gestion du projet avec <strong>Makefile</strong> pour la compilation et l'organisation du code.</li>
    <li>Exercices <strong>SQL</strong> sur une base de données de marché de l'art : requêtes de sélection, jointures, agrégations et sous-requêtes.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `How-to-SCRAP`,
    location: `Projet personnel`,
    date_range: `Continu`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Informatique","Data"]`,
    languages: `["Python"]`,
    tools: `[]`,
    libraries: `["BeautifulSoup4","requests"]`,
    tags: `["Web Scraping","Automatisation"]`,
    featured: 0,
    sort_order: 4,
    start_date: `2026-02`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Projet éducatif de <strong>web scraping</strong> en Python : cours théoriques (TD) et exercices pratiques (TP) pour apprendre les techniques de scraping.</li>
    <li>Scraping du site books.toscrape.com : extraction de titres, prix, notes et liens sur <strong>50 pages</strong> de résultats avec gestion de la pagination.</li>
    <li>Utilisation de <strong>BeautifulSoup4</strong> et <strong>requests</strong> pour le parsing HTML et les requêtes HTTP, avec <strong>export CSV</strong> des données.</li>
    <li>Mise en place d'un environnement virtuel Python, respect des bonnes pratiques (rate-limiting, délais entre requêtes).</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Command-Taker La Cave : outil interne d'association`,
    location: `EPITA - Le Kremlin-Bicêtre`,
    date_range: `En service`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Informatique","Web"]`,
    languages: `["TypeScript","SQL"]`,
    tools: `["Next.js 15","Prisma","Turso/libSQL","Vercel"]`,
    libraries: `["iron-session"]`,
    tags: `["Full-stack","Authentification","Utilisateurs réels"]`,
    featured: 0,
    sort_order: 5,
    start_date: `2025-11`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Application interne pour l'association <strong>La Cave</strong> (EPITA, 200 membres), dont je suis présidente : <strong>prise de commande au bar</strong> et <strong>gestion de stock</strong>, jusque-là tenues à la main.</li>
    <li><strong>Authentification et gestion de rôles</strong> avec <strong>iron-session</strong> : le barman, le trésorier et le membre ne voient pas la même chose.</li>
    <li>Stack <strong>Next.js 15</strong> / <strong>TypeScript</strong>, ORM <strong>Prisma</strong>, base <strong>Turso/libSQL</strong>, déploiement <strong>Vercel</strong>.</li>
    <li><strong>En service dans l'association.</strong> Livrer à de vrais utilisateurs impose une rigueur que les projets d'école n'exigent pas : une erreur se voit un vendredi soir, au bar, devant tout le monde.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Projet Personnel : Portfolio`,
    location: `Le Kremlin-Bicêtre`,
    date_range: `Continu`,
    image_url: null,
    link_url: `https://github.com/CeliaBocage/CeliaBocage.github.io`,
    context: `PERSO`,
    category: `["Informatique","Web"]`,
    languages: `["HTML","CSS","JavaScript","SQL"]`,
    tools: `["Git","Vercel","Turso/libSQL"]`,
    libraries: `["@libsql/client"]`,
    tags: `["Full-stack","Serverless"]`,
    featured: 0,
    sort_order: 6,
    start_date: `2025-10`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Développement de ce site portfolio entièrement <em>from scratch</em>, sans framework ni générateur de site : <strong>HTML</strong>, <strong>CSS</strong> et <strong>JavaScript</strong> vanilla.</li>
    <li>Passage d'un site statique à une <strong>application full-stack</strong> : API <strong>serverless</strong> (fonctions Vercel), base de données <strong>Turso/libSQL</strong>, contenu (expériences, projets, publications) servi dynamiquement au lieu d'être écrit en dur.</li>
    <li><strong>Espace d'administration</strong> protégé par mot de passe (comparaison à temps constant, secret en variable d'environnement) pour créer et modifier les cartes et les publications.</li>
    <li>Design <strong>responsive</strong> (mobile, tablette, desktop) avec un système de composants réutilisables (cartes, chips, grilles, filtres à facettes) et découpage du CSS par domaine.</li>
    <li>Déploiement continu sur <strong>Vercel</strong> à chaque push.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `FPS Solo - Unreal Engine (projet individuel)`,
    location: `ATU Sligo, Irlande`,
    date_range: `Semestre à l'étranger`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Game Design"]`,
    languages: `["C#"]`,
    tools: `["Unreal Engine","Maya"]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 0,
    sort_order: 7,
    start_date: `2025-01`,
    end_date: `2025-06`,
    description: `<ul class="card-description">
    <li>Réalisation <strong>individuelle</strong> complète d'un FPS solo sous <strong>Unreal Engine</strong>, de la conception au produit jouable.</li>
    <li>Développement de la logique de jeu en <strong>C#</strong> : déplacements, tir, ennemis IA, conditions de victoire.</li>
    <li>Création de la carte 3D, des textures et des assets visuels avec <strong>Maya</strong> et Paint.</li>
    <li>Projet réalisé en contexte international, entièrement en anglais.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Logiciel de recettes de cuisine`,
    location: `ATU Sligo, Irlande`,
    date_range: `Semestre à l'étranger`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Informatique"]`,
    languages: `["C#","SQL","XAML","LINQ"]`,
    tools: `["MariaDB"]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 0,
    sort_order: 8,
    start_date: `2025-01`,
    end_date: `2025-06`,
    description: `<ul class="card-description">
    <li>Application desktop de gestion de recettes : ajout, suppression, recherche et <strong>filtrage par ingrédient</strong>.</li>
    <li>Fonctionnalité de <strong>constraint programming</strong> : suggestion de recettes réalisables avec les ingrédients disponibles ("recettes à partir du frigo").</li>
    <li>Calcul automatique des <strong>portions</strong> en fonction du nombre de convives.</li>
    <li>Base de données <strong>MariaDB</strong>, requêtes <strong>SQL/LINQ</strong>, interface multi-pages en <strong>XAML</strong>.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Résolution de mots cachés par OCR (équipe de 4)`,
    location: `EPITA`,
    date_range: `3e semestre`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Informatique","Data / IA"]`,
    languages: `["C"]`,
    tools: `["GTK","Glade"]`,
    libraries: `[]`,
    tags: `["Machine Learning","Analyse d'Image"]`,
    featured: 1,
    sort_order: 9,
    start_date: `2024-09`,
    end_date: `2025-01`,
    description: `<ul class="card-description">
    <li>Développement d'un logiciel capable de <strong>détecter et résoudre des grilles de mots cachés</strong> à partir d'une image, grâce à la <strong>reconnaissance optique de caractères (OCR)</strong>.</li>
    <li>Implémentation d'un <strong>réseau de neurones</strong> en <strong>C</strong> atteignant <strong>99,9 % de précision</strong> sur la reconnaissance de l'alphabet français.</li>
    <li>Création d'une base de données d'entraînement et gestion du pipeline complet : prétraitement d'image, segmentation, reconnaissance et résolution.</li>
    <li>Développement de l'interface graphique avec <strong>GTK</strong> et <strong>Glade</strong> pour permettre à l'utilisateur de charger une image et visualiser le résultat.</li>
</ul>`,
  },
  {
    page: 'projets',
    title: `Puzzle/Escape Game 3D - Godot (équipe de 5)`,
    location: `EPITA`,
    date_range: `2e semestre`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Game Design","Informatique"]`,
    languages: `["C#","JSON"]`,
    tools: `["Godot","Blender"]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 0,
    sort_order: 10,
    start_date: `2023-09`,
    end_date: `2024-06`,
    description: `<ul class="card-description">
    <li>Escape game <strong>multijoueur</strong> dans un <strong>manoir</strong> : résolution d'énigmes en coopération tout en échappant à un fantôme doté d'un système de <strong>pathfinding</strong> (possibilité de se cacher pour le faire repartir).</li>
    <li><strong>Modélisation 3D</strong> complète de l'environnement avec <strong>Blender</strong> (manoir, décors, éclairage).</li>
    <li>Développement d'un système de <strong>configuration des contrôles</strong> en <strong>C#</strong>, avec sauvegarde/chargement dynamique via <strong>JSON</strong>.</li>
    <li>Intégration de l'ensemble dans le moteur <strong>Godot</strong> : gameplay, physique, IA ennemie et interface utilisateur.</li>
</ul>`,
  },

  // === VIE ASSOCIATIVE ===
  {
    page: 'vie-associative',
    title: `Staff' Communication - EPITA`,
    location: `Le Kremlin-Bicêtre`,
    date_range: `2025 - Présent`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Communication"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Événementiel","Relationnel"]`,
    featured: 0,
    sort_order: 0,
    start_date: `2025-09`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Représentation de l'EPITA sur <strong>3 JPO</strong>, <strong>10 salons étudiants</strong> et des présentations dans des lycées en France (Dunkerque…) et à l'étranger (Roumanie…). [Réalisés sur l'année 2025-2026]</li>
    <li>Encadrement d'étudiants lors des événements, accueil et conseil personnalisé auprès des futurs candidats et de leurs familles.</li>
    <li>Engagement régulier d'environ <strong>13 journées de mobilisation par an</strong>, renforçant aisance orale et sens du relationnel.</li>
</ul>`,
  },
  {
    page: 'vie-associative',
    title: `Sentinelle - STOP VSS`,
    location: `EPITA`,
    date_range: `2025 - Présent`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Engagement social"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Prévention","Sécurité","Écoute","Engagement"]`,
    featured: 0,
    sort_order: 1,
    start_date: `2025-09`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>STOP VSS</strong> est une association de lutte contre les <strong>violences sexistes et sexuelles</strong> (VSS), c'est-à-dire l'ensemble des comportements allant du harcèlement de rue aux agressions sexuelles, en passant par les propos sexistes et les situations d'emprise.</li>
    <li>Formée en tant que <strong>sentinelle</strong> : présence lors de soirées étudiantes pour veiller à la sécurité des participants et réalisation de <strong>maraudes</strong> afin de détecter et prévenir les situations à risque.</li>
    <li>Intervention en cas d'<strong>agression sexuelle</strong> ou de comportement inapproprié : mise en sécurité de la victime, écoute et orientation vers les dispositifs d'aide adaptés.</li>
    <li>Capacité à <strong>accompagner les victimes</strong> : écoute bienveillante, soutien moral et aide dans les démarches auprès des structures compétentes.</li>
</ul>`,
  },
  {
    page: 'vie-associative',
    title: `Présidente de La Cave - Association du terroir (200 membres)`,
    location: `EPITA`,
    date_range: `2024 - Présent`,
    image_url: null,
    link_url: null,
    context: `ÉCOLE`,
    category: `["Culture / Voyage","Engagement social"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Organisation","Logistique","Management","Budget"]`,
    featured: 0,
    sort_order: 2,
    start_date: `2024-11`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Présidence</strong> d'une association EPITA de <strong>200 membres</strong> : animation d'un <strong>bureau de 8 personnes</strong>, gestion budgétaire et planification annuelle.</li>
    <li>Responsabilité des <strong>prestations traiteur</strong> des événements de l'école et des autres associations : une <strong>dizaine par an, jusqu'à 500 convives</strong>.</li>
    <li>Chaîne complète prise en charge : recueil du besoin, devis, achats auprès des producteurs, budget et marge, logistique, service.</li>
    <li>Respect de l'<strong>hygiène alimentaire</strong> et du <strong>cadre légal de l'alcool en milieu étudiant</strong>.</li>
    <li>Organisation de dégustations de vins et de fromages, de sorties culturelles et de visites de caves, de domaines viticoles et de fermes locales.</li>
</ul>`,
  },
  {
    page: 'vie-associative',
    title: `Cheftaine (Bénévolat) - Scouts et Guides de France`,
    location: `Gaillac`,
    date_range: `2022 - 2024`,
    image_url: null,
    link_url: null,
    context: `BÉNÉVOLAT`,
    category: `["Animation / Jeunesse","Engagement social"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Leadership","Pédagogie","BAFA","Responsabilité"]`,
    featured: 0,
    sort_order: 3,
    start_date: `2022-09`,
    end_date: `2024-08`,
    description: `<ul class="card-description">
    <li>Encadrement bénévole d'un groupe de <strong>30 jeunes</strong> (8-11 ans), au sein d'une unité d'environ 100 scouts.</li>
    <li>Conception et animation d'activités éducatives lors de réunions hebdomadaires, week-ends et camps.</li>
    <li>Responsabilité de la sécurité physique et morale des jeunes, en lien avec les familles.</li>
    <li>Investissement de 5 à 15 h par mois, développant patience, pédagogie et sens des responsabilités.</li>
</ul>`,
  },
  {
    page: 'vie-associative',
    title: `Scoute - Scouts et Guides de France`,
    location: `Gaillac`,
    date_range: `2013 - 2022`,
    image_url: null,
    link_url: null,
    context: `BÉNÉVOLAT`,
    category: `["Animation / Jeunesse","Engagement social"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Esprit d'équipe","Autonomie","Vie en plein air"]`,
    featured: 0,
    sort_order: 4,
    start_date: `2013-09`,
    end_date: `2022-08`,
    description: `<ul class="card-description">
    <li><strong>9 ans de scoutisme</strong> au sein des Scouts et Guides de France, de la branche cadette à la branche aînée.</li>
    <li>Participation régulière à des réunions hebdomadaires, week-ends et <strong>camps</strong> d'été.</li>
    <li>Développement de l'<strong>autonomie</strong>, du sens du collectif et du goût pour la vie en plein air.</li>
</ul>`,
  },

  // === PASSIONS ===
  {
    page: 'passions',
    title: `Sports`,
    location: `USOMC (Les Massives) & salle`,
    date_range: `Pratique régulière`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Sport"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Esprit d'équipe","Concentration","Implication"]`,
    featured: 0,
    sort_order: 0,
    start_date: `2025-09`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Rugby</strong> en club (USOMC – Les Massives), 2 entraînements par semaine : esprit d'équipe, combativité et solidarité.</li>
    <li><strong>Musculation</strong> : 3 séances par semaine, discipline personnelle et dépassement de soi.</li>
    <li><strong>Running</strong> : courses régulières pour l'endurance et la gestion de l'effort.</li>
    <li><strong>Surf</strong> : pratique sur la côte atlantique, lecture des conditions et patience.</li>
</ul>`,
  },
  {
    page: 'passions',
    title: `Apprentissage de la cybersécurité en autodidacte`,
    location: `Plateformes en ligne`,
    date_range: `Continu`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Cybersécurité"]`,
    languages: `[]`,
    tools: `["TryHackMe","HackTheBox","RootMe","HackThisSite"]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 1,
    sort_order: 1,
    start_date: `2024-03`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Pratique régulière du <strong>pentest</strong> sur des environnements virtuels : reconnaissance, exploitation de vulnérabilités, élévation de privilèges.</li>
    <li>Participation à des <strong>CTF</strong> (Capture The Flag) pour développer mes compétences en sécurité offensive : cryptographie, stéganographie, forensics, web.</li>
    <li>Résolution de challenges variés sur des plateformes spécialisées, avec une progression continue.</li>
    <li>Veille active sur les dernières vulnérabilités (CVE) et les techniques d'attaque/défense.</li>
    <li>Réalisation de <strong>petits projets personnels</strong> en informatique pour monter en compétences en dehors du cursus.</li>
</ul>`,
  },
  {
    page: 'passions',
    title: `Œnologie`,
    location: `EPITA - Le Kremlin-Bicêtre`,
    date_range: `Depuis 2024`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Culture / Voyage"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `[]`,
    featured: 0,
    sort_order: 2,
    start_date: `2024-01`,
    end_date: null,
    description: `<ul class="card-description">
    <li>Apprentissage des cépages, des terroirs et du processus de vinification, de la vigne à la bouteille.</li>
    <li>Présidente de l'association <strong>La Cave</strong> à l'EPITA : organisation de dégustations et de visites de domaines.</li>
    <li>Participation régulière à des dégustations commentées pour affiner le palais et la culture œnologique.</li>
</ul>`,
  },
  {
    page: 'passions',
    title: `Voyage`,
    location: `Localisations variées`,
    date_range: `Continu`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Culture / Voyage"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Ouverture culturelle"]`,
    featured: 0,
    sort_order: 3,
    start_date: `2023-01`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Tanzanie</strong> (Zanzibar) : découverte d'une culture et de paysages uniques en Afrique de l'Est.</li>
    <li><strong>Irlande</strong> (Sligo, Galway, Dublin, Cork, Belfast…) : exploration approfondie pendant mon semestre d'échange.</li>
    <li><strong>Indonésie</strong> (Jakarta, Yogyakarta, Ubud) : immersion dans la diversité culturelle et naturelle de l'archipel.</li>
    <li><strong>Roumanie</strong> (Bucarest) : découverte du patrimoine historique d'Europe de l'Est.</li>
</ul>`,
  },
  {
    page: 'passions',
    title: `Photographie`,
    location: `Localisations variées`,
    date_range: `Continu`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Culture / Voyage"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Créativité","Observation","Patience"]`,
    featured: 0,
    sort_order: 4,
    start_date: `2023-01`,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Photographie</strong> en voyage et au quotidien : cadrage, lumière, composition.</li>
    <li>Un exercice d'<strong>observation</strong> et de patience : regarder longtemps avant de déclencher, ce qui se transpose plutôt bien à l'analyse de données comme à la reconnaissance.</li>
</ul>`,
  },
  {
    page: 'passions',
    title: `Plongée sous-marine`,
    location: `Niveau 1 FFESSM`,
    date_range: `Continu`,
    image_url: null,
    link_url: null,
    context: `PERSO`,
    category: `["Sport"]`,
    languages: `[]`,
    tools: `[]`,
    libraries: `[]`,
    tags: `["Sang-froid","Curiosité","Rigueur"]`,
    featured: 0,
    sort_order: 5,
    start_date: null,
    end_date: null,
    description: `<ul class="card-description">
    <li><strong>Niveau 1 FFESSM</strong> obtenu, avec l'envie de continuer à me former sur les niveaux suivants.</li>
    <li>Une discipline qui m'a immédiatement captivée : un rapport au corps, à la pression et à l'environnement totalement différent de tous les autres sports que j'ai pratiqués, où le contrôle de la respiration et le calme priment sur la performance.</li>
    <li>Une manière d'apprendre à évoluer en équipe dans un milieu qui ne pardonne pas l'improvisation, avec un vrai plaisir à progresser palier par palier.</li>
</ul>`,
  },
];

async function seedCards() {
  // Re-seed with classification columns
  await db.execute('DELETE FROM cards');

  for (const card of cards) {
    await db.execute({
      sql: `INSERT INTO cards (page, title, subtitle, location, date_range, description, tags, image_url, link_url, featured, sort_order, start_date, end_date, context, category, languages, tools, libraries)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        card.page, card.title, card.subtitle || null, card.location || null,
        card.date_range || null, card.description, card.tags || '[]',
        card.image_url || null, card.link_url || null, card.featured || 0, card.sort_order,
        card.start_date || null, card.end_date || null,
        card.context || null, card.category || '[]', card.languages || '[]',
        card.tools || '[]', card.libraries || '[]',
      ],
    });
    console.log(`  + [${card.page}] ${card.title.replace(/<[^>]*>/g, '').substring(0, 50)}`);
  }
  console.log('Cards seeded.');
}

// ── Run ─────────────────────────────────────────────────────────────────────

try {
  await migrate();
  await seedPosts();
  await seedCards();
  console.log('Done!');
} catch (err) {
  console.error('Setup failed:', err);
  process.exit(1);
}
