// path: backend/src/modules/integrations/prospect.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { roleGuard } from '../../middlewares/roleGuard';
import { prisma } from '../../db/client';
import { testProspectConnection } from '../../services/prospect';
import { enqueueEvent, publishPending, getOutboxStats } from '../../services/outbox';
import { OutboundEventType } from '@prisma/client';

export const prospectRouter = Router();

// Middleware pour toutes les routes (Admin uniquement)
prospectRouter.use(authMiddleware);
prospectRouter.use(tenantGuard);
prospectRouter.use(roleGuard(['ADMIN']));

// GET /api/v1/integrations/prospect/settings - Récupérer les paramètres
prospectRouter.get('/settings', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    let settings = await prisma.companyIntegrationSetting.findUnique({
      where: { companyId }
    });
    
    // Créer les paramètres par défaut si inexistants
    if (!settings) {
      settings = await prisma.companyIntegrationSetting.create({
        data: {
          companyId,
          prospectEnabled: false,
          anonymize: false
        }
      });
    }
    
    res.json({
      prospectEnabled: settings.prospectEnabled,
      anonymize: settings.anonymize,
      lastSyncAt: settings.lastSyncAt
    });
    
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/integrations/prospect/settings - Mettre à jour les paramètres
prospectRouter.patch('/settings', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { prospectEnabled, anonymize } = req.body;
    
    // Validation
    if (typeof prospectEnabled !== 'boolean' || typeof anonymize !== 'boolean') {
      return res.status(400).json({
        code: 'INVALID_PARAMS',
        message: 'Les paramètres prospectEnabled et anonymize doivent être des booléens'
      });
    }
    
    const settings = await prisma.companyIntegrationSetting.upsert({
      where: { companyId },
      update: {
        prospectEnabled,
        anonymize,
        updatedAt: new Date()
      },
      create: {
        companyId,
        prospectEnabled,
        anonymize
      }
    });
    
    console.log(`[PROSPECT] Paramètres mis à jour pour company ${companyId}: enabled=${prospectEnabled}, anonymize=${anonymize}`);
    
    res.json({
      message: 'Paramètres mis à jour avec succès',
      prospectEnabled: settings.prospectEnabled,
      anonymize: settings.anonymize
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/integrations/prospect/test - Envoyer un événement de test
prospectRouter.post('/test', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    // Vérifier que l'intégration est activée
    const settings = await prisma.companyIntegrationSetting.findUnique({
      where: { companyId }
    });
    
    if (!settings?.prospectEnabled) {
      return res.status(400).json({
        code: 'INTEGRATION_DISABLED',
        message: 'L\'intégration prospection doit être activée pour envoyer un test'
      });
    }
    
    // Tester la connexion
    const testResult = await testProspectConnection();
    
    if (testResult.success) {
      // Envoyer un événement de test via l'outbox
      await enqueueEvent(companyId, OutboundEventType.SOFTWARE_USAGE, {
        company_id: companyId,
        test: true,
        user: { email: req.user.email },
        software: { id: 'test-software', name: 'Test ClearStack', category: 'Test' },
        status: 'ACTIVE',
        timestamp: new Date().toISOString()
      });
      
      res.json({
        message: 'Test envoyé avec succès vers l\'outil de prospection',
        details: testResult.message
      });
    } else {
      res.status(500).json({
        code: 'CONNECTION_FAILED',
        message: `Échec du test de connexion: ${testResult.message}`
      });
    }
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/integrations/prospect/export-now - Export immédiat d'un échantillon
prospectRouter.post('/export-now', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    // Vérifier que l'intégration est activée
    const settings = await prisma.companyIntegrationSetting.findUnique({
      where: { companyId }
    });
    
    if (!settings?.prospectEnabled) {
      return res.status(400).json({
        code: 'INTEGRATION_DISABLED',
        message: 'L\'intégration prospection doit être activée pour exporter'
      });
    }
    
    // Créer des événements pour les 10 derniers éléments de chaque type
    const [recentReviews, recentRequests, recentContracts] = await Promise.all([
      prisma.review.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { user: true, software: true }
      }),
      prisma.request.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { requester: true }
      }),
      prisma.contract.findMany({
        where: { 
          software: { 
            reviews: { some: { companyId } } // Contrats liés à la company
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { software: true, entity: true }
      })
    ]);
    
    let eventsCreated = 0;
    
    // Enqueue des événements d'exemple
    for (const review of recentReviews) {
      await enqueueEvent(companyId, OutboundEventType.REVIEW_CREATED, {
        company_id: companyId,
        software_id: review.softwareId,
        rating: review.rating,
        tags: review.tags,
        improvement: review.improvement,
        created_at: review.createdAt.toISOString()
      });
      eventsCreated++;
    }
    
    for (const request of recentRequests) {
      await enqueueEvent(companyId, OutboundEventType.REQUEST_CREATED, {
        company_id: companyId,
        title: request.softwareRef || 'Demande logiciel',
        urgency: request.urgency,
        est_budget: request.estBudget?.toString()
      });
      eventsCreated++;
    }
    
    for (const contract of recentContracts) {
      await enqueueEvent(companyId, OutboundEventType.CONTRACT_RENEWAL, {
        company_id: companyId,
        software_id: contract.softwareId,
        end_date: contract.endDate.toISOString(),
        notice_days: contract.noticeDays,
        amount_monthly: contract.costAmount.toString(),
        entity_id: contract.entityId
      });
      eventsCreated++;
    }
    
    // Mettre à jour la date de dernière sync
    await prisma.companyIntegrationSetting.update({
      where: { companyId },
      data: { lastSyncAt: new Date() }
    });
    
    res.json({
      message: `Export immédiat lancé: ${eventsCreated} événements créés`,
      eventsCreated
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/integrations/prospect/stats - Statistiques de l'outbox
prospectRouter.get('/stats', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const stats = await getOutboxStats(companyId);
    
    res.json(stats);
    
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/integrations/prospect/process-queue - Traiter manuellement la file
prospectRouter.post('/process-queue', async (req, res, next) => {
  try {
    const results = await publishPending(20); // Traiter 20 événements max
    
    res.json({
      message: 'File d\'attente traitée',
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 5) // Limiter les erreurs affichées
    });
    
  } catch (error) {
    next(error);
  }
});