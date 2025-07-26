// path: backend/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'USER';
    companyId: string;
    emailNotifications: boolean;
  };
}

/**
 * Middleware d'authentification JWT
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'MISSING_TOKEN',
        message: 'Token d\'authentification requis'
      });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET non configuré');
      res.status(500).json({
        code: 'SERVER_ERROR',
        message: 'Erreur de configuration serveur'
      });
      return;
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Récupérer l'utilisateur en base
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        emailNotifications: true
      }
    });

    if (!user) {
      res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: 'Utilisateur introuvable'
      });
      return;
    }

    // Ajouter l'utilisateur à la requête
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Token invalide'
      });
    } else {
      console.error('Erreur middleware auth:', error);
      res.status(500).json({
        code: 'AUTH_ERROR',
        message: 'Erreur d\'authentification'
      });
    }
  }
}