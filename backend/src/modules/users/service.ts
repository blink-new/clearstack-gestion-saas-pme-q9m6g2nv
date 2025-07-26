// path: backend/src/modules/users/service.ts
import { z } from 'zod';
import { prisma } from '../../server';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  entityId: z.string().uuid().optional().nullable()
});

const updatePermissionsSchema = z.object({
  role: z.enum(['ADMIN', 'USER']).optional(),
  entityId: z.string().uuid().optional().nullable()
});

class UserService {
  async updateProfile(userId: string, data: any) {
    const validData = updateProfileSchema.parse(data);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: validData,
      include: {
        company: true,
        entity: true
      }
    });

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

  async updatePermissions(userId: string, companyId: string, data: any) {
    const validData = updatePermissionsSchema.parse(data);
    
    // Vérifier que l'utilisateur appartient à la même société
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId
      }
    });

    if (!targetUser) {
      throw new Error('Utilisateur non trouvé dans cette société');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validData
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      message: 'Permissions mises à jour avec succès'
    };
  }
}

export const userService = new UserService();