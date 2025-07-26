// path: src/hooks/useFeatureFlags.ts
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  companyId?: string;
  scope: 'global' | 'company';
  createdAt: string;
  updatedAt: string;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ success: boolean; data: FeatureFlag[] }>('/admin/feature-flags');
      setFlags(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des flags');
    } finally {
      setLoading(false);
    }
  };

  const updateFlag = async (key: string, enabled: boolean, scope: 'global' | 'company' = 'company') => {
    try {
      await apiFetch(`/admin/feature-flags/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled, scope })
      });
      
      // Mettre à jour le state local
      setFlags(prev => prev.map(flag => 
        flag.key === key && flag.scope === scope 
          ? { ...flag, enabled }
          : flag
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du flag');
    }
  };

  const isEnabled = (key: string): boolean => {
    // Priorité aux flags company, fallback sur global
    const companyFlag = flags.find(f => f.key === key && f.scope === 'company');
    if (companyFlag) return companyFlag.enabled;
    
    const globalFlag = flags.find(f => f.key === key && f.scope === 'global');
    return globalFlag?.enabled ?? false;
  };

  const getFlag = (key: string): FeatureFlag | undefined => {
    return flags.find(f => f.key === key && f.scope === 'company') || 
           flags.find(f => f.key === key && f.scope === 'global');
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    loading,
    error,
    isEnabled,
    getFlag,
    updateFlag,
    refetch: fetchFlags
  };
}

// Hook simple pour vérifier un flag spécifique
export function useFeatureFlag(key: string): { enabled: boolean; loading: boolean } {
  const { isEnabled, loading } = useFeatureFlags();
  return { enabled: isEnabled(key), loading };
}