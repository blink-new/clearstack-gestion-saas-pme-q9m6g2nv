// path: backend/src/middlewares/roleGuard.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const roleGuard = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentification requise'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Permissions insuffisantes pour cette action'
      });
    }

    next();
  };
};