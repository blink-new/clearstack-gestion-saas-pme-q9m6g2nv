// path: src/modules/requests/components/SimilarRequestsList.tsx
import React from 'react';
import { AlertTriangle, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimilarRequestsListProps {
  searchQuery: string;
}

// Mock similar requests data
const mockSimilarRequests = [
  {
    id: '1',
    software_ref: 'Figma Team',
    status: 'SUBMITTED' as const,
    votes_count: 3,
    requester: 'Thomas Martin',
    created_at: '2024-01-10T10:30:00Z'
  },
  {
    id: '2',
    software_ref: 'Figma Professional',
    status: 'REFUSED' as const,
    votes_count: 1,
    requester: 'Sophie Leroy',
    created_at: '2024-01-05T14:20:00Z'
  }
];

const statusConfig = {
  DRAFT: { label: 'Brouillon', color: 'bg-neutral-100 text-neutral-600' },
  SUBMITTED: { label: 'Soumise', color: 'bg-blue-100 text-blue-700' },
  REVIEW: { label: 'En révision', color: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED: { label: 'Acceptée', color: 'bg-green-100 text-green-700' },
  REFUSED: { label: 'Refusée', color: 'bg-red-100 text-red-700' }
};

export const SimilarRequestsList: React.FC<SimilarRequestsListProps> = ({ searchQuery }) => {
  // Simple matching logic - in real app, this would be more sophisticated
  const similarRequests = mockSimilarRequests.filter(request =>
    request.software_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery.toLowerCase().includes(request.software_ref.toLowerCase())
  );

  if (similarRequests.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-yellow-800">
          <AlertTriangle className="w-4 h-4" />
          Demandes similaires trouvées
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-yellow-700 mb-3">
          Ces demandes ressemblent à la tienne. Vérifie qu'elle n'existe pas déjà !
        </p>
        <div className="space-y-2">
          {similarRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-white rounded border border-yellow-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-neutral-950 text-sm">
                    {request.software_ref}
                  </span>
                  <Badge className={statusConfig[request.status].color}>
                    {statusConfig[request.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>par {request.requester}</span>
                  <span>{formatDate(request.created_at)}</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{request.votes_count}</span>
                  </div>
                </div>
              </div>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Voir détail
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-yellow-600 mt-3">
          💡 Si ta demande est différente, continue. Sinon, vote pour une demande existante !
        </p>
      </CardContent>
    </Card>
  );
};