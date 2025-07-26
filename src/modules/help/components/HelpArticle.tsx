// path: src/modules/help/components/HelpArticle.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpFeedback } from './HelpFeedback';

interface HelpArticleProps {
  articleSlug: string;
  onBack: () => void;
}

// Mock data des articles avec métadonnées
const articleMetadata: Record<string, {
  title: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  lastUpdated: string;
}> = {
  'demande-logiciel': {
    title: 'Comment demander un nouveau logiciel',
    description: 'Apprenez à suggérer un logiciel manquant et éviter les doublons',
    category: 'Demandes',
    tags: ['demande', 'logiciel', 'vote', 'similaires'],
    readTime: '3 min',
    lastUpdated: '15 janvier 2024'
  },
  'avis-anti-biais': {
    title: 'Système d\'avis anti-biais',
    description: 'Pourquoi les avis sont masqués avant votre contribution',
    category: 'Avis',
    tags: ['avis', 'anti-biais', 'évaluation', 'objectivité'],
    readTime: '2 min',
    lastUpdated: '12 janvier 2024'
  },
  'import-wizard': {
    title: 'Assistant d\'import de données',
    description: 'Importez vos logiciels par copier-coller ou CSV',
    category: 'Import',
    tags: ['import', 'csv', 'mapping', 'brouillon'],
    readTime: '5 min',
    lastUpdated: '10 janvier 2024'
  },
  'projet-achat': {
    title: 'Gérer un projet d\'achat',
    description: 'Suivez les 4 étapes d\'un projet d\'achat logiciel',
    category: 'Projets',
    tags: ['projet', 'achat', '4-étapes', 'timeline'],
    readTime: '4 min',
    lastUpdated: '8 janvier 2024'
  },
  'alertes-contrats': {
    title: 'Alertes d\'échéances de contrats',
    description: 'Configurez les alertes 95 jours avant expiration',
    category: 'Contrats',
    tags: ['alertes', 'contrats', 'échéances', 'notifications'],
    readTime: '3 min',
    lastUpdated: '5 janvier 2024'
  },
  'economies-suggerees': {
    title: 'Économies suggérées',
    description: 'Comprenez les heuristiques d\'optimisation des coûts',
    category: 'Économies',
    tags: ['économies', 'optimisation', 'heuristiques', 'coûts'],
    readTime: '4 min',
    lastUpdated: '3 janvier 2024'
  },
  'multi-entites': {
    title: 'Gestion multi-entités',
    description: 'Activez et gérez plusieurs entités dans votre organisation',
    category: 'Configuration',
    tags: ['multi-entités', 'organisation', 'filtres', 'permissions'],
    readTime: '3 min',
    lastUpdated: '1 janvier 2024'
  },
  'rgpd-securite': {
    title: 'RGPD et sécurité des données',
    description: 'Comment ClearStack protège vos données personnelles',
    category: 'Sécurité',
    tags: ['rgpd', 'sécurité', 'données', 'confidentialité'],
    readTime: '5 min',
    lastUpdated: '28 décembre 2023'
  },
  'changelog': {
    title: 'Nouveautés et mises à jour',
    description: 'Découvrez les dernières fonctionnalités de ClearStack',
    category: 'Nouveautés',
    tags: ['changelog', 'nouveautés', 'mises-à-jour', 'fonctionnalités'],
    readTime: '2 min',
    lastUpdated: '20 janvier 2024'
  }
};

export const HelpArticle: React.FC<HelpArticleProps> = ({ articleSlug, onBack }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metadata = articleMetadata[articleSlug];

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simuler le chargement du contenu Markdown
        // En production, ceci ferait un fetch vers le fichier .md
        const response = await import(`../md/${articleSlug}.md?raw`);
        setContent(response.default);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'article:', err);
        setError('Impossible de charger l\'article. Veuillez réessayer.');
        
        // Fallback avec contenu par défaut
        setContent(`# ${metadata?.title || 'Article non trouvé'}

Cet article est en cours de rédaction. Revenez bientôt pour plus d'informations !

## Besoin d'aide immédiate ?

- [Créer une demande de logiciel](#)
- [Donner un avis sur un logiciel](#)
- [Contacter le support](#)
`);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleSlug, metadata?.title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded mb-4"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
            Article non trouvé
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            L'article demandé n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retour au centre d'aide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec navigation */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors"
            aria-label="Retour au centre d'aide"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au centre d'aide
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
              {metadata.title}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
              {metadata.description}
            </p>
            
            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {metadata.readTime}
              </div>
              <div>
                Mis à jour le {metadata.lastUpdated}
              </div>
              <Badge variant="outline">{metadata.category}</Badge>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {metadata.tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  <Tag className="h-3 w-3" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu de l'article */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 mb-8">
          <CardContent className="p-8">
            {error && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100 mb-4 mt-8 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-100 mb-3 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-neutral-950 dark:text-neutral-100 mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-300 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-neutral-700 dark:text-neutral-300 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-2">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline inline-flex items-center gap-1"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                      {href?.startsWith('http') && <ExternalLink className="h-3 w-3" />}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-200 dark:border-primary-800 pl-4 italic text-neutral-600 dark:text-neutral-400 mb-4">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* CTA PLG */}
        <Card className="bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border-primary-200 dark:border-primary-800 mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-100 mb-2">
              Cet article vous a-t-il été utile ?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Aidez vos collègues en partageant vos connaissances
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Créer une demande
              </button>
              <button className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                Donner un avis
              </button>
              <button className="px-6 py-2 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                Inviter un collègue
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <HelpFeedback articleSlug={articleSlug} />
      </div>
    </div>
  );
};