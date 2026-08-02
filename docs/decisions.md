# Décisions d'architecture — StageLink

> Chaque décision est documentée avec le contexte, la décision prise, et les alternatives considérées.

---

## ADR-001 : Backend API REST avec Laravel

**Date** : Janvier 2026
**Statut** : Accepté

### Contexte
StageLink nécessite un backend robuste pour gérer l'authentification, les candidatures, la messagerie temps réel, et les emails transactionnels.

### Décision
Utiliser **Laravel 13** comme framework backend avec une architecture API REST.

### Alternatives considérées
- **Node.js + Express** : plus léger, moins de conventions, moins de sécurité out-of-the-box
- **Django REST Framework** : écosystème Python, moins adapté au stack JS frontend
- **Laravel** : écosystème riche (Sanctum, Reverb, Mailables, Queue, Backup), conventions fortes, documentation excellente

### Conséquences
- API REST standardisée avec des routes préfixées par rôle
- Sanctum pour l'auth token-based
- Écosystème riche pour les fonctionnalités transversales (email, backup, monitoring)

---

## ADR-002 : Frontend SPA React + Vite

**Date** : Janvier 2026
**Statut** : Accepté

### Contexte
Le frontend doit être rapide, réactif, et offrir une expérience utilisateur moderne.

### Décision
**React 18** + **Vite 8** + **Tailwind CSS v4** comme stack frontend SPA.

### Alternatives considérées
- **Next.js** : SSR/SSG, mais StageLink est une SPA (pas besoin de SEO côté server pour les pages privées)
- **Vue.js** : excellente alternative, mais l'écosystème React est plus large
- **Angular** : trop lourd pour ce projet, courbe d'apprentissage élevée

### Conséquences
- Build rapide (Vite)
- HMR instantanée en développement
- Tailwind CSS pour un design cohérent
- Code-splitting automatique par route

---

## ADR-003 : Authentification token-based (Sanctum)

**Date** : Janvier 2026
**Statut** : Accepté

### Contexte
Le frontend et le backend sont sur des domaines différents (Vercel + VPS). L'auth doit fonctionner跨-origin.

### Décision
**Laravel Sanctum** avec authentification par token (pas les cookies SPA).

### Alternatives considérées
- **Sanctum cookies** : nécessite que frontend et backend soient sur le même domaine ou sous-domaine
- **JWT (tymon/jwt-auth)** : plus complexe, tokens plus lourds, moins intégré à Laravel
- **Passport** : trop lourd pour une API simple

### Conséquences
- Token stocké dans `localStorage`
- Header `Authorization: Bearer <token>` sur chaque requête
- Tokens gérés via la table `personal_access_tokens`
- Déconnexion = suppression du token côté serveur

---

## ADR-004 : WebSocket avec Laravel Reverb

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
La messagerie et les notifications nécessitent du temps réel. Le polling 30s était lent et gaspille des ressources.

### Décision
**Laravel Reverb** comme serveur WebSocket, avec **Laravel Echo** + **Pusher.js** côté frontend.

### Alternatives considérées
- **Polling 30s** : simple mais lent, gaspille du bandeau
- **Socket.io** : excellent mais nécessite un serveur Node.js séparé
- **Pusher.com** : SaaS payant, dépendance externe
- **Reverb** : self-hosted, intégré à Laravel, compatible Pusher protocol

### Conséquences
- Serveur WebSocket sur port 8080
- Channels privés : `conversation.{id}`, `user.{id}`
- Auto-connect/disconnect via `AuthContext`
- Notifications et messages en temps réel

---

## ADR-005 : Base de données MariaDB

**Date** : Janvier 2026
**Statut** : Accepté

### Contexte
MariaDB est le SGBD par défaut sur WAMP (développement) et compatible avec la plupart des hébergeurs.

### Décision
**MariaDB** (MySQL-compatible) comme SGBD principal.

### Alternatives considérées
- **PostgreSQL** : plus puissant, mais overkill pour ce projet
- **SQLite** : utilisé uniquement pour les tests (vitesse)
- **MongoDB** : NoSQL, pas adapté aux relations complexes (users → applications → internships)

### Conséquences
- `Schema::defaultStringLength(191)` requis dans `AppServiceProvider` pour MariaDB
- Compatibilité MySQL (même syntaxe, même driver)
- Migrations Laravel natifs

---

## ADR-006 : Mode sombre via CSS variables + Tailwind

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
Les utilisateurs veulent un mode sombre. Il doit être rapide à basculer et persistant.

### Décision
**ThemeContext** React + classes `dark:` Tailwind + `localStorage` pour la persistance.

### Alternatives considérées
- **CSS-in-JS (styled-components)** : plus flexible, mais plus lourd
- **Media query CSS** : pas de toggle manuel possible
- **Tailwind dark mode** : léger, performant, intégré

### Conséquences
- Toggle dans le header (lune/soleil)
- Préférence système détectée automatiquement
- Persistance dans `localStorage`
- Classes `dark:` sur tous les composants UI

---

## ADR-007 : Multi-langue avec react-i18next

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
StageLink cible les étudiants malgaches (FR) mais doit être accessible en anglais pour les partenaires internationaux.

### Décision
**react-i18next** avec deux fichiers de traduction (`fr.js`, `en.js`).

### Alternatives considérées
- **react-intl** : plus lourd, plus complexe
- **Laravel lang** : côté backend uniquement, pas pour le frontend
- **Fichiers JSON simples** : pas de features avancées (plurals, interpolation)

### Conséquences
- ~250 clés de traduction
- Détection automatique de la langue du navigateur
- Persist dans `localStorage`
- `LanguageSwitcher` avec dropdown Globe

---

## ADR-008 : Score de complétion profil synchronisé backend/frontend

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
Le score de complétion du profil doit être cohérent entre le dashboard et la page profil.

### Décision
Le **backend est la source de vérité** (`computeCompletion()`), le frontend fournit le feedback temps réel (`computeReadiness()`). Les deux utilisent les **mêmes poids** (Photo=10, CV=20, Bio=10, Formation=15, Skills=20, Languages=10, Location=10, Links=5).

### Alternatives considérées
- **Backend uniquement** : pas de feedback temps réel pendant l'édition
- **Frontend uniquement** : manipulable côté client, incohérent avec les badges
- **Les deux synchronisés** : le backend calcule, le frontend affiche en temps réel avec les mêmes règles

### Conséquences
- Badge "Profil complété" débloqué à ≥ 80% (calculé par le backend)
- Le frontend recalcule à chaque changement de champ
- Les poids sont identiques dans les deux fichiers

---

## ADR-009 : Emails transactionnels via Mailables + queue

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
Les emails (candidature, entretien, mot de passe oublié) doivent être envoyés rapidement sans bloquer la requête.

### Décision
**Mailables Laravel** + `Mail::to()->queue()` avec try/catch + logging.

### Alternatives considérées
- **Mail::to()->send()** : synchrone, plus lent
- **Services externes (SendGrid, Mailgun)** : dépendance externe, coût
- **Queue Redis** : plus performant, mais nécessite un serveur Redis

### Conséquences
- 6 types d'emails : Welcome, ApplicationConfirmation, NewApplication, InterviewScheduled, ApplicationStatusChanged, ForgotPassword
- Templates Blade responsive (table-based, logo SVG inline)
- Envoi asynchrone via la queue Laravel
- Fallback logging si l'envoi échoue

---

## ADR-010 : Backup automatique avec Spatie

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
Les données de la plateforme (utilisateurs, candidatures, CV) doivent être sauvegardées régulièrement.

### Décision
**spatie/laravel-backup** v10 avec cron quotidien (DB + uploads + config).

### Alternatives considérées
- **Backup manuel** : pas fiable, dépend de la discipline
- **Script bash + cron** : moins intégré, moins de monitoring
- **S3 backup** : plus sûr, mais coût supplémentaire

### Conséquences
- 3 crons : cleanup (01h), backup (02h), monitoring (03h)
- Rétention : 7j / 8 semaines / 4 mois / 2 ans
- Stockage local (max 5 Go)
- Notifications email en cas d'échec

---

## ADR-011 : Documentation dans docs/

**Date** : Juillet 2026
**Statut** : Accepté

### Contexte
La documentation doit être facile à trouver et à maintenir pour les développeurs futurs.

### Décision
Dossier `docs/` avec 6 fichiers : `architecture.md`, `api-documentation.md`, `database.md`, `deployment.md`, `contributing.md`, `security.md`, `decisions.md`.

### Alternatives considérées
- **README.md seul** : trop compact pour tout documenter
- **Wiki GitHub** : séparée du code, moins maintainue
- **Swagger/OpenAPI** : excellent pour l'API, mais ne couvre pas l'architecture

### Conséquences
- Documentation versionnée avec le code
- API doc avec tous les endpoints (88 routes)
- Diagrammes ER en Mermaid
- ADR pour les décisions d'architecture
