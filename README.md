# 👩‍💻 Célia Bocage - Portfolio Web

Bienvenue sur le dépôt GitHub de mon portfolio en ligne. Ce site, conçu comme un CV interactif, détaille mon parcours d'étudiante en ingénierie informatique à l'EPITA, mes compétences techniques, ainsi que mes projets et engagements associatifs.

## 🎯 Objectif

L'objectif principal de ce portfolio est d'appuyer mes candidatures pour un **stage en cybersécurité** (Sécurité offensive, SOC, ou analyse de vulnérabilités) pour la période de **Février à Juillet 2026**.

## 📂 Contenu du Portfolio

Le site est structuré autour de plusieurs axes détaillant mon profil :

### 🎓 **[Formations](navigation/formations.html)**
Un aperçu de mon parcours académique :
* **EPITA (2023 - Présent) :** Ingénierie informatique, Algorithmique, Mathématiques, C, C#, Python, SQL.
* **ATU Sligo, Irlande (Jan. - Juin 2025) :** Semestre international axé sur le Game Design et le développement logiciel.
* **Certifications :** BAFA (Spécialisation scoutisme) et TOEIC/TOEFL.

### 💼 **[Expériences Professionnelles](navigation/experiences.html)**
Mes expériences en entreprise :
* **Stage Data Science - ArtMajeur (4 mois) :** Analyse de données, modélisation (BERT), SQL, Python et visualisation de données.
* **Jobs d'été & saisonniers :** Commis de salle (Hôtel Eldorado 4*) et Réceptionniste en pharmacie. Développement de l'autonomie et de l'adaptabilité.

### 💻 **[Projets Techniques](navigation/projets.html)**
Présentation détaillée de mes réalisations académiques et personnelles :
* **Logiciel OCR (C) :** Résolution de mots cachés utilisant le Machine Learning et l'analyse d'image.
* **Jeu Vidéo 3D (Godot/C#) :** Modélisation Blender, scripts C# et gestion de menus dynamiques (JSON).
* **Application de Cuisine (C#/XAML) :** Gestion de recettes avec base de données SQL et LinQ.

### 🤝 **[Vie Associative](navigation/vie-associative.html)**
Mon engagement bénévole :
* **Staff' Communication EPITA :** Représentation de l'école et encadrement d'événements.
* **La Cave :** Organisation de dégustations et promotion du terroir français.
* **Scouts et Guides de France :** Animation et encadrement de jeunes (Responsabilité & Pédagogie).

### 🚩 **[Passions & Cybersécurité](navigation/passions.html)**
* **Cybersécurité (Autodidacte) :** Pratique active de CTF et Pentesting sur **TryHackMe**, **HackTheBox**, **RootMe**.
* **Loisirs :** Photographie, Voyage, Rugby, Œnologie, Surf.

---

## 🛠️ Technologies Utilisées

Ce projet privilégie la légèreté et la compatibilité :
* **HTML5 :** Structure sémantique.
* **CSS3 :** Mise en page personnalisée (fichier `assets/css/style.css`).
* **JavaScript :** Fonctionnalités dynamiques légères.

## 🚀 Installation & Visualisation

Ce site est statique. Pour le visualiser localement :

1.  Cloner ce dépôt :
    ```bash
    git clone [https://github.com/CeliaBocage/CeliaBocage.github.io.git](https://github.com/CeliaBocage/CeliaBocage.github.io.git)
    ```
2.  Ouvrir le fichier `index.html` dans votre navigateur.

## 🔐 Espace admin

Un tableau de bord privé permet de gérer le contenu sans toucher au code :

* **URL :** `/navigation/admin.html`
* **Fonctions :** créer / modifier / supprimer les **publications** et les **cartes**, consulter les **statistiques de visites** et les **messages de contact**.
* **Accès :** protégé par mot de passe (variable d'environnement `ADMIN_PASSWORD`, définie dans Vercel, jamais dans le code). Sans ce mot de passe, toute écriture est refusée.

### Statistiques de visites

Chaque vue est enregistrée dans la table `visits` avec sa date, ce qui permet un suivi par mois et par page. Deux points à connaître :

* Le **code de session** vit dans le `localStorage` du navigateur : un visiteur reste le même visiteur d'une visite à l'autre. Avant, il était en `sessionStorage` et chaque onglet comptait pour une personne différente.
* **Vos propres visites ne sont pas comptées.** Le drapeau est posé automatiquement à la connexion à l'espace admin. Pour le poser ou le retirer à la main sur un appareil : ouvrir n'importe quelle page avec `?notrack=1` ou `?notrack=0`.

L'ancien compteur sans dates est conservé sous `visits_legacy` et affiché à part : ses 48 vues cumulées ne sont pas comparables aux chiffres du journal.

### Alerte email des messages

Chaque message du formulaire de contact est **écrit en base d'abord, envoyé par email ensuite** (via [Resend](https://resend.com)). Si l'envoi échoue ou n'est pas configuré, le message reste consultable dans l'espace admin, qui affiche l'état de l'envoi (`sent`, `failed`, `pending`, `disabled`) et le bouton **Tester l'envoi d'email** pour vérifier la configuration sans attendre un vrai message.

Sans `RESEND_API_KEY` ni `CONTACT_TO_EMAIL`, tout fonctionne : il n'y a simplement pas d'alerte email.

Les modifications sont écrites directement dans la base Turso et apparaissent sur le site **sans redéploiement**.

### Variables d'environnement

Voir [`.env.example`](.env.example). À définir dans Vercel :

* Obligatoires : `TURSO_DB_URL`, `TURSO_DB_TOKEN`, `ADMIN_PASSWORD`.
* Pour l'alerte email : `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, et `MAIL_FROM` si le domaine d'envoi est vérifié dans Resend.

## 📧 Contact

Pour toute opportunité de stage ou question :

* **Email :** [celia.bocage.pro@gmail.com](mailto:celia.bocage.pro@gmail.com)
* **LinkedIn :** [Célia Bocage](https://www.linkedin.com/in/célia-bocage-549b082ab)
* **Localisation :** Le Kremlin-Bicêtre / Villejuif

---
*© 2026 Célia Bocage - Tous droits réservés.*