# Cas d'utilisation — StageLink

> Description fonctionnelle des principaux cas d'utilisation de la plateforme StageLink.

---

## Tableau récapitulatif

| UC# | Acteur | Titre | Description | Précondition | Postcondition |
|-----|--------|-------|-------------|--------------|---------------|
| UC01 | Étudiant | Créer un compte | S'inscrire avec email, prénom, nom | — | Compte créé, email vérifié |
| UC02 | Étudiant | Rechercher des offres | Filtrer par mot-clé, ville, catégorie, type | Connecté | Liste d'offres filtrée |
| UC03 | Étudiant | Postuler à une offre | Envoyer CV + message | Connecté, offre ouverte | Candidature créée |
| UC04 | Étudiant | Gérer ses compétences | Ajouter/supprimer compétences avec niveau | Connecté | Compétences mises à jour |
| UC05 | Étudiant | Envoyer un message | Contacter entreprise via messagerie | Connecté | Message envoyé |
| UC06 | Étudiant | Voir ses entretiens | Consulter le calendrier des entretiens | Connecté | Liste des entretiens |
| UC07 | Entreprise | Publier une offre | Créer une offre avec tous les détails | Connecté, profil validé | Offre publiée |
| UC08 | Entreprise | Gérer les candidatures | Accepter/refuser/programmer entretien | Connecté | Statut candidature mis à jour |
| UC09 | Entreprise | Planifier un entretien | Choisir date, lieu, lien visio | Connecté, candidature acceptée | Entretien créé |
| UC10 | Admin | Consulter le dashboard | Voir stats et graphiques | Connecté (admin) | Stats affichées |
| UC11 | Admin | Gérer les utilisateurs | Bannir/débannir, modifier rôle, reset password | Connecté (admin) | Utilisateur modifié |
| UC12 | Admin | Valider une entreprise | Passer entreprise en statut validé | Connecté (admin) | Entreprise validée |

---

## Détail des cas d'utilisation

### UC01 — Créer un compte (Étudiant)

L'étudiant accède au formulaire d'inscription, renseigne son email, son prénom et son nom, puis valide. Un email de vérification est envoyé. Le compte est créé avec le rôle « étudiant » et un profil étudiant est initialisé automatiquement.

### UC02 — Rechercher des offres (Étudiant)

L'étudiant connecté accède à la page de recherche. Il peut filtrer les offres par mot-clé, ville, catégorie et type de stage (présentiel, distanciel, hybride). Les résultats s'affichent en temps réel.

### UC03 — Postuler à une offre (Étudiant)

L'étudiant sélectionne une offre ouverte, joint son CV et rédige un message de motivation. La candidature est créée avec le statut « en attente ». Une notification est envoyée à l'entreprise.

### UC04 — Gérer ses compétences (Étudiant)

L'étudiant accède à son profil et peut ajouter ou supprimer des compétences (techniques ou soft skills) en précisant son niveau de maîtrise (débutant, intermédiaire, avancé, expert).

### UC05 — Envoyer un message (Étudiant)

L'étudiant ouvre une conversation existante ou en initie une nouvelle avec une entreprise. Il rédige et envoie son message. Le message est stocké et l'entreprise reçoit une notification.

### UC06 — Voir ses entretiens (Étudiant)

L'étudiant consulte la liste de ses entretiens à venir et passés. Chaque entretien affiche la date, le lieu (ou lien visio), le nom de l'entreprise et le statut.

### UC07 — Publier une offre (Entreprise)

L'entreprise dont le profil est validé accède au formulaire de création d'offre. Elle renseigne le titre, la description, les compétences requises, la durée, la localisation et le type de stage. L'offre est publiée et visible par les étudiants.

### UC08 — Gérer les candidatures (Entreprise)

L'entreprise consulte les candidatures reçues pour chacune de ses offres. Elle peut accepter, refuser ou proposer un entretien pour chaque candidature. Le statut est mis à jour et l'étudiant est notifié.

### UC09 — Planifier un entretien (Entreprise)

Après avoir accepté une candidature, l'entreprise programme un entretien en choisissant la date, le lieu physique ou le lien de visioconférence. L'entretien est créé et l'étudiant reçoit une invitation.

### UC10 — Consulter le dashboard (Admin)

L'administrateur accède au tableau de bord qui affiche le nombre total d'utilisateurs, d'entreprises, d'offres et de candidatures. Des graphiques montrent l'évolution dans le temps et la répartition par catégorie.

### UC11 — Gérer les utilisateurs (Admin)

L'administrateur peut lister tous les utilisateurs, les bannir ou les débannir, modifier leur rôle (étudiant, entreprise, admin) et réinitialiser leur mot de passe.

### UC12 — Valider une entreprise (Admin)

L'administrateur vérifie les informations d'une entreprise en attente de validation. Il peut valider ou rejeter le profil. Une entreprise validée peut publier des offres et recevoir des candidatures.

---

*Dernière mise à jour : Juillet 2026*
