// path: backend/src/services/prospect.ts
import fetch from 'node-fetch';

const PROSPECT_BASE_URL = process.env.PROSPECT_BASE_URL || 'https://api.mon-prospect.fr';
const PROSPECT_API_KEY = process.env.PROSPECT_API_KEY;
const PROSPECT_ENABLED = process.env.PROSPECT_ENABLED === 'true';

interface ProspectResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Mapping des types d'événements vers les endpoints
const EVENT_ENDPOINTS: Record<string, string> = {
  SOFTWARE_USAGE: '/v1/events/software-usage',
  REVIEW_CREATED: '/v1/events/review-created',
  CONTRACT_RENEWAL: '/v1/events/contract-renewal',
  REQUEST_CREATED: '/v1/events/request-created',
  REQUEST_ACCEPTED: '/v1/events/request-accepted',
  ECONOMY_OPPORTUNITY: '/v1/events/economy-opportunity'
};

export async function postToProspect(eventType: string, body: any): Promise<ProspectResponse> {
  if (!PROSPECT_ENABLED) {
    console.log('[PROSPECT] Service désactivé, événement ignoré:', eventType);
    return { success: true, message: 'Service désactivé' };
  }

  if (!PROSPECT_API_KEY) {
    throw new Error('PROSPECT_API_KEY manquante dans la configuration');
  }

  const endpoint = EVENT_ENDPOINTS[eventType];
  if (!endpoint) {
    throw new Error(`Type d'événement non supporté: ${eventType}`);
  }

  const url = `${PROSPECT_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROSPECT_API_KEY}`,
        'User-Agent': 'ClearStack/1.0'
      },
      body: JSON.stringify(body),
      timeout: 10000 // 10 secondes
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erreur inconnue');
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json().catch(() => ({}));
    
    console.log(`[PROSPECT] Événement ${eventType} envoyé avec succès`);
    return { success: true, data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[PROSPECT] Échec envoi ${eventType}:`, errorMessage);
    throw new Error(`Échec envoi vers outil de prospection: ${errorMessage}`);
  }
}

// Retry simple avec backoff exponentiel
export async function postToProspectWithRetry(
  eventType: string, 
  body: any, 
  maxRetries: number = 3
): Promise<ProspectResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await postToProspect(eventType, body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erreur inconnue');
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Max 30s
        console.log(`[PROSPECT] Tentative ${attempt}/${maxRetries} échouée, retry dans ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Échec après tous les retries');
}

// Test de connectivité
export async function testProspectConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testPayload = {
      company_id: 'test-company',
      test: true,
      timestamp: new Date().toISOString()
    };
    
    await postToProspect('SOFTWARE_USAGE', testPayload);
    return { success: true, message: 'Connexion réussie vers l\'outil de prospection' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur de connexion';
    return { success: false, message };
  }
}