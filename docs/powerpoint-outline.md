# StageLink — Présentation PowerPoint

## Diapositive 1 : Page de garde
- **Titre :** StageLink
- **Sous-titre :** Plateforme de mise en relation Étudiants — Entreprises
- **Nom :** Victor Tsimamandro
- **Date :** Juillet 2026

## Diapositive 2 : Problématique
- Difficulté pour les étudiants de trouver un stage adapté
- Processus de candidature fragmenté (email, téléphone, papier)
- Manque de visibilité pour les entreprises sur les profils étudiants
- Aucun suivi centralisé des candidatures

## Diapositive 3 : Solution — StageLink
- Plateforme web centralisée
- Mise en relation directe étudiants ↔ entreprises
- Gestion complète du cycle de recrutement
- Messagerie intégrée, notifications, entretiens

## Diapositive 4 : Architecture technique
- **Backend :** Laravel 10+ API REST (Sanctum auth)
- **Frontend :** React + Vite + Tailwind CSS
- **Base de données :** MySQL 8 (InnoDB)
- **Déploiement :** Render (backend) + Vercel (frontend) + Aiven MySQL
- **Mail :** SMTP Gmail avec file d'attente

## Diapositive 5 : Modèle de données V2.0 (MCD)
- Diagramme entité-association simplifié
- Tables principales : users, companies, student_profiles, internships, applications
- Nouvelles tables V2.0 : cities, skills, documents, activity_logs
- Relations et contraintes

## Diapositive 6 : Fonctionnalités — Étudiant
- Inscription & profil (prénom, nom, photo, CV, compétences, ville)
- Recherche d'offres avec filtres avancés
- Candidature en un clic avec CV
- Favoris, messagerie, entretiens
- Notifications en temps réel

## Diapositive 7 : Fonctionnalités — Entreprise
- Profil entreprise (logo, description, ville, employés)
- Publication et gestion des offres
- Gestion des candidatures (accepter, refuser, entretien)
- Messagerie avec les candidats
- Planification d'entretiens (date, lieu, lien visio)

## Diapositive 8 : Fonctionnalités — Administrateur
- Dashboard avec statistiques et graphiques
- Gestion des utilisateurs (bannir, modifier)
- Validation des entreprises
- Gestion des catégories d'offres
- Consultation des profils étudiants

## Diapositive 9 : API REST — 70+ endpoints
- Architecture RESTful
- Authentification par Bearer token (Sanctum)
- Routes publiques, étudiant, entreprise, admin
- Format JSON, codes HTTP standards

## Diapositive 10 : Sécurité & Performances
- Validation des entrées côté serveur
- Upload sécurisé (type/taille contrôlés)
- File d'attente pour les emails
- Cache des routes et configurations
- CORS restreint

## Diapositive 11 : Roadmap
- **V1.0 (Juin) :** MVP authentification, offres, candidatures, profils
- **V1.1 (Juillet) :** Messagerie, entretiens, favoris, notifications
- **V1.2 (Juillet) :** Administration, catégories, stats
- **V2.0 (Juillet) :** Refonte BDD, déploiement production, documentation
- **V2.1 (Août) :** Avis entreprises, CV en ligne, export CSV
- **V2.2 (Septembre) :** Matching IA, alertes, PWA, tests automatisés

## Diapositive 12 : Déploiement
- **Frontend :** Vercel (stagelink-ten.vercel.app)
- **Backend :** Render (stagelink-api.onrender.com)
- **Base de données :** Aiven MySQL (ou PlanetScale)
- **CI/CD :** Déploiement automatique sur push Git
- **Domaine personnalisé :** À configurer

## Diapositive 13 : Démonstration
- Inscription étudiant
- Publication d'une offre par une entreprise
- Candidature et suivi
- Messagerie
- Interface administrateur

## Diapositive 14 : Conclusion
- StageLink : une solution complète et moderne
- Prêt pour la production (V2.0)
- Évolutif pour les versions futures
- Questions / Réponses
