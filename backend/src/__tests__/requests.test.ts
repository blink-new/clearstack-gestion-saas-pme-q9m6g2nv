// path: backend/src/__tests__/requests.test.ts
import { requestService } from '../modules/requests/service';
import { prisma } from '../server';

// Mock Prisma
jest.mock('../server', () => ({
  prisma: {
    request: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    vote: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    }
  }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('RequestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une demande valide', async () => {
      mockPrisma.request.create.mockResolvedValue({
        id: 'request-id',
        descriptionNeed: 'Besoin d\'un CRM',
        urgency: 'LT_3M',
        requester: { firstName: 'John', lastName: 'Doe' },
        _count: { votes: 0 }
      } as any);

      const result = await requestService.create('user-id', 'company-id', {
        descriptionNeed: 'Besoin d\'un CRM',
        urgency: 'LT_3M'
      });

      expect(result.descriptionNeed).toBe('Besoin d\'un CRM');
      expect(mockPrisma.request.create).toHaveBeenCalledWith({
        data: {
          descriptionNeed: 'Besoin d\'un CRM',
          urgency: 'LT_3M',
          requesterId: 'user-id',
          companyId: 'company-id'
        },
        include: expect.any(Object)
      });
    });

    it('devrait rejeter une description trop longue', async () => {
      const longDescription = 'x'.repeat(281);

      await expect(requestService.create('user-id', 'company-id', {
        descriptionNeed: longDescription,
        urgency: 'IMMEDIATE'
      })).rejects.toThrow();
    });
  });

  describe('vote', () => {
    it('devrait ajouter un vote', async () => {
      mockPrisma.request.findFirst.mockResolvedValue({ id: 'request-id' } as any);
      mockPrisma.vote.findUnique.mockResolvedValue(null);
      mockPrisma.vote.create.mockResolvedValue({} as any);

      const result = await requestService.vote('request-id', 'voter-id', 'company-id');

      expect(result.hasVoted).toBe(true);
      expect(result.message).toBe('Vote ajouté');
    });

    it('devrait retirer un vote existant', async () => {
      mockPrisma.request.findFirst.mockResolvedValue({ id: 'request-id' } as any);
      mockPrisma.vote.findUnique.mockResolvedValue({ requestId: 'request-id' } as any);
      mockPrisma.vote.delete.mockResolvedValue({} as any);

      const result = await requestService.vote('request-id', 'voter-id', 'company-id');

      expect(result.hasVoted).toBe(false);
      expect(result.message).toBe('Vote retiré');
    });
  });
});