# Cahier des Charges — StageLink V2.0

**Plateforme de mise en relation étudiants–entreprises pour les stages**

| Champ | Valeur |
|---|---|
| **Version** | 2.0 |
| **Date** | 11 juillet 2026 |
| **Auteur** | Victor Tsimamandro |
| **Statut** | En cours de développement |

---

## 1. Présentation du projet

### 1.1 Contexte

StageLink est une application web conçue pour faciliter la mise en relation entre les étudiants à la recherche de stages et les entreprises proposant des opportunités professionnelles. Le processus de recrutement de stages reste souvent long, opaque et fragmenté pour les deux parties. Les étudiants peinent à centraliser les offres pertinentes et à suivre leurs candidatures, tandis que les entreprises manquent d'un outil dédié pour publier leurs offres et interagir directement avec les candidats.

StageLink répond à ce besoin en proposant une plateforme centralisée, intuitive et moderne qui simplifie l'ensemble du parcours — de la publication d'une offre à la programmation d'un entretien — tout en intégrant un système de messagerie, de notifications et de gestion de profils enrichis.

### 1.2 Public cible

Le s'adresse à trois catégories d'utilisateurs :

- **Étudiants** — Cherchent des stages correspondant à leurs compétences et aspirations. Ils créent un profil complet (compétences, documents, bio), parcourent les offres filtrées, déposent des candidatures, échangent avec les entreprises par messagerie et suivent l'avancement de leurs entretiens.
- **Entreprises** — Souhaitent recruter des stagiaires qualifiés. Elles publient et gèrent des offres d'emploi, examinent les candidatures reçues, programment des entretiens et communiquent directement avec les candidats intéressés.
- **Administrateurs** — Supervisent le fonctionnement de la plateforme. Ils disposent d'un tableau de bord statistique, gèrent les comptes utilisateurs (activation, bannissement), valident les entreprises, administrent les catégories d'offres et consultent les profils étudiants.

### 1.3 Stack technique

| Couche | Technologie |
|---|---|
| Backend (API) | Laravel 10+ (PHP 8.3) |
| Frontend (SPA) | React 18+ avec Vite |
| Style | Tailwind CSS |
| Base de données | MySQL 8+ (InnoDB) |
| Authentification | Laravel Sanctum (Bearer token) |
| File d'attente | Database queue |
| Mail | SMTP (Gmail) |

---

## 2. Objectifs

### 2.1 Objectif principal

Fournir un écosystème numérique fiable qui rapproche les étudiants et les entreprises autour du stage, en réduisant les frictions liées à la recherche, au dépôt de candidatures et au suivi des échanges.

### 2.2 Objectifs spécifiques

1. **Faciliter la recherche de stage** — Offrir aux étudiants un moteur de recherche puissant avec des filtres multicritères (mot-clé, ville, catégorie, type de stage, salaire) afin qu'ils trouvent rapidement des offres adaptées à leur profil.

2. **Permettre la publication et la gestion des offres** — Donner aux entreprises la possibilité de créer, modifier, publier et supprimer des offres de stage, tout en y associant des informations détaillées (description, exigences, salaire, durée, catégorie).

3. **Assurer le suivi des candidatures** — Mettre à disposition un workflow complet de candidature permettant aux étudiants de postuler avec leur CV et aux entreprises d'accepter, refuser ou proposer un entretien.

4. **Intégrer un système de messagerie** — Permettre la communication en temps réel entre étudiants et entreprises via des conversations directes, sans dépendre de sources externes.

5. **Gérer les entretiens** — Offrir aux entreprises la possibilité de programmer des entretiens avec des dates et des liens de réunion, et aux étudiants de les consulter dans un calendrier dédié.

6. **Garantir la supervision administrative** — Fournir aux administrateurs des outils de surveillance (tableau de bord, logs d'activité) et de gestion (bannissement, validation d'entreprises, administration des catégories).

---

## 3. Fonctionnalités par rôle

### 3.1 Étudiant

Le parcours étudiant est centré sur la découverte d'opportunités et la gestion de ses candidatures.

#### Inscription et authentification
- Inscription avec prénom, nom, adresse e-mail et mot de passe.
- Connexion par e-mail et mot de passe, délivrance d'un token Sanctum.
- Réinitialisation du mot de passe par e-mail.

#### Gestion de profil
- Édition du profil : prénom, nom, photo de profil, biographie, ville.
- Ajout de compétences (table `skills`) avec indication du niveau de maîtrise (débutant, intermédiaire, avancé, expert) via la table pivot `student_skills`.
- Gestion de documents personnelles : CV, diplômes, certificats (formats PDF, DOC, DOCX — max 2 Mo).
- Les documents sont stockés dans le disque local et accessibles via une URL signée.

#### Recherche et consultation d'offres
- Page de cataloguedes offres disponibles.
- Filtres de recherche : mot-clé (dans le titre et la description), ville, catégorie, type de stage (stage, alternance, CDI en alternance), fourchette de salaire.
- Page de détail d'une offre : description complète, informations sur l'entreprise, nombre de candidatures, bouton de candidature.

#### Candidature
- Possibilité de postuler directement depuis la page d'une offre en sélectionnant un CV parmi ses documents.
- Consultation du statut de ses candidatures (en attente, acceptée, refusée).
- Possibilité de retirer une candidature tant qu'elle est en attente.

#### Favoris
- Ajout et suppression d'offres en favoris.
- Page dédiée listant les offres sauvegardées.

#### Messagerie
- Démarrage d'une conversation avec une entreprise à partir de la page d'une offre ou d'une candidature.
- Envoi et réception de messages en temps réel.
- Indicateur de lecture (lu / non lu).
- Liste des conversations actives.

#### Entretiens
- Consultation des entretiens programmés par les entreprises.
- Affichage de la date, du lien de réunion et du statut.
- Historique des entretiens passés.

#### Notifications
- Réception de notifications pour les événements importants : nouvelle réponse à une candidature, nouveau message, entretien programmé, etc.
- Indicateur de lecture sur les notifications.
- Page de centre de notifications.

---

### 3.2 Entreprise

Le parcours entreprise est orienté vers la publication d'offres et la gestion des candidatures reçues.

#### Inscription et authentification
- Inscription avec nom de l'entreprise, adresse e-mail et mot de passe.
- Connexion et délivrance d'un token Sanctum.
- Réinitialisation du mot de passe par e-mail.

#### Gestion de profil
- Édition du profil entreprise : nom, description, logo (JPEG, PNG, GIF, WebP), ville, nombre d'employés.
- Le profil est visible par les étudiants consultent l'entreprise.

#### Gestion des offres (CRUD)
- Création d'une offre : titre, description, type de stage, salaire, durée, catégorie, ville.
- Modification d'une offre existante.
- Suppression d'une offre (les candidatures associées sont traitées en cascade).
- Liste des offres publiées avec statistiques (nombre de vues, candidatures reçues).
- Toggle de publication (brouillon / publié).

#### Gestion des candidatures
- Liste des candidatures reçues, triées par date.
- Visualisation du profil de l'étudiant candidat (nom, bio, compétences, documents).
- Actions sur une candidature : accepter, refuser, programmer un entretien.
- Lors de l'acceptation ou du refus, une notification est envoyée à l'étudiant.

#### Messagerie
- Démarrage d'une conversation avec un étudiant (à partir d'une candidature ou du profil de l'étudiant).
- Envoi et réception de messages.
- Indicateur de lecture.

#### Entretiens
- Programmation d'un entretien en选择nant un candidat : date et heure, lien de réunion (URL).
- Modification ou annulation d'un entretien programmé.
- Liste des entretiens à venir et passés.

#### Notifications
- Réception de notifications pour les nouveaux candidatures, messages et événements.
- Indicateur de lecture.

---

### 3.3 Administrateur

L'administrateur supervise l'ensemble de la plateforme et assure son bon fonctionnement.

#### Tableau de bord
- Statistiques globales : nombre total d'utilisateurs (étudiants, entreprises, administrateurs), nombre d'offres publiées, nombre de candidatures, nombre d'entretiens programmés.
- Graphiques de tendances (inscriptions par mois, offres par catégorie).
- Activité récente.

#### Gestion des utilisateurs
- Liste de tous les utilisateurs inscrits avec recherche et filtrage par rôle et statut.
- Actions : bannir un utilisateur (passage du statut `active` à `banned`), réactiver un compte banni.
- Réinitialisation du mot de passe d'un utilisateur depuis l'interface d'administration.
- Consultation du profil détaillé de chaque utilisateur.

#### Gestion des entreprises
- Liste des entreprises inscrites avec leur statut de validation.
- Validation d'une entreprise (passage du statut de `pending` à `active`).
- Suspension d'une entreprise (passage à `suspended`).
- Consultation des offres publiées par une entreprise.

#### Gestion des catégories
- CRUD complet des catégories d'offres (création, modification, suppression).
- Une catégorie est associée à une offre via le champ `category_id`.

#### Consultation des profils
- Accès en lecture seule aux profils étudiants (nom, bio, compétences, documents).
- Aucune modification possible depuis l'interface d'administration.

---

## 4. Architecture technique

### 4.1 Backend — API RESTful Laravel

Le backend est une API RESTful construite avec Laravel 10+. Il expose des routes vers des contrôleurs qui orchestrent la logique métier, interagissent avec la base de données via Eloquent ORM et retournent des réponses JSON.

**Principes directeurs :**
- Séparation claire entre contrôleurs, modèles, requêtes validées et ressources API.
- Utilisation de Form Request pour la validation des données entrantes.
- Utilisation de API Resources pour la transformation des modèles en JSON.
- Authentification stateless via Laravel Sanctum (token Bearer).
- Middleware CORS restreint aux domaines autorisés (`stagelink-ten.vercel.app`).

### 4.2 Frontend — Single Page Application React

Le frontend est une SPA construite avec React 18+ et Vite. Il communique avec le backend via des appels HTTP (Fetch ou Axios). Le style est assuré par Tailwind CSS, garantissant un design responsive et cohérent.

**Structure typique des pages :**
- `Login` / `Register` — Authentification
- `Home` — Page d'accueil avec recherche rapide
- `Offers` — Catalogue des offres avec filtres
- `OfferDetail` — Détail d'une offre
- `Dashboard` — Espace étudiant ou entreprise selon le rôle
- `Profile` — Édition du profil
- `Messages` — Centre de messagerie
- `Interviews` — Calendrier des entretiens
- `Admin` — Interface d'administration (Dashboard, Gestion des utilisateurs, entreprises, catégories)

### 4.3 Base de données — MySQL 8+

La base de données MySQL 8+ utilise le moteur InnoDB pour garantir l'intégrité référentielle et le support des transactions. La configuration utilise `Schema::defaultStringLength(191)` dans le service provider `AppServiceProvider` afin d'éviter les erreurs d'indexation longueur avec MariaDB.

### 4.4 File d'attente

Les tâches asynchrones (envoi d'e-mails, notifications) sont gérées par la file d'attente `database`. La configuration `QUEUE_CONNECTION=database` est requise dans le fichier `.env`.

### 4.5 Service d'e-mail

L'envoi d'e-mails (réinitialisation de mot de passe, notifications) utilise le protocole SMTP avec un serveur Gmail.

---

## 5. Nouveautés de la version 2.0

La version 2.0 de StageLink introduit plusieurs améliorations architecturales et fonctionnelles par rapport à la version initiale :

### 5.1 Normalisation des adresses — Table `cities`

Les adresses sont normalisées via une table `cities` séparée. Les profils étudiants, les offres d'emploi et les profils entreprises référencent désormais un `city_id` plutôt que de stocker une chaîne de caractères libre. Cette normalisation garantit la cohérence des données et facilite les recherches géographiques.

### 5.2 Compétences — Tables `skills` et `student_skills`

Un système de compétences structuré est introduit :
- La table `skills` contient la liste des compétences disponibles (ex. : PHP, React, Gestion de projet).
- La table pivot `student_skills` associe les étudiants à leurs compétences avec un champ `level` indiquant le niveau de maîtrise (débutant, intermédiaire, avancé, expert).

### 5.3 Documents — Table `documents`

Les étudiants peuvent stocker et gérer plusieurs documents :
- Types supportés : CV, diplôme, certificat.
- Formats acceptés : PDF, DOC, DOCX (taille maximale : 2 Mo).
- Chaque document est stocké dans le disque local avec un chemin de stockage sécurisé.

### 5.4 Traçabilité — Table `activity_logs`

Toutes les actions significatives effectuées par les utilisateurs (inscription, connexion, création d'offre, candidature, etc.) sont enregistrées dans la table `activity_logs`. Cette table contient : `user_id`, `action`, `description`, `loggable_type`, `loggable_id` et `timestamps`.

### 5.5 Séparation du nom

Le champ `name` unique est remplacé par deux champs distincts : `firstname` (prénom) et `lastname` (nom de famille). Cette séparation améliore la personnalisation des communications et la précision des données de profil.

### 5.6 Statuts utilisateur

Un champ `status` est ajouté à la table `users` avec les valeurs suivantes :
- `active` — Compte activé et fonctionnel.
- `banned` — Compte banni par un administrateur.
- `inactive` — Compte désactivé ou non confirmé.

### 5.7 Localisation des offres et entreprises

Les tables `offers` et `companies` disposent désormais d'un champ `city_id` étranger, reliant directement l'offre ou l'entreprise à une ville dans la table `cities`.

### 5.8 Catégorisation directe des offres

La relation entre les offres et les catégories est simplifiée : chaque offre possède un `category_id` direct (relation one-to-many) au lieu d'une table pivot many-to-many. Cette simplification réduit la complexité des requêtes et reflète la réalité métier (une offre appartient à une seule catégorie).

### 5.9 Conversations simplifiées

Les conversations ne sont plus liées à un stage spécifique (`internship_id`). Elles sont désormais directement associées à un étudiant et une entreprise, rendant le système de messagerie plus flexible et réutilisable au-delà d'une candidature donnée.

### 5.10 Structure des messages

La table `messages` est structurée comme suit :
- `sender_id` — Identifiant de l'expéditeur (utilisateur).
- `message` — Contenu du message (texte).
- `is_read` — Indicateur de lecture (booléen, défaut : false).
- `conversation_id` — Identifiant de la conversation parente.
- `timestamps` — Dates de création et mise à jour.

### 5.11 Entretiens

La table `interviews` est enrichie avec les champs suivants :
- `date` — Date et heure de l'entretien (type datetime).
- `meeting_link` — URL du lien de réunion (Google Meet, Zoom, etc.).
- `offer_id`, `company_id`, `student_id` — Identifiants relationnels.
- `status` — Statut de l'entretien (programmé, annulé, terminé).

### 5.12 Notifications

La table `notifications` contient :
- `title` — Titre de la notification.
- `message` — Corps du message.
- `is_read` — Indicateur de lecture (booléen).
- `user_id` — Destinataire de la notification.
- `timestamps`.

---

## 6. Contraintes techniques

### 6.1 Upload de fichiers

| Type de fichier | Formats autorisés | Taille maximale |
|---|---|---|
| CV | PDF, DOC, DOCX | 2 Mo |
| Photo de profil | JPEG, PNG, WebP | 2 Mo |
| Logo entreprise | JPEG, PNG, GIF, WebP | 2 Mo |

Les fichiers sont stockés dans le disque local (`storage/app/public`) et servis via des URLs signées.

### 6.2 Authentification

L'authentification est assurée par **Laravel Sanctum**. Chaque requête authentifiée doit inclure un header `Authorization: Bearer <token>`. Les tokens sont invalidés lors de la déconnexion.

### 6.3 Politique CORS

Le CORS est configuré pour n'autoriser que les origines suivantes :
- `https://stagelink-ten.vercel.app` (frontend en production)
- `http://localhost:5173` (frontend en développement)

### 6.4 File d'attente

La file d'attente utilise le pilote `database`. La configuration requise dans `.env` :

```
QUEUE_CONNECTION=database
```

Les migrations correspondantes (`failed_jobs`, `jobs`) doivent être appliquées.

### 6.5 Longueur des chaînes

Pour garantir la compatibilité avec MariaDB, la configuration suivante est requise dans `AppServiceProvider::boot()` :

```php
Schema::defaultStringLength(191);
```

### 6.6 Traductions

Les messages de validation et d'erreur de l'application sont traduits en français. Les fichiers de traduction se trouvent dans `lang/fr/` (validation, auth, passwords, pagination). La locale par défaut est définie par `APP_LOCALE=fr` dans `.env`.

---

## 7. Déploiement

### 7.1 Architecture de production

| Composant | Hébergeur | Détails |
|---|---|---|
| Frontend (SPA) | Vercel | Build automatique via GitHub, déploiement sur `stagelink-ten.vercel.app` |
| Backend (API) | Render | Nginx + PHP-FPM, déploiement sur `stagelink-api.onrender.com` |
| Base de données | Aiven MySQL / PlanetScale | MySQL 8+, accès distant sécurisé |

### 7.2 Variables d'environnement

Le fichier `.env` du backend doit contenir les paramètres suivants (among others) :

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://stagelink-api.onrender.com
APP_LOCALE=fr

DB_CONNECTION=mysql
DB_HOST=<host_aiven>
DB_PORT=3306
DB_DATABASE=stagelink
DB_USERNAME=<username>
DB_PASSWORD=<password>

QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<email@gmail.com>
MAIL_PASSWORD=<app_password>
MAIL_ENCRYPTION=tls

SANCTUM_STATEFUL_DOMAINS=stagelink-ten.vercel.app
```

### 7.3 Processus de déploiement

1. **Backend** : Push sur la branche `main` → Render détecte le changement et déclenche un build automatique. Les migrations sont appliquées manuellement ou via un script de post-déploiement.
2. **Frontend** : Push sur la branche `main` → Vercel reconstruit l'application et déploie la nouvelle version sur `stagelink-ten.vercel.app`.
3. **Base de données** : Les migrations sont gérées via `php artisan migrate --force` lors du déploiement du backend.

---

## 8. Contributeurs

| Rôle | Nom |
|---|---|
| Développeur fullstack | Victor Tsimamandro |

---

*Document généré le 11 juillet 2026 — StageLink V2.0*
