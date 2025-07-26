// path: backend/src/modules/reviews/service.ts
import { z } from 'zod';
import { prisma } from '../../server';

const createReviewSchema = z.object({
  softwareId: z.string().uuid('ID logiciel invalide'),
  rating: z.number().int().min(1).max(5, 'Note entre 1 et 5'),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  improvement: z.string().max(200, 'Suggestion limitée à 200 caractères').optional(),
  tags: z.array(z.string()).optional()
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  improvement: z.string().max(200).optional(),
  tags: z.array(z.string()).optional()
});

class ReviewService {
  async create(userId: string, companyId: string, data: any) {
    const validData = createReviewSchema.parse(data);
    
    // Vérifier que l'utilisateur n'a pas déjà donné d'avis
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_softwareId: {
          userId,
          softwareId: validData.softwareId
        }
      }
    });

    if (existingReview) {
      throw new Error('Vous avez déjà donné votre avis sur ce logiciel');
    }

    const review = await prisma.review.create({
      data: {
        ...validData,
        userId,
        companyId,
        tags: validData.tags || []
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        software: {
          select: {
            name: true
          }
        }
      }
    });

    return review;
  }

  async list(userId: string, companyId: string, query: any) {
    const { softwareId, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!softwareId) {
      throw new Error('ID logiciel requis');
    }

    // Vérifier si l'utilisateur a déjà donné son avis
    const userReview = await prisma.review.findUnique({
      where: {
        userId_softwareId: {
          userId,
          softwareId
        }
      }
    });

    // Anti-biais : si l'utilisateur n'a pas donné d'avis, ne montrer que la moyenne
    if (!userReview) {
      const stats = await prisma.review.aggregate({
        where: {
          softwareId,
          companyId
        },
        _avg: {
          rating: true
        },
        _count: {
          id: true
        }
      });

      return {
        hasUserReview: false,
        stats: {
          averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
          totalReviews: stats._count.id
        },
        message: 'Donnez votre avis pour voir les détails des autres avis'
      };
    }

    // L'utilisateur a donné son avis, montrer tous les avis
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          softwareId,
          companyId
        },
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({
        where: {
          softwareId,
          companyId
        }
      })
    ]);

    const stats = await prisma.review.aggregate({
      where: {
        softwareId,
        companyId
      },
      _avg: {
        rating: true
      }
    });

    return {
      hasUserReview: true,
      data: reviews,
      stats: {
        averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : null,
        totalReviews: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getById(id: string, companyId: string) {
    const review = await prisma.review.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        software: {
          select: {
            name: true
          }
        }
      }
    });

    if (!review) {
      throw new Error('Avis non trouvé');
    }

    return review;
  }

  async update(id: string, userId: string, data: any) {
    const validData = updateReviewSchema.parse(data);
    
    // Vérifier que l'avis appartient à l'utilisateur
    const existingReview = await prisma.review.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingReview) {
      throw new Error('Avis non trouvé ou non autorisé');
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...validData,
        tags: validData.tags || existingReview.tags
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        software: {
          select: {
            name: true
          }
        }
      }
    });

    return review;
  }
}

export const reviewService = new ReviewService();