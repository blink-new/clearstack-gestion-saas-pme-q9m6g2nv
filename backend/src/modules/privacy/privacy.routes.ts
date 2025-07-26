// path: backend/src/modules/privacy/privacy.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import archiver from 'archiver';
import { prisma } from '../../db/client.js';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import { tenantGuard } from '../../middlewares/tenantGuard.js';
import { roleGuard } from '../../middlewares/roleGuard.js';
import { logAudit, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../../services/audit.js';

export const privacyRouter = Router();

/**
 * Export des données personnelles (DSAR - Data Subject Access Request)
 * Droit d'accès RGPD Article 15
 */
privacyRouter.get('/export-my-data', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const companyId = authReq.user.companyId;

    // Log de l'audit
    await logAudit({
      companyId,
      userId,
      action: AUDIT_ACTIONS.DATA_EXPORT_REQUESTED,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      req,
    });

    // Collecte de toutes les données personnelles
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        linkedinId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const reviews = await prisma.review.findMany({
      where: { userId, companyId },
      include: {
        software: {
          select: { name: true, category: true },
        },
      },
    });

    const usages = await prisma.usage.findMany({
      where: { userId },
      include: {
        software: {
          select: { name: true, category: true },
        },
      },
    });

    const requests = await prisma.request.findMany({
      where: { requesterId: userId, companyId },
    });

    const votes = await prisma.vote.findMany({
      where: { voterId: userId, companyId },
      include: {
        request: {
          select: { softwareRef: true, descriptionNeed: true },
        },
      },
    });

    const notifications = await prisma.notification.findMany({
      where: { userId, companyId },
    });

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: { label: true, description: true },
        },
      },
    });

    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        endpoint: true,
        createdAt: true,
      },
    });

    const betaFeedbacks = await prisma.betaFeedback.findMany({
      where: { userId, companyId },
    });

    // Création du ZIP avec toutes les données
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="donnees-clearstack-${userId}.zip"`);
    
    archive.pipe(res);

    // Ajout des fichiers JSON au ZIP
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId,
        companyId,
        description: 'Export complet de vos données personnelles ClearStack (RGPD Article 15)',
      },
      user: userData,
      reviews,
      usages,
      requests,
      votes,
      notifications,
      badges,
      pushSubscriptions,
      betaFeedbacks,
    };

    archive.append(JSON.stringify(exportData, null, 2), { name: 'mes-donnees-clearstack.json' });
    
    // Fichier explicatif
    const readme = `# Export de vos données ClearStack

Ce fichier contient toutes vos données personnelles stockées dans ClearStack, conformément au RGPD (Article 15).

## Contenu de l'export :

- **user** : Vos informations de profil
- **reviews** : Tous les avis que vous avez donnés sur des logiciels
- **usages** : Les logiciels que vous avez déclarés utiliser
- **requests** : Les demandes de logiciels que vous avez créées
- **votes** : Vos votes sur les demandes d'autres utilisateurs
- **notifications** : Votre historique de notifications
- **badges** : Les badges que vous avez obtenus
- **pushSubscriptions** : Vos abonnements aux notifications push
- **betaFeedbacks** : Vos retours sur les fonctionnalités bêta

## Vos droits RGPD :

- **Droit de rectification** : Vous pouvez corriger vos données via votre profil
- **Droit à l'effacement** : Vous pouvez demander la suppression de votre compte
- **Droit à la portabilité** : Ces données sont dans un format lisible par machine
- **Droit d'opposition** : Vous pouvez vous opposer au traitement de vos données

Pour exercer vos droits, contactez : support@clearstack.fr

Date d'export : ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
`;

    archive.append(readme, { name: 'LISEZ-MOI.txt' });
    
    await archive.finalize();

  } catch (error) {
    next(error);
  }
});

/**
 * Demande de suppression de compte (DSAR - Right to Erasure)
 * Droit à l'effacement RGPD Article 17
 */
privacyRouter.post('/delete-my-account', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const companyId = authReq.user.companyId;

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const existingRequest = await prisma.deletionQueue.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        code: 'DELETION_ALREADY_REQUESTED',
        message: 'Une demande de suppression est déjà en cours de traitement',
        purgeDate: existingRequest.purgeAfter,
      });
    }

    // Créer la demande de suppression (30 jours de délai)
    const purgeDate = new Date();
    purgeDate.setDate(purgeDate.getDate() + 30);

    const deletionRequest = await prisma.deletionQueue.create({
      data: {
        userId,
        companyId,
        reason: 'USER_REQUEST',
        purgeAfter: purgeDate,
        status: 'PENDING',
      },
    });

    // Log de l'audit
    await logAudit({
      companyId,
      userId,
      action: AUDIT_ACTIONS.ACCOUNT_DELETION_REQUESTED,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: userId,
      diff: { purgeAfter: purgeDate },
      req,
    });

    // TODO: Envoyer un email de confirmation avec lien d'annulation

    res.json({
      message: 'Demande de suppression enregistrée',
      purgeDate: deletionRequest.purgeAfter,
      cancellationInfo: 'Vous recevrez un email avec un lien pour annuler cette demande si vous changez d\'avis.',
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Export des données de l'entreprise (Admin uniquement)
 * Pour les audits et la conformité RGPD
 */
privacyRouter.get('/admin/company-export', authMiddleware, tenantGuard, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const companyId = authReq.user.companyId;

    // Log de l'audit
    await logAudit({
      companyId,
      userId: authReq.user.id,
      action: AUDIT_ACTIONS.DATA_EXPORT_REQUESTED,
      entityType: 'company',
      entityId: companyId,
      req,
    });

    // Export de toutes les données de l'entreprise (format NDJSON pour les gros volumes)
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Content-Disposition', `attachment; filename="export-entreprise-${companyId}.ndjson"`);

    // Métadonnées de l'export
    res.write(JSON.stringify({
      type: 'metadata',
      exportDate: new Date().toISOString(),
      companyId,
      description: 'Export complet des données de l\'entreprise',
    }) + '\\n');

    // Export par table (streaming pour éviter les problèmes de mémoire)
    const tables = [
      'user', 'software', 'contract', 'review', 'request', 'vote',
      'purchaseProject', 'task', 'notification', 'auditLog'
    ];

    for (const table of tables) {
      const data = await (prisma as any)[table].findMany({
        where: { companyId },
      });

      for (const record of data) {
        res.write(JSON.stringify({ type: table, data: record }) + '\\n');
      }
    }

    res.end();

  } catch (error) {
    next(error);
  }
});

/**
 * Annulation d'une demande de suppression
 */
privacyRouter.post('/cancel-deletion', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const deletionRequest = await prisma.deletionQueue.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (!deletionRequest) {
      return res.status(404).json({
        code: 'NO_DELETION_REQUEST',
        message: 'Aucune demande de suppression en cours',
      });
    }

    await prisma.deletionQueue.update({
      where: { id: deletionRequest.id },
      data: { status: 'CANCELED' },
    });

    res.json({
      message: 'Demande de suppression annulée avec succès',
    });

  } catch (error) {
    next(error);
  }
});