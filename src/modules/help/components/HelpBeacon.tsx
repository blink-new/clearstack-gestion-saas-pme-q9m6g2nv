// path: src/modules/help/components/HelpBeacon.tsx
import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpBeaconProps {
  articleSlug?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

// Articles suggérés par contexte
const contextualHelp: Record<string, {
  title: string;
  description: string;
  quickTips: string[];
  relatedArticles: Array<{ title: string; slug: string }>;
}> = {
  'demande-logiciel': {
    title: 'Aide : Demander un logiciel',
    description: 'Conseils pour bien formuler votre demande',
    quickTips: [
      'Vérifiez les demandes similaires avant de créer',
      'Décrivez le besoin en 2 lignes maximum',
      'Indiquez l\'urgence et le budget estimé'
    ],
    relatedArticles: [
      { title: 'Éviter les doublons', slug: 'demande-logiciel' },
      { title: 'Système de votes', slug: 'avis-anti-biais' }
    ]
  },
  'avis-logiciel': {
    title: 'Aide : Donner un avis',
    description: 'Pourquoi vos avis sont importants',
    quickTips: [
      'Soyez objectif dans votre évaluation',
      'Mentionnez points forts ET faibles',
      'Suggérez des améliorations concrètes'
    ],
    relatedArticles: [
      { title: 'Système anti-biais', slug: 'avis-anti-biais' },
      { title: 'Évaluer efficacement', slug: 'avis-anti-biais' }
    ]
  },
  'import-donnees': {
    title: 'Aide : Import de données',
    description: 'Importez vos logiciels facilement',
    quickTips: [
      'Préparez vos données en tableau (10-50 lignes)',
      'Utilisez le mode brouillon pour tester',
      'Mappez correctement les colonnes'
    ],
    relatedArticles: [
      { title: 'Assistant d\'import', slug: 'import-wizard' },
      { title: 'Format des données', slug: 'import-wizard' }
    ]
  },
  'projet-achat': {
    title: 'Aide : Projet d\'achat',
    description: 'Suivez les 4 étapes du processus',
    quickTips: [
      'Définissez clairement le besoin (étape 1)',
      'Comparez plusieurs solutions (étape 2)',
      'Impliquez la DAF/DSI (étape 3)',
      'Planifiez le déploiement (étape 4)'
    ],
    relatedArticles: [
      { title: 'Timeline projet', slug: 'projet-achat' },
      { title: 'ROI et risques', slug: 'projet-achat' }
    ]
  },
  'default': {
    title: 'Aide ClearStack',
    description: 'Trouvez rapidement les réponses',
    quickTips: [
      'Utilisez la recherche avec des mots-clés',
      'Parcourez les catégories d\'articles',
      'Appuyez sur "?" pour ouvrir l\'aide'
    ],
    relatedArticles: [
      { title: 'Premiers pas', slug: 'demande-logiciel' },
      { title: 'Questions fréquentes', slug: 'changelog' }
    ]
  }
};

export const HelpBeacon: React.FC<HelpBeaconProps> = ({
  articleSlug = 'default',
  position = 'bottom-right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  const help = contextualHelp[articleSlug] || contextualHelp.default;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  const handleOpenHelpCenter = () => {
    // TODO: Navigation vers le centre d'aide
    console.log('Ouvrir le centre d\'aide avec article:', articleSlug);
    setIsOpen(false);
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Widget d'aide contextuelle */}
      {isOpen && (
        <div className="mb-4 w-80 max-w-[calc(100vw-3rem)]">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-neutral-950 dark:text-neutral-100">
                  {help.title}
                </CardTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                  aria-label="Fermer l'aide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {help.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Conseils rapides */}
              <div>
                <h4 className="text-sm font-medium text-neutral-950 dark:text-neutral-100 mb-2">
                  Conseils rapides
                </h4>
                <ul className="space-y-1">
                  {help.quickTips.map((tip, index) => (
                    <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Articles liés */}
              <div>
                <h4 className="text-sm font-medium text-neutral-950 dark:text-neutral-100 mb-2">
                  Articles utiles
                </h4>
                <div className="space-y-2">
                  {help.relatedArticles.map((article, index) => (
                    <button
                      key={index}
                      onClick={() => console.log('Ouvrir article:', article.slug)}
                      className="w-full text-left p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {article.title}
                        </span>
                        <ExternalLink className="h-3 w-3 text-neutral-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA vers le centre d'aide */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleOpenHelpCenter}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Voir tous les articles d'aide
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={handleToggle}
        className={`relative w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${
          isOpen ? 'rotate-180' : ''
        }`}
        aria-label={isOpen ? 'Fermer l\'aide' : 'Ouvrir l\'aide'}
        data-testid="help-beacon-button"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <HelpCircle className="h-6 w-6" />
        )}
        
        {/* Badge de notification pour nouveaux utilisateurs */}
        {!hasBeenOpened && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs px-2 py-1 rounded whitespace-nowrap">
            {isOpen ? 'Fermer l\'aide' : 'Besoin d\'aide ?'}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
        </div>
      </button>
    </div>
  );
};