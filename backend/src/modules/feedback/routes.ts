// path: backend/src/modules/feedback/routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { prisma } from '../../db/client';

export const feedbackRouter = Router();

// Créer un feedback bêta
feedbackRouter.post('/feedback', 
  authMiddleware, 
  tenantGuard,
  async (req, res, next) => {
    try {
      const { page, rating, message } = req.body;

      if (!page) {
        return res.status(400).json({
          code: 'MISSING_PAGE',
          message: 'Le champ page est requis'
        });
      }

      if (!rating && !message) {
        return res.status(400).json({
          code: 'MISSING_CONTENT',
          message: 'Une note ou un commentaire est requis'
        });
      }

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          code: 'INVALID_RATING',
          message: 'La note doit être entre 1 et 5'
        });
      }

      const feedback = await prisma.betaFeedback.create({
        data: {
          userId: req.user.id,
          companyId: req.user.companyId,
          page: page.toString(),
          role: req.user.role,
          rating: rating || null,
          message: message || null
        }
      });

      res.status(201).json({
        message: 'Feedback enregistré avec succès',
        id: feedback.id
      });
    } catch (error) {
      next(error);
    }
  }
);

// Récupérer les feedbacks (Admin uniquement)
feedbackRouter.get('/feedback',
  authMiddleware,
  tenantGuard,
  async (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs'
        });
      }

      const { page, limit = 50, offset = 0 } = req.query;

      const where: any = {
        companyId: req.user.companyId
      };

      if (page) {
        where.page = page.toString();
      }

      const [feedbacks, total] = await Promise.all([
        prisma.betaFeedback.findMany({
          where,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: Math.min(parseInt(limit.toString()), 100),
          skip: parseInt(offset.toString())
        }),
        prisma.betaFeedback.count({ where })
      ]);

      const formattedFeedbacks = feedbacks.map(feedback => ({
        id: feedback.id,
        page: feedback.page,
        role: feedback.role,
        rating: feedback.rating,
        message: feedback.message,
        createdAt: feedback.createdAt,
        user: {
          name: `${feedback.user.firstName} ${feedback.user.lastName}`,
          email: feedback.user.email
        }
      }));

      res.json({
        feedbacks: formattedFeedbacks,
        total,
        hasMore: (parseInt(offset.toString()) + feedbacks.length) < total
      });
    } catch (error) {
      next(error);
    }
  }
);

// Statistiques des feedbacks (Admin uniquement)
feedbackRouter.get('/feedback/stats',
  authMiddleware,
  tenantGuard,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs'
        });
      }

      const [
        totalCount,
        avgRating,
        ratingDistribution,
        pageStats
      ] = await Promise.all([
        // Total des feedbacks
        prisma.betaFeedback.count({
          where: { companyId: req.user.companyId }
        }),
        
        // Note moyenne
        prisma.betaFeedback.aggregate({
          where: { 
            companyId: req.user.companyId,
            rating: { not: null }
          },
          _avg: { rating: true }
        }),
        
        // Distribution des notes
        prisma.betaFeedback.groupBy({
          by: ['rating'],
          where: { 
            companyId: req.user.companyId,
            rating: { not: null }
          },
          _count: { rating: true }
        }),
        
        // Stats par page
        prisma.betaFeedback.groupBy({
          by: ['page'],
          where: { companyId: req.user.companyId },
          _count: { page: true },
          _avg: { rating: true },
          orderBy: { _count: { page: 'desc' } },
          take: 10
        })
      ]);

      res.json({
        total: totalCount,
        averageRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          if (item.rating) {
            acc[item.rating] = item._count.rating;
          }
          return acc;
        }, {} as Record<number, number>),
        topPages: pageStats.map(stat => ({
          page: stat.page,
          count: stat._count.page,
          averageRating: stat._avg.rating ? Math.round(stat._avg.rating * 10) / 10 : null
        }))
      });
    } catch (error) {
      next(error);
    }
  }
);