// path: backend/src/modules/auth/routes.ts
import { Router } from 'express';
import { authService } from './service';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

// POST /auth/login-email - Demande lien magique (stub)
router.post('/login-email', async (req, res, next) => {
  try {
    const result = await authService.requestMagicLink(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.logout(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;