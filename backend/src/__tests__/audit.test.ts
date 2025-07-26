// path: backend/src/__tests__/audit.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logAudit, getAuditLogs, cleanupOldAuditLogs, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../services/audit.js';
import { prisma } from '../db/client.js';

// Mock Prisma
vi.mock('../db/client.js', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Service Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log pour éviter les logs pendant les tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logAudit', () => {
    it('devrait enregistrer une action d\'audit avec toutes les données', async () => {
      const mockReq = {
        clientInfo: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Test Browser',
        },
      };

      const auditData = {
        companyId: 'company-123',
        userId: 'user-456',
        action: AUDIT_ACTIONS.REVIEW_CREATED,
        entityType: AUDIT_ENTITY_TYPES.REVIEW,
        entityId: 'review-789',
        diff: { rating: 4, strengths: 'Très bon outil' },
        req: mockReq as any,
      };

      (prisma.auditLog.create as any).mockResolvedValue({
        id: 'audit-123',
        ...auditData,
      });

      await logAudit(auditData);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          companyId: 'company-123',
          userId: 'user-456',
          action: 'REVIEW_CREATED',
          entityType: 'review',
          entityId: 'review-789',
          diff: { rating: 4, strengths: 'Très bon outil' },
          ip: '192.168.1.1',
          ua: 'Mozilla/5.0 Test Browser',
        },
      });

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT] REVIEW_CREATED on review (review-789) by user user-456 in company company-123'
      );
    });

    it('devrait gérer les cas sans informations de requête', async () => {
      const auditData = {
        companyId: 'company-123',
        userId: 'user-456',
        action: AUDIT_ACTIONS.LOGIN_SUCCESS,
        entityType: AUDIT_ENTITY_TYPES.USER,
      };

      (prisma.auditLog.create as any).mockResolvedValue({
        id: 'audit-124',
        ...auditData,
      });

      await logAudit(auditData);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          companyId: 'company-123',
          userId: 'user-456',
          action: 'LOGIN_SUCCESS',
          entityType: 'user',
          entityId: undefined,
          diff: null,
          ip: null,
          ua: null,
        },
      });
    });

    it('ne devrait pas faire échouer l\'opération si l\'audit échoue', async () => {
      const auditData = {
        companyId: 'company-123',
        userId: 'user-456',
        action: AUDIT_ACTIONS.REVIEW_CREATED,
        entityType: AUDIT_ENTITY_TYPES.REVIEW,
      };

      (prisma.auditLog.create as any).mockRejectedValue(new Error('Database error'));

      // Ne devrait pas lever d'exception
      await expect(logAudit(auditData)).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de l\'enregistrement de l\'audit:',
        expect.any(Error)
      );
    });
  });

  describe('getAuditLogs', () => {
    it('devrait récupérer les logs d\'audit avec filtres', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          companyId: 'company-123',
          userId: 'user-456',
          action: 'REVIEW_CREATED',
          entityType: 'review',
          createdAt: new Date(),
        },
        {
          id: 'audit-2',
          companyId: 'company-123',
          userId: 'user-456',
          action: 'REQUEST_CREATED',
          entityType: 'request',
          createdAt: new Date(),
        },
      ];

      (prisma.auditLog.findMany as any).mockResolvedValue(mockLogs);

      const options = {
        userId: 'user-456',
        entityType: 'review',
        limit: 50,
      };

      const result = await getAuditLogs('company-123', options);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-123',
          userId: 'user-456',
          entityType: 'review',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(mockLogs);
    });

    it('devrait appliquer les filtres de date', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      (prisma.auditLog.findMany as any).mockResolvedValue([]);

      await getAuditLogs('company-123', {
        startDate,
        endDate,
        limit: 100,
        offset: 20,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-123',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        skip: 20,
      });
    });
  });

  describe('cleanupOldAuditLogs', () => {
    it('devrait supprimer les logs de plus de 2 ans', async () => {
      const mockResult = { count: 150 };
      (prisma.auditLog.deleteMany as any).mockResolvedValue(mockResult);

      await cleanupOldAuditLogs();

      expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      // Vérifier que la date est bien il y a 2 ans
      const callArgs = (prisma.auditLog.deleteMany as any).mock.calls[0][0];
      const cutoffDate = callArgs.where.createdAt.lt;
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Tolérance de 1 minute pour les différences de timing
      expect(Math.abs(cutoffDate.getTime() - twoYearsAgo.getTime())).toBeLessThan(60000);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT_CLEANUP] Supprimé 150 logs d\'audit de plus de 2 ans'
      );
    });

    it('devrait gérer les erreurs de nettoyage', async () => {
      (prisma.auditLog.deleteMany as any).mockRejectedValue(new Error('Cleanup failed'));

      await cleanupOldAuditLogs();

      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors du nettoyage des logs d\'audit:',
        expect.any(Error)
      );
    });
  });

  describe('Constantes d\'audit', () => {
    it('devrait avoir toutes les actions d\'audit définies', () => {
      expect(AUDIT_ACTIONS.REVIEW_CREATED).toBe('REVIEW_CREATED');
      expect(AUDIT_ACTIONS.REQUEST_ACCEPTED).toBe('REQUEST_ACCEPTED');
      expect(AUDIT_ACTIONS.LOGIN_SUCCESS).toBe('LOGIN_SUCCESS');
      expect(AUDIT_ACTIONS.DATA_EXPORT_REQUESTED).toBe('DATA_EXPORT_REQUESTED');
      expect(AUDIT_ACTIONS.ACCOUNT_DELETION_REQUESTED).toBe('ACCOUNT_DELETION_REQUESTED');
    });

    it('devrait avoir tous les types d\'entités définis', () => {
      expect(AUDIT_ENTITY_TYPES.USER).toBe('user');
      expect(AUDIT_ENTITY_TYPES.REVIEW).toBe('review');
      expect(AUDIT_ENTITY_TYPES.REQUEST).toBe('request');
      expect(AUDIT_ENTITY_TYPES.SOFTWARE).toBe('software');
      expect(AUDIT_ENTITY_TYPES.SETTINGS).toBe('settings');
    });
  });
});