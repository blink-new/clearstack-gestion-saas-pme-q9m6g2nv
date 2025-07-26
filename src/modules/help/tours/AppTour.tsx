// path: src/modules/help/tours/AppTour.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // Sélecteur CSS pour l'élément à mettre en surbrillance
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Action suggérée (optionnel)
}

interface AppTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'sidebar',
    title: 'Navigation principale',
    description: 'Utilisez la barre latérale pour naviguer entre les différentes sections de ClearStack. Votre rôle détermine les options disponibles.',
    target: '[data-testid="sidebar"]',
    position: 'right',
    action: 'Explorez les différentes sections'
  },
  {
    id: 'realisations',
    title: 'Vos réalisations',
    description: 'Suivez votre progression, gagnez des badges et découvrez vos contributions à l\'optimisation logicielle de votre entreprise.',
    target: '[data-testid="realisations-progress"]',
    position: 'bottom',
    action: 'Consultez vos statistiques'
  },
  {
    id: 'logiciels',
    title: 'Inventaire logiciels',
    description: 'Déclarez les logiciels que vous utilisez, donnez votre avis et consultez les évaluations de vos collègues.',
    target: '[data-testid="software-list"]',
    position: 'top',
    action: 'Ajoutez vos premiers logiciels'
  },
  {
    id: 'demandes',
    title: 'Demandes de logiciels',
    description: 'Suggérez de nouveaux logiciels, votez pour les demandes de vos collègues et suivez le processus d\'approbation.',
    target: '[data-testid="requests-section"]',
    position: 'left',
    action: 'Créez votre première demande'
  }
];

export const AppTour: React.FC<AppTourProps> = ({ isVisible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const updateHighlight = () => {
      // Supprimer l'ancien highlight
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
        highlightedElement.style.boxShadow = '';
        highlightedElement.style.borderRadius = '';
      }

      // Ajouter le nouveau highlight
      const step = tourSteps[currentStep];
      if (step) {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          element.style.position = 'relative';
          element.style.zIndex = '1000';
          element.style.boxShadow = '0 0 0 4px rgba(6, 99, 255, 0.3), 0 0 0 8px rgba(6, 99, 255, 0.1)';
          element.style.borderRadius = '8px';
          setHighlightedElement(element);
        }
      }
    };

    updateHighlight();

    return () => {
      // Nettoyer le highlight à la fermeture
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
        highlightedElement.style.boxShadow = '';
        highlightedElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isVisible, highlightedElement]);

  const handleComplete = () => {
    // Marquer le tour comme terminé dans localStorage
    localStorage.setItem('clearstack-tour-completed', 'true');
    onComplete();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Marquer le tour comme ignoré dans localStorage
    localStorage.setItem('clearstack-tour-completed', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Overlay sombre */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[999]" />
      
      {/* Tooltip du tour */}
      <div className="fixed z-[1001] max-w-sm top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-100">
                    {currentStepData.title}
                  </h3>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                    {currentStep + 1}/{tourSteps.length}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
              
              <button
                onClick={handleSkip}
                className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors ml-4"
                aria-label="Ignorer le tutoriel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action suggérée */}
            {currentStepData.action && (
              <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                  💡 {currentStepData.action}
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span>Progression</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  Ignorer
                </button>
                
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  {isLastStep ? (
                    <>
                      <Check className="h-4 w-4" />
                      Terminer
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Raccourcis clavier */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">Échap</kbd> pour ignorer • 
                <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs ml-1">→</kbd> suivant • 
                <kbd className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs ml-1">←</kbd> précédent
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};