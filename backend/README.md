# path: backend/README.md
# ClearStack Backend

Backend API pour ClearStack - SaaS de gestion logiciels pour PME françaises.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

### Installation

1. **Cloner et installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Démarrer la base de données**
```bash
docker-compose up -d postgres
```

4. **Initialiser Prisma**
```bash
npx prisma generate
npx prisma db push
```

5. **Démarrer le serveur**
```bash
npm run dev
```

L'API sera disponible sur `http://localhost:3001`

### Outils de développement

- **Adminer** (interface DB) : `http://localhost:8080`
- **API Documentation** : `/api/v1` (voir `api/openapi.yaml`)

### Tests

```bash
npm test
```

## 📧 Configuration des Notifications Email

### Configuration SMTP

1. **Gmail** (recommandé pour le développement) :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=votre-mot-de-passe-application
   ```

2. **SendGrid** (recommandé pour la production) :
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=votre-clé-api-sendgrid
   ```

### Schedulers Automatiques

Les tâches automatiques sont configurées avec les horaires suivants (Europe/Paris) :

- **Alertes quotidiennes** : Tous les jours à 8h00
  - Contrats approchant de leur fin (selon notice_days)
  - Tâches en retard dans les projets d'achat

- **Digest hebdomadaire** : Tous les vendredis à 8h00
  - Récapitulatif de l'activité de la semaine
  - Économies suggérées et contrats à renouveler

- **Nettoyage** : Tous les dimanches à 2h00
  - Suppression des notifications > 90 jours

### Endpoints Utilitaires

- `POST /api/v1/notifications/test-email` - Envoie un email de test (Admin)
- `POST /api/v1/notifications/send-digest` - Lance le digest manuellement (Admin)
- `POST /api/v1/notifications/send-alerts` - Force les alertes quotidiennes (Admin)

## 📁 Structure

```
backend/
├── prisma/schema.prisma    # Modèle de données
├── src/
│   ├── server.ts          # Point d'entrée
│   ├── middlewares/       # Auth, tenant, erreurs
│   ├── modules/           # Logique métier par domaine
│   └── __tests__/         # Tests unitaires
├── database/              # Schémas SQL
└── docker-compose.yml     # Services locaux
```

## 🔐 Authentification

- JWT Bearer tokens
- Multi-tenant (company_id)
- Rôles : ADMIN, USER

## 📊 Fonctionnalités

- ✅ Inventaire logiciels & contrats
- ✅ Avis internes avec anti-biais
- ✅ Demandes d'achat & votes
- ✅ Multi-tenant strict
- ✅ Validation Zod
- ✅ Tests Jest

## 🔗 Intégration LeBonLogiciel (LBL)

### Configuration

Ajouter les variables d'environnement dans `.env` :
```env
LBL_BASE_URL=https://api.lebonlogiciel.com
LBL_API_KEY=votre-cle-api-lbl
```

### Endpoints disponibles

- **Recherche** : `GET /api/v1/integrations/lbl/search?q=slack`
- **Détails** : `GET /api/v1/integrations/lbl/softwares/{id}`
- **Liaison** : `POST /api/v1/softwares/{id}/link-lbl`
- **Synchronisation** : `POST /api/v1/softwares/{id}/sync-lbl`
- **Health check** : `GET /api/v1/integrations/lbl/health`

### Synchronisation automatique

La synchronisation avec LeBonLogiciel s'exécute automatiquement tous les jours à 2h00 Europe/Paris.
Elle met à jour les catégories et versions des logiciels liés au référentiel.

### Test manuel

```bash
# Rechercher un logiciel
curl "http://localhost:3001/api/v1/integrations/lbl/search?q=slack" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Vérifier la santé de l'API LBL
curl "http://localhost:3001/api/v1/integrations/lbl/health" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lier un logiciel à une référence LBL
curl -X POST "http://localhost:3001/api/v1/softwares/SOFTWARE_ID/link-lbl" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"external_ref_id": "lbl-software-id", "category": "Communication"}'
```

### Adaptation des endpoints

Si l'API LeBonLogiciel utilise des endpoints différents, modifier les URLs dans `src/services/lbl.ts` :
```typescript
// Exemple d'adaptation
const url = `${this.baseUrl}/api/search?term=${encodeURIComponent(query)}`;
```

## 🎯 Connecteur Prospection

ClearStack peut automatiquement exporter vos données vers votre outil de prospection pour des campagnes ultra-ciblées.

### Configuration

1. **Variables d'environnement** dans `.env` :
```env
PROSPECT_BASE_URL=https://api.mon-prospect.fr
PROSPECT_API_KEY=votre-cle-api-prospect
PROSPECT_ENABLED=true
```

2. **Activation** : L'intégration est OFF par défaut et doit être activée par un Admin dans l'interface.

### Endpoints de l'outil de prospection

Le connecteur envoie automatiquement les données vers ces endpoints :
- `POST /v1/events/software-usage` - Déclarations d'usage logiciel
- `POST /v1/events/review-created` - Nouveaux avis créés
- `POST /v1/events/contract-renewal` - Renouvellements de contrats
- `POST /v1/events/request-created` - Nouvelles demandes logiciel
- `POST /v1/events/request-accepted` - Demandes acceptées
- `POST /v1/events/economy-opportunity` - Opportunités d'économie

### API de gestion

- `GET /api/v1/integrations/prospect/settings` - Récupérer les paramètres
- `PATCH /api/v1/integrations/prospect/settings` - Modifier les paramètres
- `POST /api/v1/integrations/prospect/test` - Envoyer un test
- `POST /api/v1/integrations/prospect/export-now` - Export immédiat
- `GET /api/v1/integrations/prospect/stats` - Statistiques outbox

### Test manuel

```bash
# Tester la connexion
curl -X POST "http://localhost:3001/api/v1/integrations/prospect/test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Exporter immédiatement un échantillon
curl -X POST "http://localhost:3001/api/v1/integrations/prospect/export-now" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Voir les statistiques
curl "http://localhost:3001/api/v1/integrations/prospect/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Modifier les paramètres
curl -X PATCH "http://localhost:3001/api/v1/integrations/prospect/settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prospectEnabled": true, "anonymize": true}'
```

### Fonctionnalités de sécurité

- **Opt-in obligatoire** : OFF par défaut, activation manuelle par Admin uniquement
- **Multi-tenant strict** : seules les données de la company courante sont exportées
- **Anonymisation optionnelle** : emails remplacés par des hashs SHA256 pour la confidentialité
- **File d'attente robuste** : retry automatique avec backoff exponentiel (max 5 tentatives)
- **Respect RGPD** : anonymisation paramétrable, logs sans données personnelles

### Monitoring et maintenance

- **Scheduler automatique** : traitement toutes les 10 minutes
- **Interface Admin** : page de paramétrage avec statistiques en temps réel
- **Logs détaillés** : préfixes `[PROSPECT]` et `[OUTBOX]` pour le debugging
- **Nettoyage automatique** : suppression des événements > 30 jours
- **Statistiques** : événements en attente/envoyés/échoués avec historique

### Architecture technique

- **Outbox Pattern** : garantit la livraison des événements même en cas de panne
- **Backoff exponentiel** : 2^n minutes entre les tentatives (max 60 min)
- **Hooks métier** : capture automatique des événements lors des actions utilisateur
- **Anonymisation RGPD** : hashs SHA256 déterministes pour le tracking anonyme