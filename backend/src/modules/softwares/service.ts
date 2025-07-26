// path: backend/src/modules/softwares/service.ts
import { z } from 'zod';
import { prisma } from '../../server';

const createSoftwareSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  version: z.string().optional(),
  category: z.string().optional(),
  externalRefId: z.string().optional()
});

const updateSoftwareSchema = z.object({
  name: z.string().min(1).optional(),
  version: z.string().optional(),
  category: z.string().optional()
});

const createContractSchema = z.object({
  entityId: z.string().uuid().optional(),
  costAmount: z.number().positive('Coût doit être positif'),
  currency: z.string().default('EUR'),
  billingPeriod: z.enum(['MONTH', 'YEAR']),
  endDate: z.string().transform(str => new Date(str)),
  noticeDays: z.number().int().min(0).default(95)
});

class SoftwareService {
  async list(companyId: string, query: any) {
    const { page = 1, limit = 20, search, category } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    
    // Filtrer par société via les contrats ou les usages
    where.OR = [
      { contracts: { some: { entity: { companyId } } } },
      { usages: { some: { user: { companyId } } } }
    ];

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    const [softwares, total] = await Promise.all([
      prisma.software.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          contracts: {
            where: { entity: { companyId } },
            include: { entity: true }
          },
          usages: {
            where: { user: { companyId } },
            include: { user: true }
          },
          _count: {
            select: {
              reviews: { where: { companyId } }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.software.count({ where })
    ]);

    return {
      data: softwares,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async create(companyId: string, data: any) {
    const validData = createSoftwareSchema.parse(data);
    
    const software = await prisma.software.create({
      data: validData
    });

    return software;
  }

  async getById(id: string, companyId: string) {
    const software = await prisma.software.findFirst({
      where: {
        id,
        OR: [
          { contracts: { some: { entity: { companyId } } } },
          { usages: { some: { user: { companyId } } } }
        ]
      },
      include: {
        contracts: {
          where: { entity: { companyId } },
          include: { entity: true }
        },
        usages: {
          where: { user: { companyId } },
          include: { user: true }
        },
        reviews: {
          where: { companyId },
          include: { user: true }
        }
      }
    });

    if (!software) {
      throw new Error('Logiciel non trouvé');
    }

    return software;
  }

  async update(id: string, companyId: string, data: any) {
    const validData = updateSoftwareSchema.parse(data);
    
    // Vérifier l'accès
    await this.getById(id, companyId);
    
    const software = await prisma.software.update({
      where: { id },
      data: validData
    });

    return software;
  }

  async getContracts(softwareId: string, companyId: string) {
    const contracts = await prisma.contract.findMany({
      where: {
        softwareId,
        entity: { companyId }
      },
      include: {
        entity: true,
        software: true
      },
      orderBy: { endDate: 'asc' }
    });

    return { data: contracts };
  }

  async createContract(softwareId: string, companyId: string, data: any) {
    const validData = createContractSchema.parse(data);
    
    // Vérifier que l'entité appartient à la société
    if (validData.entityId) {
      const entity = await prisma.entity.findFirst({
        where: {
          id: validData.entityId,
          companyId
        }
      });

      if (!entity) {
        throw new Error('Entité non trouvée dans cette société');
      }
    }

    const contract = await prisma.contract.create({
      data: {
        ...validData,
        softwareId
      },
      include: {
        entity: true,
        software: true
      }
    });

    return contract;
  }
}

export const softwareService = new SoftwareService();