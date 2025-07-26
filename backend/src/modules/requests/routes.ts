// path: backend/src/modules/requests/routes.ts
import { Router } from 'express';
import { requestService } from './service';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { roleGuard } from '../../middlewares/roleGuard';

const router = Router();

// Appliquer le tenant guard à toutes les routes
router.use(tenantGuard);

// POST /requests - Créer une demande
router.post('/', async (req, res, next) => {
  try {
    const result = await requestService.create(req.user!.id, req.user!.companyId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /requests - Lister les demandes
router.get('/', async (req, res, next) => {
  try {
    const result = await requestService.list(req.user!.companyId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /requests/:id - Mettre à jour le statut (Admin seulement)
router.patch('/:id', roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const result = await requestService.updateStatus(req.params.id, req.user!.companyId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /requests/:id/votes - Voter pour une demande
router.post('/:id/votes', async (req, res, next) => {
  try {
    const result = await requestService.vote(req.params.id, req.user!.id, req.user!.companyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /requests/similar - Rechercher des demandes similaires
router.get('/similar', async (req, res, next) => {
  try {
    const result = await requestService.findSimilar(req.user!.companyId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;