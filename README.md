# ClearStack - SaaS de gestion logiciels pour PME françaises

Application React + TypeScript + Vite pour recenser, évaluer et optimiser l'usage des logiciels en entreprise.

## Déploiement

### Développement avec Docker

```bash
# Lancer l'application en mode développement
docker-compose up --build

# Appliquer les migrations Prisma (dans un autre terminal)
docker exec -it clearstack-app-1 npx prisma migrate deploy

# Accéder à l'application
# Frontend + Backend : http://localhost:3000
# Base de données Adminer : http://localhost:8080
# Connexion Adminer : Serveur=db, Utilisateur=clearstack, Mot de passe=password
```

### Production

```bash
# Build de l'image Docker
docker build -t clearstack:latest .

# Lancer avec variables d'environnement
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/clearstack" \
  -e JWT_SECRET="your-secret-key" \
  clearstack:latest
```

## 🌱 Données de démo

### Lancement
```bash
# Appliquer les migrations et générer les données de démo
npx prisma migrate deploy && npm run seed
```

### Connexions de test
- **Admin** : `admin@demo.co` (rôle ADMIN, peut créer entités)
- **Utilisateur** : `user@demo.co` (rôle USER standard)

### Scénarios de test disponibles

**Anti-biais avis :**
- Slack : 2 avis existants, `user@demo.co` n'a pas encore donné d'avis (moyenne cachée)
- Figma : 1 avis existant + 1 avis de `user@demo.co` (détails visibles)

**Alertes contrats (J-95) :**
- Slack : échéance dans 95 jours (notification générée)
- Figma : échéance dans 32 jours
- Pipedrive : échéance dans 8 jours (critique)

**Demandes et votes :**
- HubSpot Marketing : 4 votes, statut SUBMITTED
- Notion : 2 votes, statut REVIEW
- Mailjet : acceptée → projet d'achat créé

**Projet d'achat (4 étapes) :**
- Mailjet en étape 2 avec 2 tâches (1 échue pour notification)

**Économies suggérées :**
- Licence inactive Slack : 200€
- Redondance Slack vs Teams : 150€
- Négociation renouvellement Pipedrive : 30€
- **Total : 380€ d'économies potentielles**

## Mode léger

ClearStack fonctionne actuellement en **mode léger** pour réduire l'empreinte disque tout en conservant toutes les fonctionnalités MVP essentielles.

### Fonctionnalités temporairement désactivées

- **Export PDF** : Génération de rapports PDF (dashboard, échéances, projets)
- **Tests e2e** : Tests end-to-end avec Playwright
- **Tests de performance** : Audits Lighthouse et Web Vitals
- **Tests d'accessibilité** : Validation axe-core automatisée

### Fonctionnalités conservées

✅ **Toutes les fonctionnalités MVP** :
- Onboarding et authentification
- Avis anti-biais
- Demandes de logiciels avec votes
- Projets d'achat (4 étapes)
- Assistant d'import
- Notifications (email + push)
- Connecteur LeBonLogiciel
- Connecteur prospection
- Dark mode
- Système de parrainage
- Analytics d'adoption

### Revenir au mode complet

Pour réactiver toutes les fonctionnalités :

```bash
# 1. Réinstaller les dépendances lourdes
npm install --save-dev @playwright/test @axe-core/playwright @lhci/cli puppeteer

# 2. Réactiver l'export PDF
echo "VITE_ENABLE_PDF=true" >> .env.local

# 3. Restaurer les scripts package.json
# Ajouter manuellement les scripts test:e2e, lhci, etc.

# 4. Restaurer les fichiers supprimés depuis Git
git checkout HEAD -- tests/e2e/ .lighthouserc.json .github/workflows/perf.yml
git checkout HEAD -- backend/src/services/pdf.ts backend/src/services/pdfGenerator.ts backend/src/reports/

# 5. Supprimer le fichier .npmrc
rm .npmrc
```

### Estimation d'espace libéré

- **~225 packages npm** supprimés
- **~500MB** d'espace disque libéré
- **Navigateurs Playwright** non téléchargés (~200MB économisés)
- **Binaires Puppeteer** non téléchargés (~150MB économisés)

**Total estimé : ~850MB d'espace libéré**

### Conseils supplémentaires

Si vous avez encore besoin de plus d'espace :

```bash
# Nettoyer Docker (si utilisé)
docker system prune -a --volumes

# Nettoyer les caches
npm cache clean --force
rm -rf node_modules/.cache

# Nettoyer les builds
rm -rf dist build .next out
```

# Analytics

ClearStack utilise PostHog pour l'analytics produit et le suivi de l'adoption.

## Configuration

### Variables d'environnement

```bash
# Frontend
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_POSTHOG_KEY=pk_xxx
VITE_MOCK_ANALYTICS=false

# Backend
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_API_KEY=pk_xxx
POSTHOG_PERSONAL_API_KEY=phc_xxx
MOCK_ANALYTICS=false
```

### Mode MOCK

Pour tester l'Adoption Cockpit sans compte PostHog :

```bash
MOCK_ANALYTICS=true
VITE_MOCK_ANALYTICS=true
```

## Événements suivis

### Événements d'activation
- `signup_completed` - Première session après inscription
- `onboarding_done` - Fin du tutoriel d'onboarding
- `first_action` - Première action utilisateur (avis, demande, import)

### Événements produit
- `review_created` - Création d'un avis logiciel
- `request_submitted` - Soumission d'une demande logiciel
- `import_committed` - Import de logiciels finalisé
- `project_done` - Projet d'achat terminé

### Événements PLG
- `invite_sent` - Invitation envoyée
- `invite_redeemed` - Inscription via lien de parrainage
- `invite_link_copied` - Copie du lien de parrainage
- `invite_shared_linkedin` - Partage LinkedIn

### Événements optionnels
- `notification_enabled_push` - Activation des notifications push

## Filtre multi-tenant

Toutes les requêtes backend ajoutent automatiquement `properties.company_id` pour l'isolation des données par entreprise.

## Métriques clés

- **Activation 24h** : % d'utilisateurs ayant fait une première action < 24h après inscription
- **Médiane TTV** : Temps médian entre inscription et première action (en minutes)
- **Invite rate** : % d'utilisateurs ayant envoyé ≥1 invitation
- **Invites → Activation** : % d'invitations suivies d'une première action < 7 jours