// path: backend/src/services/outbox.ts
import { prisma } from '../db/client';
import { postToProspect } from './prospect';
import { OutboundEventType, OutboundEventStatus } from '@prisma/client';

export async function enqueueEvent(
  companyId: string,
  type: OutboundEventType,
  payload: any
): Promise<void> {
  try {
    await prisma.outboundEvent.create({
      data: {
        companyId,
        type,
        payload,
        status: OutboundEventStatus.PENDING,
        tryCount: 0,
        nextAttemptAt: new Date()
      }
    });
    
    console.log(`[OUTBOX] Événement ${type} mis en file pour company ${companyId}`);
  } catch (error) {
    console.error('[OUTBOX] Erreur lors de la mise en file:', error);
    throw new Error('Impossible de mettre l\'événement en file d\'attente');
  }
}

export async function publishPending(limit: number = 50): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };
  
  try {
    // Récupérer les événements en attente
    const events = await prisma.outboundEvent.findMany({
      where: {
        status: OutboundEventStatus.PENDING,
        nextAttemptAt: { lte: new Date() }
      },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    console.log(`[OUTBOX] Traitement de ${events.length} événements en attente`);

    for (const event of events) {
      try {
        // Tentative d'envoi
        await postToProspect(event.type, event.payload);
        
        // Succès - marquer comme envoyé
        await prisma.outboundEvent.update({
          where: { id: event.id },
          data: {
            status: OutboundEventStatus.SENT,
            updatedAt: new Date()
          }
        });
        
        results.sent++;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        results.errors.push(`Event ${event.id}: ${errorMessage}`);
        
        // Incrémenter le compteur de tentatives
        const newTryCount = event.tryCount + 1;
        const maxRetries = 5;
        
        if (newTryCount > maxRetries) {
          // Échec définitif après 5 tentatives
          await prisma.outboundEvent.update({
            where: { id: event.id },
            data: {
              status: OutboundEventStatus.FAILED,
              tryCount: newTryCount,
              updatedAt: new Date()
            }
          });
          results.failed++;
          
        } else {
          // Programmer un nouveau retry avec backoff exponentiel
          const backoffMinutes = Math.min(Math.pow(2, newTryCount), 60); // Max 60 minutes
          const nextAttempt = new Date(Date.now() + backoffMinutes * 60 * 1000);
          
          await prisma.outboundEvent.update({
            where: { id: event.id },
            data: {
              tryCount: newTryCount,
              nextAttemptAt: nextAttempt,
              updatedAt: new Date()
            }
          });
          
          console.log(`[OUTBOX] Event ${event.id} programmé pour retry dans ${backoffMinutes}min`);
        }
      }
    }
    
    if (results.sent > 0 || results.failed > 0) {
      console.log(`[OUTBOX] Résultats: ${results.sent} envoyés, ${results.failed} échoués définitivement`);
    }
    
  } catch (error) {
    console.error('[OUTBOX] Erreur lors du traitement des événements:', error);
    results.errors.push(`Erreur système: ${error instanceof Error ? error.message : 'Inconnue'}`);
  }
  
  return results;
}

// Statistiques pour l'UI Admin
export async function getOutboxStats(companyId: string) {
  try {
    const [pending, sent, failed] = await Promise.all([
      prisma.outboundEvent.count({
        where: { companyId, status: OutboundEventStatus.PENDING }
      }),
      prisma.outboundEvent.count({
        where: { companyId, status: OutboundEventStatus.SENT }
      }),
      prisma.outboundEvent.count({
        where: { companyId, status: OutboundEventStatus.FAILED }
      })
    ]);
    
    const recentEvents = await prisma.outboundEvent.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        tryCount: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return {
      pending,
      sent,
      failed,
      total: pending + sent + failed,
      recentEvents
    };
    
  } catch (error) {
    console.error('[OUTBOX] Erreur lors de la récupération des stats:', error);
    throw new Error('Impossible de récupérer les statistiques');
  }
}

// Nettoyage des anciens événements (optionnel)
export async function cleanupOldEvents(daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const result = await prisma.outboundEvent.deleteMany({
      where: {
        status: OutboundEventStatus.SENT,
        updatedAt: { lt: cutoffDate }
      }
    });
    
    console.log(`[OUTBOX] ${result.count} anciens événements supprimés`);
    return result.count;
    
  } catch (error) {
    console.error('[OUTBOX] Erreur lors du nettoyage:', error);
    return 0;
  }
}