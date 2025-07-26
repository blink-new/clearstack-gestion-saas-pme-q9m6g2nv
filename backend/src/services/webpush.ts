// path: backend/src/services/webpush.ts
import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { 
  VAPID_PUBLIC_KEY, 
  VAPID_PRIVATE_KEY, 
  VAPID_SUBJECT = 'mailto:support@clearstack.fr' 
} = process.env;

// Configuration VAPID
webpush.setVapidDetails(VAPID_SUBJECT!, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);

export async function saveSubscription(
  userId: string, 
  sub: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { 
      p256dh: sub.keys.p256dh, 
      auth: sub.keys.auth, 
      userId 
    },
    create: { 
      endpoint: sub.endpoint, 
      p256dh: sub.keys.p256dh, 
      auth: sub.keys.auth, 
      userId 
    }
  });
}

export async function deleteSubscription(endpoint: string) {
  return prisma.pushSubscription.delete({ 
    where: { endpoint } 
  }).catch(() => null);
}

export async function pushToUser(userId: string, payload: any) {
  const subs = await prisma.pushSubscription.findMany({ 
    where: { userId }
  });
  
  const notif = JSON.stringify(payload);
  
  await Promise.all(
    subs.map(s => 
      webpush.sendNotification(
        { 
          endpoint: s.endpoint, 
          keys: { p256dh: s.p256dh, auth: s.auth }
        }, 
        notif
      ).catch(() => null)
    )
  );
}

// Exemple d'envoi type
export const buildAlertPayload = (title: string, body: string, url: string) => ({
  title,
  body,
  url,
  icon: '/icons/icon-192.png'
});