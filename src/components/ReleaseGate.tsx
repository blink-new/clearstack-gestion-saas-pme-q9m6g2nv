// path: src/components/ReleaseGate.tsx
import React from 'react';
import { BetaAccessPage } from '../pages/BetaAccessPage';
import { useFeatureFlag } from '../hooks/useFeatureFlags';

interface ReleaseGateProps {
  children: React.ReactNode;
}

export const ReleaseGate: React.FC<ReleaseGateProps> = ({ children }) => {
  const { enabled: hasBetaAccess, loading } = useFeatureFlag('beta_access');

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Vérification de l'accès...
          </p>
        </div>
      </div>
    );
  }

  // Si pas d'accès bêta, afficher la page d'accès sur invitation
  if (!hasBetaAccess) {
    return <BetaAccessPage />;
  }

  // Sinon, afficher l'application normale
  return <>{children}</>;
};