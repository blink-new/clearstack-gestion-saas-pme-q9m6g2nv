// path: backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding des données de démo ClearStack...');

  // Configuration timezone Europe/Paris
  const now = dayjs().tz('Europe/Paris');
  
  // 1. Création des sociétés
  console.log('📊 Création des sociétés...');
  
  const clearStackDemo = await prisma.company.upsert({
    where: { id: 'C_DEMO' },
    update: {},
    create: {
      id: 'C_DEMO',
      name: 'ClearStack Demo',
      createdAt: now.toDate(),
    },
  });

  const acmeTest = await prisma.company.upsert({
    where: { id: 'C_ACME' },
    update: {},
    create: {
      id: 'C_ACME',
      name: 'Acme Test',
      createdAt: now.toDate(),
    },
  });

  // 2. Entités et départements pour ClearStack Demo
  console.log('🏢 Création des entités et départements...');
  
  const siegeParis = await prisma.entity.upsert({
    where: { id: 'ENT_PARIS' },
    update: {},
    create: {
      id: 'ENT_PARIS',
      companyId: clearStackDemo.id,
      name: 'Siège Paris',
    },
  });

  const agenceLyon = await prisma.entity.upsert({
    where: { id: 'ENT_LYON' },
    update: {},
    create: {
      id: 'ENT_LYON',
      companyId: clearStackDemo.id,
      name: 'Agence Lyon',
    },
  });

  const deptDAF = await prisma.department.upsert({
    where: { id: 'DEPT_DAF' },
    update: {},
    create: {
      id: 'DEPT_DAF',
      entityId: siegeParis.id,
      name: 'DAF',
    },
  });

  const deptDSI = await prisma.department.upsert({
    where: { id: 'DEPT_DSI' },
    update: {},
    create: {
      id: 'DEPT_DSI',
      entityId: siegeParis.id,
      name: 'DSI',
    },
  });

  const deptCommerce = await prisma.department.upsert({
    where: { id: 'DEPT_COMMERCE' },
    update: {},
    create: {
      id: 'DEPT_COMMERCE',
      entityId: agenceLyon.id,
      name: 'Commerce',
    },
  });

  // 3. Utilisateurs ClearStack Demo
  console.log('👥 Création des utilisateurs...');
  
  const adminUser = await prisma.user.upsert({
    where: { id: 'USER_ADMIN' },
    update: {},
    create: {
      id: 'USER_ADMIN',
      companyId: clearStackDemo.id,
      entityId: siegeParis.id,
      email: 'admin@demo.co',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'ADMIN',
      canCreateEntities: true,
      createdAt: now.toDate(),
    },
  });

  const standardUser = await prisma.user.upsert({
    where: { id: 'USER_STANDARD' },
    update: {},
    create: {
      id: 'USER_STANDARD',
      companyId: clearStackDemo.id,
      entityId: siegeParis.id,
      email: 'user@demo.co',
      firstName: 'Pierre',
      lastName: 'Martin',
      role: 'USER',
      canCreateEntities: false,
      createdAt: now.toDate(),
    },
  });

  const colleague1 = await prisma.user.upsert({
    where: { id: 'USER_COLLEAGUE1' },
    update: {},
    create: {
      id: 'USER_COLLEAGUE1',
      companyId: clearStackDemo.id,
      entityId: agenceLyon.id,
      email: 'sophie@demo.co',
      firstName: 'Sophie',
      lastName: 'Leroy',
      role: 'USER',
      canCreateEntities: false,
      createdAt: now.toDate(),
    },
  });

  const colleague2 = await prisma.user.upsert({
    where: { id: 'USER_COLLEAGUE2' },
    update: {},
    create: {
      id: 'USER_COLLEAGUE2',
      companyId: clearStackDemo.id,
      entityId: siegeParis.id,
      email: 'julien@demo.co',
      firstName: 'Julien',
      lastName: 'Moreau',
      role: 'USER',
      canCreateEntities: false,
      createdAt: now.toDate(),
    },
  });

  const colleague3 = await prisma.user.upsert({
    where: { id: 'USER_COLLEAGUE3' },
    update: {},
    create: {
      id: 'USER_COLLEAGUE3',
      companyId: clearStackDemo.id,
      entityId: agenceLyon.id,
      email: 'claire@demo.co',
      firstName: 'Claire',
      lastName: 'Bernard',
      role: 'USER',
      canCreateEntities: false,
      createdAt: now.toDate(),
    },
  });

  // 4. Logiciels
  console.log('💻 Création des logiciels...');
  
  const slack = await prisma.software.upsert({
    where: { id: 'SW_SLACK' },
    update: {},
    create: {
      id: 'SW_SLACK',
      externalRefId: 'LBL_SLACK_123',
      name: 'Slack',
      version: '4.38.125',
      category: 'Communication',
      createdAt: now.toDate(),
    },
  });

  const figma = await prisma.software.upsert({
    where: { id: 'SW_FIGMA' },
    update: {},
    create: {
      id: 'SW_FIGMA',
      externalRefId: 'LBL_FIGMA_456',
      name: 'Figma',
      version: '116.15.24',
      category: 'Design',
      createdAt: now.toDate(),
    },
  });

  const pipedrive = await prisma.software.upsert({
    where: { id: 'SW_PIPEDRIVE' },
    update: {},
    create: {
      id: 'SW_PIPEDRIVE',
      name: 'Pipedrive',
      version: '2024.1',
      category: 'CRM',
      createdAt: now.toDate(),
    },
  });

  // 5. Contrats avec dates relatives
  console.log('📋 Création des contrats...');
  
  const slackContract = await prisma.contract.upsert({
    where: { id: 'CONTRACT_SLACK' },
    update: {},
    create: {
      id: 'CONTRACT_SLACK',
      softwareId: slack.id,
      entityId: siegeParis.id,
      costAmount: 200.00,
      currency: 'EUR',
      billingPeriod: 'MONTH',
      endDate: now.add(95, 'day').toDate(),
      noticeDays: 95,
    },
  });

  const figmaContract = await prisma.contract.upsert({
    where: { id: 'CONTRACT_FIGMA' },
    update: {},
    create: {
      id: 'CONTRACT_FIGMA',
      softwareId: figma.id,
      entityId: siegeParis.id,
      costAmount: 2400.00,
      currency: 'EUR',
      billingPeriod: 'YEAR',
      endDate: now.add(32, 'day').toDate(),
      noticeDays: 60,
    },
  });

  const pipedriveContract = await prisma.contract.upsert({
    where: { id: 'CONTRACT_PIPEDRIVE' },
    update: {},
    create: {
      id: 'CONTRACT_PIPEDRIVE',
      softwareId: pipedrive.id,
      entityId: agenceLyon.id,
      costAmount: 99.00,
      currency: 'EUR',
      billingPeriod: 'MONTH',
      endDate: now.add(8, 'day').toDate(),
      noticeDays: 30,
    },
  });

  // 6. Usages (déclarations d'utilisation)
  console.log('🔧 Création des usages...');
  
  // Slack : 3 utilisateurs (laisse 1 licence inactive pour économies)
  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: adminUser.id, softwareId: slack.id } },
    update: {},
    create: {
      userId: adminUser.id,
      softwareId: slack.id,
      status: 'ACTIVE',
    },
  });

  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: standardUser.id, softwareId: slack.id } },
    update: {},
    create: {
      userId: standardUser.id,
      softwareId: slack.id,
      status: 'ACTIVE',
    },
  });

  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: colleague1.id, softwareId: slack.id } },
    update: {},
    create: {
      userId: colleague1.id,
      softwareId: slack.id,
      status: 'ACTIVE',
    },
  });

  // Figma : 2 utilisateurs
  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: adminUser.id, softwareId: figma.id } },
    update: {},
    create: {
      userId: adminUser.id,
      softwareId: figma.id,
      status: 'ACTIVE',
    },
  });

  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: colleague2.id, softwareId: figma.id } },
    update: {},
    create: {
      userId: colleague2.id,
      softwareId: figma.id,
      status: 'ACTIVE',
    },
  });

  // Pipedrive : 1 utilisateur
  await prisma.usage.upsert({
    where: { userId_softwareId: { userId: colleague3.id, softwareId: pipedrive.id } },
    update: {},
    create: {
      userId: colleague3.id,
      softwareId: pipedrive.id,
      status: 'ACTIVE',
    },
  });

  // 7. Avis (anti-biais)
  console.log('⭐ Création des avis...');
  
  // Slack : 2 avis existants (pas d'avis pour user@demo.co)
  await prisma.review.upsert({
    where: { id: 'REVIEW_SLACK_1' },
    update: {},
    create: {
      id: 'REVIEW_SLACK_1',
      companyId: clearStackDemo.id,
      userId: colleague1.id,
      softwareId: slack.id,
      rating: 4,
      strengths: 'Interface intuitive, notifications en temps réel',
      weaknesses: 'Peut être distrayant, beaucoup de notifications',
      improvement: 'Améliorer les filtres de notifications',
      tags: JSON.stringify(['productivité', 'communication']),
      createdAt: now.subtract(15, 'day').toDate(),
      updatedAt: now.subtract(15, 'day').toDate(),
    },
  });

  await prisma.review.upsert({
    where: { id: 'REVIEW_SLACK_2' },
    update: {},
    create: {
      id: 'REVIEW_SLACK_2',
      companyId: clearStackDemo.id,
      userId: colleague2.id,
      softwareId: slack.id,
      rating: 5,
      strengths: 'Excellent pour le travail en équipe, intégrations nombreuses',
      weaknesses: 'Prix élevé pour les grandes équipes',
      improvement: 'Tarifs plus avantageux pour les PME',
      tags: JSON.stringify(['collaboration', 'intégrations']),
      createdAt: now.subtract(8, 'day').toDate(),
      updatedAt: now.subtract(8, 'day').toDate(),
    },
  });

  // Figma : 1 avis existant + 1 avis pour user@demo.co
  await prisma.review.upsert({
    where: { id: 'REVIEW_FIGMA_1' },
    update: {},
    create: {
      id: 'REVIEW_FIGMA_1',
      companyId: clearStackDemo.id,
      userId: colleague2.id,
      softwareId: figma.id,
      rating: 5,
      strengths: 'Collaboration en temps réel exceptionnelle, prototypage rapide',
      weaknesses: 'Courbe d\'apprentissage pour les débutants',
      improvement: 'Plus de templates prêts à l\'emploi',
      tags: JSON.stringify(['design', 'prototypage', 'collaboration']),
      createdAt: now.subtract(20, 'day').toDate(),
      updatedAt: now.subtract(20, 'day').toDate(),
    },
  });

  await prisma.review.upsert({
    where: { id: 'REVIEW_FIGMA_USER' },
    update: {},
    create: {
      id: 'REVIEW_FIGMA_USER',
      companyId: clearStackDemo.id,
      userId: standardUser.id,
      softwareId: figma.id,
      rating: 4,
      strengths: 'Interface moderne, fonctionnalités complètes',
      weaknesses: 'Parfois lent sur les gros fichiers',
      improvement: 'Optimiser les performances',
      tags: JSON.stringify(['design', 'performance']),
      createdAt: now.subtract(5, 'day').toDate(),
      updatedAt: now.subtract(5, 'day').toDate(),
    },
  });

  // 8. Demandes et votes
  console.log('📝 Création des demandes et votes...');
  
  const hubspotRequest = await prisma.request.upsert({
    where: { id: 'REQ_HUBSPOT' },
    update: {},
    create: {
      id: 'REQ_HUBSPOT',
      companyId: clearStackDemo.id,
      requesterId: colleague3.id,
      softwareRef: 'HubSpot Marketing',
      descriptionNeed: 'Besoin d\'un outil marketing automation pour nos campagnes email et lead nurturing',
      urgency: 'LT_3M',
      estBudget: 500.00,
      status: 'SUBMITTED',
      createdAt: now.subtract(10, 'day').toDate(),
    },
  });

  const notionRequest = await prisma.request.upsert({
    where: { id: 'REQ_NOTION' },
    update: {},
    create: {
      id: 'REQ_NOTION',
      companyId: clearStackDemo.id,
      requesterId: standardUser.id,
      softwareRef: 'Notion',
      descriptionNeed: 'Outil de documentation et gestion de projets pour centraliser nos processus',
      urgency: 'GT_3M',
      estBudget: 200.00,
      status: 'REVIEW',
      createdAt: now.subtract(7, 'day').toDate(),
    },
  });

  const mailjetRequest = await prisma.request.upsert({
    where: { id: 'REQ_MAILJET' },
    update: {},
    create: {
      id: 'REQ_MAILJET',
      companyId: clearStackDemo.id,
      requesterId: colleague1.id,
      softwareRef: 'Mailjet',
      descriptionNeed: 'Solution d\'emailing professionnel pour nos newsletters et communications clients',
      urgency: 'IMMEDIATE',
      estBudget: 150.00,
      status: 'ACCEPTED',
      createdAt: now.subtract(14, 'day').toDate(),
    },
  });

  // Votes
  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: hubspotRequest.id, voterId: adminUser.id } },
    update: {},
    create: { requestId: hubspotRequest.id, voterId: adminUser.id },
  });

  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: hubspotRequest.id, voterId: standardUser.id } },
    update: {},
    create: { requestId: hubspotRequest.id, voterId: standardUser.id },
  });

  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: hubspotRequest.id, voterId: colleague1.id } },
    update: {},
    create: { requestId: hubspotRequest.id, voterId: colleague1.id },
  });

  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: hubspotRequest.id, voterId: colleague2.id } },
    update: {},
    create: { requestId: hubspotRequest.id, voterId: colleague2.id },
  });

  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: notionRequest.id, voterId: colleague2.id } },
    update: {},
    create: { requestId: notionRequest.id, voterId: colleague2.id },
  });

  await prisma.vote.upsert({
    where: { requestId_voterId: { requestId: notionRequest.id, voterId: colleague3.id } },
    update: {},
    create: { requestId: notionRequest.id, voterId: colleague3.id },
  });

  // 9. Projet d'achat pour Mailjet
  console.log('🚀 Création du projet d\'achat...');
  
  const mailjetProject = await prisma.purchaseProject.upsert({
    where: { id: 'PROJECT_MAILJET' },
    update: {},
    create: {
      id: 'PROJECT_MAILJET',
      companyId: clearStackDemo.id,
      requestId: mailjetRequest.id,
      status: 'STEP2',
      roiEstimate: 'ROI estimé : 25% d\'amélioration du taux d\'ouverture des emails',
      risks: 'Risque de migration des données depuis l\'ancien outil',
      createdAt: now.subtract(12, 'day').toDate(),
    },
  });

  // Tâches du projet (une échue pour notification)
  await prisma.task.upsert({
    where: { id: 'TASK_MAILJET_1' },
    update: {},
    create: {
      id: 'TASK_MAILJET_1',
      companyId: clearStackDemo.id,
      projectId: mailjetProject.id,
      title: 'Comparer les tarifs Mailjet vs SendGrid',
      assigneeId: adminUser.id,
      dueDate: now.subtract(2, 'day').toDate(), // Échue
      done: false,
    },
  });

  await prisma.task.upsert({
    where: { id: 'TASK_MAILJET_2' },
    update: {},
    create: {
      id: 'TASK_MAILJET_2',
      companyId: clearStackDemo.id,
      projectId: mailjetProject.id,
      title: 'Tester l\'API Mailjet avec nos templates',
      assigneeId: colleague2.id,
      dueDate: now.add(5, 'day').toDate(),
      done: false,
    },
  });

  // 10. Économies suggérées
  console.log('💰 Création des économies suggérées...');
  
  await prisma.economyItem.upsert({
    where: { id: 'ECO_SLACK_INACTIVE' },
    update: {},
    create: {
      id: 'ECO_SLACK_INACTIVE',
      companyId: clearStackDemo.id,
      softwareId: slack.id,
      type: 'INACTIVE_LICENSE',
      estimatedAmount: 200.00, // 1 licence inactive * coût mensuel
    },
  });

  await prisma.economyItem.upsert({
    where: { id: 'ECO_SLACK_REDUNDANCY' },
    update: {},
    create: {
      id: 'ECO_SLACK_REDUNDANCY',
      companyId: clearStackDemo.id,
      softwareId: slack.id,
      type: 'REDUNDANCY',
      estimatedAmount: 150.00, // Économie potentielle vs Teams
    },
  });

  await prisma.economyItem.upsert({
    where: { id: 'ECO_PIPEDRIVE_RENEWAL' },
    update: {},
    create: {
      id: 'ECO_PIPEDRIVE_RENEWAL',
      companyId: clearStackDemo.id,
      softwareId: pipedrive.id,
      type: 'RENEWAL',
      estimatedAmount: 30.00, // 30% de négociation sur renouvellement
    },
  });

  // 11. Notifications
  console.log('🔔 Création des notifications...');
  
  await prisma.notification.upsert({
    where: { id: 'NOTIF_CONTRACT_SLACK' },
    update: {},
    create: {
      id: 'NOTIF_CONTRACT_SLACK',
      companyId: clearStackDemo.id,
      userId: adminUser.id,
      type: 'ALERT_CONTRACT',
      payload: JSON.stringify({
        softwareName: 'Slack',
        endDate: now.add(95, 'day').format('DD/MM/YYYY'),
        daysLeft: 95,
        contractId: slackContract.id,
      }),
      readAt: null,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'NOTIF_REQUEST_VOTE' },
    update: {},
    create: {
      id: 'NOTIF_REQUEST_VOTE',
      companyId: clearStackDemo.id,
      userId: standardUser.id,
      type: 'REQUEST',
      payload: JSON.stringify({
        requestTitle: 'HubSpot Marketing',
        requesterName: 'Claire Bernard',
        requestId: hubspotRequest.id,
      }),
      readAt: null,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'NOTIF_TASK_DUE' },
    update: {},
    create: {
      id: 'NOTIF_TASK_DUE',
      companyId: clearStackDemo.id,
      userId: adminUser.id,
      type: 'PROJECT_TASK',
      payload: JSON.stringify({
        taskTitle: 'Comparer les tarifs Mailjet vs SendGrid',
        projectName: 'Mailjet',
        dueDate: now.subtract(2, 'day').format('DD/MM/YYYY'),
        taskId: 'TASK_MAILJET_1',
      }),
      readAt: null,
    },
  });

  // 12. Paramètres d'alerte
  console.log('⚙️ Création des paramètres d\'alerte...');
  
  await prisma.alertSetting.upsert({
    where: { id: 'ALERT_CLEARSTACK' },
    update: {},
    create: {
      id: 'ALERT_CLEARSTACK',
      companyId: clearStackDemo.id,
      defaultNoticeDays: 95,
    },
  });

  // 13. Badges et attribution
  console.log('🏆 Création des badges...');
  
  const badge1 = await prisma.badge.upsert({
    where: { id: 'BADGE_FIRST_CONTRIB' },
    update: {},
    create: {
      id: 'BADGE_FIRST_CONTRIB',
      code: 'FIRST_CONTRIBUTION',
      label: 'Première contribution',
      description: 'Premier avis ou logiciel ajouté',
    },
  });

  const badge2 = await prisma.badge.upsert({
    where: { id: 'BADGE_AMBASSADOR' },
    update: {},
    create: {
      id: 'BADGE_AMBASSADOR',
      code: 'AMBASSADOR',
      label: 'Ambassadeur',
      description: 'A invité 3 collègues ou plus',
    },
  });

  // Attribution badge à user@demo.co
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: standardUser.id, badgeId: badge1.id } },
    update: {},
    create: {
      userId: standardUser.id,
      badgeId: badge1.id,
      earnedAt: now.subtract(5, 'day').toDate(),
    },
  });

  // 14. Import batch exemple
  console.log('📥 Création de l\'import batch...');
  
  await prisma.importBatch.upsert({
    where: { id: 'IMPORT_DEMO' },
    update: {},
    create: {
      id: 'IMPORT_DEMO',
      companyId: clearStackDemo.id,
      status: 'DRAFT',
      rawFilePath: '/tmp/demo-import.csv',
      mapping: JSON.stringify({
        'Nom du logiciel': 'name',
        'Version': 'version',
        'Catégorie': 'category',
      }),
    },
  });

  // 15. Paramètres d'intégration prospection
  console.log('🔗 Création des paramètres d\'intégration...');
  
  await prisma.companyIntegrationSetting.upsert({
    where: { id: 'INTEGRATION_CLEARSTACK' },
    update: {},
    create: {
      id: 'INTEGRATION_CLEARSTACK',
      companyId: clearStackDemo.id,
      prospectEnabled: false,
      anonymize: true,
      lastSyncAt: null,
    },
  });

  // 16. Feature flags par défaut
  console.log('🚩 Création des feature flags...');
  
  const defaultFlags = [
    { key: 'beta_access', enabled: true, scope: 'global' },
    { key: 'prospect_connector', enabled: false, scope: 'global' },
    { key: 'web_push', enabled: true, scope: 'global' },
    { key: 'economies_block', enabled: true, scope: 'global' },
  ];

  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { 
        key_companyId_scope: { 
          key: flag.key, 
          companyId: flag.scope === 'global' ? null : clearStackDemo.id,
          scope: flag.scope as 'global' | 'company'
        } 
      },
      update: {},
      create: {
        key: flag.key,
        enabled: flag.enabled,
        companyId: flag.scope === 'global' ? null : clearStackDemo.id,
        scope: flag.scope as 'global' | 'company',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      },
    });
  }

  // 17. Referrals de démo
  console.log('🤝 Création des referrals...');
  
  const referrals = [
    {
      id: 'ref-demo-1',
      companyId: clearStackDemo.id,
      inviterId: adminUser.id,
      code: 'ADMIN2024',
      createdAt: now.subtract(15, 'day').toDate(),
      redeemedById: colleague1.id,
      redeemedAt: now.subtract(10, 'day').toDate(),
      utmSource: 'invite',
      utmCampaign: 'plg'
    },
    {
      id: 'ref-demo-2',
      companyId: clearStackDemo.id,
      inviterId: adminUser.id,
      code: 'TEAM2024',
      createdAt: now.subtract(8, 'day').toDate(),
      redeemedById: colleague2.id,
      redeemedAt: now.subtract(5, 'day').toDate(),
      utmSource: 'invite',
      utmCampaign: 'plg'
    },
    {
      id: 'ref-demo-3',
      companyId: clearStackDemo.id,
      inviterId: standardUser.id,
      code: 'USER2024',
      createdAt: now.subtract(3, 'day').toDate(),
      redeemedById: null,
      redeemedAt: null,
      utmSource: 'invite',
      utmCampaign: 'plg'
    }
  ];

  for (const referral of referrals) {
    await prisma.referral.upsert({
      where: { id: referral.id },
      update: referral,
      create: referral
    });
  }

  // 18. Données Acme Test (isolation tenant)
  console.log('🏢 Création des données Acme Test...');
  
  const acmeSoftware = await prisma.software.upsert({
    where: { id: 'SW_ACME_TOOL' },
    update: {},
    create: {
      id: 'SW_ACME_TOOL',
      name: 'Acme Tool',
      version: '1.0.0',
      category: 'Productivity',
      createdAt: now.toDate(),
    },
  });

  const acmeEntity = await prisma.entity.upsert({
    where: { id: 'ENT_ACME' },
    update: {},
    create: {
      id: 'ENT_ACME',
      companyId: acmeTest.id,
      name: 'Acme HQ',
    },
  });

  await prisma.contract.upsert({
    where: { id: 'CONTRACT_ACME' },
    update: {},
    create: {
      id: 'CONTRACT_ACME',
      softwareId: acmeSoftware.id,
      entityId: acmeEntity.id,
      costAmount: 100.00,
      currency: 'EUR',
      billingPeriod: 'MONTH',
      endDate: now.add(60, 'day').toDate(),
      noticeDays: 30,
    },
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log(`📊 Société principale : ${clearStackDemo.name} (${clearStackDemo.id})`);
  console.log(`👥 Utilisateurs créés : admin@demo.co, user@demo.co + 3 collègues`);
  console.log(`💻 Logiciels : Slack, Figma, Pipedrive`);
  console.log(`📋 Contrats avec échéances : J+95, J+32, J+8`);
  console.log(`⭐ Avis anti-biais : Slack (2 avis, pas user@demo.co), Figma (2 avis dont user@demo.co)`);
  console.log(`📝 Demandes : HubSpot (4 votes), Notion (2 votes), Mailjet (acceptée → projet)`);
  console.log(`💰 Économies suggérées : ${200 + 150 + 30}€ au total`);
  console.log(`🔔 Notifications : 3 types (contrat, demande, tâche)`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });