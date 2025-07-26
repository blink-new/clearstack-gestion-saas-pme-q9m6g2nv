// path: backend/src/services/featureFlags.ts
import { prisma } from '../db/client';

export interface FeatureFlagConfig {
  key: string;
  enabled: boolean;
  companyId?: string;
}

// Flags par défaut
export const DEFAULT_FLAGS = [
  'beta_access',
  'prospect_connector',
  'web_push',
  'economies_block'
];

export async function initializeFlags(companyId?: string) {
  const existingFlags = await prisma.featureFlag.findMany({
    where: { companyId },
    select: { key: true }
  });
  
  const existingKeys = existingFlags.map(f => f.key);
  const missingFlags = DEFAULT_FLAGS.filter(key => !existingKeys.includes(key));
  
  if (missingFlags.length > 0) {
    await prisma.featureFlag.createMany({
      data: missingFlags.map(key => ({
        key,
        enabled: key === 'beta_access' ? true : false, // beta_access activé par défaut
        companyId
      })),
      skipDuplicates: true
    });
  }
}

export async function isEnabled(key: string, companyId?: string): Promise<boolean> {
  // Vérifier d'abord le flag spécifique à la company
  if (companyId) {
    const companyFlag = await prisma.featureFlag.findUnique({
      where: { key_companyId: { key, companyId } }
    });
    if (companyFlag) return companyFlag.enabled;
  }
  
  // Fallback sur le flag global
  const globalFlag = await prisma.featureFlag.findUnique({
    where: { key_companyId: { key, companyId: null } }
  });
  
  return globalFlag?.enabled ?? false;
}

export async function setFlag(key: string, enabled: boolean, companyId?: string) {
  return prisma.featureFlag.upsert({
    where: { key_companyId: { key, companyId } },
    update: { enabled },
    create: { key, enabled, companyId }
  });
}

export async function getFlags(companyId?: string) {
  const flags = await prisma.featureFlag.findMany({
    where: { companyId },
    orderBy: { key: 'asc' }
  });
  
  return flags;
}

export async function getAllFlags(companyId: string) {
  // Récupère les flags company + globaux
  const [companyFlags, globalFlags] = await Promise.all([
    prisma.featureFlag.findMany({
      where: { companyId },
      orderBy: { key: 'asc' }
    }),
    prisma.featureFlag.findMany({
      where: { companyId: null },
      orderBy: { key: 'asc' }
    })
  ]);
  
  // Merge avec priorité aux flags company
  const flagsMap = new Map();
  
  globalFlags.forEach(flag => {
    flagsMap.set(flag.key, { ...flag, scope: 'global' });
  });
  
  companyFlags.forEach(flag => {
    flagsMap.set(flag.key, { ...flag, scope: 'company' });
  });
  
  return Array.from(flagsMap.values());
}

export async function createBetaFeedback(data: {
  userId: string;
  companyId: string;
  page: string;
  role: string;
  rating?: number;
  message?: string;
}) {
  return prisma.betaFeedback.create({
    data,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });
}

export async function getBetaFeedbacks(companyId: string, limit = 50) {
  return prisma.betaFeedback.findMany({
    where: { companyId },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}