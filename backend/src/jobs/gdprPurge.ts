// path: backend/src/jobs/gdprPurge.ts
import cron from 'node-cron';
import { prisma } from '../db/client.js';
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../services/audit.js';
import crypto from 'crypto';

/**
 * Job de purge RGPD - Exécuté quotidiennement à 02:30 Europe/Paris
 * Traite les demandes de suppression arrivées à échéance
 */
export function startGdprPurgeJob() {
  // Tous les jours à 02:30 Europe/Paris
  cron.schedule('30 2 * * *', async () => {
    console.log('[GDPR_PURGE] Démarrage du job de purge RGPD');
    
    try {
      await processExpiredDeletionRequests();
      await cleanupOldDeletionRequests();
    } catch (error) {
      console.error('[GDPR_PURGE] Erreur lors du job de purge:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });

  console.log('[GDPR_PURGE] Job de purge RGPD programmé (02:30 Europe/Paris)');
}

/**
 * Traite les demandes de suppression arrivées à échéance
 */
async function processExpiredDeletionRequests() {
  const now = new Date();
  
  // Récupère toutes les demandes de suppression expirées
  const expiredRequests = await prisma.deletionQueue.findMany({
    where: {
      status: 'PENDING',
      purgeAfter: {
        lte: now,
      },
    },
  });

  console.log(`[GDPR_PURGE] ${expiredRequests.length} demandes de suppression à traiter`);

  for (const request of expiredRequests) {
    try {
      if (request.userId) {
        await purgeUserData(request.userId, request.companyId);
      } else if (request.companyId) {
        await purgeCompanyData(request.companyId);
      }

      // Marquer la demande comme traitée
      await prisma.deletionQueue.update({
        where: { id: request.id },
        data: { status: 'PURGED' },
      });

      console.log(`[GDPR_PURGE] Demande ${request.id} traitée avec succès`);

    } catch (error) {
      console.error(`[GDPR_PURGE] Erreur lors du traitement de la demande ${request.id}:`, error);
      // Continuer avec les autres demandes même en cas d'erreur
    }
  }
}

/**
 * Anonymise et supprime les données personnelles d'un utilisateur
 * Conserve les données agrégées nécessaires aux statistiques
 */
async function purgeUserData(userId: string, companyId: string | null) {
  console.log(`[GDPR_PURGE] Purge des données utilisateur ${userId}`);

  // Générer un hash anonyme pour remplacer l'email
  const anonymousHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16);
  const anonymousEmail = `anonyme-${anonymousHash}@supprime.local`;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Anonymiser les données utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymousEmail,
          firstName: 'Utilisateur',
          lastName: 'Supprimé',
          linkedinId: null,
        },
      });

      // 2. Supprimer les données personnelles sensibles
      await tx.pushSubscription.deleteMany({
        where: { userId },
      });

      await tx.notification.deleteMany({
        where: { userId },
      });

      await tx.betaFeedback.deleteMany({
        where: { userId },
      });

      // 3. Anonymiser les avis (conserver pour les statistiques mais anonymiser)
      await tx.review.updateMany({
        where: { userId },
        data: {
          // Conserver la note et les catégories, anonymiser le contenu textuel
          strengths: 'Contenu supprimé (RGPD)',
          weaknesses: 'Contenu supprimé (RGPD)',
          improvement: 'Contenu supprimé (RGPD)',
        },
      });

      // 4. Anonymiser les demandes (conserver pour les statistiques)
      await tx.request.updateMany({
        where: { requesterId: userId },
        data: {
          descriptionNeed: 'Description supprimée (RGPD)',
        },
      });

      // 5. Conserver les votes (données agrégées importantes) mais anonymiser
      // Les votes restent pour les statistiques mais ne sont plus liés à l'utilisateur

      // 6. Supprimer les tâches assignées
      await tx.task.updateMany({
        where: { assigneeId: userId },
        data: { assigneeId: null },
      });

      // 7. Conserver les badges obtenus (statistiques gamification)
      // mais ils ne sont plus liés à l'utilisateur identifiable

      // Log de l'audit
      if (companyId) {
        await logAudit({
          companyId,
          userId: null, // Plus d'utilisateur identifiable
          action: AUDIT_ACTIONS.ACCOUNT_PURGED,
          entityType: AUDIT_ENTITY_TYPES.USER,
          entityId: userId,
          diff: { anonymizedEmail: anonymousEmail },
        });
      }
    });

    console.log(`[GDPR_PURGE] Données utilisateur ${userId} purgées avec succès`);

  } catch (error) {
    console.error(`[GDPR_PURGE] Erreur lors de la purge utilisateur ${userId}:`, error);
    throw error;
  }
}

/**
 * Supprime toutes les données d'une entreprise
 * Utilisé uniquement pour les suppressions d'entreprise complètes
 */
async function purgeCompanyData(companyId: string) {
  console.log(`[GDPR_PURGE] Purge des données entreprise ${companyId}`);

  try {
    await prisma.$transaction(async (tx) => {
      // Supprimer dans l'ordre des dépendances
      await tx.auditLog.deleteMany({ where: { companyId } });
      await tx.outboundEvent.deleteMany({ where: { companyId } });
      await tx.notification.deleteMany({ where: { companyId } });
      await tx.task.deleteMany({ where: { companyId } });
      await tx.purchaseProject.deleteMany({ where: { companyId } });
      await tx.vote.deleteMany({ where: { companyId } });
      await tx.request.deleteMany({ where: { companyId } });
      await tx.review.deleteMany({ where: { companyId } });
      await tx.economyItem.deleteMany({ where: { companyId } });
      await tx.importBatch.deleteMany({ where: { companyId } });
      await tx.alertSetting.deleteMany({ where: { companyId } });
      await tx.companyIntegrationSetting.deleteMany({ where: { companyId } });
      await tx.featureFlag.deleteMany({ where: { companyId } });
      await tx.betaFeedback.deleteMany({ where: { companyId } });

      // Supprimer les utilisateurs et leurs données liées
      const users = await tx.user.findMany({ where: { companyId } });
      for (const user of users) {
        await tx.pushSubscription.deleteMany({ where: { userId: user.id } });
        await tx.userBadge.deleteMany({ where: { userId: user.id } });
        await tx.usage.deleteMany({ where: { userId: user.id } });
      }
      await tx.user.deleteMany({ where: { companyId } });

      // Supprimer les entités et leurs dépendances
      const entities = await tx.entity.findMany({ where: { companyId } });
      for (const entity of entities) {
        await tx.department.deleteMany({ where: { entityId: entity.id } });
        await tx.contract.deleteMany({ where: { entityId: entity.id } });
      }
      await tx.entity.deleteMany({ where: { companyId } });

      // Enfin, supprimer l'entreprise
      await tx.company.delete({ where: { id: companyId } });
    });

    console.log(`[GDPR_PURGE] Données entreprise ${companyId} purgées avec succès`);

  } catch (error) {
    console.error(`[GDPR_PURGE] Erreur lors de la purge entreprise ${companyId}:`, error);
    throw error;
  }
}

/**
 * Nettoie les anciennes demandes de suppression (plus de 1 an)
 */
async function cleanupOldDeletionRequests() {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await prisma.deletionQueue.deleteMany({
      where: {
        status: { in: ['PURGED', 'CANCELED'] },
        requestedAt: { lt: oneYearAgo },
      },
    });

    if (result.count > 0) {
      console.log(`[GDPR_PURGE] Supprimé ${result.count} anciennes demandes de suppression`);
    }
  } catch (error) {
    console.error('[GDPR_PURGE] Erreur lors du nettoyage des anciennes demandes:', error);
  }
}