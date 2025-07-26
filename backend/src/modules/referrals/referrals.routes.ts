// path: backend/src/modules/referrals/referrals.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/client';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { roleGuard } from '../../middlewares/roleGuard';
import { sendEmail } from '../../services/notify';
import { renderTemplate } from '../../services/templates';
import crypto from 'crypto';

export const referralsRouter = Router();

// Schémas de validation
const createReferralSchema = z.object({
  emails: z.array(z.string().email()).optional(),
  message: z.string().optional()
});

const redeemReferralSchema = z.object({
  code: z.string(),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional()
});

// POST /api/v1/referrals/create - Génère code et envoie invitations
referralsRouter.post('/create', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { emails, message } = createReferralSchema.parse(req.body);
    const { user, companyId } = req as any;

    // Vérifier le throttle (max 20 invitations/jour)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInvites = await prisma.referral.count({
      where: {
        companyId,
        inviterId: user.id,
        createdAt: { gte: today }
      }
    });

    if (todayInvites >= 20) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de 20 invitations par jour atteinte'
      });
    }

    // Générer un code unique
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    // Créer le referral
    const referral = await prisma.referral.create({
      data: {
        companyId,
        inviterId: user.id,
        code,
        utmSource: 'invite',
        utmCampaign: 'plg'
      }
    });

    const referralLink = `https://app.clearstack.fr/signup?ref=${code}&utm_source=invite&utm_campaign=plg`;

    // Envoyer les emails si fournis
    if (emails && emails.length > 0) {
      // Vérifier les opt-outs
      const optOuts = await prisma.emailOptOut.findMany({
        where: { email: { in: emails } }
      });
      const optOutEmails = optOuts.map(o => o.email);
      const validEmails = emails.filter(email => !optOutEmails.includes(email));

      for (const email of validEmails) {
        try {
          const html = await renderTemplate('invite', {
            inviterName: `${user.firstName} ${user.lastName}`,
            inviterEmail: user.email,
            message: message || '',
            referralLink,
            companyName: 'ClearStack'
          });

          await sendEmail(
            email,
            `${user.firstName} t'invite à rejoindre ClearStack`,
            html
          );
        } catch (error) {
          console.error(`Erreur envoi email à ${email}:`, error);
        }
      }
    }

    res.status(201).json({
      code: referral.code,
      link: referralLink,
      message: 'Code de parrainage créé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/referrals/me - Stats personnelles
referralsRouter.get('/me', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { user, companyId } = req as any;

    const stats = await prisma.referral.aggregate({
      where: {
        companyId,
        inviterId: user.id
      },
      _count: {
        id: true,
        redeemedById: true
      }
    });

    const invitesSent = stats._count.id || 0;
    const conversions = stats._count.redeemedById || 0;
    const conversionRate = invitesSent > 0 ? (conversions / invitesSent * 100) : 0;

    // Récupérer les dernières invitations
    const recentReferrals = await prisma.referral.findMany({
      where: {
        companyId,
        inviterId: user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        code: true,
        createdAt: true,
        redeemedAt: true,
        redeemedById: true
      }
    });

    res.json({
      stats: {
        invitesSent,
        conversions,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      recentReferrals
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/v1/referrals/redeem - Consomme un code de parrainage
referralsRouter.post('/redeem', async (req, res, next) => {
  try {
    const { code, utmSource, utmCampaign } = redeemReferralSchema.parse(req.body);

    // Trouver le referral
    const referral = await prisma.referral.findUnique({
      where: { code }
    });

    if (!referral) {
      return res.status(404).json({
        code: 'REFERRAL_NOT_FOUND',
        message: 'Code de parrainage invalide'
      });
    }

    if (referral.redeemedById) {
      return res.status(400).json({
        code: 'REFERRAL_ALREADY_USED',
        message: 'Ce code de parrainage a déjà été utilisé'
      });
    }

    // TODO: Intégrer avec le système d'inscription
    // Pour l'instant, on retourne juste les infos du referral
    res.json({
      referral: {
        id: referral.id,
        companyId: referral.companyId,
        inviterId: referral.inviterId
      },
      message: 'Code de parrainage valide'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/v1/referrals/company - Stats agrégées (Admin seulement)
referralsRouter.get('/company', authMiddleware, tenantGuard, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { companyId } = req as any;

    // Stats globales
    const globalStats = await prisma.referral.aggregate({
      where: { companyId },
      _count: {
        id: true,
        redeemedById: true
      }
    });

    // Top invitants
    const topInviters = await prisma.referral.groupBy({
      by: ['inviterId'],
      where: { companyId },
      _count: {
        id: true,
        redeemedById: true
      },
      orderBy: {
        _count: {
          redeemedById: 'desc'
        }
      },
      take: 5
    });

    // Récupérer les infos des top invitants
    const inviterIds = topInviters.map(t => t.inviterId);
    const inviters = await prisma.user.findMany({
      where: { id: { in: inviterIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const topInvitersWithNames = topInviters.map(stat => {
      const inviter = inviters.find(i => i.id === stat.inviterId);
      return {
        inviter: inviter ? {
          name: `${inviter.firstName} ${inviter.lastName}`,
          email: inviter.email
        } : null,
        invitesSent: stat._count.id,
        conversions: stat._count.redeemedById
      };
    });

    const totalInvites = globalStats._count.id || 0;
    const totalConversions = globalStats._count.redeemedById || 0;
    const globalConversionRate = totalInvites > 0 ? (totalConversions / totalInvites * 100) : 0;

    res.json({
      globalStats: {
        totalInvites,
        totalConversions,
        conversionRate: Math.round(globalConversionRate * 100) / 100
      },
      topInviters: topInvitersWithNames
    });

  } catch (error) {
    next(error);
  }
});