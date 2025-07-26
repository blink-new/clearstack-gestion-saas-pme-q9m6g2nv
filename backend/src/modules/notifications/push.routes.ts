// path: backend/src/modules/notifications/push.routes.ts
import { Router } from 'express';
import { saveSubscription, deleteSubscription, pushToUser } from '../../services/webpush';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const pushRouter = Router();

pushRouter.post('/push/subscribe', authMiddleware, async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    await saveSubscription(req.user.id, { endpoint, keys });
    res.status(201).json({ message: 'Abonnement push activé' });
  } catch (e) { 
    next(e); 
  }
});

pushRouter.delete('/push/subscribe', authMiddleware, async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    await deleteSubscription(endpoint);
    res.status(204).end();
  } catch (e) { 
    next(e); 
  }
});

pushRouter.post('/push/test', authMiddleware, async (req, res, next) => {
  try {
    await pushToUser(req.user.id, { 
      title: 'Test ClearStack', 
      body: 'Ceci est un test de notification', 
      url: '/' 
    });
    res.json({ message: 'Push envoyé' });
  } catch (e) { 
    next(e); 
  }
});