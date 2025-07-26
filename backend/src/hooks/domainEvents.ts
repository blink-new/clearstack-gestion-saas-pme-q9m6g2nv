// path: backend/src/hooks/domainEvents.ts
import { prisma } from '../db/client';
import { enqueueEvent } from '../services/outbox';
import { maybeAnonymizeUser } from '../utils/anonymize';
import { OutboundEventType } from '@prisma/client';

// Vérifier si l'intégration prospection est activée pour une company
async function isProspectEnabled(companyId: string): Promise<{ enabled: boolean; anonymize: boolean }> {
  try {
    const settings = await prisma.companyIntegrationSetting.findUnique({
      where: { companyId }
    });
    
    return {
      enabled: settings?.prospectEnabled || false,
      anonymize: settings?.anonymize || false
    };
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur vérification settings:', error);
    return { enabled: false, anonymize: false };
  }
}

// Hook: Après création d'un avis
export async function onReviewCreated(reviewId: string): Promise<void> {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: true, software: true }
    });
    
    if (!review) return;
    
    const { enabled, anonymize } = await isProspectEnabled(review.companyId);
    if (!enabled) return;
    
    const payload = {
      company_id: review.companyId,
      software_id: review.softwareId,
      rating: review.rating,
      tags: review.tags,
      improvement: review.improvement,
      created_at: review.createdAt.toISOString(),
      user: maybeAnonymizeUser(review.user, anonymize)
    };
    
    await enqueueEvent(review.companyId, OutboundEventType.REVIEW_CREATED, payload);
    console.log(`[DOMAIN_EVENTS] Avis créé envoyé pour company ${review.companyId}`);
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onReviewCreated:', error);
  }
}

// Hook: Après création d'une demande
export async function onRequestCreated(requestId: string): Promise<void> {
  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { requester: true }
    });
    
    if (!request) return;
    
    const { enabled, anonymize } = await isProspectEnabled(request.companyId);
    if (!enabled) return;
    
    const payload = {
      company_id: request.companyId,
      title: request.softwareRef || 'Demande logiciel',
      urgency: request.urgency,
      est_budget: request.estBudget?.toString(),
      description: request.descriptionNeed.substring(0, 100), // Limiter la taille
      created_at: request.createdAt.toISOString(),
      requester: maybeAnonymizeUser(request.requester, anonymize)
    };
    
    await enqueueEvent(request.companyId, OutboundEventType.REQUEST_CREATED, payload);
    console.log(`[DOMAIN_EVENTS] Demande créée envoyée pour company ${request.companyId}`);
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onRequestCreated:', error);
  }
}

// Hook: Après acceptation d'une demande
export async function onRequestAccepted(requestId: string): Promise<void> {
  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { 
        requester: true,
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!request) return;
    
    const { enabled, anonymize } = await isProspectEnabled(request.companyId);
    if (!enabled) return;
    
    const project = request.projects[0];
    
    const payload = {
      company_id: request.companyId,
      software_ref: request.softwareRef,
      software_id: request.softwareId,
      roi_estimate: project?.roiEstimate,
      risks: project?.risks,
      est_budget: request.estBudget?.toString(),
      accepted_at: new Date().toISOString(),
      requester: maybeAnonymizeUser(request.requester, anonymize)
    };
    
    await enqueueEvent(request.companyId, OutboundEventType.REQUEST_ACCEPTED, payload);
    console.log(`[DOMAIN_EVENTS] Demande acceptée envoyée pour company ${request.companyId}`);
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onRequestAccepted:', error);
  }
}

// Hook: Après déclaration d'usage d'un logiciel
export async function onSoftwareUsage(userId: string, softwareId: string, status: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const software = await prisma.software.findUnique({
      where: { id: softwareId }
    });
    
    if (!user || !software) return;
    
    const { enabled, anonymize } = await isProspectEnabled(user.companyId);
    if (!enabled) return;
    
    const payload = {
      company_id: user.companyId,
      user: maybeAnonymizeUser(user, anonymize),
      software: {
        id: software.id,
        name: software.name,
        category: software.category
      },
      status,
      timestamp: new Date().toISOString()
    };
    
    await enqueueEvent(user.companyId, OutboundEventType.SOFTWARE_USAGE, payload);
    console.log(`[DOMAIN_EVENTS] Usage logiciel envoyé pour company ${user.companyId}`);
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onSoftwareUsage:', error);
  }
}

// Hook: Après modification d'un contrat (échéance ou préavis)
export async function onContractRenewal(contractId: string): Promise<void> {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { 
        software: true,
        entity: true
      }
    });
    
    if (!contract) return;
    
    // Trouver la company via l'entité
    const entity = await prisma.entity.findUnique({
      where: { id: contract.entityId || '' },
      include: { company: true }
    });
    
    if (!entity) return;
    
    const { enabled } = await isProspectEnabled(entity.companyId);
    if (!enabled) return;
    
    const payload = {
      company_id: entity.companyId,
      software_id: contract.softwareId,
      end_date: contract.endDate.toISOString(),
      notice_days: contract.noticeDays,
      amount_monthly: contract.costAmount.toString(),
      currency: contract.currency,
      entity_id: contract.entityId,
      software_name: contract.software.name,
      updated_at: new Date().toISOString()
    };
    
    await enqueueEvent(entity.companyId, OutboundEventType.CONTRACT_RENEWAL, payload);
    console.log(`[DOMAIN_EVENTS] Renouvellement contrat envoyé pour company ${entity.companyId}`);
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onContractRenewal:', error);
  }
}

// Hook: Après calcul d'économies suggérées
export async function onEconomyOpportunity(companyId: string, economyItems: any[]): Promise<void> {
  try {
    const { enabled } = await isProspectEnabled(companyId);
    if (!enabled) return;
    
    // Filtrer les opportunités > 200€
    const significantOpportunities = economyItems.filter(item => 
      parseFloat(item.estimatedAmount) >= 200
    );
    
    for (const item of significantOpportunities) {
      const payload = {
        company_id: companyId,
        type: item.type,
        estimated_amount: item.estimatedAmount.toString(),
        software_id: item.softwareId,
        calculated_at: new Date().toISOString()
      };
      
      await enqueueEvent(companyId, OutboundEventType.ECONOMY_OPPORTUNITY, payload);
    }
    
    if (significantOpportunities.length > 0) {
      console.log(`[DOMAIN_EVENTS] ${significantOpportunities.length} opportunités d'économie envoyées pour company ${companyId}`);
    }
    
  } catch (error) {
    console.error('[DOMAIN_EVENTS] Erreur onEconomyOpportunity:', error);
  }
}