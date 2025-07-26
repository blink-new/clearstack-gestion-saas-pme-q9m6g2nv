// path: backend/src/__tests__/reviews.test.ts
import { reviewService } from '../modules/reviews/service';
import { prisma } from '../server';

// Mock Prisma
jest.mock('../server', () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    }
  }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ReviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un avis valide', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue({
        id: 'review-id',
        rating: 4,
        strengths: 'Facile à utiliser',
        weaknesses: 'Cher',
        improvement: 'Réduire le prix',
        user: { firstName: 'John', lastName: 'Doe' },
        software: { name: 'Test Software' }
      } as any);

      const result = await reviewService.create('user-id', 'company-id', {
        softwareId: 'software-id',
        rating: 4,
        strengths: 'Facile à utiliser',
        weaknesses: 'Cher',
        improvement: 'Réduire le prix'
      });

      expect(result.rating).toBe(4);
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: {
          softwareId: 'software-id',
          rating: 4,
          strengths: 'Facile à utiliser',
          weaknesses: 'Cher',
          improvement: 'Réduire le prix',
          userId: 'user-id',
          companyId: 'company-id',
          tags: []
        },
        include: expect.any(Object)
      });
    });

    it('devrait rejeter un avis en double', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({ id: 'existing-review' } as any);

      await expect(reviewService.create('user-id', 'company-id', {
        softwareId: 'software-id',
        rating: 4
      })).rejects.toThrow('Vous avez déjà donné votre avis sur ce logiciel');
    });
  });

  describe('list - Anti-biais', () => {
    it('devrait masquer les détails si l\'utilisateur n\'a pas donné d\'avis', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 3.5 },
        _count: { id: 10 }
      } as any);

      const result = await reviewService.list('user-id', 'company-id', {
        softwareId: 'software-id'
      });

      expect(result.hasUserReview).toBe(false);
      expect(result.stats.averageRating).toBe(3.5);
      expect(result.stats.totalReviews).toBe(10);
      expect(result.message).toContain('Donnez votre avis');
    });

    it('devrait montrer tous les avis si l\'utilisateur a donné le sien', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({ id: 'user-review' } as any);
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(5);
      mockPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.0 }
      } as any);

      const result = await reviewService.list('user-id', 'company-id', {
        softwareId: 'software-id'
      });

      expect(result.hasUserReview).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.stats.averageRating).toBe(4.0);
    });
  });
});