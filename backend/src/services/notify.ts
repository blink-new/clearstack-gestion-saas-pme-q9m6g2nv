// path: backend/src/services/notify.ts
import { PrismaClient } from '@prisma/client';
import { createMailTransport, mailConfig } from '../config/mail.js';
import { renderTemplate } from './templates.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

export interface NotificationPayload {
  contractId?: string;
  requestId?: string;
  taskId?: string;
  projectId?: string;
  daysRemaining?: number;
  amount?: number;
  softwareName?: string;
  requesterName?: string;
  taskTitle?: string;
  [key: string]: any;
}

export interface DigestData {
  userName: string;
  period: string;
  stats: {
    newRequests: number;
    contractsExpiring30: number;
    contractsExpiring60: number;
    contractsExpiring95: number;
    totalSavings: number;
    completedTasks: number;
  };
  upcomingContracts: Array<{
    softwareName: string;
    daysRemaining: number;
    amount: number;
  }>;
  topRequests: Array<{
    title: string;
    votes: number;
    requester: string;
  }>;
}

/**
 * Crée une notification en DB et envoie l'email si les préférences le permettent
 */
export async function queueNotification(
  userId: string,
  type: 'ALERT_CONTRACT' | 'REQUEST' | 'PROJECT_TASK' | 'SYSTEM',
  payload: NotificationPayload
): Promise<void> {
  try {
    // Récupérer l'utilisateur et ses préférences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailNotifications: true,
        companyId: true
      }
    });

    if (!user) {
      console.error(`Utilisateur ${userId} introuvable`);
      return;
    }

    // Créer la notification en DB
    await prisma.notification.create({
      data: {
        userId,
        companyId: user.companyId,
        type,
        payload: payload as any,
        readAt: null
      }
    });

    // Envoyer l'email si les notifications sont activées
    if (user.emailNotifications) {
      await sendNotificationEmail(user, type, payload);
    }

    console.log(`✅ Notification ${type} créée pour ${user.email}`);
  } catch (error) {
    console.error(`❌ Erreur création notification:`, error);
    // Ne pas faire échouer le processus principal
  }
}

/**
 * Envoie un email de notification
 */
async function sendNotificationEmail(
  user: any,
  type: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const transport = createMailTransport();
    
    let subject = '';
    let templateName = '';
    
    switch (type) {
      case 'ALERT_CONTRACT':
        subject = `⚠️ Contrat ${payload.softwareName} expire dans ${payload.daysRemaining} jours`;
        templateName = 'alert-contract';
        break;
      case 'REQUEST':
        subject = `🗳️ Nouvelle demande de logiciel : ${payload.softwareName}`;
        templateName = 'request-vote';
        break;
      case 'PROJECT_TASK':
        subject = `📋 Tâche en retard : ${payload.taskTitle}`;
        templateName = 'task-due';
        break;
      default:
        subject = '🔔 Notification ClearStack';
        templateName = 'generic';
    }

    const html = await renderTemplate(templateName, {
      userName: `${user.firstName} ${user.lastName}`,
      ...payload,
      baseUrl: mailConfig.baseUrl,
      logoUrl: mailConfig.logoUrl
    });

    await transport.sendMail({
      from: mailConfig.from,
      to: user.email,
      subject,
      html,
      replyTo: mailConfig.replyTo
    });

    console.log(`✅ Email ${type} envoyé à ${user.email}`);
  } catch (error) {
    console.error(`❌ Erreur envoi email:`, error);
  }
}

/**
 * Envoie un email générique
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const transport = createMailTransport();
    
    await transport.sendMail({
      from: mailConfig.from,
      to,
      subject,
      html,
      replyTo: mailConfig.replyTo
    });

    console.log(`✅ Email envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error);
    return false;
  }
}

/**
 * Génère et envoie le digest hebdomadaire
 */
export async function sendWeeklyDigest(userId?: string): Promise<void> {
  try {
    const whereClause = userId ? { id: userId } : {};
    
    const users = await prisma.user.findMany({
      where: {
        ...whereClause,
        emailNotifications: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyId: true
      }
    });

    for (const user of users) {
      try {
        const digestData = await generateDigestData(user.companyId, user.id);
        
        const html = await renderTemplate('weekly-digest', {
          ...digestData,
          baseUrl: mailConfig.baseUrl,
          logoUrl: mailConfig.logoUrl
        });

        await sendEmail(
          user.email,
          `📊 Votre récap hebdomadaire ClearStack`,
          html
        );

        // Petit délai pour éviter de surcharger le serveur SMTP
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Erreur digest pour ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur génération digest:`, error);
  }
}

/**
 * Génère les données pour le digest hebdomadaire
 */
async function generateDigestData(companyId: string, userId: string): Promise<DigestData> {
  const weekStart = dayjs().tz('Europe/Paris').startOf('week');
  const weekEnd = dayjs().tz('Europe/Paris').endOf('week');
  
  // Statistiques de la semaine
  const [newRequests, contractsExpiring30, contractsExpiring60, contractsExpiring95, completedTasks] = await Promise.all([
    // Nouvelles demandes cette semaine
    prisma.request.count({
      where: {
        companyId,
        createdAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate()
        }
      }
    }),
    
    // Contrats expirant dans 30 jours
    prisma.contract.count({
      where: {
        software: { companyId },
        endDate: {
          gte: dayjs().toDate(),
          lte: dayjs().add(30, 'day').toDate()
        }
      }
    }),
    
    // Contrats expirant dans 60 jours
    prisma.contract.count({
      where: {
        software: { companyId },
        endDate: {
          gte: dayjs().toDate(),
          lte: dayjs().add(60, 'day').toDate()
        }
      }
    }),
    
    // Contrats expirant dans 95 jours
    prisma.contract.count({
      where: {
        software: { companyId },
        endDate: {
          gte: dayjs().toDate(),
          lte: dayjs().add(95, 'day').toDate()
        }
      }
    }),
    
    // Tâches complétées cette semaine
    prisma.task.count({
      where: {
        project: { companyId },
        done: true,
        updatedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate()
        }
      }
    })
  ]);

  // Prochains contrats à renouveler
  const upcomingContracts = await prisma.contract.findMany({
    where: {
      software: { companyId },
      endDate: {
        gte: dayjs().toDate(),
        lte: dayjs().add(95, 'day').toDate()
      }
    },
    include: {
      software: true
    },
    orderBy: {
      endDate: 'asc'
    },
    take: 5
  });

  // Top demandes avec le plus de votes
  const topRequests = await prisma.request.findMany({
    where: {
      companyId,
      status: 'SUBMITTED'
    },
    include: {
      requester: true,
      _count: {
        select: { votes: true }
      }
    },
    orderBy: {
      votes: {
        _count: 'desc'
      }
    },
    take: 3
  });

  // Calcul des économies suggérées
  const economyItems = await prisma.economyItem.findMany({
    where: { companyId }
  });
  
  const totalSavings = economyItems.reduce((sum, item) => sum + (item.estimatedAmount?.toNumber() || 0), 0);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true }
  });

  return {
    userName: `${user?.firstName} ${user?.lastName}`,
    period: `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`,
    stats: {
      newRequests,
      contractsExpiring30,
      contractsExpiring60,
      contractsExpiring95,
      totalSavings,
      completedTasks
    },
    upcomingContracts: upcomingContracts.map(contract => ({
      softwareName: contract.software.name,
      daysRemaining: dayjs(contract.endDate).diff(dayjs(), 'day'),
      amount: contract.costAmount?.toNumber() || 0
    })),
    topRequests: topRequests.map(request => ({
      title: request.softwareRef || 'Logiciel à définir',
      votes: request._count.votes,
      requester: `${request.requester.firstName} ${request.requester.lastName}`
    }))
  };
}