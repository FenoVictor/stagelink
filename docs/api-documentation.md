# StageLink V2.0 - Documentation API

> Plateforme de mise en relation entre étudiants et entreprises pour les stages.

---

## Table des matières

1. [Informations générales](#informations-générales)
2. [Routes publiques](#routes-publiques)
3. [Routes authentifiées (tous rôles)](#routes-authentifiées-tous-rôles)
4. [Routes Étudiant](#routes-étudiant)
5. [Routes Entreprise](#routes-entreprise)
6. [Routes Admin](#routes-admin)
7. [Modèles de données](#modèles-de-données)

---

## Informations générales

| Élément | Valeur |
|---------|--------|
| **Base URL** | `https://stagelink-api.onrender.com/api` |
| **Format** | JSON (`Content-Type: application/json`) |
| **Authentification** | Bearer token via Laravel Sanctum |
| **Version** | V2.0 |

### Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```
Authorization: Bearer <token>
```

Le token est obtenu via les endpoints `/register` ou `/login`.

### Codes de statut standards

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Requête invalide |
| `401` | Non authentifié |
| `403` | Non autorisé |
| `404` | Ressource introuvable |
| `409` | Conflit (ex: double candidature) |
| `422` | Erreur de validation |
| `500` | Erreur serveur |

### Réponses d'erreur standard

```json
{
  "message": "Description de l'erreur",
  "errors": {
    "champ": ["Erreur de validation spécifique"]
  }
}
```

---

## Routes publiques

### Inscription

```
POST /api/register
```

Crée un nouveau compte utilisateur. Selon le rôle, un profil étudiant ou une entreprise est automatiquement créé.

**Body (FormData) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `firstname` | string | Oui | Prénom (max 100) |
| `lastname` | string | Oui | Nom (max 100) |
| `email` | string | Oui | Email unique |
| `password` | string | Oui | Mot de passe (min 8, confirmation requise) |
| `password_confirmation` | string | Oui | Confirmation du mot de passe |
| `role` | string | Oui | `student` ou `company` |
| `company_name` | string | Non | Nom de l'entreprise (si role=company) |
| `description` | string | Non | Description de l'entreprise (si role=company) |
| `website` | string | Non | Site web (URL, si role=company) |
| `location` | string | Non | Localisation (si role=company) |
| `industry` | string | Non | Secteur d'activité (si role=company) |

**Réponse (201) :**

```json
{
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com",
    "role": "student",
    "status": "active",
    "created_at": "2026-01-15T10:30:00.000000Z"
  },
  "token": "1|abc123def456..."
}
```

---

### Connexion

```
POST /api/login
```

Authentifie un utilisateur et retourne un token Sanctum.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | string | Oui | Email de l'utilisateur |
| `password` | string | Oui | Mot de passe |

**Réponse (200) :**

```json
{
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com",
    "role": "student",
    "status": "active"
  },
  "token": "2|xyz789ghi012..."
}
```

**Erreur (422) :**

```json
{
  "message": "Les données envoyées sont invalides.",
  "errors": {
    "email": ["L'adresse email ou le mot de passe est incorrect."]
  }
}
```

---

### Liste des offres de stage

```
GET /api/internships
```

Retourne la liste paginée des offres de stage ouvertes. Les offres sont liées à leur entreprise, catégorie et ville.

**Paramètres de requête (query) :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `keyword` | string | Recherche par mot-clé (titre, description, requirements) |
| `city` | string | Filtre par nom de ville (recherche partielle) |
| `category` | integer | ID de la catégorie |
| `company` | string | Filtre par nom d'entreprise (recherche partielle) |
| `type` | string | Type de stage : `remote`, `onsite`, `hybrid` |
| `salary_min` | number | Salaire minimum |
| `salary_max` | number | Salaire maximum |
| `sort` | string | Champ de tri : `created_at`, `title`, `salary`, `location`, `views_count` (défaut : `created_at`) |
| `order` | string | Direction : `asc` ou `desc` (défaut : `desc`) |
| `per_page` | integer | Résultats par page (défaut : 12, max : 50) |

**Réponse (200) :**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Développeur Full Stack",
      "description": "Recherche développeur React/Node...",
      "requirements": "HTML, CSS, JavaScript, React",
      "location": "Antananarivo",
      "type": "hybrid",
      "salary": 1500000,
      "duration": "3 mois",
      "slots": 2,
      "deadline": "2026-03-30",
      "status": "open",
      "views_count": 42,
      "company": {
        "id": 5,
        "name": "TechCorp Madagascar",
        "logo": "logos/techcorp.png"
      },
      "category": {
        "id": 1,
        "name": "Informatique"
      },
      "city": {
        "id": 1,
        "name": "Antananarivo"
      },
      "is_favorited": false,
      "created_at": "2026-01-10T08:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://stagelink-api.onrender.com/api/internships?page=1",
    "last": "https://stagelink-api.onrender.com/api/internships?page=5",
    "prev": null,
    "next": "https://stagelink-api.onrender.com/api/internships?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 58
  }
}
```

> **Note V2.0 :** Le champ `is_favorited` est ajouté uniquement si l'utilisateur est authentifié. Les filtres `keyword`, `city` et `company` remplacent l'ancien paramètre `search`.

---

### Détail d'une offre

```
GET /api/internships/{id}
```

Retourne le détail complet d'une offre de stage. Incrémente le compteur de vues.

**Réponse (200) :**

```json
{
  "internship": {
    "id": 1,
    "title": "Développeur Full Stack",
    "description": "Recherche développeur React/Node pour projet SaaS...",
    "requirements": "HTML, CSS, JavaScript, React, Node.js",
    "location": "Antananarivo",
    "type": "hybrid",
    "salary": 1500000,
    "duration": "3 mois",
    "slots": 2,
    "deadline": "2026-03-30",
    "status": "open",
    "views_count": 43,
    "company": {
      "id": 5,
      "name": "TechCorp Madagascar",
      "description": "Entreprise spécialisée en développement web...",
      "logo": "logos/techcorp.png",
      "website": "https://techcorp.mg"
    },
    "category": {
      "id": 1,
      "name": "Informatique"
    },
    "city": {
      "id": 1,
      "name": "Antananarivo"
    },
    "created_at": "2026-01-10T08:00:00.000000Z"
  },
  "applications_count": 12,
  "is_favorited": true
}
```

> **Note V2.0 :** La réponse inclut `applications_count` et `is_favorited` (si authentifié).

---

### Liste des villes

```
GET /api/cities
```

Retourne la liste de toutes les villes disponibles.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "name": "Antananarivo",
    "province": "Analamanga"
  },
  {
    "id": 2,
    "name": "Toamasina",
    "province": "Atsinanana"
  },
  {
    "id": 3,
    "name": "Fianarantsoa",
    "province": "Haute Matsiatra"
  }
]
```

---

### Liste des compétences

```
GET /api/skills
```

Retourne la liste de toutes les compétences disponibles.

**Réponse (200) :**

```json
[
  { "id": 1, "name": "JavaScript" },
  { "id": 2, "name": "PHP" },
  { "id": 3, "name": "Python" },
  { "id": 4, "name": "React" },
  { "id": 5, "name": "Laravel" }
]
```

---

## Routes authentifiées (tous rôles)

Ces routes nécessitent un token valide, quel que soit le rôle de l'utilisateur.

### Profil utilisateur connecté

```
GET /api/user
```

Retourne les informations complètes de l'utilisateur connecté, y compris son profil (entreprise ou étudiant) et ses candidatures.

**Réponse (200) :**

```json
{
  "id": 1,
  "name": "Jean Dupont",
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com",
  "role": "student",
  "status": "active",
  "phone": "+261 34 00 000 00",
  "companyProfile": null,
  "studentProfile": {
    "id": 1,
    "bio": "Étudiant en informatique passionné",
    "school": "Université de Fianarantsoa",
    "major": "Génie Logiciel",
    "graduation_year": 2027,
    "city": { "id": 1, "name": "Antananarivo" }
  },
  "applications": []
}
```

---

### Déconnexion

```
POST /api/logout
```

Supprime le token d'authentification courant.

**Réponse (200) :**

```json
{
  "message": "Déconnexion réussie."
}
```

---

### Recherche d'utilisateurs

```
GET /api/users/search?q=<terme>
```

Recherche des utilisateurs par nom, prénom, email ou téléphone. Utile pour initialiser une conversation.

**Paramètres :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `q` | string | Oui | Terme de recherche (min 2 caractères) |

**Réponse (200) :**

```json
[
  {
    "id": 10,
    "name": "Marie Rakoto",
    "firstname": "Marie",
    "lastname": "Rakoto",
    "email": "marie@example.com",
    "phone": "+261 33 11 222 33",
    "role": "company"
  }
]
```

> **Note :** L'utilisateur courant est exclu des résultats. Limite de 10 résultats.

---

## Routes Étudiant

Ces routes nécessitent un token valide avec le rôle `student`.

### Voir profil étudiant

```
GET /api/student/profile
```

Retourne le profil complet de l'étudiant connecté.

**Réponse (200) :**

```json
{
  "id": 1,
  "user_id": 1,
  "phone": "+261 34 00 000 00",
  "bio": "Étudiant en informatique passionné par le web",
  "skills": "JavaScript, PHP, React",
  "school": "Université de Fianarantsoa",
  "major": "Génie Logiciel",
  "graduation_year": 2027,
  "github": "https://github.com/jeandupont",
  "portfolio": "https://jeandupont.dev",
  "linkedin": "https://linkedin.com/in/jeandupont",
  "birth_date": "2003-05-15",
  "gender": "male",
  "address": "Lot 123, Analakely",
  "cv_path": "cvs/jeandupont_cv.pdf",
  "photo": "photos/jeandupont.jpg",
  "city": "Antananarivo",
  "city_id": 1,
  "created_at": "2026-01-15T10:30:00.000000Z"
}
```

---

### Modifier profil étudiant

```
POST /api/student/profile
```

Met à jour le profil de l'étudiant connecté. Accepte `multipart/form-data` pour les fichiers.

**Body (FormData) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `phone` | string | Non | Numéro de téléphone (max 20) |
| `bio` | string | Non | Biographie |
| `skills` | string | Non | Compétences (texte libre) |
| `school` | string | Non | École/Université |
| `major` | string | Non | Filière/Specialité |
| `graduation_year` | integer | Non | Année de diplomation (1950-2100) |
| `github` | string | Non | URL GitHub |
| `portfolio` | string | Non | URL Portfolio |
| `linkedin` | string | Non | URL LinkedIn |
| `birth_date` | date | Non | Date de naissance (YYYY-MM-DD) |
| `gender` | string | Non | `male`, `female` ou `other` |
| `city_id` | integer | Non | ID de la ville |
| `address` | string | Non | Adresse (max 1000) |
| `cv` | file | Non | CV (pdf, doc, docx - max 2 Mo) |
| `photo` | file | Non | Photo de profil (jpeg, png, jpg, webp - max 2 Mo) |

**Réponse (200) :** Objet profil mis à jour.

---

### Postuler à une offre

```
POST /api/internships/{id}/apply
```

Soumet une candidature pour une offre de stage. Un email est envoyé à l'entreprise. Impossible de postuler deux fois à la même offre.

**Body (FormData) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `cover_letter` | string | Non | Lettre de motivation |
| `cv` | file | Non | CV (pdf, doc, docx - max 2 Mo) |

**Réponse (201) :**

```json
{
  "id": 15,
  "internship_id": 1,
  "student_id": 1,
  "cover_letter": "Je suis très intéressé par cette offre...",
  "cv_path": "cvs/candidature_15.pdf",
  "status": "en_attente",
  "created_at": "2026-02-01T14:00:00.000000Z"
}
```

**Erreur (409) :**

```json
{
  "message": "Vous avez déjà postulé à cette offre."
}
```

---

### Mes candidatures

```
GET /api/student/applications
```

Retourne la liste des candidatures de l'étudiant, avec les informations de l'offre et de l'entreprise.

**Réponse (200) :**

```json
[
  {
    "id": 15,
    "internship_id": 1,
    "student_id": 1,
    "cover_letter": "Je suis très intéressé...",
    "cv_path": "cvs/candidature_15.pdf",
    "status": "en_attente",
    "created_at": "2026-02-01T14:00:00.000000Z",
    "internship": {
      "id": 1,
      "title": "Développeur Full Stack",
      "company": {
        "id": 5,
        "name": "TechCorp Madagascar"
      }
    }
  }
]
```

> **Statuts possibles :** `en_attente`, `acceptée`, `refusée`, `interview`

---

### Ajouter/retirer un favori

```
POST /api/internships/{id}/favorite
```

Toggle le statut favori d'une offre. Si l'offre est déjà en favori, elle est retirée, sinon ajoutée.

**Réponse (200) :**

```json
{
  "favorited": true
}
```

ou

```json
{
  "favorited": false
}
```

---

### Mes favoris

```
GET /api/favorites
```

Retourne la liste des offres en favori avec les détails de l'offre et de l'entreprise.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "internship_id": 1,
    "student_id": 1,
    "created_at": "2026-02-01T14:00:00.000000Z",
    "internship": {
      "id": 1,
      "title": "Développeur Full Stack",
      "company": {
        "id": 5,
        "name": "TechCorp Madagascar"
      },
      "city": {
        "id": 1,
        "name": "Antananarivo"
      }
    }
  }
]
```

---

### Mes conversations

```
GET /api/conversations
```

Retourne la liste des conversations de l'utilisateur avec le dernier message et le nombre de messages non lus.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "student_id": 1,
    "company_id": 5,
    "updated_at": "2026-02-10T16:30:00.000000Z",
    "student": {
      "id": 1,
      "name": "Jean Dupont"
    },
    "company": {
      "id": 5,
      "name": "TechCorp Madagascar"
    },
    "last_message": {
      "id": 42,
      "message": "Merci pour votre réponse, nous reviendrons vers vous.",
      "sender_id": 5,
      "created_at": "2026-02-10T16:30:00.000000Z",
      "sender": {
        "id": 5,
        "name": "TechCorp Madagascar"
      }
    },
    "unread_count": 2
  }
]
```

---

### Nouvelle conversation

```
POST /api/conversations
```

Crée une nouvelle conversation ou récupère une conversation existante entre l'étudiant et l'entreprise. Le premier message est inclus.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `student_id` | integer | Oui | ID de l'étudiant |
| `company_id` | integer | Oui | ID de l'entreprise (user_id) |
| `message` | string | Oui | Premier message (max 5000) |

> **Note :** L'étudiant et l'entreprise doivent être des utilisateurs différents.

**Réponse (201) :**

```json
{
  "conversation": {
    "id": 1,
    "student_id": 1,
    "company_id": 5,
    "messages": [
      {
        "id": 1,
        "sender_id": 1,
        "message": "Bonjour, je suis intéressé par votre offre.",
        "is_read": false,
        "created_at": "2026-02-10T14:00:00.000000Z",
        "sender": {
          "id": 1,
          "name": "Jean Dupont"
        }
      }
    ]
  },
  "message": {
    "id": 1,
    "sender_id": 1,
    "message": "Bonjour, je suis intéressé par votre offre.",
    "is_read": false,
    "created_at": "2026-02-10T14:00:00.000000Z",
    "sender": {
      "id": 1,
      "name": "Jean Dupont"
    }
  }
}
```

---

### Voir une conversation

```
GET /api/conversations/{id}
```

Retourne une conversation avec tous ses messages. Marque automatiquement les messages reçus comme lus.

> Seuls les participants de la conversation peuvent y accéder (403 sinon).

---

### Envoyer un message

```
POST /api/conversations/{id}/messages
```

Envoie un nouveau message dans une conversation existante.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `message` | string | Oui | Contenu du message (max 5000) |

**Réponse (201) :**

```json
{
  "id": 43,
  "conversation_id": 1,
  "sender_id": 1,
  "message": "Merci pour votre retour !",
  "is_read": false,
  "created_at": "2026-02-11T09:00:00.000000Z",
  "sender": {
    "id": 1,
    "name": "Jean Dupont"
  }
}
```

---

### Messages d'une conversation

```
GET /api/conversations/{id}/messages
```

Retourne les messages d'une conversation avec pagination (50 par page).

> Seuls les participants de la conversation peuvent y accéder.

**Réponse (200) :**

```json
{
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "message": "Bonjour, je suis intéressé par votre offre.",
      "is_read": true,
      "created_at": "2026-02-10T14:00:00.000000Z",
      "sender": {
        "id": 1,
        "name": "Jean Dupont"
      }
    }
  ],
  "links": { ... },
  "meta": { ... }
}
```

---

### Mes entretiens

```
GET /api/interviews
```

Retourne la liste des entretiens de l'utilisateur. Pour un étudiant, seuls ses entretiens sont retournés. Pour une entreprise, tous ses entretiens.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "application_id": 15,
    "date": "2026-02-20T10:00:00.000000Z",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "notes": "Entretien technique",
    "location": "Bureau principal, Antananarivo",
    "status": "scheduled",
    "application": {
      "id": 15,
      "internship": {
        "id": 1,
        "title": "Développeur Full Stack"
      },
      "student": {
        "id": 1,
        "name": "Jean Dupont"
      }
    }
  }
]
```

> **Statuts possibles :** `scheduled`, `completed`, `cancelled`

---

### Mes notifications

```
GET /api/notifications
```

Retourne les 50 dernières notifications avec le nombre de non-lues.

**Réponse (200) :**

```json
{
  "notifications": [
    {
      "id": 1,
      "type": "Nouvelle candidature",
      "message": "Jean Dupont a postulé à votre offre Développeur Full Stack",
      "is_read": false,
      "created_at": "2026-02-01T14:00:00.000000Z"
    }
  ],
  "unread_count": 3
}
```

---

### Marquer une notification comme lue

```
PUT /api/notifications/{id}/read
```

Marque une notification spécifique comme lue.

**Réponse (200) :**

```json
{
  "message": "Marqué comme lu"
}
```

---

### Tout marquer comme lu

```
PUT /api/notifications/read-all
```

Marque toutes les notifications non lues de l'utilisateur comme lues.

**Réponse (200) :**

```json
{
  "message": "Tout marqué comme lu"
}
```

---

## Routes Entreprise

Ces routes nécessitent un token valide avec le rôle `company`. Toutes les routes sont préfixées par `/api/company`.

### Voir profil entreprise

```
GET /api/company/profile
```

Retourne le profil complet de l'entreprise. Si aucun profil n'existe, il est automatiquement créé.

**Réponse (200) :**

```json
{
  "id": 5,
  "user_id": 10,
  "name": "TechCorp Madagascar",
  "description": "Entreprise spécialisée en développement web et mobile",
  "logo": "logos/techcorp.png",
  "website": "https://techcorp.mg",
  "location": "Antananarivo",
  "industry": "Technologies de l'information",
  "phone": "+261 20 22 333 44",
  "address": "Lot 45B, Analakely",
  "employees_count": 25,
  "status": "validated",
  "verified": true,
  "verified_at": "2026-01-10T08:00:00.000000Z",
  "city": "Antananarivo",
  "city_id": 1,
  "created_at": "2026-01-05T10:00:00.000000Z",
  "updated_at": "2026-02-01T12:00:00.000000Z",
  "user": {
    "id": 10,
    "name": "TechCorp Madagascar",
    "email": "contact@techcorp.mg"
  }
}
```

---

### Modifier profil entreprise

```
POST /api/company/profile
```

Met à jour le profil de l'entreprise. Accepte `multipart/form-data` pour le logo.

**Body (FormData) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Non | Nom de l'entreprise |
| `description` | string | Non | Description |
| `website` | string | Non | Site web (URL) |
| `location` | string | Non | Localisation |
| `industry` | string | Non | Secteur d'activité |
| `phone` | string | Non | Téléphone (max 20) |
| `city_id` | integer | Non | ID de la ville |
| `address` | string | Non | Adresse (max 1000) |
| `employees_count` | integer | Non | Nombre d'employés |
| `logo` | file | Non | Logo (jpeg, png, jpg, gif, webp - max 2 Mo) |

**Réponse (200) :** Objet entreprise mis à jour.

---

### Mes offres de stage

```
GET /api/company/internships
```

Retourne toutes les offres de stage de l'entreprise avec le nombre de candidatures.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "title": "Développeur Full Stack",
    "description": "Recherche développeur React/Node...",
    "requirements": "HTML, CSS, JavaScript, React",
    "location": "Antananarivo",
    "type": "hybrid",
    "salary": 1500000,
    "duration": "3 mois",
    "slots": 2,
    "deadline": "2026-03-30",
    "status": "open",
    "views_count": 42,
    "company_id": 5,
    "category_id": 1,
    "city_id": 1,
    "applications_count": 12,
    "categories": [
      { "id": 1, "name": "Informatique" }
    ],
    "created_at": "2026-01-10T08:00:00.000000Z"
  }
]
```

---

### Créer une offre de stage

```
POST /api/company/internships
```

Crée une nouvelle offre de stage.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | Oui | Titre de l'offre (max 255) |
| `description` | string | Oui | Description détaillée |
| `requirements` | string | Non | Prérequis/compétences requises |
| `location` | string | Non | Lieu du stage |
| `type` | string | Non | `remote`, `onsite` ou `hybrid` |
| `duration` | string | Non | Durée du stage |
| `salary` | number | Non | Rémunération (min 0) |
| `slots` | integer | Non | Nombre de places (min 1) |
| `deadline` | date | Non | Date limite de candidature (YYYY-MM-DD) |
| `status` | string | Non | `draft`, `open`, `closed` ou `filled` (défaut: `open`) |
| `categories` | array | Non | IDs des catégories |
| `categories.*` | integer | Non | ID d'une catégorie existante |

**Réponse (201) :**

```json
{
  "id": 2,
  "title": "Data Analyst",
  "description": "Analyse de données et reporting...",
  "requirements": "Python, SQL, Power BI",
  "location": "Toamasina",
  "type": "onsite",
  "salary": 1200000,
  "duration": "6 mois",
  "slots": 1,
  "deadline": "2026-04-15",
  "status": "open",
  "company_id": 5,
  "categories": [
    { "id": 2, "name": "Data Science" }
  ],
  "created_at": "2026-02-15T10:00:00.000000Z"
}
```

---

### Modifier une offre de stage

```
PUT /api/company/internships/{id}
```

Met à jour une offre de stage appartenant à l'entreprise. Retourne 403 si l'offre appartient à une autre entreprise.

**Body (JSON) :** Même schéma que la création (tous les champs optionnels).

**Réponse (200) :** Objet offre mis à jour avec ses catégories.

---

### Supprimer une offre de stage

```
DELETE /api/company/internships/{id}
```

Supprime une offre de stage. Retourne 403 si l'offre appartient à une autre entreprise.

**Réponse (200) :**

```json
{
  "message": "Internship deleted successfully."
}
```

---

### Candidatures reçues pour une offre

```
GET /api/company/internships/{id}/applications
```

Retourne toutes les candidatures pour une offre spécifique. Retourne 403 si l'offre n'appartient pas à l'entreprise.

**Réponse (200) :**

```json
[
  {
    "id": 15,
    "internship_id": 1,
    "student_id": 1,
    "cover_letter": "Je suis très intéressé par cette offre...",
    "cv_path": "cvs/candidature_15.pdf",
    "status": "en_attente",
    "created_at": "2026-02-01T14:00:00.000000Z",
    "student": {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean@example.com"
    }
  }
]
```

---

### Mettre à jour le statut d'une candidature

```
PUT /api/company/applications/{id}
```

Change le statut d'une candidature. Un email est envoyé à l'étudiant. Retourne 403 si la candidature n'appartient pas à l'entreprise.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `status` | string | Oui | `en_attente`, `acceptée`, `refusée` ou `interview` |

**Réponse (200) :** Objet candidature mis à jour.

---

### Planifier un entretien

```
POST /api/company/interviews
```

Crée un entretien lié à une candidature. La date doit être dans le futur. Vérifie que l'offre appartient à l'entreprise.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `application_id` | integer | Oui | ID de la candidature |
| `date` | datetime | Oui | Date de l'entretien (doit être après maintenant) |
| `meeting_link` | string | Non | Lien de visioconférence (URL) |
| `notes` | string | Non | Notes (max 2000) |
| `location` | string | Non | Lieu physique (max 255) |

**Réponse (201) :**

```json
{
  "id": 1,
  "application_id": 15,
  "date": "2026-02-20T10:00:00.000000Z",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "notes": "Entretien technique + culture fit",
  "location": "Bureau principal, Antananarivo",
  "status": "scheduled",
  "application": {
    "id": 15,
    "internship": {
      "id": 1,
      "title": "Développeur Full Stack"
    },
    "student": {
      "id": 1,
      "name": "Jean Dupont"
    }
  }
}
```

---

### Modifier un entretien

```
PUT /api/company/interviews/{id}
```

Met à jour les détails d'un entretien. Les entreprises ne peuvent modifier que leurs propres entretiens.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `date` | datetime | Non | Nouvelle date (doit être dans le futur) |
| `meeting_link` | string | Non | Lien de visioconférence (URL) |
| `status` | string | Non | `scheduled`, `completed` ou `cancelled` |
| `notes` | string | Non | Notes (max 2000) |
| `location` | string | Non | Lieu physique (max 255) |

**Réponse (200) :** Objet entretien mis à jour avec les relations.

---

## Routes Admin

Ces routes nécessitent un token valide avec le rôle `admin`. Toutes les routes sont préfixées par `/api/admin`.

### Dashboard - Statistiques

```
GET /api/admin/stats
```

Retourne les statistiques globales de la plateforme et des données pour les graphiques (12 derniers mois).

**Réponse (200) :**

```json
{
  "users": 150,
  "students": 120,
  "active_users": 140,
  "banned_users": 5,
  "inactive_users": 5,
  "companies": 25,
  "verified_companies": 18,
  "internships": 65,
  "internships_open": 42,
  "applications": 230,
  "applications_pending": 85,
  "categories": 8,
  "conversations": 45,
  "interviews": 30,
  "monthly": [
    {
      "month": "2025-03",
      "users": 8,
      "internships": 3,
      "applications": 12
    },
    {
      "month": "2025-04",
      "users": 12,
      "internships": 5,
      "applications": 18
    }
  ]
}
```

---

### Liste des utilisateurs

```
GET /api/admin/users?search=<terme>
```

Retourne tous les utilisateurs avec leurs profils associés.

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche par nom, prénom ou email |

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "name": "Jean Dupont",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com",
    "phone": "+261 34 00 000 00",
    "role": "student",
    "status": "active",
    "banned_at": null,
    "created_at": "2026-01-15T10:30:00.000000Z",
    "company": null,
    "student": {
      "id": 1
    }
  }
]
```

---

### Détail d'un utilisateur

```
GET /api/admin/users/{id}
```

Retourne les informations complètes d'un utilisateur avec ses profils.

**Réponse (200) :**

```json
{
  "id": 1,
  "name": "Jean Dupont",
  "firstname": "Jean",
  "lastname": "Dupont",
  "email": "jean@example.com",
  "phone": "+261 34 00 000 00",
  "role": "student",
  "status": "active",
  "banned_at": null,
  "created_at": "2026-01-15T10:30:00.000000Z",
  "updated_at": "2026-02-01T12:00:00.000000Z",
  "companyProfile": null,
  "studentProfile": {
    "id": 1,
    "school": "Université de Fianarantsoa",
    "major": "Génie Logiciel",
    "graduation_year": 2027,
    "bio": "Étudiant en informatique"
  }
}
```

---

### Modifier un utilisateur

```
PUT /api/admin/users/{id}
```

Met à jour les informations d'un utilisateur.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `role` | string | Non | `student`, `company` ou `admin` |
| `name` | string | Non | Nom complet |
| `firstname` | string | Non | Prénom |
| `lastname` | string | Non | Nom |
| `email` | string | Non | Email (unique) |
| `phone` | string | Non | Téléphone |
| `status` | string | Non | `active`, `banned` ou `inactive` |

**Réponse (200) :** Objet utilisateur mis à jour avec ses profils.

---

### Bannir un utilisateur

```
POST /api/admin/users/{id}/ban
```

Bannit un utilisateur. Supprime tous ses tokens (déconnexion forcée). Impossible de bannir un admin.

**Réponse (200) :**

```json
{
  "message": "Utilisateur banni.",
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "status": "banned",
    "banned_at": "2026-02-15T10:00:00.000000Z"
  }
}
```

---

### Débannir un utilisateur

```
POST /api/admin/users/{id}/unban
```

Réactive un utilisateur banni.

**Réponse (200) :**

```json
{
  "message": "Utilisateur débanni.",
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "status": "active",
    "banned_at": null
  }
}
```

---

### Réinitialiser le mot de passe d'un utilisateur

```
POST /api/admin/users/{id}/reset-password
```

Réinitialise le mot de passe et déconnecte l'utilisateur.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `password` | string | Oui | Nouveau mot de passe (min 8) |
| `password_confirmation` | string | Oui | Confirmation |

**Réponse (200) :**

```json
{
  "message": "Mot de passe réinitialisé."
}
```

---

### Supprimer un utilisateur

```
DELETE /api/admin/users/{id}
```

Supprime définitivement un utilisateur. Impossible de supprimer un admin.

**Réponse (200) :**

```json
{
  "message": "Utilisateur supprimé."
}
```

---

### Liste des étudiants

```
GET /api/admin/students?search=<terme>
```

Retourne tous les étudiants avec leur profil, compétences et nombre de candidatures.

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche par nom, prénom ou email |

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "name": "Jean Dupont",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com",
    "phone": "+261 34 00 000 00",
    "status": "active",
    "banned_at": null,
    "created_at": "2026-01-15T10:30:00.000000Z",
    "profile": {
      "id": 1,
      "school": "Université de Fianarantsoa",
      "major": "Génie Logiciel",
      "graduation_year": 2027,
      "birth_date": "2003-05-15",
      "gender": "male",
      "address": "Lot 123, Analakely",
      "city": "Antananarivo",
      "bio": "Étudiant en informatique",
      "cv_path": "cvs/jeandupont_cv.pdf"
    },
    "skills": [
      { "id": 1, "name": "JavaScript", "level": "avancé" },
      { "id": 2, "name": "PHP", "level": "intermédiaire" }
    ],
    "applications_count": 5
  }
]
```

---

### Détail d'un étudiant

```
GET /api/admin/students/{id}
```

Retourne le détail complet d'un étudiant : profil, CV, compétences, candidatures et favoris.

**Réponse (200) :**

```json
{
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "firstname": "Jean",
    "lastname": "Dupont",
    "email": "jean@example.com",
    "phone": "+261 34 00 000 00",
    "status": "active",
    "created_at": "2026-01-15T10:30:00.000000Z",
    "banned_at": null
  },
  "profile": {
    "id": 1,
    "school": "Université de Fianarantsoa",
    "major": "Génie Logiciel",
    "graduation_year": 2027,
    "birth_date": "2003-05-15",
    "gender": "male",
    "address": "Lot 123, Analakely",
    "city": "Antananarivo",
    "bio": "Étudiant en informatique passionné",
    "cv_path": "cvs/jeandupont_cv.pdf",
    "photo": "photos/jeandupont.jpg",
    "github": "https://github.com/jeandupont",
    "portfolio": "https://jeandupont.dev",
    "linkedin": "https://linkedin.com/in/jeandupont"
  },
  "cv_url": "https://stagelink-api.onrender.com/storage/cvs/jeandupont_cv.pdf",
  "skills": [
    { "id": 1, "name": "JavaScript", "level": "avancé" },
    { "id": 2, "name": "PHP", "level": "intermédiaire" }
  ],
  "applications": [
    {
      "id": 15,
      "status": "en_attente",
      "cover_letter": "Je suis très intéressé...",
      "cv_path": "cvs/candidature_15.pdf",
      "created_at": "2026-02-01T14:00:00.000000Z",
      "internship": {
        "id": 1,
        "title": "Développeur Full Stack",
        "company": "TechCorp Madagascar"
      }
    }
  ],
  "favorites_count": 3
}
```

> **Note V2.0 :** Le champ `cv_url` est une URL complète vers le fichier CV. Les compétences incluent le niveau via la table pivot.

---

### Liste des entreprises

```
GET /api/admin/companies?search=<terme>
```

Retourne toutes les entreprises avec leur statut, vérification et nombre d'offres.

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche par nom, email ou localisation |

**Réponse (200) :**

```json
[
  {
    "id": 5,
    "name": "TechCorp Madagascar",
    "description": "Entreprise spécialisée en développement web",
    "logo": "logos/techcorp.png",
    "website": "https://techcorp.mg",
    "location": "Antananarivo",
    "industry": "Technologies de l'information",
    "status": "validated",
    "phone": "+261 20 22 333 44",
    "address": "Lot 45B, Analakely",
    "employees_count": 25,
    "city": "Antananarivo",
    "verified": true,
    "verified_at": "2026-01-10T08:00:00.000000Z",
    "created_at": "2026-01-05T10:00:00.000000Z",
    "user": {
      "id": 10,
      "name": "TechCorp Madagascar",
      "email": "contact@techcorp.mg"
    },
    "internships_count": 8
  }
]
```

> **Statuts possibles :** `validated`, `suspended`, `pending`

---

### Détail d'une entreprise

```
GET /api/admin/companies/{id}
```

Retourne le détail complet d'une entreprise avec toutes ses offres et le nombre de candidatures par offre.

**Réponse (200) :**

```json
{
  "company": {
    "id": 5,
    "name": "TechCorp Madagascar",
    "description": "Entreprise spécialisée en développement web",
    "logo": "logos/techcorp.png",
    "website": "https://techcorp.mg",
    "location": "Antananarivo",
    "industry": "Technologies de l'information",
    "status": "validated",
    "phone": "+261 20 22 333 44",
    "address": "Lot 45B, Analakely",
    "employees_count": 25,
    "city": "Antananarivo",
    "verified": true,
    "verified_at": "2026-01-10T08:00:00.000000Z",
    "created_at": "2026-01-05T10:00:00.000000Z",
    "updated_at": "2026-02-01T12:00:00.000000Z",
    "user": {
      "id": 10,
      "name": "TechCorp Madagascar",
      "email": "contact@techcorp.mg"
    }
  },
  "internships": [
    {
      "id": 1,
      "title": "Développeur Full Stack",
      "status": "open",
      "location": "Antananarivo",
      "type": "hybrid",
      "salary": 1500000,
      "views_count": 42,
      "created_at": "2026-01-10T08:00:00.000000Z",
      "applications_count": 12
    }
  ]
}
```

---

### Valider une entreprise

```
POST /api/admin/companies/{id}/validate
```

Marque une entreprise comme validée et vérifiée.

**Réponse (200) :**

```json
{
  "message": "Entreprise validée.",
  "company": {
    "id": 5,
    "name": "TechCorp Madagascar",
    "status": "validated",
    "verified": true,
    "verified_at": "2026-02-15T10:00:00.000000Z"
  }
}
```

---

### Suspendre une entreprise

```
POST /api/admin/companies/{id}/suspend
```

Suspend une entreprise. Toutes ses offres ouvertes sont automatiquement fermées.

**Réponse (200) :**

```json
{
  "message": "Entreprise suspendue.",
  "company": {
    "id": 5,
    "name": "TechCorp Madagascar",
    "status": "suspended"
  }
}
```

---

### Réactiver une entreprise

```
POST /api/admin/companies/{id}/reactivate
```

Réactive une entreprise suspendue (statut → `validated`).

**Réponse (200) :**

```json
{
  "message": "Entreprise réactivée.",
  "company": {
    "id": 5,
    "name": "TechCorp Madagascar",
    "status": "validated"
  }
}
```

---

### Supprimer une entreprise

```
DELETE /api/admin/companies/{id}
```

Supprime définitivement une entreprise et toutes ses offres.

**Réponse (200) :**

```json
{
  "message": "Entreprise supprimée."
}
```

---

### Toutes les offres (admin)

```
GET /api/admin/internships
```

Retourne toutes les offres de stage de la plateforme avec les informations de l'entreprise.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "title": "Développeur Full Stack",
    "description": "Recherche développeur React/Node...",
    "status": "open",
    "location": "Antananarivo",
    "type": "hybrid",
    "salary": 1500000,
    "company_id": 5,
    "views_count": 42,
    "created_at": "2026-01-10T08:00:00.000000Z",
    "company": {
      "id": 5,
      "name": "TechCorp Madagascar"
    }
  }
]
```

---

### Modifier une offre (admin)

```
PUT /api/admin/internships/{id}
```

Permet à un admin de modifier n'importe quelle offre.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `status` | string | Non | `draft`, `open`, `closed` ou `filled` |
| `title` | string | Non | Titre |
| `description` | string | Non | Description |

**Réponse (200) :** Objet offre mis à jour.

---

### Supprimer une offre (admin)

```
DELETE /api/admin/internships/{id}
```

Supprime définitivement une offre.

**Réponse (200) :**

```json
{
  "message": "Internship deleted successfully."
}
```

---

### Liste des catégories

```
GET /api/admin/categories
```

Retourne toutes les catégories avec le nombre d'offres associées.

**Réponse (200) :**

```json
[
  {
    "id": 1,
    "name": "Informatique",
    "slug": "informatique",
    "internships_count": 25,
    "created_at": "2026-01-01T00:00:00.000000Z"
  },
  {
    "id": 2,
    "name": "Data Science",
    "slug": "data-science",
    "internships_count": 10,
    "created_at": "2026-01-01T00:00:00.000000Z"
  }
]
```

---

### Créer une catégorie

```
POST /api/admin/categories
```

Crée une nouvelle catégorie. Le slug est automatiquement généré.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Oui | Nom unique (max 255) |

**Réponse (201) :**

```json
{
  "id": 9,
  "name": "Marketing Digital",
  "slug": "marketing-digital",
  "created_at": "2026-02-15T10:00:00.000000Z"
}
```

---

### Voir une catégorie

```
GET /api/admin/categories/{id}
```

**Réponse (200) :** Objet catégorie.

---

### Modifier une catégorie

```
PUT /api/admin/categories/{id}
```

Met à jour le nom d'une catégorie. Le slug est régénéré si le nom change.

**Body (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Non | Nouveau nom (unique) |

**Réponse (200) :** Objet catégorie mis à jour.

---

### Supprimer une catégorie

```
DELETE /api/admin/categories/{id}
```

**Réponse (200) :**

```json
{
  "message": "Category deleted successfully."
}
```

---

## Modèles de données

### Utilisateur (User)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `name` | string | Nom complet (prénom + nom) |
| `firstname` | string | Prénom |
| `lastname` | string | Nom |
| `email` | string | Email unique |
| `phone` | string | Téléphone |
| `role` | string | `student`, `company` ou `admin` |
| `status` | string | `active`, `banned` ou `inactive` |
| `banned_at` | datetime | Date de bannissement |
| `created_at` | datetime | Date de création |
| `updated_at` | datetime | Dernière mise à jour |

### Profil étudiant (StudentProfile)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `user_id` | integer | ID de l'utilisateur |
| `phone` | string | Téléphone |
| `bio` | string | Biographie |
| `skills` | string | Compétences (texte) |
| `school` | string | École/Université |
| `major` | string | Filière |
| `graduation_year` | integer | Année de diplomation |
| `github` | string | URL GitHub |
| `portfolio` | string | URL Portfolio |
| `linkedin` | string | URL LinkedIn |
| `birth_date` | date | Date de naissance |
| `gender` | string | `male`, `female`, `other` |
| `city_id` | integer | ID de la ville |
| `address` | string | Adresse |
| `cv_path` | string | Chemin du CV |
| `photo` | string | Chemin de la photo |

### Entreprise (Company)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `user_id` | integer | ID de l'utilisateur |
| `name` | string | Nom de l'entreprise |
| `description` | string | Description |
| `logo` | string | Chemin du logo |
| `website` | string | Site web |
| `location` | string | Localisation |
| `industry` | string | Secteur d'activité |
| `phone` | string | Téléphone |
| `city_id` | integer | ID de la ville |
| `address` | string | Adresse |
| `employees_count` | integer | Nombre d'employés |
| `status` | string | `validated`, `suspended`, `pending` |
| `verified` | boolean | Entreprise vérifiée |
| `verified_at` | datetime | Date de vérification |

### Offre de stage (Internship)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `title` | string | Titre |
| `description` | string | Description |
| `requirements` | string | Prérequis |
| `location` | string | Lieu |
| `type` | string | `remote`, `onsite`, `hybrid` |
| `salary` | number | Rémunération |
| `duration` | string | Durée |
| `slots` | integer | Nombre de places |
| `deadline` | date | Date limite |
| `status` | string | `draft`, `open`, `closed`, `filled` |
| `views_count` | integer | Nombre de vues |
| `company_id` | integer | ID de l'entreprise |
| `category_id` | integer | ID de la catégorie |
| `city_id` | integer | ID de la ville |

### Candidature (Application)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `internship_id` | integer | ID de l'offre |
| `student_id` | integer | ID de l'étudiant |
| `cover_letter` | string | Lettre de motivation |
| `cv_path` | string | Chemin du CV |
| `status` | string | `en_attente`, `acceptée`, `refusée`, `interview` |

### Conversation

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `student_id` | integer | ID de l'étudiant |
| `company_id` | integer | ID de l'entreprise |

### Message

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `conversation_id` | integer | ID de la conversation |
| `sender_id` | integer | ID de l'expéditeur |
| `message` | string | Contenu |
| `is_read` | boolean | Lu ou non |

### Entretien (Interview)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | Identifiant unique |
| `application_id` | integer | ID de la candidature |
| `date` | datetime | Date/heure de l'entretien |
| `meeting_link` | string | Lien visioconférence |
| `notes` | string | Notes |
| `location` | string | Lieu physique |
| `status` | string | `scheduled`, `completed`, `cancelled` |
