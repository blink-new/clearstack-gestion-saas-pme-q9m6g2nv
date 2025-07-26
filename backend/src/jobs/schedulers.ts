// path: backend/src/jobs/schedulers.ts
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { queueNotification, sendWeeklyDigest } from '../services/notify.js';
import { runLBLSync } from './lblSync.js';
import { startProspectSyncJob } from './prospectSync.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

/**
 * Démarre tous les schedulers
 */
export function startSchedulers(): void {
  console.log('🚀 Démarrage des schedulers ClearStack...');
  
  // Alertes quotidiennes à 8h00 Europe/Paris
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Exécution des alertes quotidiennes...');
    await sendDailyAlerts();
  }, {
    timezone: 'Europe/Paris'
  });

  // Digest hebdomadaire le vendredi à 8h00 Europe/Paris
  cron.schedule('0 8 * * 5', async () => {
    console.log('📊 Envoi du digest hebdomadaire...');
    await sendWeeklyDigest();
  }, {
    timezone: 'Europe/Paris'
  });

  // Nettoyage des notifications anciennes (tous les dimanches à 2h00)
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Nettoyage des anciennes notifications...');
    await cleanupOldNotifications();
  }, {
    timezone: 'Europe/Paris'
  });

  // Synchronisation LeBonLogiciel (tous les jours à 2h00)
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Synchronisation LeBonLogiciel...');
    await runLBLSync();
  }, {
    timezone: 'Europe/Paris'
  });

  // Démarrer le scheduler de prospection (toutes les 10 minutes)
  startProspectSyncJob();

  console.log('✅ Schedulers démarrés avec succès');
}

/**
 * Envoie les alertes quotidiennes
 */
async function sendDailyAlerts(): Promise<void> {
  try {
    const today = dayjs().tz('Europe/Paris');
    
    // 1. Alertes de contrats approchant de leur fin
    await sendContractAlerts();
    
    // 2. Alertes de tâches en retard
    await sendOverdueTaskAlerts();
    
    console.log('✅ Alertes quotidiennes envoyées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des alertes quotidiennes:', error);
  }
}

/**
 * Envoie les alertes de contrats
 */
async function sendContractAlerts(): Promise<void> {
  try {
    // Récupérer tous les contrats avec leurs paramètres d'alerte
    const contracts = await prisma.contract.findMany({
      include: {
        software: {
          include: {
            company: {
              include: {
                users: {
                  where: {
                    role: 'ADMIN',
                    emailNotifications: true
                  }
                }
              }
            }
          }
        }
      },
      where: {
        endDate: {
          gte: dayjs().toDate() // Seulement les contrats non expirés
        }
      }
    });

    for (const contract of contracts) {
      const daysUntilExpiry = dayjs(contract.endDate).diff(dayjs(), 'day');
      const noticeDays = contract.noticeDays || 95; // Défaut 95 jours
      
      // Vérifier si on doit envoyer une alerte
      const shouldAlert = daysUntilExpiry <= noticeDays && daysUntilExpiry > 0;
      
      if (shouldAlert) {
        // Envoyer l'alerte à tous les admins de la société
        for (const admin of contract.software.company.users) {
          await queueNotification(admin.id, 'ALERT_CONTRACT', {
            contractId: contract.id,
            softwareName: contract.software.name,
            daysRemaining: daysUntilExpiry,
            amount: contract.costAmount?.toNumber() || 0
          });
        }
        
        console.log(`📧 Alerte contrat envoyée: ${contract.software.name} (J-${daysUntilExpiry})`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur alertes contrats:', error);
  }
}

/**
 * Envoie les alertes de tâches en retard
 */
async function sendOverdueTaskAlerts(): Promise<void> {
  try {
    const today = dayjs().tz('Europe/Paris').startOf('day');
    
    // Récupérer les tâches en retard
    const overdueTasks = await prisma.task.findMany({
      where: {
        done: false,
        dueDate: {
          lt: today.toDate()
        }
      },
      include: {
        assignee: true,
        project: {
          include: {
            software: true
          }
        }
      }
    });

    for (const task of overdueTasks) {
      if (task.assignee && task.assignee.emailNotifications) {
        await queueNotification(task.assignee.id, 'PROJECT_TASK', {
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          projectName: task.project.software?.name || 'Projet sans nom',
          dueDate: dayjs(task.dueDate).format('DD/MM/YYYY')
        });
        
        console.log(`📧 Alerte tâche en retard envoyée: ${task.title} (${task.assignee.email})`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur alertes tâches:', error);
  }
}

/**
 * Nettoie les anciennes notifications (> 90 jours)
 */
async function cleanupOldNotifications(): Promise<void> {
  try {
    const cutoffDate = dayjs().subtract(90, 'day').toDate();
    
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    
    console.log(`🧹 ${result.count} anciennes notifications supprimées`);
  } catch (error) {
    console.error('❌ Erreur nettoyage notifications:', error);
  }
}

/**
 * Envoie un digest pour un utilisateur spécifique (utilitaire)
 */
export async function sendDigestForUser(userId: string): Promise<void> {
  try {
    await sendWeeklyDigest(userId);
    console.log(`✅ Digest envoyé pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error(`❌ Erreur envoi digest pour ${userId}:`, error);
    throw error;
  }
}

/**
 * Force l'envoi des alertes (utilitaire)
 */
export async function forceDailyAlerts(): Promise<void> {
  console.log('🔄 Envoi forcé des alertes quotidiennes...');
  await sendDailyAlerts();
}