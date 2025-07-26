// path: backend/src/config/mail.ts
import nodemailer from 'nodemailer';

// Configuration du transport SMTP
export const createMailTransport = () => {
  const transport = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Pour les serveurs SMTP auto-signés
    }
  });

  return transport;
};

// Configuration par défaut des emails
export const mailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@clearstack.fr',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@clearstack.fr',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  logoUrl: process.env.LOGO_URL || 'https://clearstack.fr/logo.png'
};

// Vérification de la configuration
export const verifyMailConfig = async () => {
  try {
    const transport = createMailTransport();
    await transport.verify();
    console.log('✅ Configuration SMTP valide');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration SMTP:', error);
    return false;
  }
};