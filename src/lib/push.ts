// path: src/lib/push.ts

// Utilitaires de conversion base64
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function registerPush(): Promise<{ ok: boolean; reason?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    
    const existingSub = await reg.pushManager.getSubscription();
    const sub = existingSub ?? await reg.pushManager.subscribe({ 
      userVisibleOnly: true, 
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!) 
    });

    const body = { 
      endpoint: sub.endpoint, 
      keys: { 
        p256dh: arrayBufferToBase64(sub.getKey('p256dh')), 
        auth: arrayBufferToBase64(sub.getKey('auth')) 
      } 
    };

    await fetch(`${import.meta.env.VITE_API_URL}/push/subscribe`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    });

    return { ok: true };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement push:', error);
    return { ok: false, reason: 'error' };
  }
}

export async function unregisterPush(): Promise<{ ok: boolean }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false };
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return { ok: false };

    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { ok: true };

    await fetch(`${import.meta.env.VITE_API_URL}/push/subscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint })
    });

    await sub.unsubscribe();
    return { ok: true };
  } catch (error) {
    console.error('Erreur lors de la désinscription push:', error);
    return { ok: false };
  }
}