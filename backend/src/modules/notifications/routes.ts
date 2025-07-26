// path: backend/src/modules/notifications/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { tenantGuard } from '../../middlewares/tenantGuard.js';
import { roleGuard } from '../../middlewares/roleGuard.js';
import { sendEmail, sendWeeklyDigest } from '../../services/notify.js';
import { sendDigestForUser, forceDailyAlerts } from '../../jobs/schedulers.js';
import { renderTemplate } from '../../services/templates.js';
import { mailConfig } from '../../config/mail.js';

const prisma = new PrismaClient();

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);
router.use(tenantGuard);

/**
 * POST /api/v1/notifications/test-email
 * Envoie un email de test à l'admin connecté
 */
router.post('/test-email', roleGuard(['ADMIN']), async (req, res) => {
  try {
    const user = req.user;
    
    const testHtml = await renderTemplate('alert-contract', {
      userName: `${user.firstName} ${user.lastName}`,
      softwareName: 'Microsoft Office 365',
      daysRemaining: 30,
      amount: 2400,
      contractId: 'test-contract-id',
      baseUrl: mailConfig.baseUrl,
      logoUrl: mailConfig.logoUrl
    });

    const success = await sendEmail(
      user.email,
      '🧪 Test d\'email ClearStack',
      testHtml
    );

    if (success) {
      res.json({
        success: true,
        message: `Email de test envoyé à ${user.email}`
      });
    } else {
      res.status(500).json({
        code: 'EMAIL_SEND_FAILED',
        message: 'Échec de l\'envoi de l\'email de test'
      });
    }
  } catch (error) {
    console.error('Erreur test email:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Erreur lors de l\'envoi de l\'email de test'
    });
  }
});

/**
 * POST /api/v1/notifications/send-digest
 * Lance manuellement l'envoi du digest hebdomadaire
 */
router.post('/send-digest', roleGuard(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId) {
      // Envoyer le digest à un utilisateur spécifique
      await sendDigestForUser(userId);
      res.json({
        success: true,
        message: `Digest envoyé à l'utilisateur ${userId}`
      });
    } else {
      // Envoyer le digest à tous les utilisateurs
      await sendWeeklyDigest();
      res.json({
        success: true,
        message: 'Digest hebdomadaire envoyé à tous les utilisateurs'
      });
    }
  } catch (error) {
    console.error('Erreur envoi digest:', error);
    res.status(500).json({
      code: 'DIGEST_SEND_FAILED',
      message: 'Erreur lors de l\'envoi du digest'
    });
  }
});

/**
 * POST /api/v1/notifications/send-alerts
 * Force l'envoi des alertes quotidiennes (Admin uniquement)
 */
router.post('/send-alerts', roleGuard(['ADMIN']), async (req, res) => {
  try {
    await forceDailyAlerts();
    
    res.json({
      success: true,
      message: 'Alertes quotidiennes envoyées avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi alertes:', error);
    res.status(500).json({
      code: 'ALERTS_SEND_FAILED',
      message: 'Erreur lors de l\'envoi des alertes'
    });
  }
});

/**
 * GET /api/v1/notifications/email-stats
 * Statistiques d'envoi d'emails (Admin uniquement)
 */
router.get('/email-stats', roleGuard(['ADMIN']), async (req, res) => {
  try {
    // TODO: Implémenter le tracking des emails envoyés
    // Pour l'instant, retourner des stats mockées
    
    const stats = {
      totalSent: 0,
      totalFailed: 0,
      lastWeekSent: 0,
      averageOpenRate: 0,
      topNotificationTypes: [
        { type: 'ALERT_CONTRACT', count: 0 },
        { type: 'REQUEST', count: 0 },
        { type: 'PROJECT_TASK', count: 0 }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur stats emails:', error);
    res.status(500).json({
      code: 'STATS_ERROR',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * POST /api/v1/notifications/preferences
 * Met à jour les préférences de notification de l'utilisateur
 */
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean().optional()
});

router.post('/preferences', async (req, res) => {
  try {
    const { emailNotifications, pushNotifications } = updatePreferencesSchema.parse(req.body);
    const userId = req.user.id;
    
    // Mettre à jour les préférences en base
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotifications,
        // pushNotifications sera ajouté plus tard si nécessaire
      },
      select: {
        id: true,
        emailNotifications: true
      }
    });
    
    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      preferences: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: error.errors
      });
    } else {
      console.error('Erreur mise à jour préférences:', error);
      res.status(500).json({
        code: 'UPDATE_FAILED',
        message: 'Erreur lors de la mise à jour des préférences'
      });
    }
  }
});

export default router;