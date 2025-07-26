// path: backend/src/middlewares/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const posthogHost = process.env.POSTHOG_HOST || 'https://app.posthog.com';

// Configuration CSP avec support des sources nécessaires
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", posthogHost],
      connectSrc: ["'self'", process.env.VITE_API_URL || "http://localhost:3000", posthogHost],
      scriptSrc: ["'self'", "'unsafe-inline'", posthogHost],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
});

// Rate limiting global
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting renforcé pour l'authentification
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de connexion par IP
  message: {
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration CORS avec whitelist
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(origin => origin.trim());
};

export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Autoriser les requêtes sans origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id'],
});

// Middleware de sanitisation des entrées (complément à Zod)
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Fonction récursive pour nettoyer les objets
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Supprime les caractères potentiellement dangereux
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitise body, query et params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Middleware pour capturer l'IP et User-Agent pour l'audit
export const captureRequestInfo = (req: Request, res: Response, next: NextFunction) => {
  // Capture l'IP réelle (derrière proxy/load balancer)
  const ip = req.headers['x-forwarded-for'] as string || 
             req.headers['x-real-ip'] as string ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.ip;

  const userAgent = req.headers['user-agent'] || '';

  // Ajoute les infos à la requête pour l'audit
  (req as any).clientInfo = {
    ip: Array.isArray(ip) ? ip[0] : ip,
    userAgent
  };

  next();
};