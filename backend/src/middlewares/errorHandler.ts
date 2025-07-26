// path: backend/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erreur:', error);

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Données invalides',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Erreur Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      code: 'DUPLICATE_ENTRY',
      message: 'Cette entrée existe déjà'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: 'Ressource non trouvée'
    });
  }

  // Erreur générique
  res.status(error.status || 500).json({
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Erreur interne du serveur'
  });
};