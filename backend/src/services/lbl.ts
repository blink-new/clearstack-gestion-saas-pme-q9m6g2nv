// path: backend/src/services/lbl.ts
interface LBLSoftware {
  id: string;
  name: string;
  category: string;
  logo?: string;
  versions: string[];
}

interface LBLSearchResponse {
  items: LBLSoftware[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

class LBLClient {
  private cache = new Map<string, CacheEntry>();
  private lastCallTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly RATE_LIMIT = 200; // 200ms between calls
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.LBL_BASE_URL || 'https://api.lebonlogiciel.com';
    this.apiKey = process.env.LBL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('LBL_API_KEY non configurée - fonctionnalités LBL désactivées');
    }
  }

  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT - timeSinceLastCall));
    }
    
    this.lastCallTime = Date.now();
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ClearStack/1.0'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API LeBonLogiciel: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async searchSoftwares(query: string): Promise<LBLSoftware[]> {
    if (!this.apiKey) {
      console.warn('LBL API non configurée - retour liste vide');
      return [];
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseUrl}/v1/search?query=${encodeURIComponent(query)}`;
      const response = await this.rateLimitedFetch(url);
      const data: LBLSearchResponse = await response.json();
      
      const results = data.items || [];
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      console.error('Erreur recherche LBL:', error);
      throw new Error('Impossible de rechercher dans le référentiel LeBonLogiciel. Veuillez réessayer plus tard.');
    }
  }

  async getSoftwareById(id: string): Promise<LBLSoftware | null> {
    if (!this.apiKey) {
      console.warn('LBL API non configurée - retour null');
      return null;
    }

    if (!id) {
      throw new Error('ID logiciel requis');
    }

    const cacheKey = `software:${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseUrl}/v1/softwares/${encodeURIComponent(id)}`;
      const response = await this.rateLimitedFetch(url);
      const data: LBLSoftware = await response.json();
      
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Erreur récupération logiciel LBL:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error('Impossible de récupérer les détails du logiciel depuis LeBonLogiciel.');
    }
  }

  // Méthode utilitaire pour nettoyer le cache
  clearCache(): void {
    this.cache.clear();
  }

  // Méthode utilitaire pour vérifier la disponibilité
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      await this.searchSoftwares('test');
      return true;
    } catch {
      return false;
    }
  }
}

export const lblClient = new LBLClient();
export { LBLSoftware };