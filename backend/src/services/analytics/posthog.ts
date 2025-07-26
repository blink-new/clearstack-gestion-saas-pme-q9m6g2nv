import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const MOCK = process.env.MOCK_ANALYTICS === 'true';
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

// Cache mémoire simple avec TTL 5 minutes
const cache = new Map<string, { data: any; expires: number }>();

function getCacheKey(endpoint: string, params: any): string {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
}

async function postHogRequest(endpoint: string, params: any): Promise<any> {
  if (MOCK) {
    console.info('[Analytics] MOCK mode - returning fake data');
    return null;
  }

  if (!POSTHOG_PERSONAL_API_KEY) {
    throw new Error('POSTHOG_PERSONAL_API_KEY not configured');
  }

  const cacheKey = getCacheKey(endpoint, params);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${params.project_id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('[Analytics] PostHog request failed:', error);
    throw error;
  }
}

export async function queryFunnelTTV({ from, to, company_id }: { 
  from: string; 
  to: string; 
  company_id: string; 
}) {
  if (MOCK) {
    return {
      steps: [
        { name: 'signup_completed', count: 100, conversion: 1.0 },
        { name: 'onboarding_done', count: 70, conversion: 0.7 },
        { name: 'first_action', count: 55, conversion: 0.55 }
      ],
      median_ttv_minutes: 38
    };
  }

  // TODO: Implémentation réelle PostHog Funnel API
  const params = {
    project_id: process.env.POSTHOG_PROJECT_ID,
    events: [
      { id: 'signup_completed', name: 'signup_completed' },
      { id: 'onboarding_done', name: 'onboarding_done' },
      { id: 'first_action', name: 'first_action' }
    ],
    filters: {
      date_from: from,
      date_to: to,
      properties: [
        { key: 'company_id', value: company_id, operator: 'exact' }
      ]
    }
  };

  return await postHogRequest('insights/funnel', params);
}

export async function queryInvitesConversion({ from, to, company_id }: { 
  from: string; 
  to: string; 
  company_id: string; 
}) {
  if (MOCK) {
    return {
      steps: [
        { name: 'invite_sent', count: 45, conversion: 1.0 },
        { name: 'invite_redeemed', count: 18, conversion: 0.4 },
        { name: 'first_action', count: 12, conversion: 0.27 }
      ],
      conversion_rate: 0.27
    };
  }

  // TODO: Implémentation réelle PostHog Funnel API
  const params = {
    project_id: process.env.POSTHOG_PROJECT_ID,
    events: [
      { id: 'invite_sent', name: 'invite_sent' },
      { id: 'invite_redeemed', name: 'invite_redeemed' },
      { id: 'first_action', name: 'first_action' }
    ],
    filters: {
      date_from: from,
      date_to: to,
      properties: [
        { key: 'company_id', value: company_id, operator: 'exact' }
      ]
    }
  };

  return await postHogRequest('insights/funnel', params);
}

export async function queryRetentionCohorts({ 
  period, 
  months, 
  company_id 
}: { 
  period: 'weekly' | 'monthly'; 
  months: number; 
  company_id: string; 
}) {
  if (MOCK) {
    const cohorts = [];
    for (let i = 0; i < months; i++) {
      const cohort = {
        period: `${period === 'weekly' ? 'Semaine' : 'Mois'} ${i}`,
        values: []
      };
      for (let j = 0; j <= i; j++) {
        // Simulation d'une rétention décroissante
        const retention = Math.max(0.1, 1 - (j * 0.15) - Math.random() * 0.1);
        cohort.values.push(Math.round(retention * 100) / 100);
      }
      cohorts.push(cohort);
    }
    return { cohorts };
  }

  // TODO: Implémentation réelle PostHog Cohorts API
  const params = {
    project_id: process.env.POSTHOG_PROJECT_ID,
    period,
    months,
    filters: {
      properties: [
        { key: 'company_id', value: company_id, operator: 'exact' }
      ]
    }
  };

  return await postHogRequest('insights/retention', params);
}

export async function queryFeatureUsageShare({ from, to, company_id }: { 
  from: string; 
  to: string; 
  company_id: string; 
}) {
  if (MOCK) {
    return {
      features: [
        { name: 'Avis', count: 32, percentage: 0.58 },
        { name: 'Demandes', count: 18, percentage: 0.33 },
        { name: 'Import', count: 5, percentage: 0.09 }
      ],
      total_first_actions: 55
    };
  }

  // TODO: Implémentation réelle PostHog Events API
  const params = {
    project_id: process.env.POSTHOG_PROJECT_ID,
    events: ['first_action'],
    filters: {
      date_from: from,
      date_to: to,
      properties: [
        { key: 'company_id', value: company_id, operator: 'exact' }
      ]
    },
    breakdown: 'kind'
  };

  return await postHogRequest('insights/trend', params);
}