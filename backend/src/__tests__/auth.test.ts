// path: backend/src/__tests__/auth.test.ts
import { authService } from '../modules/auth/service';

describe('AuthService', () => {
  describe('requestMagicLink', () => {
    it('devrait demander un lien magique avec un email valide', async () => {
      const result = await authService.requestMagicLink({
        email: 'test@example.com'
      });

      expect(result).toEqual({
        message: 'Lien magique envoyé par email',
        email: 'test@example.com'
      });
    });

    it('devrait rejeter un email invalide', async () => {
      await expect(authService.requestMagicLink({
        email: 'email-invalide'
      })).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('devrait déconnecter un utilisateur', async () => {
      const result = await authService.logout('user-id');

      expect(result).toEqual({
        message: 'Déconnexion réussie'
      });
    });
  });

  describe('generateToken', () => {
    it('devrait générer un token JWT', () => {
      process.env.JWT_SECRET = 'test-secret';
      
      const token = authService.generateToken('user-id', 'company-id');
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});