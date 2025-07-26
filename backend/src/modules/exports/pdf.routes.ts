import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantGuard } from '../../middlewares/tenantGuard';

export const pdfRouter = Router();

// Stub routes pour le mode léger - PDF désactivé
const pdfDisabledResponse = {
  code: 'DISABLED_IN_LIGHT_MODE',
  message: 'Export PDF désactivé temporairement.'
};

pdfRouter.get('/exports/pdf/dashboard', authMiddleware, tenantGuard, async (req, res) => {
  res.status(501).json(pdfDisabledResponse);
});

pdfRouter.get('/exports/pdf/renewals', authMiddleware, tenantGuard, async (req, res) => {
  res.status(501).json(pdfDisabledResponse);
});

pdfRouter.get('/exports/pdf/project/:id', authMiddleware, tenantGuard, async (req, res) => {
  res.status(501).json(pdfDisabledResponse);
});