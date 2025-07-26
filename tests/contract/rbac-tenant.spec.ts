// path: tests/contract/rbac-tenant.spec.ts
import { test, expect } from '@playwright/test';

test.describe('RBAC & Tenant Isolation', () => {
  test.beforeEach(async ({ page }) => {
    // Configuration de base pour les tests
    await page.goto('/');
  });

  test('Un utilisateur ne peut pas accéder aux données d\'une autre société', async ({ page }) => {
    // TODO: Implémenter le test d'isolation tenant
    // 1. Se connecter avec user de company A
    // 2. Tenter d'accéder aux données de company B via API directe
    // 3. Vérifier que l'accès est refusé (403)
    
    // Mock de connexion utilisateur Company A
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_company_a');
      localStorage.setItem('user_company_id', 'company_a');
    });

    // Tentative d'accès aux données d'une autre société via API
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/v1/softwares', {
          headers: {
            'Authorization': 'Bearer mock_token_company_a',
            'X-Company-Id': 'company_b', // Tentative d'accès à une autre société
          },
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Vérifier que l'accès est refusé
    expect(response.status).toBe(403);
    expect(response.ok).toBe(false);
  });

  test('Les données listées sont filtrées par company_id', async ({ page }) => {
    // TODO: Implémenter le test de filtrage des listes
    // 1. Se connecter avec un utilisateur
    // 2. Récupérer la liste des logiciels
    // 3. Vérifier que tous les éléments appartiennent à la même société
    
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_valid');
      localStorage.setItem('user_company_id', 'demo_company');
    });

    // Naviguer vers la page des logiciels
    await page.goto('/logiciels');
    
    // Attendre le chargement des données
    await page.waitForSelector('[data-testid="software-list"]', { timeout: 5000 });

    // Vérifier que les données affichées appartiennent à la bonne société
    const softwareItems = await page.locator('[data-testid="software-item"]').all();
    
    for (const item of softwareItems) {
      // Chaque élément devrait avoir un attribut data-company-id correspondant
      const companyId = await item.getAttribute('data-company-id');
      expect(companyId).toBe('demo_company');
    }
  });

  test('Un USER ne peut pas accéder aux fonctions ADMIN', async ({ page }) => {
    // Mock de connexion utilisateur standard
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_user');
      localStorage.setItem('user_role', 'USER');
    });

    // Tenter d'accéder au dashboard admin
    await page.goto('/admin/dashboard');

    // Vérifier la redirection ou l'erreur d'accès
    await expect(page).toHaveURL(/\/access-denied|\/login|\/$/);
    
    // Ou vérifier qu'un message d'erreur est affiché
    const errorMessage = page.locator('[data-testid="access-denied-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('Accès refusé');
    }
  });

  test('Un ADMIN peut accéder aux fonctions d\'administration', async ({ page }) => {
    // Mock de connexion administrateur
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_admin');
      localStorage.setItem('user_role', 'ADMIN');
    });

    // Accéder au dashboard admin
    await page.goto('/admin/dashboard');

    // Vérifier que la page se charge correctement
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    
    // Vérifier la présence d'éléments spécifiques aux admins
    await expect(page.locator('[data-testid="company-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-actions"]')).toBeVisible();
  });

  test('Les menus sont masqués selon le rôle utilisateur', async ({ page }) => {
    // Test avec utilisateur standard
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_user');
      localStorage.setItem('user_role', 'USER');
    });

    await page.goto('/');
    
    // Vérifier que les menus admin ne sont pas visibles
    await expect(page.locator('[data-testid="admin-menu"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="import-menu"]')).not.toBeVisible();
    
    // Vérifier que les menus utilisateur sont visibles
    await expect(page.locator('[data-testid="realisations-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="software-menu"]')).toBeVisible();

    // Test avec administrateur
    await page.evaluate(() => {
      localStorage.setItem('user_role', 'ADMIN');
    });

    await page.reload();

    // Vérifier que les menus admin sont maintenant visibles
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-menu"]')).toBeVisible();
  });

  test('Les API endpoints respectent les permissions', async ({ page }) => {
    // Test des endpoints avec différents rôles
    const endpoints = [
      { path: '/api/v1/admin/users', adminOnly: true },
      { path: '/api/v1/admin/settings', adminOnly: true },
      { path: '/api/v1/softwares', adminOnly: false },
      { path: '/api/v1/reviews', adminOnly: false },
    ];

    for (const endpoint of endpoints) {
      // Test avec utilisateur standard
      let response = await page.evaluate(async (path) => {
        try {
          const res = await fetch(path, {
            headers: {
              'Authorization': 'Bearer mock_token_user',
              'X-User-Role': 'USER',
            },
          });
          return { status: res.status, ok: res.ok };
        } catch (error) {
          return { error: error.message };
        }
      }, endpoint.path);

      if (endpoint.adminOnly) {
        expect(response.status).toBe(403); // Accès refusé pour USER
      } else {
        expect(response.status).not.toBe(403); // Accès autorisé pour USER
      }

      // Test avec administrateur
      response = await page.evaluate(async (path) => {
        try {
          const res = await fetch(path, {
            headers: {
              'Authorization': 'Bearer mock_token_admin',
              'X-User-Role': 'ADMIN',
            },
          });
          return { status: res.status, ok: res.ok };
        } catch (error) {
          return { error: error.message };
        }
      }, endpoint.path);

      expect(response.status).not.toBe(403); // Accès autorisé pour ADMIN
    }
  });

  test('Les données sensibles ne sont pas exposées selon le rôle', async ({ page }) => {
    // Mock de connexion utilisateur standard
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token_user');
      localStorage.setItem('user_role', 'USER');
    });

    await page.goto('/logiciels/software-123');

    // Vérifier que les informations de coût ne sont pas visibles pour un USER
    await expect(page.locator('[data-testid="contract-cost"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="budget-info"]')).not.toBeVisible();

    // Changer pour un admin
    await page.evaluate(() => {
      localStorage.setItem('user_role', 'ADMIN');
    });

    await page.reload();

    // Vérifier que les informations de coût sont maintenant visibles
    await expect(page.locator('[data-testid="contract-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-info"]')).toBeVisible();
  });
});