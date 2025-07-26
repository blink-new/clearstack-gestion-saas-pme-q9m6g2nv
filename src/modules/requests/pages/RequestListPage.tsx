// path: src/modules/requests/pages/RequestListPage.tsx
import React, { useState } from 'react';
import { Search, Plus, Filter, Calendar, User, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RequestFormModal } from '../components/RequestFormModal';

// Mock data
const mockRequests = [
  {
    id: '1',
    software_ref: 'Figma Pro',
    description_need: 'Besoin d\'un outil de design collaboratif pour l\'équipe UX. Les maquettes actuelles sont dispersées.',
    urgency: 'LT_3M' as const,
    est_budget: 1200,
    status: 'SUBMITTED' as const,
    votes_count: 8,
    requester: {
      id: '1',
      first_name: 'Marie',
      last_name: 'Dubois',
      email: 'marie.dubois@clearstack.fr',
      avatar: null
    },
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    software_ref: 'Notion Enterprise',
    description_need: 'Centraliser la documentation technique et les processus. Remplacer les Google Docs éparpillés.',
    urgency: 'IMMEDIATE' as const,
    est_budget: 800,
    status: 'REVIEW' as const,
    votes_count: 12,
    requester: {
      id: '2',
      first_name: 'Thomas',
      last_name: 'Martin',
      email: 'thomas.martin@clearstack.fr',
      avatar: null
    },
    created_at: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    software_ref: 'Loom Business',
    description_need: 'Créer des vidéos de formation et de démonstration pour les clients. Améliorer la communication.',
    urgency: 'GT_3M' as const,
    est_budget: null,
    status: 'ACCEPTED' as const,
    votes_count: 5,
    requester: {
      id: '3',
      first_name: 'Sophie',
      last_name: 'Leroy',
      email: 'sophie.leroy@clearstack.fr',
      avatar: null
    },
    created_at: '2024-01-08T09:15:00Z'
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
  IMMEDIATE: { label: 'Immédiat', color: 'text-red-600' },
  LT_3M: { label: '< 3 mois', color: 'text-yellow-600' },
  GT_3M: { label: '> 3 mois', color: 'text-green-600' }
};

export const RequestListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = request.software_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description_need.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-950 mb-2">
        Aucune demande pour l'instant
      </h3>
      <p className="text-neutral-600 mb-6">
        Sois le premier à suggérer un logiciel dont ton équipe a besoin !
      </p>
      <Button 
        onClick={() => setShowRequestModal(true)}
        className="bg-primary-600 hover:bg-primary-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Suggérer un logiciel
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-950 mb-2">
              Demandes de logiciels
            </h1>
            <p className="text-neutral-600">
              Suggère de nouveaux outils et vote pour ceux proposés par tes collègues
            </p>
          </div>
          <Button 
            onClick={() => setShowRequestModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Suggérer un logiciel
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une demande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="SUBMITTED">Soumises</SelectItem>
              <SelectItem value="REVIEW">En révision</SelectItem>
              <SelectItem value="ACCEPTED">Acceptées</SelectItem>
              <SelectItem value="REFUSED">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-950">
                          {request.software_ref}
                        </h3>
                        <Badge className={statusConfig[request.status].color}>
                          {statusConfig[request.status].label}
                        </Badge>
                        <span className={`text-sm font-medium ${urgencyConfig[request.urgency].color}`}>
                          {urgencyConfig[request.urgency].label}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm line-clamp-2">
                        {request.description_need}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">{request.votes_count}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={request.requester.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary-100 text-primary-600">
                          {request.requester.first_name[0]}{request.requester.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-neutral-600">
                        {request.requester.first_name} {request.requester.last_name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                    {request.est_budget && (
                      <div className="text-sm font-medium text-neutral-950">
                        {request.est_budget.toLocaleString('fr-FR')} €/an
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Request Form Modal */}
        {showRequestModal && (
          <RequestFormModal onClose={() => setShowRequestModal(false)} />
        )}
      </div>
    </main>
  );
};