import posthog from 'posthog-js';

const host = import.meta.env.VITE_POSTHOG_HOST || import.meta.env.POSTHOG_HOST || 'https://app.posthog.com';
const key = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.POSTHOG_PROJECT_API_KEY;
const mock = (import.meta.env.VITE_MOCK_ANALYTICS ?? import.meta.env.MOCK_ANALYTICS) === 'true';

function hash(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  return crypto.subtle.digest('SHA-256', enc).then(buf => 
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  );
}

let ready = false;

export async function analyticsInit(user?: { 
  id: string; 
  email?: string; 
  company_id: string; 
  anonymize?: boolean 
}) {
  if (mock || !key) { 
    console.info('[Analytics] MOCK mode'); 
    return; 
  }
  
  posthog.init(key!, { 
    api_host: host, 
    autocapture: false, 
    capture_pageview: true 
  });
  
  let distinctId = user?.id || 'anon';
  const props: any = { company_id: user?.company_id };
  
  if (user?.anonymize && user?.email) {
    distinctId = await hash(user.company_id + ':' + user.email);
    props.email_hash = await hash(user.email);
  } else if (user?.email) {
    props.email = user.email;
  }
  
  posthog.identify(distinctId, props);
  ready = true;
}

export function track(event: string, props: any = {}) {
  if (mock || !key || !ready) { 
    console.debug('[Analytics] (mock)', event, props); 
    return; 
  }
  posthog.capture(event, props);
}