// path: src/hooks/useAnalytics.ts
import { useEffect } from 'react';
import posthog from 'posthog-js';

interface AnalyticsEvent {
  onboarding_done: { step: string; duration_ms: number };
  review_created: { software_id: string; rating: number; has_improvement: boolean };
  request_submitted: { urgency: string; has_budget: boolean; software_ref?: string };
  project_done: { project_id: string; duration_days: number; roi_estimate?: string };
  feature_flag_toggled: { flag_key: string; enabled: boolean; scope: string };
  beta_feedback_submitted: { page: string; rating?: number; has_message: boolean };
  page_viewed: { page: string; role: string };
  import_completed: { rows_count: number; success_count: number };
  economy_viewed: { total_amount: number; items_count: number };
}

type EventName = keyof AnalyticsEvent;
type EventProperties<T extends EventName> = AnalyticsEvent[T];

export function useAnalytics() {
  useEffect(() => {
    // Initialiser PostHog si la clé est présente
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    if (posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('PostHog loaded');
          }
        },
        capture_pageview: false, // On gère manuellement
        disable_session_recording: import.meta.env.PROD ? false : true
      });
    }
  }, []);

  const track = <T extends EventName>(
    event: T,
    properties?: EventProperties<T> & Record<string, any>
  ) => {
    if (!posthog.__loaded) {
      if (import.meta.env.DEV) {
        console.log('Analytics (mock):', event, properties);
      }
      return;
    }

    try {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE
      });
    } catch (error) {
      console.warn('Erreur analytics:', error);
    }
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    if (!posthog.__loaded) return;
    
    try {
      posthog.identify(userId, traits);
    } catch (error) {
      console.warn('Erreur identify:', error);
    }
  };

  const pageView = (pageName: string, properties?: Record<string, any>) => {
    if (!posthog.__loaded) return;
    
    try {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        ...properties
      });
    } catch (error) {
      console.warn('Erreur pageview:', error);
    }
  };

  const reset = () => {
    if (!posthog.__loaded) return;
    
    try {
      posthog.reset();
    } catch (error) {
      console.warn('Erreur reset:', error);
    }
  };

  return {
    track,
    identify,
    pageView,
    reset,
    isLoaded: posthog.__loaded
  };
}

// Hook pour tracker automatiquement les vues de page
export function usePageTracking(pageName: string, properties?: Record<string, any>) {
  const { pageView } = useAnalytics();

  useEffect(() => {
    pageView(pageName, properties);
  }, [pageName, pageView, properties]);
}