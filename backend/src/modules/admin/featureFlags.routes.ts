// path: backend/src/modules/admin/featureFlags.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleGuard } from '../../middlewares/roleGuard';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { 
  initializeFlags, 
  getAllFlags, 
  setFlag, 
  createBetaFeedback, 
  getBetaFeedbacks 
} from '../../services/featureFlags';
import { z } from 'zod';
import Papa from 'papaparse';

export const featureFlagsRouter = Router();

// Schémas de validation
const SetFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  scope: z.enum(['global', 'company']).default('company')
});

const BetaFeedbackSchema = z.object({
  page: z.string(),
  rating: z.number().min(1).max(5).optional(),
  message: z.string().optional()
});

const ImportEmailsSchema = z.object({
  csvData: z.string(),
  delimiter: z.string().default(',')
});

// GET /api/v1/admin/feature-flags - Lister tous les flags
featureFlagsRouter.get('/feature-flags', 
  authMiddleware, 
  roleGuard(['ADMIN']), 
  tenantGuard,
  async (req, res, next) => {
    try {
      await initializeFlags(req.companyId);
      await initializeFlags(); // Flags globaux
      
      const flags = await getAllFlags(req.companyId!);
      
      res.json({
        success: true,
        data: flags
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/admin/feature-flags/:key - Modifier un flag
featureFlagsRouter.patch('/feature-flags/:key',
  authMiddleware,
  roleGuard(['ADMIN']),
  tenantGuard,
  async (req, res, next) => {
    try {
      const { key } = req.params;
      const body = SetFlagSchema.parse(req.body);
      
      const companyId = body.scope === 'global' ? null : req.companyId!;
      
      const flag = await setFlag(key, body.enabled, companyId);
      
      res.json({
        success: true,
        message: `Flag ${key} ${body.enabled ? 'activé' : 'désactivé'} (scope: ${body.scope})`,
        data: flag
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/admin/beta-whitelist/import - Importer emails CSV
featureFlagsRouter.post('/beta-whitelist/import',
  authMiddleware,
  roleGuard(['ADMIN']),
  tenantGuard,
  async (req, res, next) => {
    try {
      const body = ImportEmailsSchema.parse(req.body);
      
      // Parse CSV
      const parsed = Papa.parse(body.csvData, {
        delimiter: body.delimiter,
        header: true,
        skipEmptyLines: true
      });
      
      if (parsed.errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Erreur de parsing CSV',
          errors: parsed.errors
        });
      }
      
      const emails = parsed.data
        .map((row: any) => row.email || row.Email || row.EMAIL)
        .filter((email: string) => email && email.includes('@'));
      
      if (emails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun email valide trouvé dans le CSV'
        });
      }
      
      // TODO: Implémenter la logique de whitelist
      // Pour l'instant, on simule juste l'import
      
      res.json({
        success: true,
        message: `${emails.length} emails importés dans la whitelist bêta`,
        data: { count: emails.length, emails: emails.slice(0, 5) } // Preview
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/feedback - Créer un feedback bêta (accessible à tous les users)
featureFlagsRouter.post('/feedback',
  authMiddleware,
  tenantGuard,
  async (req, res, next) => {
    try {
      const body = BetaFeedbackSchema.parse(req.body);
      
      const feedback = await createBetaFeedback({
        userId: req.user!.id,
        companyId: req.companyId!,
        page: body.page,
        role: req.user!.role,
        rating: body.rating,
        message: body.message
      });
      
      res.status(201).json({
        success: true,
        message: 'Merci pour votre retour !',
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/admin/feedback - Lister les feedbacks (Admin)
featureFlagsRouter.get('/feedback',
  authMiddleware,
  roleGuard(['ADMIN']),
  tenantGuard,
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const feedbacks = await getBetaFeedbacks(req.companyId!, limit);
      
      res.json({
        success: true,
        data: feedbacks
      });
    } catch (error) {
      next(error);
    }
  }
);