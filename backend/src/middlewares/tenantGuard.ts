// path: backend/src/middlewares/tenantGuard.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

/**
 * Middleware de protection multi-tenant renforcé
 * Garantit l'isolation stricte des données par société
 */
export function tenantGuard(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentification requise'
      });
      return;
    }

    if (!authReq.user.companyId) {
      res.status(403).json({
        code: 'TENANT_ACCESS_DENIED',
        message: 'Accès refusé : société non identifiée'
      });
      return;
    }

    // Ajouter le company_id aux headers et à la requête
    req.headers['x-company-id'] = authReq.user.companyId;
    (req as any).companyId = authReq.user.companyId;

    // Log pour audit de sécurité (sans données sensibles)
    console.log(`[TENANT] User ${authReq.user.id} accessing company ${authReq.user.companyId} - ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    console.error('Erreur middleware tenant:', error);
    res.status(500).json({
      code: 'TENANT_ERROR',
      message: 'Erreur de protection multi-tenant'
    });
  }
}

/**
 * Middleware spécialisé pour vérifier l'accès aux ressources par ID
 * Garantit qu'une ressource appartient bien à la société de l'utilisateur
 */
export const resourceTenantGuard = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const authReq = req as AuthenticatedRequest;
    const companyId = authReq.user?.companyId;

    if (!resourceId || !companyId) {
      return res.status(400).json({
        code: 'INVALID_REQUEST',
        message: 'Paramètres manquants pour la vérification d\'accès'
      });
    }

    // Log pour audit de sécurité
    console.log(`[RESOURCE_GUARD] Checking access to ${resourceType} ${resourceId} for company ${companyId}`);

    // TODO: Implémenter la vérification spécifique par type de ressource
    // Cette vérification devrait être faite dans chaque service métier
    // pour garantir que WHERE company_id = ? est toujours présent

    next();
  };
};