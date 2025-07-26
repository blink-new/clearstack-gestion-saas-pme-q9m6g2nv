// path: backend/src/modules/integrations/lbl.routes.ts
import { Router } from 'express';
import { lblClient } from '../../services/lbl';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { prisma } from '../../db/client';

export const lblRouter = Router();

// Recherche de logiciels dans le référentiel LBL
lblRouter.get('/lbl/search', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        code: 'INVALID_QUERY',
        message: 'Paramètre de recherche requis'
      });
    }

    const results = await lblClient.searchSoftwares(q);
    
    res.json({
      items: results,
      query: q,
      count: results.length
    });
  } catch (error) {
    console.error('Erreur recherche LBL:', error);
    res.status(500).json({
      code: 'LBL_SEARCH_ERROR',
      message: error.message || 'Erreur lors de la recherche dans le référentiel'
    });
  }
});

// Récupération des détails d'un logiciel LBL
lblRouter.get('/lbl/softwares/:id', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const software = await lblClient.getSoftwareById(id);
    
    if (!software) {
      return res.status(404).json({
        code: 'SOFTWARE_NOT_FOUND',
        message: 'Logiciel non trouvé dans le référentiel'
      });
    }

    res.json(software);
  } catch (error) {
    console.error('Erreur récupération logiciel LBL:', error);
    res.status(500).json({
      code: 'LBL_SOFTWARE_ERROR',
      message: error.message || 'Erreur lors de la récupération du logiciel'
    });
  }
});

// Lier un logiciel à une référence LBL
lblRouter.post('/softwares/:id/link-lbl', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { external_ref_id, category, version } = req.body;
    
    if (!external_ref_id) {
      return res.status(400).json({
        code: 'MISSING_EXTERNAL_REF',
        message: 'Référence externe requise'
      });
    }

    // Vérifier que le logiciel existe et appartient à la société
    const existingSoftware = await prisma.software.findFirst({
      where: {
        id,
        // TODO: Ajouter company_id filter via tenantGuard context
      }
    });

    if (!existingSoftware) {
      return res.status(404).json({
        code: 'SOFTWARE_NOT_FOUND',
        message: 'Logiciel non trouvé'
      });
    }

    // Vérifier que la référence LBL existe
    const lblSoftware = await lblClient.getSoftwareById(external_ref_id);
    if (!lblSoftware) {
      return res.status(400).json({
        code: 'INVALID_LBL_REFERENCE',
        message: 'Référence LeBonLogiciel invalide'
      });
    }

    // Mettre à jour le logiciel avec la référence LBL
    const updatedSoftware = await prisma.software.update({
      where: { id },
      data: {
        external_ref_id,
        category: category || lblSoftware.category,
        version: version || lblSoftware.versions[0] || existingSoftware.version,
        updated_at: new Date()
      }
    });

    res.json({
      message: 'Logiciel lié au référentiel LeBonLogiciel avec succès',
      software: updatedSoftware,
      lbl_reference: lblSoftware
    });
  } catch (error) {
    console.error('Erreur liaison LBL:', error);
    res.status(500).json({
      code: 'LBL_LINK_ERROR',
      message: error.message || 'Erreur lors de la liaison avec le référentiel'
    });
  }
});

// Synchronisation manuelle d'un logiciel avec LBL
lblRouter.post('/softwares/:id/sync-lbl', authMiddleware, tenantGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const software = await prisma.software.findFirst({
      where: {
        id,
        external_ref_id: { not: null }
        // TODO: Ajouter company_id filter
      }
    });

    if (!software || !software.external_ref_id) {
      return res.status(404).json({
        code: 'NO_LBL_REFERENCE',
        message: 'Aucune référence LeBonLogiciel trouvée pour ce logiciel'
      });
    }

    const lblSoftware = await lblClient.getSoftwareById(software.external_ref_id);
    if (!lblSoftware) {
      return res.status(400).json({
        code: 'LBL_REFERENCE_NOT_FOUND',
        message: 'Référence LeBonLogiciel non trouvée ou supprimée'
      });
    }

    // Mise à jour des champs synchronisables (pas le nom)
    const updatedSoftware = await prisma.software.update({
      where: { id },
      data: {
        category: lblSoftware.category,
        // Garder la version actuelle si elle existe dans LBL, sinon prendre la première
        version: lblSoftware.versions.includes(software.version) 
          ? software.version 
          : lblSoftware.versions[0] || software.version,
        updated_at: new Date()
      }
    });

    res.json({
      message: 'Synchronisation avec LeBonLogiciel réussie',
      software: updatedSoftware,
      lbl_reference: lblSoftware,
      changes: {
        category_updated: software.category !== lblSoftware.category,
        version_updated: software.version !== updatedSoftware.version
      }
    });
  } catch (error) {
    console.error('Erreur sync LBL:', error);
    res.status(500).json({
      code: 'LBL_SYNC_ERROR',
      message: error.message || 'Erreur lors de la synchronisation'
    });
  }
});

// Health check de l'API LBL
lblRouter.get('/lbl/health', authMiddleware, async (req, res) => {
  try {
    const isHealthy = await lblClient.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unavailable',
      message: isHealthy 
        ? 'Connexion LeBonLogiciel opérationnelle' 
        : 'Service LeBonLogiciel indisponible'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la vérification du service LeBonLogiciel'
    });
  }
});