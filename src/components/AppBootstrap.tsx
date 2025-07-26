import { useEffect } from 'react';
import { analyticsInit } from '../lib/analytics';

// Mock hook pour useMe - à remplacer par le vrai hook quand disponible
const useMe = () => {
  // TODO: Remplacer par le vrai hook useMe quand l'API auth sera connectée
  return { 
    data: {
      id: 'demo-user',
      email: 'user@demo.co',
      company_id: 'demo-company',
      anonymize: false
    }
  };
};

export function AppBootstrap() {
  const { data: user } = useMe();
  
  useEffect(() => {
    if (user) {
      analyticsInit({
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        anonymize: user?.anonymize ?? false
      });
    }
  }, [user]);
  
  return null;
}