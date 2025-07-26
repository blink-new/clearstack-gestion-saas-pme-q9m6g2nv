// path: src/modules/help/pages/HelpCenterPage.tsx
import React, { useState, useEffect } from 'react';
import { Search, BookOpen, MessageCircle, Lightbulb, Shield, TrendingUp, Building2, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpSearch } from '../components/HelpSearch';
import { HelpArticle } from '../components/HelpArticle';

// Mock data des articles d'aide
const helpArticles = [
  {
    id: 'demande-logiciel',
    slug: 'demande-logiciel',
    title: 'Comment demander un nouveau logiciel',
    description: 'Apprenez à suggérer un logiciel manquant et éviter les doublons',
    category: 'Demandes',
    tags: ['demande', 'logiciel', 'vote', 'similaires'],
    readTime: '3 min',
    icon: MessageCircle,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'avis-anti-biais',
    slug: 'avis-anti-biais',
    title: 'Système d\'avis anti-biais',
    description: 'Pourquoi les avis sont masqués avant votre contribution',
    category: 'Avis',
    tags: ['avis', 'anti-biais', 'évaluation', 'objectivité'],
    readTime: '2 min',
    icon: Shield,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'import-wizard',
    slug: 'import-wizard',
    title: 'Assistant d\'import de données',
    description: 'Importez vos logiciels par copier-coller ou CSV',
    category: 'Import',
    tags: ['import', 'csv', 'mapping', 'brouillon'],
    readTime: '5 min',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'projet-achat',
    slug: 'projet-achat',
    title: 'Gérer un projet d\'achat',
    description: 'Suivez les 4 étapes d\'un projet d\'achat logiciel',
    category: 'Projets',
    tags: ['projet', 'achat', '4-étapes', 'timeline'],
    readTime: '4 min',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
  },
  {
    id: 'alertes-contrats',
    slug: 'alertes-contrats',
    title: 'Alertes d\'échéances de contrats',
    description: 'Configurez les alertes 95 jours avant expiration',
    category: 'Contrats',
    tags: ['alertes', 'contrats', 'échéances', 'notifications'],
    readTime: '3 min',
    icon: Clock,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  },
  {
    id: 'economies-suggerees',
    slug: 'economies-suggerees',
    title: 'Économies suggérées',
    description: 'Comprenez les heuristiques d\'optimisation des coûts',
    category: 'Économies',
    tags: ['économies', 'optimisation', 'heuristiques', 'coûts'],
    readTime: '4 min',
    icon: TrendingUp,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300'
  },
  {
    id: 'multi-entites',
    slug: 'multi-entites',
    title: 'Gestion multi-entités',
    description: 'Activez et gérez plusieurs entités dans votre organisation',
    category: 'Configuration',
    tags: ['multi-entités', 'organisation', 'filtres', 'permissions'],
    readTime: '3 min',
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
  },
  {
    id: 'rgpd-securite',
    slug: 'rgpd-securite',
    title: 'RGPD et sécurité des données',
    description: 'Comment ClearStack protège vos données personnelles',
    category: 'Sécurité',
    tags: ['rgpd', 'sécurité', 'données', 'confidentialité'],
    readTime: '5 min',
    icon: Shield,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'changelog',
    slug: 'changelog',
    title: 'Nouveautés et mises à jour',
    description: 'Découvrez les dernières fonctionnalités de ClearStack',
    category: 'Nouveautés',
    tags: ['changelog', 'nouveautés', 'mises-à-jour', 'fonctionnalités'],
    readTime: '2 min',
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
  }
];

const categories = [
  'Toutes',
  'Demandes',
  'Avis',
  'Import',
  'Projets',
  'Contrats',
  'Économies',
  'Configuration',
  'Sécurité',
  'Nouveautés'
];

export const HelpCenterPage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [filteredArticles, setFilteredArticles] = useState(helpArticles);

  // Raccourci clavier "?" pour ouvrir le centre d'aide
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          // Focus sur la recherche
          const searchInput = document.querySelector('[data-testid="help-search-input"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filtrage des articles
  useEffect(() => {
    let filtered = helpArticles;

    if (selectedCategory !== 'Toutes') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory]);

  if (selectedArticle) {
    return (
      <HelpArticle
        articleSlug={selectedArticle}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
            Centre d'aide ClearStack
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          {/* Recherche */}
          <div className="max-w-2xl mx-auto mb-6">
            <HelpSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher dans l'aide... (ou appuyez sur '?')"
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-100 dark:hover:bg-neutral-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats de recherche */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {filteredArticles.length} résultat{filteredArticles.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          </div>
        )}

        {/* Articles d'aide */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const IconComponent = article.icon;
              return (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                  onClick={() => setSelectedArticle(article.slug)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${article.color} mb-3`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {article.readTime}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-neutral-950 dark:text-neutral-100 line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-neutral-500 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* État vide */
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-950 dark:text-neutral-100 mb-2">
              Aucun article trouvé
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Essayez avec d'autres mots-clés ou parcourez toutes les catégories
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Toutes');
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Voir tous les articles
            </button>
          </div>
        )}

        {/* CTA PLG */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-100 mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Invitez un collègue à contribuer ou contactez notre équipe support
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                  Inviter un collègue
                </button>
                <button className="px-6 py-2 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  Contacter le support
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};