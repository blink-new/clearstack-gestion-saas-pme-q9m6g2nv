// path: backend/src/jobs/prospectSync.ts
import cron from 'node-cron';
import { publishPending, cleanupOldEvents } from '../services/outbox';

let isRunning = false;

/**
 * Job de synchronisation des événements vers l'outil de prospection
 * Exécuté toutes les 10 minutes
 */
export function startProspectSyncJob(): void {
  console.log('[PROSPECT_SYNC] Démarrage du scheduler de synchronisation (toutes les 10 minutes)');
  
  // Toutes les 10 minutes : traiter les événements en attente
  cron.schedule('*/10 * * * *', async () => {
    if (isRunning) {
      console.log('[PROSPECT_SYNC] Job déjà en cours, skip');
      return;
    }
    
    isRunning = true;
    
    try {
      const startTime = Date.now();
      console.log('[PROSPECT_SYNC] Début du traitement des événements en attente');
      
      const results = await publishPending(100); // Traiter jusqu'à 100 événements
      
      const duration = Date.now() - startTime;
      
      if (results.sent > 0 || results.failed > 0) {
        console.log(`[PROSPECT_SYNC] Terminé en ${duration}ms: ${results.sent} envoyés, ${results.failed} échoués`);
        
        // Log des erreurs si présentes (mais pas d'arrêt)
        if (results.errors.length > 0) {
          console.warn('[PROSPECT_SYNC] Erreurs rencontrées:', results.errors.slice(0, 3));
        }
      }
      
    } catch (error) {
      console.error('[PROSPECT_SYNC] Erreur lors du traitement:', error);
      // Ne pas arrêter le scheduler en cas d'erreur
    } finally {
      isRunning = false;
    }
  }, {
    timezone: 'Europe/Paris'
  });
  
  // Tous les jours à 03:00 : nettoyage des anciens événements
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('[PROSPECT_SYNC] Début du nettoyage des anciens événements');
      
      const deletedCount = await cleanupOldEvents(30); // Supprimer les événements > 30 jours
      
      if (deletedCount > 0) {
        console.log(`[PROSPECT_SYNC] ${deletedCount} anciens événements supprimés`);
      }
      
    } catch (error) {
      console.error('[PROSPECT_SYNC] Erreur lors du nettoyage:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });
}

/**
 * Arrêter le scheduler (pour les tests ou l'arrêt propre)
 */
export function stopProspectSyncJob(): void {
  console.log('[PROSPECT_SYNC] Arrêt du scheduler de synchronisation');
  cron.getTasks().forEach(task => task.stop());
}

/**
 * Traitement manuel immédiat (pour l'API Admin)
 */
export async function runProspectSyncNow(): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
  duration: number;
}> {
  if (isRunning) {
    throw new Error('Un traitement est déjà en cours');
  }
  
  isRunning = true;
  const startTime = Date.now();
  
  try {
    console.log('[PROSPECT_SYNC] Traitement manuel déclenché');
    
    const results = await publishPending(50); // Limiter à 50 pour le manuel
    const duration = Date.now() - startTime;
    
    console.log(`[PROSPECT_SYNC] Traitement manuel terminé en ${duration}ms: ${results.sent} envoyés, ${results.failed} échoués`);
    
    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    console.error('[PROSPECT_SYNC] Erreur lors du traitement manuel:', errorMessage);
    
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [errorMessage],
      duration
    };
    
  } finally {
    isRunning = false;
  }
}

/**
 * Statistiques du scheduler
 */
export function getProspectSyncStatus(): {
  isRunning: boolean;
  nextRun: string | null;
} {
  const tasks = cron.getTasks();
  const syncTask = Array.from(tasks.values())[0]; // Premier task = sync
  
  return {
    isRunning,
    nextRun: syncTask ? 'Toutes les 10 minutes' : null
  };
}