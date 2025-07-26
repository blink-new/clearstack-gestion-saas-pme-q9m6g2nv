// path: src/modules/requests/pages/RequestDetailPage.tsx
import React, { useState } from 'react';
import { ArrowLeft, ThumbsUp, Calendar, User, Euro, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockRequest = {
  id: '1',
  software_ref: 'Figma Pro',
  description_need: 'Besoin d\'un outil de design collaboratif pour l\'équipe UX. Les maquettes actuelles sont dispersées et il est difficile de collaborer efficacement. Figma permettrait de centraliser le travail de design et d\'améliorer la collaboration avec les développeurs.',
  urgency: 'LT_3M' as const,
  est_budget: 1200,
  status: 'REVIEW' as const,
  votes_count: 8,
  requester: {
    id: '1',
    first_name: 'Marie',
    last_name: 'Dubois',
    email: 'marie.dubois@clearstack.fr',
    avatar: null,
    department: 'Design'
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-16T14:20:00Z'
};

const mockVoters = [
  { id: '1', first_name: 'Thomas', last_name: 'Martin', avatar: null },
  { id: '2', first_name: 'Sophie', last_name: 'Leroy', avatar: null },
  { id: '3', first_name: 'Pierre', last_name: 'Durand', avatar: null },
  { id: '4', first_name: 'Julie', last_name: 'Bernard', avatar: null },
  { id: '5', first_name: 'Antoine', last_name: 'Moreau', avatar: null }
];

const mockHistory = [
  {
    id: '1',
    action: 'Demande créée',
    user: 'Marie Dubois',
    date: '2024-01-15T10:30:00Z',
    comment: null
  },
  {
    id: '2',
    action: 'Statut changé vers "En révision"',
    user: 'Admin ClearStack',
    date: '2024-01-16T14:20:00Z',
    comment: 'Demande en cours d\'évaluation par l\'équipe IT'
  }
];

const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-neutral-100 text-neutral-600' },
  SUBMITTED: { label: 'Soumise', color: 'bg-blue-100 text-blue-700' },
  REVIEW: { label: 'En révision', color: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  REFUSED: { label: 'Refusée', color: 'bg-red-100 text-red-700' }
};

const urgencyConfig = {
  IMMEDIATE: { label: 'Immédiat', color: 'text-red-600', icon: '🔥' },
  LT_3M: { label: '< 3 mois', color: 'text-yellow-600', icon: '⚡' },
  GT_3M: { label: '> 3 mois', color: 'text-green-600', icon: '📅' }
};

export const RequestDetailPage = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [showAdminActions, setShowAdminActions] = useState(false);
  const { toast } = useToast();
  
  // Mock user role - in real app, get from auth context
  const userRole = 'ADMIN'; // or 'USER'
  const isAdmin = userRole === 'ADMIN';

  const handleVote = () => {
    if (hasVoted) return;
    
    setHasVoted(true);
    toast({
      title: "Vote enregistré !",
      description: "Merci ! Parlez-en à votre équipe ?",
      action: (
        <Button variant="outline" size="sm" className="bg-teal-500 text-white border-teal-500 hover:bg-teal-600">
          Inviter un collègue
        </Button>
      )
    });
  };

  const handleStatusChange = (newStatus: 'ACCEPTED' | 'REFUSED') => {
    toast({
      title: `Demande ${newStatus === 'ACCEPTED' ? 'acceptée' : 'refusée'}`,
      description: "Le demandeur sera notifié de cette décision."
    });
    setShowAdminActions(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux demandes
        </Button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-950 mb-2">
                {mockRequest.software_ref}
              </h1>
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[mockRequest.status].color}>
                  {statusConfig[mockRequest.status].label}
                </Badge>
                <span className={`text-sm font-medium flex items-center gap-1 ${urgencyConfig[mockRequest.urgency].color}`}>
                  <span>{urgencyConfig[mockRequest.urgency].icon}</span>
                  {urgencyConfig[mockRequest.urgency].label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 text-lg font-semibold text-neutral-950">
                  <ThumbsUp className="w-5 h-5" />
                  {mockRequest.votes_count + (hasVoted ? 1 : 0)}
                </div>
                <p className="text-xs text-neutral-500">votes</p>
              </div>
              <Button
                onClick={handleVote}
                disabled={hasVoted}
                className={hasVoted 
                  ? "bg-green-100 text-green-700 hover:bg-green-100" 
                  : "bg-primary-600 hover:bg-primary-700 text-white"
                }
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {hasVoted ? 'Voté' : '+1'}
              </Button>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && mockRequest.status === 'REVIEW' && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <Button
                  onClick={() => handleStatusChange('ACCEPTED')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepter
                </Button>
                <Button
                  onClick={() => handleStatusChange('REFUSED')}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              </div>
              <Textarea
                placeholder="Commentaire pour le demandeur (optionnel)..."
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                className="text-sm"
                rows={2}
              />
            </div>
          )}

          {/* Accepted Actions */}
          {mockRequest.status === 'ACCEPTED' && (
            <div className="border-t pt-4">
              <p className="text-sm text-neutral-600 mb-3">
                Cette demande a été acceptée. Choisissez la suite :
              </p>
              <div className="flex gap-3">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  Mettre à jour fiche existante
                </Button>
                <Button variant="outline" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                  Lancer un projet d'achat
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Détails de la demande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-950 mb-2">Description du besoin</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    {mockRequest.description_need}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-neutral-950 mb-1">Urgence</h4>
                    <span className={`text-sm ${urgencyConfig[mockRequest.urgency].color}`}>
                      {urgencyConfig[mockRequest.urgency].icon} {urgencyConfig[mockRequest.urgency].label}
                    </span>
                  </div>
                  {mockRequest.est_budget && (
                    <div>
                      <h4 className="font-medium text-neutral-950 mb-1">Budget estimé</h4>
                      <span className="text-sm text-neutral-600 flex items-center gap-1">
                        <Euro className="w-3 h-3" />
                        {mockRequest.est_budget.toLocaleString('fr-FR')} €/an
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-neutral-950 mb-2">Demandeur</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={mockRequest.requester.avatar || undefined} />
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {mockRequest.requester.first_name[0]}{mockRequest.requester.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-neutral-950">
                        {mockRequest.requester.first_name} {mockRequest.requester.last_name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {mockRequest.requester.department} • {mockRequest.requester.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHistory.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-neutral-950">{entry.action}</span>
                          <span className="text-xs text-neutral-500">
                            par {entry.user}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mb-1">
                          {formatDate(entry.date)}
                        </p>
                        {entry.comment && (
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Votes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Votes ({mockRequest.votes_count + (hasVoted ? 1 : 0)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVoters.slice(0, 5).map((voter) => (
                    <div key={voter.id} className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={voter.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-600">
                          {voter.first_name[0]}{voter.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-600">
                        {voter.first_name} {voter.last_name}
                      </span>
                    </div>
                  ))}
                  {hasVoted && (
                    <div className="flex items-center gap-2 bg-green-50 p-2 rounded">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-green-100 text-green-600">
                          Moi
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-green-600 font-medium">
                        Vous avez voté
                      </span>
                    </div>
                  )}
                  {mockRequest.votes_count > 5 && (
                    <p className="text-xs text-neutral-500">
                      +{mockRequest.votes_count - 5} autres votes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-teal-200 text-teal-600 hover:bg-teal-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Inviter un collègue à voter
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Voir demandes similaires
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};