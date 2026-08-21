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
    summary: `La DB 360 : une timeline unique où chaque événement business est enregistré et, souvent, rentre tout seul. De l'idée au déploiement.`,
    image_url: null,
    tags: '["Data","MongoDB","DataEngineering","Weborama","DB360","Traçabilité"]',
    created_at: '2026-07-12',
    context: `STAGE`,
    category: '["Data / IA"]',
    languages: '["JavaScript","SQL"]',
    tools: '["MongoDB","Docker","Railway","Grafana"]',
    libraries: '["Node.js","API REST"]',
    featured: 1,
    sort_order: 0,
    content: `<p>Il y a quelques mois, j'écrivais ici qu'une bonne partie du travail en data, c'est jouer les inspectrices : un pic dans un dashboard, et personne ne sait pourquoi. L'info est éclatée dans la tête de 4 personnes, entre la com', la tech et le commerce. Ce constat, je l'ai fait pendant mon stage data chez <strong>ArtMajeur</strong>.</p>

<p>Je disais qu'il faudrait une base unique pour arrêter ça.</p>

<p><strong>Cette base, je l'ai construite. Elle s'appelle la DB 360.</strong> 🗄️</p>

<p>L'idée : une <strong>timeline de tous les événements business</strong> de l'entreprise. Une campagne marketing, une mise en prod, un changement de prix, un A/B test, une sortie produit… tout au même endroit, daté, contextualisé.</p>

<p>Comme ça, la prochaine fois qu'une courbe décroche, la réponse n'est plus dans la mémoire de quelqu'un. Elle est dans la base.</p>

<p><strong>🏗️ Ce que j'ai appris en la concevant :</strong></p>

<p><strong>1. Un bon modèle de données se lit en 5 minutes.</strong><br>
Un seul type d'objet au centre, l'<strong>événement horodaté</strong>, avec juste ce qu'il faut de champs pour le situer : quand, quoi, qui, quelle source, quel périmètre. Pas besoin d'être technique pour comprendre le modèle, et c'est tout l'objectif : les équipes qui l'alimentent ne sont pas des développeurs.</p>

<p><strong>2. La donnée que personne ne remplit n'existera jamais.</strong><br>
Le piège d'un tel outil, c'est de demander aux équipes de remplir un formulaire de plus. Personne ne le fait. Alors j'ai branché des <strong>connecteurs qui alimentent la base automatiquement</strong> : les releases produit remontent depuis GitHub, les coupons depuis Stripe, les publications depuis les réseaux sociaux, le reste depuis un Google Sheets.</p>

<p>👉 L'événement s'enregistre <strong>sans que personne ait à y penser.</strong></p>

<p><strong>3. Un projet data, ce n'est pas qu'une requête.</strong><br>
C'est aussi une vraie application : une <strong>API REST</strong>, un modèle d'événements sur <strong>MongoDB</strong>, une source de données branchée sur <strong>Grafana</strong> pour corréler les événements aux métriques, le tout conteneurisé avec <strong>Docker</strong> et déployé sur <strong>Railway</strong>. J'ai touché à toute la chaîne, du constat à la mise en production.</p>

<p>Le plus satisfaisant ?</p>

<p>Passer d'une frustration (<em>« mais pourquoi ce pic ?! »</em>) à un outil concret qui répond à la question pour toute l'équipe, aujourd'hui et dans deux ans.</p>

<p><strong>La donnée la plus précieuse d'une entreprise, c'est celle qui n'a jamais été enregistrée. J'ai construit l'endroit où l'enregistrer. 💡</strong></p>

<p><em>Le besoin est né de mes analyses chez ArtMajeur ; la conception et la mise en production ont eu lieu pendant mon stage Tech chez Weborama (mai - août 2026).</em></p>`,
  },
  {
    slug: 'pourquoi-je-me-fais-pirater',
    title: `Pourquoi je passe mes soirées à me faire pirater (volontairement) 🛡️`,
    summary: `CTF, pentest, machines à casser sur TryHackMe et HackTheBox… Ce que la sécurité offensive m'apprend que les cours ne m'apprennent pas.`,
    image_url: null,
    tags: '["Cybersécurité","CTF","Pentest","TryHackMe","HackTheBox","RootMe"]',
    created_at: '2026-07-10',
    context: `PERSO`,
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
  <li>🔎 <strong>Énumérer</strong> : ne rien laisser passer, parce que la faille est souvent dans le détail qu'on ignore.</li>
  <li>🧩 <strong>Relier les indices</strong> : un identifiant traîne ici, un fichier de conf mal protégé là… et soudain tout s'emboîte.</li>
  <li>⏳ <strong>Encaisser la frustration</strong> : bloquer 2h sur une machine, puis comprendre que la solution tenait à un rien.</li>
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
    context: `PERSO`,
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
  <li>La faille n'est presque jamais là où le code est complexe, elle est là où on a supposé que « personne ne ferait ça ».</li>
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
    context: `ÉCOLE`,
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
  <li>🖼️ <strong>Prétraitement de l'image</strong> : passage en niveaux de gris, binarisation, suppression du bruit. Une machine ne voit pas une lettre, elle voit des pixels.</li>
  <li>✂️ <strong>Segmentation</strong> : découper l'image en lignes, puis en caractères. Là où l'œil humain sépare tout instantanément, il faut tout expliquer au code.</li>
  <li>🧠 <strong>Reconnaissance</strong> : entraîner un réseau de neurones à associer un bloc de pixels à une lettre.</li>
</ul>

<p>La grande leçon de ce projet ?</p>

<p><strong>Coder l'intelligence « à la main » en C, c'est comprendre à quel point rien n'est évident pour une machine.</strong></p>

<p>Chaque étape que notre cerveau fait sans y penser (reconnaître un « A », ignorer une tache) devient une ligne de code, un algorithme, une décision.</p>

<p>Et c'est exactement ce qui rend l'informatique passionnante : <strong>décomposer l'évidence jusqu'à ce qu'une machine puisse la reproduire.</strong></p>`,
  },
  {
    slug: 'de-blender-au-code-jeu-3d',
    title: `De Blender au code : construire un jeu 3D de A à Z. 🎮`,
    summary: `Modélisation, scripts C#, menus dynamiques… Un projet où j'ai touché à toute la chaîne, du visuel à la logique.`,
    image_url: null,
    tags: '["GameDev","Godot","CSharp","Blender","3D","ProjetTechnique"]',
    created_at: '2026-05-05',
    context: `ÉCOLE`,
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
  <li>🗿 <strong>Modélisation 3D sur Blender</strong> : créer les objets, les textures, penser à ce que le joueur va voir.</li>
  <li>⚙️ <strong>Scripts C#</strong> : les déplacements, les interactions, la logique de jeu.</li>
  <li>📋 <strong>Menus dynamiques gérés en JSON</strong> : pour ne pas coder « en dur » chaque option, mais charger la configuration depuis un fichier.</li>
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
    context: `STAGE`,
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

<p>Ce que j'apprends à faire parler chez ArtMajeur (des chiffres), je veux le faire parler demain sur des logs, des flux réseau, des comportements.</p>

<p><strong>La donnée ne ment pas. Elle attend juste quelqu'un qui sache poser les bonnes questions.</strong></p>`,
  },
  {
    slug: 'mcp-nouvelle-surface-attaque',
    title: `Un serveur MCP, c'est une porte d'entrée. Qui la garde ? 🔐`,
    summary: `Le Model Context Protocol standardise l'accès des agents IA aux outils de l'entreprise. Il standardise donc aussi la surface d'attaque. Ce que mon stage en gouvernance IA m'a appris.`,
    image_url: null,
    tags: '["Cybersécurité","MCP","IA","GouvernanceIA","LLM","Weborama"]',
    created_at: '2026-08-14',
    context: `STAGE`,
    category: '["Cybersécurité","Data / IA"]',
    languages: '["Python","TypeScript"]',
    tools: '["Claude Code","MCP","JSON-RPC","GitHub API"]',
    libraries: '[]',
    featured: 1,
    sort_order: 0,
    content: `<p>Pendant mon stage Tech chez <strong>Weborama</strong>, j'ai passé quatre mois sur le MCP interne : revue de PRs, développement de skills, synchronisation des configurations sur les postes. Et j'en ressors avec une conviction que je n'avais pas en arrivant.</p>

<p><strong>Commençons par le problème que MCP résout.</strong></p>

<p>Sans standard, brancher un LLM sur les outils d'une entreprise, c'est écrire un connecteur sur mesure par couple modèle × outil. N modèles, M outils, N × M connecteurs à maintenir. Le <strong>Model Context Protocol</strong> définit une interface commune : un serveur écrit une fois est consommable par n'importe quel client compatible. On passe de N × M à N + M.</p>

<p>Techniquement : un hôte (l'application, par exemple Claude Code) embarque un <strong>client MCP</strong> qui parle à des <strong>serveurs MCP</strong> en JSON-RPC : stdio en local, HTTP/SSE à distance. Un serveur expose trois primitives : des <strong>tools</strong> (les actions que le modèle peut appeler), des <strong>resources</strong> (des données lisibles, adressées par URI) et des <strong>prompts</strong> (des modèles d'invite réutilisables). Le modèle découvre les capacités à l'exécution : rien n'est codé en dur.</p>

<p>C'est élégant. Et c'est précisément ce qui m'inquiète. 🧐</p>

<p><strong>Ce qu'on vient de créer, c'est un point d'entrée unique et documenté vers les systèmes internes.</strong> Base de données, API métier, Git. Un serveur MCP n'est pas un détail d'intégration : c'est une <strong>surface d'attaque</strong>, et un point de contrôle de sécurité à part entière.</p>

<p>Les quatre réflexes que j'ai vus se construire :</p>

<p><strong>1. La portée des outils au strict nécessaire.</strong> Un tool qui peut lire toute la base parce que c'était plus simple à écrire, c'est un tool qui pourra exfiltrer toute la base.</p>

<p><strong>2. Les secrets restent côté serveur.</strong> Jamais dans le contexte du modèle. Un contexte, ça se logue, ça se met en cache, ça part chez un fournisseur tiers.</p>

<p><strong>3. Les sorties d'outils sont des données non fiables.</strong> C'est l'<strong>injection de prompt indirecte</strong> : le contenu d'une page web ou d'un ticket que l'outil rapporte peut contenir des instructions. Le modèle ne fait pas la différence entre « voici la donnée » et « voici ce que tu dois faire ». Nous, si, à condition d'y avoir pensé avant.</p>

<p><strong>4. Validation humaine sur le destructif, journalisation de tous les appels.</strong> Un appel d'outil non consigné est un appel qu'on ne pourra pas auditer.</p>

<p>Ajoutez à cela des <strong>citizen developers</strong>, des collègues non-développeurs outillés par l'IA, qui produisent maintenant du code utile. C'était l'autre moitié de mon stage : les accompagner, animer des workshops, et surtout parler d'hygiène des secrets avant que le sujet ne se règle tout seul, mal.</p>

<p><strong>Les agents IA en interne ne créent pas des risques nouveaux dans leur nature. Ils créent une porte de plus, mieux documentée que les autres. 🚪</strong></p>`,
  },
  {
    slug: 'ce-qui-nest-pas-ecrit-nexiste-pas',
    title: `La variation que personne ne savait expliquer. 🕰️`,
    summary: `Une variation forte restée inexpliquée, cinq personnes à interroger, et aucune date retrouvable. L'histoire qui m'a convaincue que la traçabilité n'est pas un sujet de documentation, mais de mémoire.`,
    image_url: null,
    tags: '["Data","Traçabilité","Analyse","DB360","Post-mortem"]',
    created_at: '2026-08-04',
    context: `STAGE`,
    category: '["Data / IA"]',
    languages: '["SQL","Python"]',
    tools: '["PostgreSQL"]',
    libraries: '["pandas"]',
    featured: 1,
    sort_order: 0,
    content: `<p>Chez <strong>ArtMajeur</strong>, une plateforme qui réunit des milliers d'artistes, je tombe un jour sur une anomalie dans les données : une <strong>variation forte sur un segment du catalogue</strong>, sans explication dans les chiffres. 📊</p>

<p>Alors je fais ce qu'on fait dans ce cas : je demande. Une personne, puis deux, puis <strong>cinq</strong>. Et petit à petit, une hypothèse se reconstitue : une opération passée, dont plus personne n'a la date exacte.</p>

<p>Une hypothèse. Reconstituée à l'oral. Et surtout : <strong>impossible de dater l'événement.</strong></p>

<p>L'opération n'était écrite nulle part. Elle n'existait que dans la mémoire de deux personnes.</p>

<p><strong>C'est là que le déclic s'est produit.</strong> 💡</p>

<p>Mon problème n'était pas l'analyse. Mon analyse allait très bien. Mon problème, c'était l'<strong>absence de mémoire</strong>. Une donnée sans son contexte n'est pas interprétable, et un contexte qui n'est pas écrit disparaît avec les gens qui le portaient.</p>

<p>J'ai proposé une base d'événements horodatés, internes et externes, corrélable aux métriques : <strong>DB360</strong>. Releases, campagnes, incidents, faits extérieurs. Pour que la cause d'un écart soit <em>interrogeable</em> au lieu d'être recollée à l'oral. J'ai porté l'idée jusqu'au déploiement en production, pendant mon stage suivant.</p>

<p><strong>Et c'est en cybersécurité que cette leçon m'a le plus servi.</strong></p>

<p>Parce que la phrase est exactement la même. Un incident non documenté est un incident qui se reproduira. Sans journal horodaté, il n'y a <strong>ni post-mortem, ni apprentissage</strong>, juste des gens qui se souviennent à peu près, et qui finiront par partir.</p>

<p>Le SIEM, les logs applicatifs, la journalisation des appels d'outils d'un agent IA : ce sont toutes des réponses au même problème. Pas « garder une trace au cas où ». <strong>Rendre le passé interrogeable.</strong></p>

<p><strong>Ce qui n'est pas écrit n'existe pas. Je n'ai plus jamais regardé un dashboard de la même façon. 🕰️</strong></p>

<p><em>Une précision d'honnêteté : la date exacte de cette opération, je ne l'ai jamais retrouvée. C'est tout le sujet de l'histoire.</em></p>`,
  },
  {
    slug: 'contribution-koan-72-lancements',
    title: `72 lancements manuels. J'en ai fait un. 🔁`,
    summary: `Ma contribution à Kōan, l'agent IA autonome open source d'Anantys : peu de lignes de code, mais celles qui font passer un outil du stade démonstration au stade exploitable.`,
    image_url: null,
    tags: '["OpenSource","Python","IA","Automatisation","Kōan","AgentIA"]',
    created_at: '2026-07-26',
    context: `PERSO`,
    category: '["Informatique","Data / IA"]',
    languages: '["Python"]',
    tools: '["Git","Docker","GitHub"]',
    libraries: '[]',
    featured: 0,
    sort_order: 0,
    content: `<p>Une précision d'abord, parce qu'elle compte : <strong>Kōan n'est pas mon projet.</strong> C'est un <strong>agent IA autonome open source</strong> publié par <strong>Anantys</strong> : « an autonomous AI agent that works while you sleep ». Environ 24 000 lignes de Python. Moi, j'y ai <strong>contribué</strong>. 🧑‍💻</p>

<p>Ce que fait Kōan : il exploite du quota de modèle inutilisé pour exécuter en tâche de fond des <strong>revues de code</strong>, des corrections de bugs et des analyses de codebase. File de missions partagée, cycle de vie des tâches, modes de budget adaptatifs, mémoire isolée par projet, pilotage par messagerie.</p>

<p>Et un détail d'architecture que je trouve exemplaire : il travaille sur des branches <code>koan/*</code> et n'ouvre que des <strong>pull requests en brouillon</strong>. <strong>Jamais de commit direct sur <code>main</code>.</strong> Un agent autonome avec un accès en écriture à vos dépôts, c'est une surface d'attaque, et là, le garde-fou est dans la conception, pas dans la bonne volonté de l'utilisateur. 🔒</p>

<p><strong>Maintenant, ma contribution. Elle est modeste, et c'est tout l'intérêt de l'histoire.</strong></p>

<p>L'outil ne s'appliquait qu'à <strong>un dépôt par exécution</strong>. Pour couvrir l'ensemble du parc, il fallait le relancer… <strong>72 fois. À la main.</strong></p>

<p>J'ai ajouté la <strong>boucle d'itération sur les dépôts</strong>. Une seule exécution couvre désormais tout le parc.</p>

<p>C'est peu de code. Mais 72 lancements manuels, c'est exactement le genre de friction qui <strong>condamne un outil</strong> : personne ne le fait de façon fiable, donc personne ne l'adopte vraiment, donc l'outil meurt sans que personne l'éteigne. Supprimer cette friction, c'est le faire passer du stade <em>démonstration</em> au stade <em>exploitable en production</em>. 🚀</p>

<p><strong>Ce que ça m'a appris, et que je ne savais pas avant :</strong></p>

<p><strong>1. Lire du code écrit par quelqu'un d'autre est une compétence à part entière.</strong><br>
24 000 lignes de Python, des conventions qui ne sont pas les miennes, un processus de revue à respecter. On n'arrive pas dans un projet open source en proposant sa façon de faire.</p>

<p><strong>2. Le point de friction réel n'est presque jamais le symptôme apparent.</strong><br>
On aurait pu écrire un script shell qui lance Kōan 72 fois. Ça aurait « marché ». Le vrai problème était à l'intérieur de la boucle d'exécution, pas autour.</p>

<p><strong>3. L'impact d'une contribution ne se mesure pas en lignes.</strong><br>
C'est la leçon que je garde. La valeur ajoutée d'un développeur n'est pas proportionnelle au volume produit.</p>

<p>J'ai aussi vu cet outil passer du dépôt public au <strong>déploiement interne</strong>, avec des missions liées au contexte métier de l'entreprise. C'est cette instance qui alimente <strong>DB360</strong>, la base d'événements que j'ai conçue : Kōan exécute ses missions et écrit le résultat dans la base, que j'ai raccordée à l'agent via <strong>MCP</strong>. Aucune saisie manuelle.</p>

<p>Voir un projet open source franchir le pas de l'adoption réelle, ça pose une question que le code ne pose pas tout seul : <strong>un outil n'existe que s'il est utilisé.</strong> 🎯</p>`,
  },
  {
    slug: 'raisonner-couche-par-couche',
    title: `Sept couches, sept surfaces d'attaque. 🧅`,
    summary: `Le modèle OSI, on l'apprend pour l'examen. Mais c'est en CTF que j'ai compris à quoi il sert vraiment : arrêter de deviner, et isoler la couche fautive.`,
    image_url: null,
    tags: '["Cybersécurité","Réseaux","OSI","TCP","Wireshark","CTF"]',
    created_at: '2026-07-18',
    context: `PERSO`,
    category: '["Cybersécurité"]',
    languages: '[]',
    tools: '["Wireshark","Nmap","tcpdump","Burp Suite","netcat"]',
    libraries: '[]',
    featured: 0,
    sort_order: 0,
    content: `<p>Le modèle OSI, tout le monde l'apprend. Sept couches, on récite, on passe l'examen, on oublie. 📚</p>

<p>Ce qui m'a fait le comprendre pour de vrai, ce sont les <strong>CTF</strong>. Parce que devant une machine qui ne répond pas comme prévu, on a deux options : deviner, ou <strong>descendre la pile</strong>.</p>

<p><strong>Ce que le modèle apporte vraiment : une méthode.</strong></p>

<p>Chaque couche ajoute son en-tête en descendant la pile, et le retire en remontant. C'est cette <strong>encapsulation</strong> qui rend le débogage méthodique possible : le problème vit dans une couche, une seule, et on peut l'isoler. Le câble ou le signal (L1) ? Les trames et l'ARP (L2) ? L'adressage et le routage (L3) ? Les ports et l'état TCP (L4) ? Ou une bêtise applicative en L7 ?</p>

<p>Au passage : la pile réelle, TCP/IP, en condense quatre. OSI reste le <strong>vocabulaire commun</strong> pour désigner un problème à quelqu'un d'autre, c'est déjà énorme.</p>

<p><strong>Et la lecture sécurité, elle, tient dans une phrase : chaque couche a ses attaques.</strong> 🎯</p>

<p>L2, l'ARP spoofing et le MAC flooding. L3, l'IP spoofing et le scan réseau. L4, le SYN flood et le balayage de ports. L7, l'injection, le XSS, l'authentification mal gérée. Un <em>defense-in-depth</em> ne se raisonne pas autrement que couche par couche.</p>

<p><strong>Un exemple qui m'a marquée : TCP contre UDP.</strong></p>

<p>On présente souvent ça comme une préférence. C'est un <strong>arbitrage fiabilité contre latence</strong>. TCP ouvre une connexion (SYN / SYN-ACK / ACK), numérote, acquitte, retransmet, contrôle la congestion, au prix d'une latence d'établissement et de 20 octets d'en-tête minimum. UDP a un en-tête de 8 octets, aucun acquittement, aucun réordonnancement. On le choisit quand perdre un paquet coûte moins cher qu'attendre : DNS, DHCP, VoIP, jeux, et QUIC/HTTP3 qui reconstruit la fiabilité au-dessus.</p>

<p>Savoir <em>pourquoi</em> le DNS tient en UDP (et bascule en TCP au-delà de 512 octets ou pour un transfert de zone) vaut mieux que savoir <em>que</em> le DNS est en UDP.</p>

<p>Et ce même arbitrage explique les attaques : la poignée de main en trois temps est la base du <strong>SYN flood</strong> et des scans Nmap (SYN semi-ouvert contre connect scan) ; UDP est sans état, donc trivial à usurper, ce qui en fait le vecteur des <strong>amplifications DNS et NTP</strong>.</p>

<p>Aujourd'hui, quand j'ouvre une capture dans <strong>Wireshark</strong>, je ne vois plus des lignes. Je vois des couches encapsulées, chacune avec sa surface d'attaque.</p>

<p><strong>On ne débogue pas un réseau à l'intuition. On l'épluche. 🧅</strong></p>`,
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
