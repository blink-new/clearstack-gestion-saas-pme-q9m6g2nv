// path: backend/src/modules/auth/service.ts
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../../server';

const loginEmailSchema = z.object({
  email: z.string().email('Email invalide')
});

class AuthService {
  async requestMagicLink(data: any) {
    const { email } = loginEmailSchema.parse(data);
    
    // Stub : en production, envoyer un vrai email
    console.log(`Lien magique demandé pour: ${email}`);
    
    return {
      message: 'Lien magique envoyé par email',
      email
    };
  }

  async logout(userId: string) {
    // En production, invalider le token côté serveur
    console.log(`Déconnexion utilisateur: ${userId}`);
    
    return {
      message: 'Déconnexion réussie'
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        entity: true
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company: {
        id: user.company.id,
        name: user.company.name
      },
      entity: user.entity ? {
        id: user.entity.id,
        name: user.entity.name
      } : null
    };
  }

  generateToken(userId: string, companyId: string) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET non configuré');
    }

    return jwt.sign(
      { userId, companyId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export const authService = new AuthService();