/**
 * Setup script: creates tables and seeds existing posts into Turso DB.
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
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      count INTEGER DEFAULT 0
    )
  `);

  console.log('Tables created.');
}

// ── Seed posts ──────────────────────────────────────────────────────────────

const posts = [
  {
    slug: 'quand-ia-ferme-une-boucle',
    title: 'Quand l\'IA ferme une boucle. \u{1F504}',
    summary: 'L\'humain l\'a cr\u00E9\u00E9e pour gagner du temps face \u00E0 la documentation. Aujourd\'hui, elle-m\u00EAme ne cherche plus \u00E0 la lire...',
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
    title: 'Quand tes courbes racontent une histoire\u2026 incompl\u00E8te \u{1F4CA}',
    summary: 'Un trou b\u00E9ant. Puis une explosion de donn\u00E9es. Bienvenue dans la r\u00E9alit\u00E9 des bases qui ont \u00E9volu\u00E9 au fil du temps.',
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
    title: 'Comment faire parler les chiffres pour mieux les interpr\u00E9ter\u00A0? \u{1F4CA}',
    summary: 'Un r\u00E9sultat faible n\'est pas forc\u00E9ment un r\u00E9sultat inutile. Parfois, ce n\'est pas l\'effet qui est petit, c\'est le signal qui est noy\u00E9.',
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
    title: 'Gemini 3 Pro\u00A0: Un sprinter, pas un marathonien\u00A0? \u{1F3C3}',
    summary: 'J\'ai test\u00E9 la nouveaut\u00E9 de Google pour trouver une alternative plus \u00E9conomique \u00E0 Claude. Voici mon retour terrain.',
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
    title: 'La pire erreur en data\u00A0? Croire que l\'analyse commence avec les chiffres. \u{1F4CA}',
    summary: 'Avant d\'analyser quoi que ce soit, je me pose toujours les quatre m\u00EAmes questions...',
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
    title: '\u{1F4BB} Vibe Coding & IA\u00A0: Et si on arr\u00EAtait de parler de "remplacement"\u00A0?',
    summary: 'Dans mon quotidien, je vois exactement l\'inverse. L\'IA ne remplace pas, elle transforme nos m\u00E9tiers.',
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
    title: 'Salon \u00E9tudiant & atelier radio franceinfo \u{1F399}\uFE0F',
    summary: 'Pr\u00E9sente sur le stand EPITA, j\'ai \u00E9chang\u00E9 avec de nombreux lyc\u00E9ens et particip\u00E9 \u00E0 un atelier radio en direct.',
    image_url: null,
    tags: '["EPITA","SalonÉtudiant","Radio","Franceinfo"]',
    created_at: '2025-11-05',
    content: `<p>Pr\u00E9sente vendredi et dimanche sur le stand <strong>EPITA</strong>, j'ai pu \u00E9changer avec de nombreux lyc\u00E9ens curieux de d\u00E9couvrir les \u00E9tudes en informatique.</p>

<p>\u{1F399}\uFE0F J'ai aussi particip\u00E9 \u00E0 un <strong>atelier radio en direct avec franceinfo</strong>, aux c\u00F4t\u00E9s d'un journaliste et de Lina Godefroy. Une belle exp\u00E9rience pour apprendre \u00E0 prendre la parole de fa\u00E7on claire et structur\u00E9e\u2026 tout en pr\u00E9sentant notre \u00E9cole\u00A0!</p>

<p><strong>Une immersion intense mais tr\u00E8s enrichissante.</strong></p>`,
  },
  {
    slug: 'ce-que-jai-appris-restauration',
    title: '\u{1F37D}\uFE0F Ce que j\'ai appris apr\u00E8s quelques mois en restauration',
    summary: '"C\'est juste un job d\'\u00E9tudiant", para\u00EEt-il. Pourtant, j\'y ai appris \u00E0 g\u00E9rer le stress, prendre le lead, et ne jamais rester passif\u00B7ve.',
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
];

async function seed() {
  // Check if posts already exist
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

// ── Run ─────────────────────────────────────────────────────────────────────

try {
  await migrate();
  await seed();
  console.log('Done!');
} catch (err) {
  console.error('Setup failed:', err);
  process.exit(1);
}
