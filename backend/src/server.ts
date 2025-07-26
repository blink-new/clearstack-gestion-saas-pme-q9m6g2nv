// path: backend/src/server.ts
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { verifyMailConfig } from './config/mail.js';
import { startSchedulers } from './jobs/schedulers.js';
import { startGdprPurgeJob } from './jobs/gdprPurge.js';
import { 
  helmetConfig, 
  globalRateLimit, 
  authRateLimit, 
  corsConfig, 
  sanitizeInput, 
  captureRequestInfo 
} from './middlewares/security.js';

// Import des routes
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import softwareRoutes from './modules/softwares/routes.js';
import reviewRoutes from './modules/reviews/routes.js';
import requestRoutes from './modules/requests/routes.js';
import notificationRoutes from './modules/notifications/routes.js';
import { pushRouter } from './modules/notifications/push.routes.js';
import { lblRouter } from './modules/integrations/lbl.routes.js';
import { prospectRouter } from './modules/integrations/prospect.routes.js';
import { featureFlagsRouter } from './modules/admin/featureFlags.routes.js';
import { feedbackRouter } from './modules/feedback/routes.js';
import { referralsRouter } from './modules/referrals/referrals.routes.js';
import { privacyRouter } from './modules/privacy/privacy.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de sécurité (ordre important)
app.use(helmetConfig);
app.use(corsConfig);
app.use(globalRateLimit);
app.use(captureRequestInfo);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Rate limiting spécifique pour l'authentification
app.use('/api/v1/auth', authRateLimit);

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/softwares', softwareRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1', pushRouter);
app.use('/api/v1/integrations', lblRouter);
app.use('/api/v1/integrations/prospect', prospectRouter);
app.use('/api/v1', featureFlagsRouter);
app.use('/api/v1', feedbackRouter);
app.use('/api/v1/referrals', referralsRouter);
app.use('/api/v1/privacy', privacyRouter);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'ClearStack API',
    version: '1.0.0',
    description: 'API pour la gestion des logiciels en PME',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      softwares: '/api/v1/softwares',
      reviews: '/api/v1/reviews',
      requests: '/api/v1/requests',
      notifications: '/api/v1/notifications'
    }
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrage du serveur
async function startServer() {
  try {
    // Vérifier la configuration email
    const mailConfigValid = await verifyMailConfig();
    if (!mailConfigValid) {
      console.warn('⚠️ Configuration SMTP invalide - les emails ne seront pas envoyés');
    }

    // Démarrer les schedulers
    if (process.env.NODE_ENV !== 'test') {
      startSchedulers();
      startGdprPurgeJob();
    }

    // Démarrer le serveur HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Serveur ClearStack démarré sur le port ${PORT}`);
      console.log(`📖 Documentation API : http://localhost:${PORT}/`);
      console.log(`🏥 Health check : http://localhost:${PORT}/health`);
      console.log(`🔒 Middlewares de sécurité activés`);
      console.log(`📊 Schedulers démarrés`);
      console.log(`🛡️ Job de purge RGPD programmé`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

export default app;