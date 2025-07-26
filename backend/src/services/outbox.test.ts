// path: backend/src/services/outbox.test.ts
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { enqueueEvent, publishPending } from './outbox';
import { postToProspect } from './prospect';
import { OutboundEventType, OutboundEventStatus } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  outboundEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn()
  }
};

// Mock prospect service
jest.mock('./prospect', () => ({
  postToProspect: jest.fn()
}));

// Mock prisma client
jest.mock('../db/client', () => ({
  prisma: mockPrisma
}));

const mockPostToProspect = postToProspect as jest.MockedFunction<typeof postToProspect>;

describe('Outbox Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log pour éviter les logs pendant les tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('enqueueEvent', () => {
    it('devrait créer un événement en statut PENDING', async () => {
      const companyId = 'company-123';
      const type = OutboundEventType.REVIEW_CREATED;
      const payload = { test: 'data' };

      mockPrisma.outboundEvent.create.mockResolvedValue({
        id: 'event-123',
        companyId,
        type,
        payload,
        status: OutboundEventStatus.PENDING,
        tryCount: 0
      });

      await enqueueEvent(companyId, type, payload);

      expect(mockPrisma.outboundEvent.create).toHaveBeenCalledWith({
        data: {
          companyId,
          type,
          payload,
          status: OutboundEventStatus.PENDING,
          tryCount: 0,
          nextAttemptAt: expect.any(Date)
        }
      });
    });

    it('devrait gérer les erreurs de création', async () => {
      const companyId = 'company-123';
      const type = OutboundEventType.REVIEW_CREATED;
      const payload = { test: 'data' };

      mockPrisma.outboundEvent.create.mockRejectedValue(new Error('DB Error'));

      await expect(enqueueEvent(companyId, type, payload))
        .rejects.toThrow('Impossible de mettre l\'événement en file d\'attente');
    });
  });

  describe('publishPending', () => {
    it('devrait traiter les événements en attente avec succès', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          companyId: 'company-123',
          type: OutboundEventType.REVIEW_CREATED,
          payload: { test: 'data1' },
          status: OutboundEventStatus.PENDING,
          tryCount: 0,
          createdAt: new Date(),
          nextAttemptAt: new Date()
        },
        {
          id: 'event-2',
          companyId: 'company-123',
          type: OutboundEventType.REQUEST_CREATED,
          payload: { test: 'data2' },
          status: OutboundEventStatus.PENDING,
          tryCount: 0,
          createdAt: new Date(),
          nextAttemptAt: new Date()
        }
      ];

      mockPrisma.outboundEvent.findMany.mockResolvedValue(mockEvents);
      mockPostToProspect.mockResolvedValue({ success: true });
      mockPrisma.outboundEvent.update.mockResolvedValue({});

      const results = await publishPending(10);

      expect(results.sent).toBe(2);
      expect(results.failed).toBe(0);
      expect(results.errors).toHaveLength(0);

      // Vérifier que postToProspect a été appelé pour chaque événement
      expect(mockPostToProspect).toHaveBeenCalledTimes(2);
      expect(mockPostToProspect).toHaveBeenCalledWith('REVIEW_CREATED', { test: 'data1' });
      expect(mockPostToProspect).toHaveBeenCalledWith('REQUEST_CREATED', { test: 'data2' });

      // Vérifier que les événements ont été marqués comme SENT
      expect(mockPrisma.outboundEvent.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.outboundEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: {
          status: OutboundEventStatus.SENT,
          updatedAt: expect.any(Date)
        }
      });
    });

    it('devrait gérer les échecs avec backoff', async () => {
      const mockEvent = {
        id: 'event-1',
        companyId: 'company-123',
        type: OutboundEventType.REVIEW_CREATED,
        payload: { test: 'data' },
        status: OutboundEventStatus.PENDING,
        tryCount: 2,
        createdAt: new Date(),
        nextAttemptAt: new Date()
      };

      mockPrisma.outboundEvent.findMany.mockResolvedValue([mockEvent]);
      mockPostToProspect.mockRejectedValue(new Error('Network error'));
      mockPrisma.outboundEvent.update.mockResolvedValue({});

      const results = await publishPending(10);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(0); // Pas encore échoué définitivement
      expect(results.errors).toHaveLength(1);
      expect(results.errors[0]).toContain('Network error');

      // Vérifier que l'événement a été programmé pour un retry avec backoff
      expect(mockPrisma.outboundEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: {
          tryCount: 3, // Incrémenté
          nextAttemptAt: expect.any(Date), // Nouvelle date de retry
          updatedAt: expect.any(Date)
        }
      });
    });

    it('devrait marquer comme FAILED après 5 tentatives', async () => {
      const mockEvent = {
        id: 'event-1',
        companyId: 'company-123',
        type: OutboundEventType.REVIEW_CREATED,
        payload: { test: 'data' },
        status: OutboundEventStatus.PENDING,
        tryCount: 5, // Déjà 5 tentatives
        createdAt: new Date(),
        nextAttemptAt: new Date()
      };

      mockPrisma.outboundEvent.findMany.mockResolvedValue([mockEvent]);
      mockPostToProspect.mockRejectedValue(new Error('Persistent error'));
      mockPrisma.outboundEvent.update.mockResolvedValue({});

      const results = await publishPending(10);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(1); // Échec définitif
      expect(results.errors).toHaveLength(1);

      // Vérifier que l'événement a été marqué comme FAILED
      expect(mockPrisma.outboundEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: {
          status: OutboundEventStatus.FAILED,
          tryCount: 6, // Incrémenté
          updatedAt: expect.any(Date)
        }
      });
    });

    it('devrait respecter la limite d\'événements', async () => {
      const mockEvents = Array.from({ length: 20 }, (_, i) => ({
        id: `event-${i}`,
        companyId: 'company-123',
        type: OutboundEventType.REVIEW_CREATED,
        payload: { test: `data${i}` },
        status: OutboundEventStatus.PENDING,
        tryCount: 0,
        createdAt: new Date(),
        nextAttemptAt: new Date()
      }));

      mockPrisma.outboundEvent.findMany.mockResolvedValue(mockEvents);
      mockPostToProspect.mockResolvedValue({ success: true });
      mockPrisma.outboundEvent.update.mockResolvedValue({});

      await publishPending(5); // Limiter à 5 événements

      // Vérifier que findMany a été appelé avec la bonne limite
      expect(mockPrisma.outboundEvent.findMany).toHaveBeenCalledWith({
        where: {
          status: OutboundEventStatus.PENDING,
          nextAttemptAt: { lte: expect.any(Date) }
        },
        orderBy: { createdAt: 'asc' },
        take: 5 // Limite respectée
      });
    });

    it('devrait gérer les erreurs système sans arrêter le traitement', async () => {
      mockPrisma.outboundEvent.findMany.mockRejectedValue(new Error('Database connection lost'));

      const results = await publishPending(10);

      expect(results.sent).toBe(0);
      expect(results.failed).toBe(0);
      expect(results.errors).toHaveLength(1);
      expect(results.errors[0]).toContain('Erreur système');
    });
  });

  describe('Calcul du backoff', () => {
    it('devrait calculer le backoff exponentiel correctement', async () => {
      const testCases = [
        { tryCount: 1, expectedMinutes: 2 },   // 2^1 = 2 minutes
        { tryCount: 2, expectedMinutes: 4 },   // 2^2 = 4 minutes
        { tryCount: 3, expectedMinutes: 8 },   // 2^3 = 8 minutes
        { tryCount: 4, expectedMinutes: 16 },  // 2^4 = 16 minutes
        { tryCount: 5, expectedMinutes: 32 },  // 2^5 = 32 minutes
        { tryCount: 6, expectedMinutes: 60 },  // 2^6 = 64, mais max 60 minutes
        { tryCount: 10, expectedMinutes: 60 }  // Max 60 minutes
      ];

      for (const testCase of testCases) {
        const mockEvent = {
          id: 'event-1',
          companyId: 'company-123',
          type: OutboundEventType.REVIEW_CREATED,
          payload: { test: 'data' },
          status: OutboundEventStatus.PENDING,
          tryCount: testCase.tryCount,
          createdAt: new Date(),
          nextAttemptAt: new Date()
        };

        mockPrisma.outboundEvent.findMany.mockResolvedValue([mockEvent]);
        mockPostToProspect.mockRejectedValue(new Error('Test error'));
        mockPrisma.outboundEvent.update.mockResolvedValue({});

        await publishPending(1);

        // Vérifier que nextAttemptAt est calculé avec le bon backoff
        const updateCall = mockPrisma.outboundEvent.update.mock.calls.find(
          call => call[0].where.id === 'event-1'
        );
        
        if (updateCall && testCase.tryCount <= 5) { // Seulement si pas encore FAILED
          const nextAttemptAt = updateCall[0].data.nextAttemptAt as Date;
          const now = new Date();
          const diffMinutes = Math.round((nextAttemptAt.getTime() - now.getTime()) / (1000 * 60));
          
          expect(diffMinutes).toBeCloseTo(testCase.expectedMinutes, 1);
        }

        jest.clearAllMocks();
      }
    });
  });
});