# Guide QA ClearStack

## 🧪 Tests Automatisés

### Tests End-to-End (Playwright)

```bash
# Lancer tous les tests e2e
npm run test:e2e

# Tests spécifiques
npm run test:e2e tests/e2e/onboarding.spec.ts
npm run test:e2e tests/e2e/review-antibias.spec.ts
npm run test:e2e tests/e2e/contract-alert.spec.ts

# Smoke tests rapides
npm run test:e2e tests/e2e/smoke/smoke.spec.ts

# Mode interactif avec UI
npm run test:e2e:ui

# Mode debug avec navigateur visible
npm run test:e2e:headed
```

### Tests d'Accessibilité (axe-core)

```bash
# Lancer tests accessibilité
npm run test:a11y

# Tests spécifiques
npm run test:e2e tests/e2e/a11y.spec.ts

# Générer rapport détaillé
npm run test:e2e tests/e2e/a11y.spec.ts -- --reporter=html
```

### Tests de Performance (Lighthouse)

```bash
# Audit performance complet
npm run lhci

# Audit local avec serveur de développement
npm run build
npm run preview &
npx lhci autorun

# Analyse bundle
npm run build
npx vite-bundle-analyzer dist
```

### Tests de Contrat API

```bash
# Validation schémas Zod ↔ API
npm run test:contract

# Tests spécifiques
npm run test:e2e tests/contract/api-contract.spec.ts
```

## 📋 Checklist QA Manuelle

Consulter le fichier [`QA-checklist.md`](./QA-checklist.md) pour la checklist complète.

### Sections principales :
- ✅ **Fonctionnel** : Onboarding, Avis anti-biais, Demandes, Projets, Import, Notifications
- 🔒 **RBAC & Multi-tenant** : Contrôles d'accès, isolation données
- 🔌 **Intégrations** : LeBonLogiciel, Prospection
- 🚀 **PLG** : CTA d'invitation, gamification
- 🎨 **UX & Accessibilité** : Dark mode, états vides, A11y AA
- ⏰ **Alertes** : Contrats, digest hebdomadaire

## 🚀 CI/CD et Automatisation

### GitHub Actions

Les tests QA sont intégrés dans les workflows CI/CD :

```yaml
# .github/workflows/ci.yml
- Tests e2e et accessibilité sur chaque PR
- Validation contrats API
- Vérification lint et build

# .github/workflows/perf.yml  
- Audit Lighthouse sur main
- Analyse bundle size
- Mesure Web Vitals
```

### Seuils de Performance

| Métrique | Seuil | Description |
|----------|-------|-------------|
| **LCP** | ≤ 2.5s | Largest Contentful Paint |
| **TTI** | ≤ 4.0s | Time to Interactive |
| **FCP** | ≤ 1.5s | First Contentful Paint |
| **Bundle** | ≤ 2MB | Taille totale JavaScript |
| **Performance** | ≥ 85/100 | Score Lighthouse |
| **Accessibilité** | ≥ 95/100 | Score Lighthouse |

## 🔧 Configuration Environnements

### Variables d'environnement pour tests

```bash
# .env.test
VITE_API_URL=http://localhost:3001/api/v1
VITE_VAPID_PUBLIC_KEY=mock-vapid-key
DATABASE_URL=postgresql://test:test@localhost:5432/clearstack_test
JWT_SECRET=test-secret
```

### Serveurs de test

```bash
# Backend de test
cd backend
npm run test:server

# Frontend de test  
npm run preview

# Base de données de test
docker-compose -f docker-compose.test.yml up -d
```

## 📊 Rapports et Monitoring

### Génération de rapports

```bash
# Rapport HTML complet
npm run test:e2e -- --reporter=html

# Rapport JSON pour CI
npm run test:e2e -- --reporter=json

# Rapport Lighthouse
lhci autorun --upload.target=temporary-public-storage
```

### Métriques à surveiller

- **Taux de réussite tests** : ≥ 95%
- **Couverture accessibilité** : 100% pages principales
- **Performance** : Respect budgets définis
- **Erreurs JavaScript** : 0 erreur critique
- **Temps de réponse API** : ≤ 500ms (95e percentile)

## 🐛 Debug et Résolution

### Tests qui échouent

```bash
# Mode debug avec pause
npm run test:e2e -- --debug

# Screenshots et traces
npm run test:e2e -- --trace=on

# Logs détaillés
DEBUG=pw:api npm run test:e2e
```

### Problèmes courants

| Problème | Solution |
|----------|----------|
| **Tests timeout** | Augmenter `timeout` dans `playwright.config.ts` |
| **Éléments non trouvés** | Vérifier `data-testid` dans composants |
| **Lighthouse échoue** | Vérifier que serveur preview est démarré |
| **Contrats API** | Vérifier schémas Zod à jour avec OpenAPI |

## 📝 Bonnes Pratiques

### Tests e2e
- Utiliser `data-testid` plutôt que classes CSS
- Tests indépendants (pas de dépendances entre tests)
- Mock des données externes (API, localStorage)
- Attendre les états de chargement (`waitForLoadState`)

### Accessibilité
- Tester navigation clavier sur chaque page
- Vérifier contrastes en mode clair ET sombre
- Valider structure sémantique (H1→H2→H3)
- Tester avec lecteur d'écran (NVDA, JAWS)

### Performance
- Optimiser images (WebP, lazy loading)
- Code splitting par route
- Précharger ressources critiques
- Minimiser JavaScript non utilisé

---

**Dernière mise à jour :** Janvier 2025  
**Version ClearStack :** 1.0.0  
**Contact QA :** qa@clearstack.fr