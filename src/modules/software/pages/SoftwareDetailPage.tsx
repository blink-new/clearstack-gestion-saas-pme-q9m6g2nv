// path: src/modules/software/pages/SoftwareDetailPage.tsx
import React, { useState } from 'react';
import { 
  Star, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  UserPlus, 
  MessageSquare,
  Building2,
  Euro,
  Clock,
  CheckCircle,
  X,
  Send
} from 'lucide-react';
import { useSoftware, useCreateReview } from '../../../hooks';
import { track } from '../../../lib/analytics';
import { trackFirstAction } from '../../../lib/firstAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// Données mockées pour la démonstration
const mockSoftware = {
  id: '1',
  name: 'Slack',
  version: '4.38.125',
  category: 'Communication',
  logo: '/api/placeholder/64/64',
  description: 'Plateforme de communication d\'équipe avec messagerie instantanée, appels vidéo et partage de fichiers.',
  averageRating: 4.2,
  totalReviews: 12,
  totalUsers: 45,
  nextRenewal: {
    date: '2024-03-15',
    daysLeft: 28
  },
  contracts: [
    {
      id: '1',
      costAmount: 8400,
      currency: 'EUR',
      billingPeriod: 'YEAR',
      endDate: '2024-03-15',
      noticeDays: 30,
      entity: 'Siège Social'
    },
    {
      id: '2',
      costAmount: 420,
      currency: 'EUR',
      billingPeriod: 'MONTH',
      endDate: '2024-06-30',
      noticeDays: 60,
      entity: 'Filiale Lyon'
    }
  ],
  users: [
    { id: '1', name: 'Marie Dubois', department: 'Marketing', avatar: '/api/placeholder/32/32' },
    { id: '2', name: 'Pierre Martin', department: 'Développement', avatar: '/api/placeholder/32/32' },
    { id: '3', name: 'Sophie Laurent', department: 'Commercial', avatar: '/api/placeholder/32/32' },
    { id: '4', name: 'Thomas Bernard', department: 'RH', avatar: '/api/placeholder/32/32' },
    { id: '5', name: 'Julie Moreau', department: 'Finance', avatar: '/api/placeholder/32/32' }
  ],
  reviews: [
    {
      id: '1',
      userId: '2',
      userName: 'Pierre Martin',
      rating: 5,
      strengths: 'Interface intuitive, intégrations nombreuses, notifications personnalisables',
      weaknesses: 'Peut être distrayant, consomme beaucoup de mémoire',
      improvement: 'Améliorer les performances sur les gros channels',
      createdAt: '2024-01-15',
      tags: ['Interface', 'Intégrations']
    },
    {
      id: '2',
      userId: '3',
      userName: 'Sophie Laurent',
      rating: 4,
      strengths: 'Facilite la communication d\'équipe, recherche efficace',
      weaknesses: 'Notifications parfois trop nombreuses',
      improvement: 'Meilleur contrôle des notifications par projet',
      createdAt: '2024-01-10',
      tags: ['Communication', 'Recherche']
    }
  ]
};

// Composant Modal Formulaire Avis (défini en premier pour éviter les erreurs de référence)
const ReviewFormModal: React.FC<{ 
  software: typeof mockSoftware; 
  children: React.ReactNode 
}> = ({ software, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [improvement, setImprovement] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = [
    'Interface', 'Performance', 'Intégrations', 'Support', 
    'Prix', 'Fonctionnalités', 'Sécurité', 'Mobile'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Appel API pour soumettre l'avis
    console.log('Avis soumis:', { rating, strengths, weaknesses, improvement, selectedTags });
    
    // Analytics tracking
    track('review_created', { 
      software_id: software.id, 
      company_id: 'demo-company', // TODO: récupérer depuis le contexte auth
      rating 
    });
    
    // Track première action pour TTV
    trackFirstAction('review', 'demo-company');
    
    setIsOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Donner mon avis sur {software.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Note */}
          <div>
            <Label className="text-base font-medium">Note générale *</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-gold-500 fill-current'
                        : 'text-neutral-300 hover:text-gold-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-neutral-600">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Points forts */}
          <div>
            <Label htmlFor="strengths" className="text-base font-medium">
              Points forts *
            </Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Qu'est-ce qui vous plaît le plus dans ce logiciel ?"
              className="mt-2"
              rows={3}
              required
            />
          </div>

          {/* Points faibles */}
          <div>
            <Label htmlFor="weaknesses" className="text-base font-medium">
              Points faibles *
            </Label>
            <Textarea
              id="weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="Quels sont les aspects à améliorer ?"
              className="mt-2"
              rows={3}
              required
            />
          </div>

          {/* Suggestion d'amélioration */}
          <div>
            <Label htmlFor="improvement" className="text-base font-medium">
              Suggestion d'amélioration
            </Label>
            <Textarea
              id="improvement"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Une idée pour améliorer ce logiciel ? (max 200 caractères)"
              className="mt-2"
              rows={2}
              maxLength={200}
            />
            <div className="text-xs text-neutral-500 mt-1">
              {improvement.length}/200 caractères
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-medium">Tags (optionnel)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm font-normal">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!rating || !strengths.trim() || !weaknesses.trim()}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Publier mon avis
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Composant Header du logiciel
const SoftwareHeader: React.FC<{ software: typeof mockSoftware; userRole: string; isUserUsing: boolean }> = ({ 
  software, 
  userRole, 
  isUserUsing 
}) => {
  const [isUsing, setIsUsing] = useState(isUserUsing);

  const handleToggleUsage = () => {
    setIsUsing(!isUsing);
    // TODO: Appel API pour déclarer/retirer l'usage
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>

          {/* Infos principales */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral-950">{software.name}</h1>
              <Badge variant="outline" className="text-sm">v{software.version}</Badge>
              <Badge className="bg-primary-100 text-primary-600 hover:bg-primary-100">
                {software.category}
              </Badge>
            </div>

            <p className="text-neutral-600 mb-4 max-w-2xl">{software.description}</p>

            {/* Métriques */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-600">
                  {software.totalUsers} utilisateur{software.totalUsers > 1 ? 's' : ''}
                </span>
              </div>

              {software.averageRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(software.averageRating)
                            ? 'text-gold-500 fill-current'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600">
                    {software.averageRating}/5 ({software.totalReviews} avis)
                  </span>
                </div>
              )}

              {software.nextRenewal && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-warning-500" />
                  <span className="text-sm text-neutral-600">
                    Renouvellement dans {software.nextRenewal.daysLeft} jours
                  </span>
                  {software.nextRenewal.daysLeft <= 30 && (
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-col gap-2">
            <Button
              variant={isUsing ? "outline" : "default"}
              size="sm"
              onClick={handleToggleUsage}
              className="min-w-[140px]"
            >
              {isUsing ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Je l'utilise
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Je l'utilise
                </>
              )}
            </Button>

            <ReviewFormModal software={software}>
              <Button variant="outline" size="sm" className="min-w-[140px]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Donner mon avis
              </Button>
            </ReviewFormModal>

            {userRole === 'ADMIN' && (
              <Button variant="outline" size="sm" className="min-w-[140px]">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter contrat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant Bloc Contrats
const ContractsBlock: React.FC<{ contracts: typeof mockSoftware.contracts; userRole: string }> = ({ 
  contracts, 
  userRole 
}) => {
  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">Aucun contrat enregistré</h3>
          <p className="text-neutral-600 mb-4">
            {userRole === 'ADMIN' 
              ? 'Ajoutez les informations contractuelles pour suivre les coûts et échéances.'
              : 'Les informations contractuelles ne sont pas encore disponibles.'
            }
          </p>
          {userRole === 'ADMIN' && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un contrat
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Contrats</CardTitle>
        {userRole === 'ADMIN' && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter contrat
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{contract.entity}</Badge>
                  <span className="text-sm text-neutral-600">
                    Fin le {new Date(contract.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-neutral-950">
                    {contract.costAmount.toLocaleString('fr-FR')} {contract.currency}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {contract.billingPeriod === 'YEAR' ? 'par an' : 'par mois'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Préavis {contract.noticeDays} jours
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {contract.billingPeriod === 'YEAR' 
                    ? `${Math.round(contract.costAmount / 12).toLocaleString('fr-FR')} €/mois`
                    : `${(contract.costAmount * 12).toLocaleString('fr-FR')} €/an`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant Bloc Utilisateurs
const UsersBlock: React.FC<{ users: typeof mockSoftware.users; isUserUsing: boolean }> = ({ 
  users, 
  isUserUsing 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          Utilisateurs ({users.length})
        </CardTitle>
        {!isUserUsing && (
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Je l'utilise
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary-100 text-primary-600">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-neutral-950">{user.name}</div>
                <div className="text-sm text-neutral-600">{user.department}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant Section Avis (anti-biais)
const ReviewsSection: React.FC<{ 
  software: typeof mockSoftware; 
  userHasReviewed: boolean 
}> = ({ software, userHasReviewed }) => {
  if (!userHasReviewed) {
    // Anti-biais : afficher seulement moyenne/nb si user n'a pas encore posté
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">
            {software.totalReviews > 0 
              ? `${software.totalReviews} avis • Note moyenne ${software.averageRating}/5`
              : 'Aucun avis pour le moment'
            }
          </h3>
          <p className="text-neutral-600 mb-6">
            {software.totalReviews > 0 
              ? 'Publie ton avis pour voir ceux des autres collègues.'
              : 'Soyez le premier à donner votre avis sur ce logiciel !'
            }
          </p>
          <ReviewFormModal software={software}>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Donner mon avis
            </Button>
          </ReviewFormModal>
        </CardContent>
      </Card>
    );
  }

  // Après soumission : afficher tous les avis
  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-950 mb-2">
                Avis de l'équipe ({software.totalReviews})
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(software.averageRating)
                          ? 'text-gold-500 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-neutral-950">
                  {software.averageRating}/5
                </span>
              </div>
            </div>
            <ReviewFormModal software={software}>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Modifier mon avis
              </Button>
            </ReviewFormModal>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="space-y-4">
        {software.reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {review.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-neutral-950">{review.userName}</div>
                    <div className="text-sm text-neutral-600">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'text-gold-500 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-success-500 mb-1">Points forts</h4>
                  <p className="text-neutral-700">{review.strengths}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-salmon-500 mb-1">Points faibles</h4>
                  <p className="text-neutral-700">{review.weaknesses}</p>
                </div>
                
                {review.improvement && (
                  <div>
                    <h4 className="font-medium text-primary-600 mb-1">Suggestion d'amélioration</h4>
                    <p className="text-neutral-700">{review.improvement}</p>
                  </div>
                )}

                {review.tags && review.tags.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {review.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA PLG après avis */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-neutral-950 mb-2">Merci pour votre avis !</h3>
          <p className="text-neutral-600 mb-4">
            Aidez vos collègues en évaluant d'autres logiciels ou invitez-les à partager leur expérience.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm">
              Évaluer Microsoft Teams
            </Button>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter un collègue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



// Composant principal
export const SoftwareDetailPage: React.FC = () => {
  // Hooks API
  const softwareId = '1'; // TODO: récupérer depuis les params de route
  const { data: software, isLoading: softwareLoading } = useSoftware(softwareId);
  const createReviewMutation = useCreateReview();

  // TODO connect other fields - Fallback vers mock data si API pas encore connectée
  const displaySoftware = software || mockSoftware;
  
  const mockUserRole = 'USER'; // Mock - à récupérer depuis le contexte auth
  const mockIsUserUsing = false; // Mock - à récupérer depuis l'API
  const mockUserHasReviewed = false; // Mock - logique anti-biais

  // Loading state
  if (softwareLoading) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-neutral-200 rounded"></div>
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-neutral-200 rounded"></div>
              <div className="h-64 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header du logiciel */}
        <SoftwareHeader 
          software={displaySoftware} 
          userRole={mockUserRole}
          isUserUsing={mockIsUserUsing}
        />

        {/* Navigation par onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="contracts">Contrats</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContractsBlock contracts={displaySoftware.contracts} userRole={mockUserRole} />
              <UsersBlock users={displaySoftware.users} isUserUsing={mockIsUserUsing} />
            </div>
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsBlock contracts={displaySoftware.contracts} userRole={mockUserRole} />
          </TabsContent>

          <TabsContent value="users">
            <UsersBlock users={displaySoftware.users} isUserUsing={mockIsUserUsing} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsSection 
              software={displaySoftware} 
              userHasReviewed={mockUserHasReviewed}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};