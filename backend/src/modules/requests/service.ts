// path: backend/src/modules/requests/service.ts
import { z } from 'zod';
import { prisma } from '../../server';

const createRequestSchema = z.object({
  softwareRef: z.string().optional(),
  softwareId: z.string().uuid().optional(),
  descriptionNeed: z.string().min(1).max(280, 'Description limitée à 280 caractères'),
  urgency: z.enum(['IMMEDIATE', 'LT_3M', 'GT_3M']),
  estBudget: z.number().positive().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEW', 'ACCEPTED', 'REFUSED'])
});

class RequestService {
  async create(requesterId: string, companyId: string, data: any) {
    const validData = createRequestSchema.parse(data);
    
    const request = await prisma.request.create({
      data: {
        ...validData,
        requesterId,
        companyId
      },
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        software: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    return request;
  }

  async list(companyId: string, query: any) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { softwareRef: { contains: search, mode: 'insensitive' } },
        { descriptionNeed: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          requester: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          software: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.request.count({ where })
    ]);

    return {
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async updateStatus(id: string, companyId: string, data: any) {
    const validData = updateStatusSchema.parse(data);
    
    const request = await prisma.request.findFirst({
      where: {
        id,
        companyId
      }
    });

    if (!request) {
      throw new Error('Demande non trouvée');
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: validData,
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        software: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    return updatedRequest;
  }

  async vote(requestId: string, voterId: string, companyId: string) {
    // Vérifier que la demande existe et appartient à la société
    const request = await prisma.request.findFirst({
      where: {
        id: requestId,
        companyId
      }
    });

    if (!request) {
      throw new Error('Demande non trouvée');
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        requestId_voterId: {
          requestId,
          voterId
        }
      }
    });

    if (existingVote) {
      // Retirer le vote
      await prisma.vote.delete({
        where: {
          requestId_voterId: {
            requestId,
            voterId
          }
        }
      });

      return {
        message: 'Vote retiré',
        hasVoted: false
      };
    } else {
      // Ajouter le vote
      await prisma.vote.create({
        data: {
          requestId,
          voterId,
          companyId
        }
      });

      return {
        message: 'Vote ajouté',
        hasVoted: true
      };
    }
  }

  async findSimilar(companyId: string, query: any) {
    const { q: searchQuery } = query;

    if (!searchQuery) {
      return { data: [] };
    }

    const requests = await prisma.request.findMany({
      where: {
        companyId,
        OR: [
          { softwareRef: { contains: searchQuery, mode: 'insensitive' } },
          { descriptionNeed: { contains: searchQuery, mode: 'insensitive' } }
        ],
        status: { not: 'DRAFT' }
      },
      take: 5,
      include: {
        requester: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { data: requests };
  }
}

export const requestService = new RequestService();