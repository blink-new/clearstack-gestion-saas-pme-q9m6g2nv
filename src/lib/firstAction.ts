import { track } from './analytics';

let firstDone = false;

export function trackFirstAction(kind: 'review' | 'request' | 'import', company_id: string) {
  if (firstDone) return;
  firstDone = true;
  track('first_action', { kind, company_id });
}