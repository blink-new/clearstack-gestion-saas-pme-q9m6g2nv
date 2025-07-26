// path: src/modules/help/hooks/useAppTour.ts
import { useState, useEffect } from 'react';

// Hook pour gérer l'état du tour
export const useAppTour = () => {
  const [isTourVisible, setIsTourVisible] = useState(false);

  useEffect(() => {
    // Vérifier si le tour a déjà été complété
    const tourCompleted = localStorage.getItem('clearstack-tour-completed');
    
    if (!tourCompleted) {
      // Démarrer le tour après un court délai pour laisser l'app se charger
      const timer = setTimeout(() => {
        setIsTourVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!isTourVisible) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsTourVisible(false);
          localStorage.setItem('clearstack-tour-completed', 'true');
          break;
        case 'ArrowRight':
          // Logique pour passer à l'étape suivante
          // Cette logique sera gérée par le composant AppTour
          break;
        case 'ArrowLeft':
          // Logique pour revenir à l'étape précédente
          // Cette logique sera gérée par le composant AppTour
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isTourVisible]);

  const startTour = () => {
    localStorage.removeItem('clearstack-tour-completed');
    setIsTourVisible(true);
  };

  const completeTour = () => {
    setIsTourVisible(false);
  };

  const skipTour = () => {
    setIsTourVisible(false);
  };

  return {
    isTourVisible,
    startTour,
    completeTour,
    skipTour
  };
};