// path: backend/src/services/audit.ts
import { prisma } from '../db/client.js';
import { Request } from 'express';

export interface AuditLogData {
  companyId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  diff?: any;
  req?: Request;
}

/**
 * Enregistre une action dans le journal d'audit
 * Toutes les actions importantes doivent être auditées
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const clientInfo = data.req ? (data.req as any).clientInfo : null;

    await prisma.auditLog.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        diff: data.diff ? JSON.parse(JSON.stringify(data.diff)) : null,
        ip: clientInfo?.ip || null,
        ua: clientInfo?.userAgent || null,
      },
    });

    // Log console pour monitoring en temps réel
    console.log(`[AUDIT] ${data.action} on ${data.entityType}${data.entityId ? ` (${data.entityId})` : ''} by user ${data.userId} in company ${data.companyId}`);
  } catch (error) {
    // Ne pas faire échouer l'opération principale si l'audit échoue
    console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
  }
}

/**
 * Actions d'audit standardisées
 */
export const AUDIT_ACTIONS = {
  // Avis
  REVIEW_CREATED: 'REVIEW_CREATED',
  REVIEW_UPDATED: 'REVIEW_UPDATED',
  REVIEW_DELETED: 'REVIEW_DELETED',

  // Demandes
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_UPDATED: 'REQUEST_UPDATED',
  REQUEST_VOTED: 'REQUEST_VOTED',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  REQUEST_REFUSED: 'REQUEST_REFUSED',

  // Projets d'achat
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_STEP_COMPLETED: 'PROJECT_STEP_COMPLETED',

  // Contrats
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_UPDATED: 'CONTRACT_UPDATED',
  CONTRACT_DELETED: 'CONTRACT_DELETED',

  // Logiciels
  SOFTWARE_CREATED: 'SOFTWARE_CREATED',
  SOFTWARE_UPDATED: 'SOFTWARE_UPDATED',
  SOFTWARE_USAGE_DECLARED: 'SOFTWARE_USAGE_DECLARED',
  SOFTWARE_USAGE_REMOVED: 'SOFTWARE_USAGE_REMOVED',

  // Paramètres
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  INTEGRATION_ENABLED: 'INTEGRATION_ENABLED',
  INTEGRATION_DISABLED: 'INTEGRATION_DISABLED',

  // Sécurité & RGPD
  DATA_EXPORT_REQUESTED: 'DATA_EXPORT_REQUESTED',
  ACCOUNT_DELETION_REQUESTED: 'ACCOUNT_DELETION_REQUESTED',
  ACCOUNT_PURGED: 'ACCOUNT_PURGED',

  // Authentification
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',

  // Administration
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  FEATURE_FLAG_TOGGLED: 'FEATURE_FLAG_TOGGLED',
} as const;

/**
 * Types d'entités auditées
 */
export const AUDIT_ENTITY_TYPES = {
  USER: 'user',
  REVIEW: 'review',
  REQUEST: 'request',
  PROJECT: 'project',
  CONTRACT: 'contract',
  SOFTWARE: 'software',
  SETTINGS: 'settings',
  INTEGRATION: 'integration',
  FEATURE_FLAG: 'feature_flag',
} as const;

/**
 * Récupère les logs d'audit pour une société
 * Utilisé pour les exports RGPD et le monitoring
 */
export async function getAuditLogs(
  companyId: string,
  options: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
) {
  const where: any = { companyId };

  if (options.userId) where.userId = options.userId;
  if (options.entityType) where.entityType = options.entityType;
  if (options.entityId) where.entityId = options.entityId;
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit || 100,
    skip: options.offset || 0,
  });
}

/**
 * Nettoie les anciens logs d'audit (rétention 2 ans)
 * À appeler périodiquement via cron
 */
export async function cleanupOldAuditLogs(): Promise<void> {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: twoYearsAgo,
        },
      },
    });

    console.log(`[AUDIT_CLEANUP] Supprimé ${result.count} logs d'audit de plus de 2 ans`);
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs d\'audit:', error);
  }
}