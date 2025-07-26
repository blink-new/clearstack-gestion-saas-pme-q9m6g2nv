# Checklist QA ClearStack

## ✅ Fonctionnel

### Onboarding
- [ ] Connexion LinkedIn mock fonctionne
- [ ] Redirection vers page Réalisations (USER) ou Dashboard Admin (ADMIN)
- [ ] Tutoriel d'onboarding 4 étapes s'affiche pour nouveaux utilisateurs
- [ ] Stockage localStorage "tour_completed" fonctionne

### Avis Anti-biais
- [ ] Moyenne/nombre d'avis masqués avant soumission utilisateur
- [ ] Formulaire avis complet (note, points forts/faibles, amélioration, tags)
- [ ] Après soumission : affichage de tous les avis détaillés
- [ ] Limitation 200 caractères sur suggestion d'amélioration
- [ ] CTA PLG "Inviter collègue à donner avis" après soumission

### Demande + Vote
- [ ] Formulaire demande : nom logiciel, description ≤280 char, urgence, budget
- [ ] Détection demandes similaires lors de la saisie
- [ ] Système de vote +1 global (pas par service)
- [ ] Actions Admin : Accepter/Refuser avec commentaire
- [ ] CTA PLG "Inviter collègue à voter" après vote

### Projet d'achat
- [ ] Timeline 4 étapes : Besoin validé → Comparaison → Validation → Signature
- [ ] Mini-checklists par étape avec assignee, due_date, done
- [ ] Panneau latéral : budget, ROI modifiable, risques
- [ ] Bouton "Marquer terminé" change statut étape
- [ ] CTA "Convertir en fiche logiciel" si logiciel non créé

### Import Wizard
- [ ] Étape 1 : Zone collage tableau + upload CSV
- [ ] Étape 2 : Mapping colonnes → champs ClearStack avec suggestions
- [ ] Étape 3 : Prévisualisation avec édition inline + mode brouillon
- [ ] Étape 4 : Commit final avec récap lignes importées/erreurs
- [ ] CTA PLG "Inviter collègue compléter données" après import

### Notifications
- [ ] Centre : filtres par type, marquer lu/non-lu, actions inline
- [ ] Email : respect préférences ON/OFF, templates MJML avec couleurs DS
- [ ] Push : toggle ON/OFF, service worker, notifications navigateur
- [ ] Digest hebdomadaire vendredi 08:00 Europe/Paris

### Économies suggérées
- [ ] Calcul heuristiques : licences inactives, redondances, low satisfaction, renouvellement
- [ ] Affichage total € + breakdown par type
- [ ] CTA "Voir détail / lancer action"
- [ ] Recalcul automatique selon règles internes

## 🔒 RBAC & Multi-tenant

### Contrôle d'accès
- [ ] Menus masqués selon rôle (pas grisés)
- [ ] USER : Réalisations, Logiciels, Demandes, Notifications
- [ ] ADMIN : Dashboard, Logiciels, Demandes, Projets, Import, Notifications
- [ ] Aucune fuite de données entre companies (company_id strict)

### Sécurité
- [ ] Toutes les requêtes API filtrées par company_id
- [ ] JWT tokens valides et refresh automatique
- [ ] Pas d'exposition de données sensibles en frontend
- [ ] Headers X-Company-Id correctement envoyés

## 🔌 Intégrations

### LeBonLogiciel (LBL)
- [ ] Auto-complétion nom logiciel dans formulaires
- [ ] Lien référentiel : bouton "Lier au référentiel LBL"
- [ ] Badge "Référentiel LBL" si logiciel lié
- [ ] Synchronisation quotidienne 02:00 Europe/Paris
- [ ] Fail-safe : continue avec saisie libre si API indisponible

### Prospection
- [ ] Opt-in Admin obligatoire (OFF par défaut)
- [ ] Outbox pattern : événements en file d'attente
- [ ] Anonymisation optionnelle (email → SHA256 hash)
- [ ] Retry avec backoff exponentiel
- [ ] Scheduler 10 minutes : envoi événements pending

## 🚀 PLG (Product-Led Growth)

### CTA d'invitation
- [ ] Après soumission avis : "Inviter collègue évaluer"
- [ ] Après vote demande : "Parlez-en à votre équipe"
- [ ] Après import : "Inviter collègue compléter données"
- [ ] Après export : lien partage interne avec CTA invitation
- [ ] États vides : CTA "Inviter premier collègue"

### Gamification
- [ ] Badges progression : Premier avis, Contributeur, Expert, etc.
- [ ] Dashboard Réalisations : progression personnelle, objectifs
- [ ] Classement équipe activable/désactivable par Admin
- [ ] Micro-actions 1 clic depuis métriques

## 🎨 UX & Accessibilité

### Dark Mode
- [ ] Toggle fonctionnel dans header (icônes soleil/lune)
- [ ] Variables CSS inversées selon tokens design system
- [ ] Persistance localStorage + respect préférence système
- [ ] Pas de flash of unstyled theme (script anti-flash)

### États vides
- [ ] Messages encourageants avec illustrations
- [ ] CTA appropriés selon contexte
- [ ] Pas de pages blanches ou d'erreurs 404 non gérées

### Internationalisation
- [ ] Interface 100% française (labels, messages, micro-copy)
- [ ] Formats dates/heures Europe/Paris
- [ ] Messages d'erreur en français
- [ ] Pas de texte anglais résiduel

### Accessibilité AA
- [ ] Contrastes couleurs ≥ 4.5:1 (texte normal) et ≥ 3:1 (texte large)
- [ ] Focus visible sur tous éléments interactifs
- [ ] Navigation clavier complète (Tab, Enter, Espace, Échap)
- [ ] Aria-labels sur boutons icônes et éléments complexes
- [ ] Lecteurs d'écran : structure sémantique H1/H2/H3

## ⏰ Alertes & Notifications

### Alertes contrats
- [ ] Calcul échéances : fin de contrat - notice_days
- [ ] Alerte par défaut : 95 jours avant fin
- [ ] Paramétrage notice_days par contrat
- [ ] Email quotidien 08:00 Europe/Paris si alertes
- [ ] Jalons configurables (30j, 60j, 95j)

### Digest hebdomadaire
- [ ] Envoi vendredi 08:00 Europe/Paris
- [ ] Contenu : nb demandes, échéances 30/60/95j, économies suggérées
- [ ] Template MJML avec couleurs design system
- [ ] Respect préférences email_notifications utilisateur
- [ ] Lien désabonnement et préférences

## 📱 Responsive & Performance

### Mobile
- [ ] Navigation hamburger fonctionnelle
- [ ] Sidebar overlay avec backdrop
- [ ] Formulaires utilisables sur mobile
- [ ] Tableaux avec scroll horizontal si nécessaire

### Performance
- [ ] Temps de chargement initial < 3s
- [ ] Images optimisées et lazy loading
- [ ] Bundle JavaScript < 2MB
- [ ] Pas de memory leaks React (useEffect cleanup)

---

## 🧪 Tests à exécuter

- [ ] `npm run test:e2e` : Tests end-to-end Playwright
- [ ] `npm run test:a11y` : Tests accessibilité axe-core
- [ ] `npm run lhci` : Audit performance Lighthouse
- [ ] `npm run test:contract` : Validation contrats API ↔ Zod

---

**Date de vérification :** ___________  
**Testeur :** ___________  
**Environnement :** ___________  
**Version :** ___________