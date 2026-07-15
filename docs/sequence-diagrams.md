# Diagrammes de séquence — StageLink

> Représentation des flux principaux de l'application StageLink en syntaxe Mermaid.

---

## 1. Inscription étudiant

```mermaid
sequenceDiagram
    participant S as Étudiant
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL

    S->>F: Remplit le formulaire (email, prénom, nom, password)
    F->>A: POST /api/register
    A->>A: Valider les champs
    A->>DB: INSERT INTO users (role=student)
    A->>DB: INSERT INTO student_profiles (user_id)
    A->>A: Générer token JWT
    A-->>F: 201 Created { user, token }
    F-->>F: Stocker le token
    F-->>S: Redirection vers le dashboard
```

**Explication** : L'étudiant soumet son formulaire d'inscription. L'API valide les données, crée l'utilisateur avec le rôle `student`, initialise un profil étudiant lié, génère un token JWT et retourne une réponse 201. Le frontend stocke le token et redirige vers le dashboard.

---

## 2. Connexion

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL

    U->>F: Saisir email + password
    F->>A: POST /api/login
    A->>DB: SELECT * FROM users WHERE email = ?
    A->>A: Vérifier password (Hash::check)
    alt Identifiants valides
        A->>A: Générer token JWT
        A-->>F: 200 OK { user, token }
        F-->>F: Stocker le token
        F-->>U: Redirection vers le dashboard
    else Identifiants invalides
        A-->>F: 401 Unauthorized
        F-->>U: Afficher erreur
    end
```

**Explication** : L'utilisateur saisit ses identifiants. L'API recherche l'utilisateur par email, vérifie le hash du mot de passe. Si les identifiants sont valides, un token JWT est généré et retourné. Sinon, une erreur 401 est renvoyée.

---

## 3. Postuler à une offre

```mermaid
sequenceDiagram
    participant E as Étudiant
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL
    participant Q as Queue (Email)

    E->>F: Cliquer sur "Postuler" + joindre CV + message
    F->>A: POST /api/internships/{id}/apply
    A->>A: Authentifier le token
    A->>DB: Vérifier que l'offre existe et est ouverte
    A->>DB: INSERT INTO applications (student_id, internship_id, status=pending)
    A->>DB: INSERT INTO documents (application_id, type=cv, path=...)
    A->>Q: Dispatch EmailJob (notification entreprise)
    A-->>F: 201 Created { application }
    F-->>E: Confirmation de candidature
```

**Explication** : L'étudiant sélectionne une offre et soumet sa candidature avec un CV et un message. L'API authentifie la requête, vérifie que l'offre est ouverte, crée l'enregistrement de candidature avec le statut `pending`, stocke le document CV et met en file d'attente l'envoi d'un email de notification à l'entreprise.

---

## 4. Messagerie

```mermaid
sequenceDiagram
    participant E as Étudiant
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL

    E->>F: Rédiger et envoyer un message
    F->>A: POST /api/conversations/{id}/messages
    A->>A: Authentifier le token
    A->>DB: Vérifier que l'utilisateur est membre de la conversation
    A->>DB: INSERT INTO messages (conversation_id, sender_id, body)
    A->>DB: UPDATE conversations SET updated_at = NOW()
    A-->>F: 201 Created { message }
    F-->>E: Message affiché dans la conversation
```

**Explication** : L'étudiant rédige un message dans une conversation existante. L'API authentifie la requête, vérifie que l'utilisateur est bien membre de la conversation, crée le message et met à jour le champ `updated_at` de la conversation pour refléter l'activité récente.

---

## 5. Programmer un entretien

```mermaid
sequenceDiagram
    participant EN as Entreprise
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL
    participant Q as Queue (Email)

    EN->>F: Accepter la candidature
    F->>A: PUT /api/company/applications/{id} { status: "interview" }
    A->>DB: UPDATE applications SET status = "interview"
    A-->>F: 200 OK

    EN->>F: Remplir le formulaire d'entretien (date, lieu, visio)
    F->>A: POST /api/company/applications/{id}/schedule-interview
    A->>A: Valider la date et les détails
    A->>DB: INSERT INTO interviews (application_id, date, location, ...)
    A->>Q: Dispatch EmailJob (invitation étudiant)
    A-->>F: 201 Created { interview }
    F-->>EN: Entretien confirmé
```

**Explication** : L'entreprise procède en deux étapes. D'abord, elle met à jour le statut de la candidature à `interview`. Ensuite, elle programme l'entretien en renseignant la date, le lieu ou le lien de visioconférence. Un email d'invitation est envoyé à l'étudiant via la file de jobs.

---

## 6. Dashboard admin

```mermaid
sequenceDiagram
    participant ADM as Admin
    participant F as Frontend
    participant A as API (Laravel)
    participant DB as MySQL

    ADM->>F: Accéder au dashboard
    F->>A: GET /api/admin/stats
    A->>A: Vérifier le rôle admin
    A->>DB: SELECT COUNT(*) FROM users
    A->>DB: SELECT COUNT(*) FROM companies
    A->>DB: SELECT COUNT(*) FROM internships
    A->>DB: SELECT COUNT(*) FROM applications
    A->>DB: SELECT COUNT(*) FROM conversations
    A->>A: Calculer les stats + données graphiques
    A-->>F: 200 OK { stats, graphs }
    F-->>ADM: Afficher dashboard avec graphiques
```

**Explication** : L'administrateur accède au tableau de bord. L'API vérifie que l'utilisateur a bien le rôle `admin`, puis exécute plusieurs requêtes de comptage sur les entités principales (utilisateurs, entreprises, offres, candidatures, conversations). Les statistiques et les données graphiques sont retournées et affichées dans le dashboard.

---

*Dernière mise à jour : Juillet 2026*
