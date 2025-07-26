// path: backend/src/modules/users/routes.ts
import { Router } from 'express';
import { userService } from './service';
import { tenantGuard } from '../../middlewares/tenantGuard';
import { roleGuard } from '../../middlewares/roleGuard';

const router = Router();

// Appliquer le tenant guard à toutes les routes
router.use(tenantGuard);

// PATCH /me - Mettre à jour son profil
router.patch('/me', async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user!.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:id/permissions - Admin seulement
router.patch('/:id/permissions', roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const result = await userService.updatePermissions(
      req.params.id,
      req.user!.companyId,
      req.body
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;