# Roadmap — StageLink

> Plan de développement de la plateforme StageLink de mise en relation étudiants/entreprises.

---

## V1.0 — Juin 2026 · MVP

**Objectif** : Valider le cœur de métier de la plateforme.

- Authentification complète (inscription / connexion) avec gestion des rôles : étudiant, entreprise, administrateur
- CRUD des offres de stage (création, lecture, modification, suppression)
- Système de candidatures (postuler à une offre, suivre l'état)
- Profils étudiants et entreprises

---

## V1.1 — Juillet 2026 · Communication

**Objectif** : Faciliter l'échange entre les parties prenantes.

- Messagerie interne entre étudiants et entreprises
- Gestion des entretiens (planification, détails)
- Système de favoris (sauvegarder des offres)
- Notifications en temps réel

---

## V1.2 — Juillet 2026 · Administration

**Objectif** : Donner aux administrateurs les outils de pilotage.

- Dashboard administrateur avec vue d'ensemble
- Gestion des utilisateurs et des entreprises (activation, désactivation)
- Système de catégories d'offres

---

## V2.0 — Juillet 2026 · Refonte BDD + Production

**Objectif** : Remettre à plat l'architecture data et déployer en production.

- Nouveau schéma de base de données :
  - Tables `cities`, `skills`, `documents`, `activity_logs`
  - Champs `firstname` / `lastname` (remplacement de `name`)
  - Champ `status` sur les utilisateurs
  - Clé étrangère `city_id` sur les profils, offres et entreprises
- Simplification du modèle de conversations
- Renommage des champs pour plus de clarté (`body` → `message`, `scheduled_at` → `date`, etc.)
- Déploiement :
  - **Backend** : Render
  - **Base de données** : Aiven MySQL
  - **Frontend** : Vercel
- Documentation professionnelle complète

---

## V2.1 — Août 2026 · Features avancées

**Objectif** : Enrichir l'expérience utilisateur avec des fonctionnalités différenciantes.

- Avis et notation des entreprises par les étudiants
- Statistiques avancées avec graphiques interactifs
- Export des données en CSV et PDF
- Éditeur de CV en ligne (CV builder)

---

## V2.2 — Septembre 2026 · Intelligence & Scale

**Objectif** : Intégrer l'intelligence artificielle et préparer la montée en charge.

- Matching automatique basé sur les compétences (skills-based)
- Alertes email et notifications push
- Mode hors ligne — Progressive Web App (PWA)
- Suite de tests automatisés (unitaires, intégration, end-to-end)

---

*Dernière mise à jour : Juillet 2026*
