// path: backend/src/services/lbl.test.ts
import { jest } from '@jest/globals';
import { lblClient, LBLSoftware } from './lbl';

// Mock fetch globalement
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock des variables d'environnement
const originalEnv = process.env;

describe('LBL Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lblClient.clearCache();
    
    // Configuration par défaut pour les tests
    process.env = {
      ...originalEnv,
      LBL_BASE_URL: 'https://api.lebonlogiciel.com',
      LBL_API_KEY: 'test-api-key'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('searchSoftwares', () => {
    const mockSearchResponse: { items: LBLSoftware[] } = {
      items: [
        {
          id: 'lbl-1',
          name: 'Slack',
          category: 'Communication',
          logo: 'https://example.com/slack-logo.png',
          versions: ['4.29.0', '4.28.0']
        },
        {
          id: 'lbl-2',
          name: 'Slackware',
          category: 'Système',
          versions: ['15.0', '14.2']
        }
      ]
    };

    it('devrait retourner les résultats de recherche avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      } as Response);

      const results = await lblClient.searchSoftwares('slack');

      expect(results).toEqual(mockSearchResponse.items);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.lebonlogiciel.com/v1/search?query=slack',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
            'User-Agent': 'ClearStack/1.0'
          })
        })
      );
    });

    it('devrait retourner une liste vide pour une requête trop courte', async () => {
      const results = await lblClient.searchSoftwares('a');
      expect(results).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('devrait retourner une liste vide si pas de clé API', async () => {
      process.env.LBL_API_KEY = '';
      
      const results = await lblClient.searchSoftwares('slack');
      expect(results).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('devrait utiliser le cache pour les requêtes identiques', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      } as Response);

      // Première requête
      const results1 = await lblClient.searchSoftwares('slack');
      // Deuxième requête identique
      const results2 = await lblClient.searchSoftwares('slack');

      expect(results1).toEqual(results2);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Une seule fois grâce au cache
    });

    it('devrait gérer les erreurs API avec un message français', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(lblClient.searchSoftwares('slack'))
        .rejects
        .toThrow('Impossible de rechercher dans le référentiel LeBonLogiciel');
    });
  });

  describe('getSoftwareById', () => {
    const mockSoftware: LBLSoftware = {
      id: 'lbl-1',
      name: 'Slack',
      category: 'Communication',
      logo: 'https://example.com/slack-logo.png',
      versions: ['4.29.0', '4.28.0', '4.27.0']
    };

    it('devrait retourner les détails du logiciel avec succès', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftware
      } as Response);

      const result = await lblClient.getSoftwareById('lbl-1');

      expect(result).toEqual(mockSoftware);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.lebonlogiciel.com/v1/softwares/lbl-1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });

    it('devrait retourner null pour un logiciel non trouvé (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      const result = await lblClient.getSoftwareById('inexistant');
      expect(result).toBeNull();
    });

    it('devrait utiliser le cache pour les requêtes identiques', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoftware
      } as Response);

      // Première requête
      const result1 = await lblClient.getSoftwareById('lbl-1');
      // Deuxième requête identique
      const result2 = await lblClient.getSoftwareById('lbl-1');

      expect(result1).toEqual(result2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('healthCheck', () => {
    it('devrait retourner true si l\'API fonctionne', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      } as Response);

      const isHealthy = await lblClient.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('devrait retourner false si pas de clé API', async () => {
      process.env.LBL_API_KEY = '';
      
      const isHealthy = await lblClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });
});