// path: backend/src/modules/reviews/routes.ts
import { Router } from 'express';
import { reviewService } from './service';
import { tenantGuard } from '../../middlewares/tenantGuard';

const router = Router();

// Appliquer le tenant guard à toutes les routes
router.use(tenantGuard);

// POST /reviews - Créer un avis
router.post('/', async (req, res, next) => {
  try {
    const result = await reviewService.create(req.user!.id, req.user!.companyId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /reviews - Lister les avis (avec anti-biais)
router.get('/', async (req, res, next) => {
  try {
    const result = await reviewService.list(req.user!.id, req.user!.companyId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /reviews/:id - Détail d'un avis
router.get('/:id', async (req, res, next) => {
  try {
    const result = await reviewService.getById(req.params.id, req.user!.companyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /reviews/:id - Mettre à jour son avis
router.patch('/:id', async (req, res, next) => {
  try {
    const result = await reviewService.update(req.params.id, req.user!.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;