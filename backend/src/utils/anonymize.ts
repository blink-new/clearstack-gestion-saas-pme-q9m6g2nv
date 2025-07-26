// path: backend/src/utils/anonymize.ts
import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AnonymizedUser {
  id: string;
  email_hash?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Anonymise les données utilisateur si nécessaire
 * @param user - Utilisateur à anonymiser
 * @param anonymize - Si true, remplace l'email par un hash SHA256
 * @returns Utilisateur avec données anonymisées ou non selon le paramètre
 */
export function maybeAnonymizeUser(user: User, anonymize: boolean): AnonymizedUser {
  if (!anonymize) {
    // Retourner les données claires
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
  }
  
  // Anonymiser l'email avec SHA256
  const emailHash = crypto
    .createHash('sha256')
    .update(user.email.toLowerCase().trim())
    .digest('hex');
  
  return {
    id: user.id,
    email_hash: emailHash,
    // Garder prénom/nom si pas trop sensible, ou les anonymiser aussi
    firstName: user.firstName ? anonymizeString(user.firstName) : undefined,
    lastName: user.lastName ? anonymizeString(user.lastName) : undefined
  };
}

/**
 * Anonymise une chaîne en gardant seulement la première lettre
 * @param str - Chaîne à anonymiser
 * @returns Chaîne anonymisée (ex: "Jean" -> "J***")
 */
function anonymizeString(str: string): string {
  if (!str || str.length === 0) return str;
  if (str.length === 1) return '*';
  
  return str.charAt(0) + '*'.repeat(str.length - 1);
}

/**
 * Hash une valeur de manière déterministe pour l'anonymisation
 * @param value - Valeur à hasher
 * @param salt - Salt optionnel (par défaut utilise un salt fixe)
 * @returns Hash SHA256 en hexadécimal
 */
export function hashValue(value: string, salt: string = 'clearstack-anonymize'): string {
  return crypto
    .createHash('sha256')
    .update(salt + value.toLowerCase().trim())
    .digest('hex');
}

/**
 * Anonymise un objet en remplaçant les champs sensibles par des hashs
 * @param obj - Objet à anonymiser
 * @param sensitiveFields - Liste des champs à anonymiser
 * @param anonymize - Si false, retourne l'objet original
 * @returns Objet anonymisé
 */
export function maybeAnonymizeObject(
  obj: Record<string, any>, 
  sensitiveFields: string[], 
  anonymize: boolean
): Record<string, any> {
  if (!anonymize) {
    return obj;
  }
  
  const anonymized = { ...obj };
  
  for (const field of sensitiveFields) {
    if (anonymized[field] && typeof anonymized[field] === 'string') {
      anonymized[`${field}_hash`] = hashValue(anonymized[field]);
      delete anonymized[field];
    }
  }
  
  return anonymized;
}

/**
 * Vérifie si un email correspond à un hash donné
 * @param email - Email en clair
 * @param hash - Hash à vérifier
 * @returns true si l'email correspond au hash
 */
export function verifyEmailHash(email: string, hash: string): boolean {
  const emailHash = crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
    
  return emailHash === hash;
}

/**
 * Génère un identifiant anonyme déterministe basé sur l'email
 * Utile pour le tracking sans exposer l'email
 * @param email - Email de l'utilisateur
 * @returns Identifiant anonyme (8 premiers caractères du hash)
 */
export function generateAnonymousId(email: string): string {
  return hashValue(email).substring(0, 8);
}