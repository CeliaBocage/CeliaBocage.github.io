/**
 * Ajoute de NOUVELLES publications à la base Turso, sans toucher aux existantes.
 *
 * - INSERT OR IGNORE par slug : aucun doublon, rien n'est supprimé ni écrasé.
 * - Les métadonnées (context, category, languages, tools, libraries, featured,
 *   sort_order) sont posées directement à l'insertion.
 *
 * Utilisation :
 *   TURSO_DB_URL=libsql://... TURSO_DB_TOKEN=... node scripts/add-posts.js
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

// ── Nouvelles publications ────────────────────────────────────────────────────

const newPosts = [
  {
    slug: 'db-360-la-memoire-de-lentreprise',
    title: `J'ai construit la mémoire que l'entreprise n'avait pas. 🧠🗄️`,
    summary: `La DB 360 : une timeline unique où chaque événement business est enregistré — et souvent, rentre tout seul. De l'idée au déploiement.`,
    image_url: null,
    tags: '["Data","PostgreSQL","TypeScript","DataEngineering","Artmajeur","DB360"]',
    created_at: '2026-07-12',
    context: 'STAGE',
    category: '["Data / IA"]',
    languages: '["TypeScript","SQL"]',
    tools: '["PostgreSQL","TimescaleDB","Railway"]',
    libraries: '["Kysely","Fastify"]',
    featured: 1,
    sort_order: 0,
    content: `<p>Il y a quelques mois, j'écrivais ici qu'une bonne partie du travail en data, c'est jouer les inspectrices : un pic dans un dashboard, et personne ne sait pourquoi. L'info est éclatée dans la tête de 4 personnes, entre la com', la tech et le commerce.</p>

<p>Je disais qu'il faudrait une base unique pour arrêter ça.</p>

<p><strong>Cette base, je l'ai construite. Elle s'appelle la DB 360.</strong> 🗄️</p>

<p>L'idée : une <strong>timeline de tous les événements business</strong> de l'entreprise. Une campagne marketing, une mise en prod, un changement de prix, un A/B test, une sortie produit… tout au même endroit, daté, contextualisé.</p>

<p>Comme ça, la prochaine fois qu'une courbe décroche, la réponse n'est plus dans la mémoire de quelqu'un. Elle est dans la base.</p>

<p><strong>🏗️ Ce que j'ai appris en la concevant :</strong></p>

<p><strong>1. Un bon modèle de données se lit en 5 minutes.</strong><br>
J'ai choisi un <strong>schéma en étoile</strong> : une seule table de faits (les événements) au centre, entourée de dimensions simples et nettes. Pas besoin d'être technique pour comprendre le schéma — et c'est tout l'objectif.</p>

<p><strong>2. La donnée que personne ne remplit n'existera jamais.</strong><br>
Le piège d'un tel outil, c'est de demander aux équipes de remplir un formulaire de plus. Personne ne le fait. Alors j'ai branché des <strong>connecteurs qui alimentent la base automatiquement</strong> : les releases produit remontent depuis GitHub, les coupons depuis Stripe, les publications depuis les réseaux sociaux, le reste depuis un Google Sheets.</p>

<p>👉 L'événement s'enregistre <strong>sans que personne ait à y penser.</strong></p>

<p><strong>3. Un projet data, ce n'est pas qu'une requête.</strong><br>
C'est aussi une vraie application : une API, une interface timeline, une console d'admin, une authentification par rôles, des tests, une CI, un déploiement. J'ai touché à toute la chaîne, en <strong>TypeScript</strong> sur <strong>PostgreSQL / TimescaleDB</strong>, déployée sur Railway.</p>

<p>Le plus satisfaisant ?</p>

<p>Passer d'une frustration — <em>« mais pourquoi ce pic ?! »</em> — à un outil concret qui répond à la question pour toute l'équipe, aujourd'hui et dans deux ans.</p>

<p><strong>La donnée la plus précieuse d'une entreprise, c'est celle qui n'a jamais été enregistrée. J'ai construit l'endroit où l'enregistrer. 💡</strong></p>`,
  },
  {
    slug: 'pourquoi-je-me-fais-pirater',
    title: `Pourquoi je passe mes soirées à me faire pirater (volontairement) 🛡️`,
    summary: `CTF, pentest, machines à casser sur TryHackMe et HackTheBox… Ce que la sécurité offensive m'apprend que les cours ne m'apprennent pas.`,
    image_url: null,
    tags: '["Cybersécurité","CTF","Pentest","TryHackMe","HackTheBox","RootMe"]',
    created_at: '2026-07-10',
    context: 'PERSO',
    category: '["Cybersécurité"]',
    languages: '["Python","Bash"]',
    tools: '["TryHackMe","HackTheBox","RootMe","Burp Suite","nmap"]',
    libraries: '[]',
    featured: 1,
    sort_order: 1,
    content: `<p>La plupart des gens ouvrent Netflix le soir.<br>
Moi, j'ouvre une machine vulnérable sur <strong>HackTheBox</strong> et j'essaie d'en prendre le contrôle. 😅</p>

<p>Depuis un moment, je pratique la <strong>sécurité offensive</strong> en autodidacte : CTF, pentest, énumération, exploitation… sur <strong>TryHackMe</strong>, <strong>HackTheBox</strong> et <strong>RootMe</strong>.</p>

<p>Et j'ai compris une chose que les cours classiques ne transmettent pas vraiment :</p>

<p><strong>La sécurité, ce n'est pas apprendre par cœur. C'est savoir chercher.</strong></p>

<p>Sur une machine, tu pars de rien. Une IP, un port ouvert, un service qui tourne. Et il faut :</p>
<ul>
  <li>🔎 <strong>Énumérer</strong> — ne rien laisser passer, parce que la faille est souvent dans le détail qu'on ignore.</li>
  <li>🧩 <strong>Relier les indices</strong> — un identifiant traîne ici, un fichier de conf mal protégé là… et soudain tout s'emboîte.</li>
  <li>⏳ <strong>Encaisser la frustration</strong> — bloquer 2h sur une machine, puis comprendre que la solution tenait à un rien.</li>
</ul>

<p>Ce que j'aime, c'est que ça mobilise exactement le même réflexe que la data : <strong>observer, formuler une hypothèse, tester, recommencer.</strong></p>

<p>Sauf qu'ici, le dashboard, c'est un shell. 🐚</p>

<p>Mon objectif est clair : un <strong>stage en sécurité offensive, SOC ou analyse de vulnérabilités</strong>. Et chaque machine résolue me rapproche de ce terrain-là.</p>

<p><strong>On n'apprend pas à défendre un système sans comprendre comment on l'attaque.</strong></p>`,
  },
  {
    slug: 'penser-comme-un-attaquant',
    title: `Sécuriser, c'est d'abord savoir attaquer. 🧠`,
    summary: `Le pentest m'a appris à lire un système à l'envers : non pas « comment ça marche », mais « comment ça casse ».`,
    image_url: null,
    tags: '["Cybersécurité","Pentest","OffensiveSecurity","Mindset","SécuritéOffensive"]',
    created_at: '2026-06-22',
    context: 'PERSO',
    category: '["Cybersécurité"]',
    languages: '[]',
    tools: '[]',
    libraries: '[]',
    featured: 0,
    sort_order: 2,
    content: `<p>Quand on développe, on se demande : <em>« Comment est-ce que je fais marcher ça ? »</em></p>

<p>Quand on fait du pentest, la question s'inverse : <em>« Comment est-ce que je fais casser ça ? »</em></p>

<p>Et honnêtement, ce changement de regard a transformé ma façon de coder.</p>

<p>Avant, je voyais un formulaire comme un champ à remplir.<br>
Maintenant, je vois <strong>un point d'entrée</strong>. Qu'est-ce qui se passe si j'y mets une apostrophe ? Un script ? 10 000 caractères ?</p>

<p>💡 <strong>L'état d'esprit de l'attaquant, ce n'est pas de la malveillance. C'est de la méfiance méthodique.</strong></p>

<p>C'est se dire que :</p>
<ul>
  <li>Toute entrée utilisateur est hostile jusqu'à preuve du contraire.</li>
  <li>Ce qui est « caché » n'est pas « protégé ».</li>
  <li>La faille n'est presque jamais là où le code est complexe — elle est là où on a supposé que « personne ne ferait ça ».</li>
</ul>

<p>Le plus drôle ? Depuis que je pense comme une attaquante, <strong>j'écris du code plus solide.</strong> Je valide mes entrées, je me méfie de mes propres suppositions, je teste les cas tordus.</p>

<p>La sécurité offensive et la sécurité défensive, ce ne sont pas deux camps.</p>

<p><strong>C'est la même pièce, vue des deux côtés.</strong></p>`,
  },
  {
    slug: 'apprendre-a-une-machine-a-lire',
    title: `Apprendre à une machine à lire. 👁️`,
    summary: `Un OCR codé en C, capable de résoudre une grille de mots cachés. Ce que ça m'a appris sur ce qui se passe VRAIMENT sous une IA.`,
    image_url: null,
    tags: '["C","MachineLearning","OCR","ImageProcessing","ProjetTechnique","EPITA"]',
    created_at: '2026-05-30',
    context: 'ÉCOLE',
    category: '["Développement"]',
    languages: '["C"]',
    tools: '[]',
    libraries: '[]',
    featured: 1,
    sort_order: 3,
    content: `<p>Aujourd'hui, on dit « IA » et on imagine une boîte magique.</p>

<p>Il y a quelques mois, j'ai construit cette boîte. En <strong>C</strong>. Sans magie. 🧱</p>

<p>Le projet : un <strong>logiciel OCR</strong> capable de lire une grille de mots cachés à partir d'une simple image, puis de résoudre la grille toute seule.</p>

<p>Et croyez-moi, avant qu'une machine « lise » une lettre, il se passe beaucoup de choses :</p>
<ul>
  <li>🖼️ <strong>Prétraitement de l'image</strong> — passage en niveaux de gris, binarisation, suppression du bruit. Une machine ne voit pas une lettre, elle voit des pixels.</li>
  <li>✂️ <strong>Segmentation</strong> — découper l'image en lignes, puis en caractères. Là où l'œil humain sépare tout instantanément, il faut tout expliquer au code.</li>
  <li>🧠 <strong>Reconnaissance</strong> — entraîner un réseau de neurones à associer un bloc de pixels à une lettre.</li>
</ul>

<p>La grande leçon de ce projet ?</p>

<p><strong>Coder l'intelligence « à la main » en C, c'est comprendre à quel point rien n'est évident pour une machine.</strong></p>

<p>Chaque étape que notre cerveau fait sans y penser — reconnaître un « A », ignorer une tache — devient une ligne de code, un algorithme, une décision.</p>

<p>Et c'est exactement ce qui rend l'informatique passionnante : <strong>décomposer l'évidence jusqu'à ce qu'une machine puisse la reproduire.</strong></p>`,
  },
  {
    slug: 'de-blender-au-code-jeu-3d',
    title: `De Blender au code : construire un jeu 3D de A à Z. 🎮`,
    summary: `Modélisation, scripts C#, menus dynamiques… Un projet où j'ai touché à toute la chaîne, du visuel à la logique.`,
    image_url: null,
    tags: '["GameDev","Godot","CSharp","Blender","3D","ProjetTechnique"]',
    created_at: '2026-05-05',
    context: 'ÉCOLE',
    category: '["Développement"]',
    languages: '["C#"]',
    tools: '["Godot","Blender"]',
    libraries: '["JSON"]',
    featured: 0,
    sort_order: 4,
    content: `<p>Faire un jeu vidéo, on croit que c'est « coder ».</p>

<p>En réalité, c'est enfiler dix casquettes différentes. 🎨🧑‍💻</p>

<p>Sur mon projet de <strong>jeu 3D</strong> (moteur <strong>Godot</strong>, scripts en <strong>C#</strong>), j'ai touché à toute la chaîne :</p>
<ul>
  <li>🗿 <strong>Modélisation 3D sur Blender</strong> — créer les objets, les textures, penser à ce que le joueur va voir.</li>
  <li>⚙️ <strong>Scripts C#</strong> — les déplacements, les interactions, la logique de jeu.</li>
  <li>📋 <strong>Menus dynamiques gérés en JSON</strong> — pour ne pas coder « en dur » chaque option, mais charger la configuration depuis un fichier.</li>
</ul>

<p>Ce dernier point m'a appris quelque chose que je réutilise partout depuis :</p>

<p>💡 <strong>Séparer les données de la logique.</strong></p>

<p>Un menu écrit en dur dans le code, c'est ingérable dès qu'on veut ajouter une option. Un menu décrit dans un JSON, c'est le code qui s'adapte tout seul aux données. On modifie un fichier, pas le programme.</p>

<p>C'est exactement la même philosophie que ce portfolio, d'ailleurs : le contenu vit dans une base, le code ne fait que l'afficher. 😉</p>

<p>Passer du visuel (Blender) à la logique (C#) puis à la configuration (JSON), c'est comprendre qu'un projet, ce n'est jamais une compétence isolée.</p>

<p><strong>C'est savoir faire dialoguer des briques qui, au départ, ne parlent pas la même langue.</strong></p>`,
  },
  {
    slug: 'data-et-securite-meme-combat',
    title: `Data & sécurité : le même métier d'enquêtrice. 🔗`,
    summary: `Détecter une anomalie dans un dashboard ou repérer une intrusion dans des logs… c'est le même réflexe. Je vous explique.`,
    image_url: null,
    tags: '["Data","Cybersécurité","Analyse","Anomalies","DataScience"]',
    created_at: '2026-04-15',
    context: 'STAGE',
    category: '["Data / IA","Cybersécurité"]',
    languages: '["Python","SQL"]',
    tools: '[]',
    libraries: '[]',
    featured: 0,
    sort_order: 5,
    content: `<p>On me demande souvent : <em>« Mais quel rapport entre ton stage en data et ton objectif en cybersécurité ? »</em></p>

<p>Réponse : <strong>le même réflexe d'enquêtrice.</strong> 🔍</p>

<p>Pendant mon stage chez <strong>ArtMajeur</strong>, mon travail consiste souvent à repérer une anomalie dans un jeu de données : un pic qui ne devrait pas être là, une courbe qui décroche, un chiffre qui ne « fait pas sens métier ».</p>

<p>En sécurité, c'est rigoureusement la même chose, appliqué à d'autres données :</p>
<ul>
  <li>📊 En data : <em>« Pourquoi ce pic de ventes le 12 ? »</em></li>
  <li>🛡️ En sécu : <em>« Pourquoi cette connexion à 3h du matin depuis une IP inconnue ? »</em></li>
</ul>

<p>Dans les deux cas, la démarche est identique :</p>
<ul>
  <li>Établir ce qui est <strong>normal</strong> (la baseline).</li>
  <li>Repérer ce qui <strong>s'en écarte</strong>.</li>
  <li>Reconstituer <strong>l'histoire</strong> derrière l'écart.</li>
  <li>Distinguer le <strong>signal</strong> du <strong>bruit</strong>.</li>
</ul>

<p>💡 La détection d'intrusion, la chasse aux menaces (<em>threat hunting</em>), l'analyse SOC… c'est de l'analyse de données appliquée à la sécurité.</p>

<p>Ce que j'apprends à faire parler chez ArtMajeur — des chiffres — je veux le faire parler demain sur des logs, des flux réseau, des comportements.</p>

<p><strong>La donnée ne ment pas. Elle attend juste quelqu'un qui sache poser les bonnes questions.</strong></p>`,
  },
];

// ── Insertion (additive, idempotente) ─────────────────────────────────────────

async function addPosts() {
  let added = 0;
  for (const post of newPosts) {
    const result = await db.execute({
      sql: `INSERT OR IGNORE INTO posts
              (slug, title, summary, content, tags, image_url,
               context, category, languages, tools, libraries,
               featured, sort_order, published, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [
        post.slug, post.title, post.summary, post.content, post.tags, post.image_url,
        post.context, post.category, post.languages, post.tools, post.libraries,
        post.featured, post.sort_order, post.created_at,
      ],
    });
    if (result.rowsAffected > 0) {
      console.log(`  + ${post.slug}`);
      added++;
    } else {
      console.log(`  = ${post.slug} (déjà présent, ignoré)`);
    }
  }
  console.log(`\nTerminé : ${added} nouvelle(s) publication(s) ajoutée(s), ${newPosts.length - added} déjà présente(s).`);
}

try {
  await addPosts();
} catch (err) {
  console.error('Échec de l\'ajout des posts :', err);
  process.exit(1);
}
