# Politique de sécurité — StageLink

## Signalement de failles de sécurité

Si vous découvrez une vulnérabilité dans StageLink, merci de la signaler de manière responsable.

### Comment signaler ?

**Email :** victortsimamandro@gmail.com

**Objet du message :** `[SÉCURITÉ] - Description courte de la vulnérabilité`

**Informations à inclure :**
- Description de la faille
- Étapes pour reproduire
- Impact potentiel
- Version concernée
- Toute suggestion de correction (optionnel)

### Processus

| Étape | Délai | Description |
|-------|-------|-------------|
| Accusé de réception | 24h | Confirmation de réception du signalement |
| Évaluation | 72h | Classification par sévérité (critique/haute/moyenne/basse) |
| Correction | Variable | Développement du correctif selon la sévérité |
| Notification | Après fix | Information du signaleur avant publication |
| Crédit | Publication | Mention du signaleur (sauf anonymat demandé) |

### Temps de réponse selon la sévérité

| Sévérité | Exemples | Délai de correction |
|----------|----------|---------------------|
| Critique | Injection SQL, auth bypass, exfiltration de données | 24-48h |
| Haute | XSS stocké, elevation de privilege, accès non autorisé | 1 semaine |
| Moyenne | CSRF, information disclosure, denial of service | 2 semaines |
| Basse | Best practices, hardening, minor issues | Prochaine release |

### Ce qui ne qualifie PAS comme vulnérabilité

- Attaques physiques ou sociales
- Dénie de service (DoS) sur des endpoints non critiques
- Rapports automatisés sans preuve d'exploitation
- Vulnérabilités dans des dépendances tierces (signaler au mainteneur)
- Problèmes de configuration du serveur de déploiement

### Politique de confidentialité

- Les signalements restent confidentiels jusqu'à la correction
- Pas de poursuites légales contre les chercheurs de bonne foi
- Le signaleur peut demander l'anonymat
- Nous ne collectons pas de données personnelles via le formulaire de signalement

### Déploiement des correctifs

```
1. Correctif développé en branche privée
2. Tests automatisés exécutés
3. Review de code (si équipe disponible)
4. Déploiement staging → vérification
5. Déploiement production
6. CVE attribué (si applicable)
7. Notification des utilisateurs (si impact majeur)
```

### Contact

| Canal | Usage |
|-------|-------|
| victortsimamandro@gmail.com | Signalement de failles |
| https://github.com/anomalyco/opencode/issues | Bugs (pas de failles) |

**Merci de contribuer à la sécurité de StageLink.**
