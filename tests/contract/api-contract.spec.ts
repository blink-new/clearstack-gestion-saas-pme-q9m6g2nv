import { test, expect } from '@playwright/test';
import { 
  UserSchema, 
  SoftwareSchema, 
  ReviewSchema, 
  RequestSchema, 
  NotificationSchema 
} from '../../src/lib/zod-schemas';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api/v1';

test.describe('Contrats API ↔ Zod', () => {
  let authToken: string;
  let companyId: string;

  test.beforeAll(async ({ request }) => {
    // Mock login pour obtenir token
    const loginResponse = await request.post(`${API_BASE_URL}/auth/login-email`, {
      data: { email: 'test@clearstack.fr' }
    });
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      companyId = loginData.company_id;
    } else {
      // Utiliser token mock si login échoue
      authToken = 'mock-jwt-token';
      companyId = 'mock-company-id';
    }
  });

  test('GET /me - Validation schéma User', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId
      }
    });

    expect(response.ok()).toBeTruthy();
    const userData = await response.json();

    // Validation avec schéma Zod
    const parseResult = UserSchema.safeParse(userData);
    
    if (!parseResult.success) {
      console.error('Erreurs validation User:', parseResult.error.errors);
      expect(parseResult.success).toBeTruthy();
    }

    // Vérifications spécifiques
    expect(userData).toHaveProperty('id');
    expect(userData).toHaveProperty('email');
    expect(userData).toHaveProperty('role');
    expect(['ADMIN', 'USER']).toContain(userData.role);
  });

  test('GET /softwares - Validation schéma Software[]', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/softwares`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId
      }
    });

    expect(response.ok()).toBeTruthy();
    const softwaresData = await response.json();

    // Vérifier structure de réponse paginée
    expect(softwaresData).toHaveProperty('data');
    expect(softwaresData).toHaveProperty('total');
    expect(Array.isArray(softwaresData.data)).toBeTruthy();

    // Valider chaque logiciel avec schéma Zod
    for (const software of softwaresData.data) {
      const parseResult = SoftwareSchema.safeParse(software);
      
      if (!parseResult.success) {
        console.error(`Erreurs validation Software ${software.id}:`, parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifications spécifiques
      expect(software).toHaveProperty('id');
      expect(software).toHaveProperty('name');
      expect(software).toHaveProperty('category');
    }
  });

  test('GET /reviews - Validation schéma Review[]', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/reviews?software_id=mock-software-id`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId
      }
    });

    expect(response.ok()).toBeTruthy();
    const reviewsData = await response.json();

    // Vérifier structure de réponse
    expect(reviewsData).toHaveProperty('data');
    expect(Array.isArray(reviewsData.data)).toBeTruthy();

    // Valider chaque avis avec schéma Zod
    for (const review of reviewsData.data) {
      const parseResult = ReviewSchema.safeParse(review);
      
      if (!parseResult.success) {
        console.error(`Erreurs validation Review ${review.id}:`, parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifications spécifiques
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('rating');
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review).toHaveProperty('strengths');
      expect(review).toHaveProperty('weaknesses');
    }
  });

  test('GET /requests - Validation schéma Request[]', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId
      }
    });

    expect(response.ok()).toBeTruthy();
    const requestsData = await response.json();

    // Vérifier structure de réponse paginée
    expect(requestsData).toHaveProperty('data');
    expect(requestsData).toHaveProperty('total');
    expect(Array.isArray(requestsData.data)).toBeTruthy();

    // Valider chaque demande avec schéma Zod
    for (const requestItem of requestsData.data) {
      const parseResult = RequestSchema.safeParse(requestItem);
      
      if (!parseResult.success) {
        console.error(`Erreurs validation Request ${requestItem.id}:`, parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifications spécifiques
      expect(requestItem).toHaveProperty('id');
      expect(requestItem).toHaveProperty('software_ref');
      expect(requestItem).toHaveProperty('description_need');
      expect(requestItem).toHaveProperty('urgency');
      expect(['IMMEDIATE', 'LT_3M', 'GT_3M']).toContain(requestItem.urgency);
      expect(requestItem).toHaveProperty('status');
      expect(['DRAFT', 'SUBMITTED', 'REVIEW', 'ACCEPTED', 'REFUSED']).toContain(requestItem.status);
    }
  });

  test('GET /notifications - Validation schéma Notification[]', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId
      }
    });

    expect(response.ok()).toBeTruthy();
    const notificationsData = await response.json();

    // Vérifier structure de réponse paginée
    expect(notificationsData).toHaveProperty('data');
    expect(notificationsData).toHaveProperty('unread_count');
    expect(Array.isArray(notificationsData.data)).toBeTruthy();

    // Valider chaque notification avec schéma Zod
    for (const notification of notificationsData.data) {
      const parseResult = NotificationSchema.safeParse(notification);
      
      if (!parseResult.success) {
        console.error(`Erreurs validation Notification ${notification.id}:`, parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifications spécifiques
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('type');
      expect(['ALERT_CONTRACT', 'REQUEST', 'PROJECT_TASK', 'SYSTEM']).toContain(notification.type);
      expect(notification).toHaveProperty('payload');
      expect(notification).toHaveProperty('read_at');
    }
  });

  test('POST /reviews - Validation création avis', async ({ request }) => {
    const newReview = {
      software_id: 'mock-software-id',
      rating: 4,
      strengths: 'Interface intuitive et rapide',
      weaknesses: 'Manque quelques fonctionnalités avancées',
      improvement: 'Ajouter plus d\'intégrations',
      tags: ['interface', 'performance']
    };

    const response = await request.post(`${API_BASE_URL}/reviews`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json'
      },
      data: newReview
    });

    // Accepter 201 (créé) ou 400 (validation) pour test contrat
    expect([201, 400, 422]).toContain(response.status());

    if (response.ok()) {
      const createdReview = await response.json();
      
      // Validation avec schéma Zod
      const parseResult = ReviewSchema.safeParse(createdReview);
      
      if (!parseResult.success) {
        console.error('Erreurs validation Review créé:', parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifier que les données envoyées sont présentes
      expect(createdReview.rating).toBe(newReview.rating);
      expect(createdReview.strengths).toBe(newReview.strengths);
      expect(createdReview.weaknesses).toBe(newReview.weaknesses);
    }
  });

  test('POST /requests - Validation création demande', async ({ request }) => {
    const newRequest = {
      software_ref: 'Nouveau logiciel de test',
      description_need: 'Nous avons besoin de ce logiciel pour améliorer notre productivité',
      urgency: 'LT_3M',
      est_budget: 500.00
    };

    const response = await request.post(`${API_BASE_URL}/requests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json'
      },
      data: newRequest
    });

    // Accepter 201 (créé) ou 400 (validation) pour test contrat
    expect([201, 400, 422]).toContain(response.status());

    if (response.ok()) {
      const createdRequest = await response.json();
      
      // Validation avec schéma Zod
      const parseResult = RequestSchema.safeParse(createdRequest);
      
      if (!parseResult.success) {
        console.error('Erreurs validation Request créé:', parseResult.error.errors);
        expect(parseResult.success).toBeTruthy();
      }

      // Vérifier que les données envoyées sont présentes
      expect(createdRequest.software_ref).toBe(newRequest.software_ref);
      expect(createdRequest.description_need).toBe(newRequest.description_need);
      expect(createdRequest.urgency).toBe(newRequest.urgency);
    }
  });

  test('Gestion erreurs API - Format standardisé', async ({ request }) => {
    // Tenter requête avec token invalide
    const response = await request.get(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token',
        'X-Company-Id': companyId
      }
    });

    expect(response.status()).toBe(401);
    const errorData = await response.json();

    // Vérifier format d'erreur standardisé
    expect(errorData).toHaveProperty('code');
    expect(errorData).toHaveProperty('message');
    expect(typeof errorData.message).toBe('string');
    expect(errorData.message.length).toBeGreaterThan(0);
  });

  test('Multi-tenant - Isolation des données', async ({ request }) => {
    // Tenter accès avec company_id différent
    const response = await request.get(`${API_BASE_URL}/softwares`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Company-Id': 'other-company-id'
      }
    });

    // Doit retourner 403 (interdit) ou données vides selon implémentation
    if (response.ok()) {
      const data = await response.json();
      // Si OK, vérifier que les données sont vides ou filtrées
      expect(data.data).toEqual([]);
    } else {
      expect([401, 403]).toContain(response.status());
    }
  });
});