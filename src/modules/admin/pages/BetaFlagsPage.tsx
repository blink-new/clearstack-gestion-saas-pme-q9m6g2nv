// path: src/modules/admin/pages/BetaFlagsPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Upload, Download, Settings, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../hooks/use-toast';

interface BetaFeedback {
  id: string;
  page: string;
  role: string;
  rating?: number;
  message?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const BetaFlagsPage: React.FC = () => {
  const { flags, loading, updateFlag, refetch } = useFeatureFlags();
  const { track } = useAnalytics();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<BetaFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const handleToggleFlag = async (key: string, enabled: boolean, scope: 'global' | 'company') => {
    try {
      await updateFlag(key, enabled, scope);
      track('feature_flag_toggled', { flag_key: key, enabled, scope });
      toast({
        title: 'Flag mis à jour',
        description: `${key} ${enabled ? 'activé' : 'désactivé'} (${scope})`
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
        variant: 'destructive'
      });
    }
  };

  const handleImportEmails = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez coller des données CSV',
        variant: 'destructive'
      });
      return;
    }

    try {
      setImporting(true);
      const response = await apiFetch<{ success: boolean; message: string; data: { count: number } }>('/admin/beta-whitelist/import', {
        method: 'POST',
        body: JSON.stringify({ csvData })
      });

      toast({
        title: 'Import réussi',
        description: response.message
      });
      setCsvData('');
    } catch (error) {
      toast({
        title: 'Erreur d\'import',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'import',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const response = await apiFetch<{ success: boolean; data: BetaFeedback[] }>('/admin/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les feedbacks',
        variant: 'destructive'
      });
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const getFlagIcon = (key: string) => {
    switch (key) {
      case 'beta_access': return <Users className="h-4 w-4" />;
      case 'prospect_connector': return <BarChart3 className="h-4 w-4" />;
      case 'web_push': return <MessageSquare className="h-4 w-4" />;
      case 'economies_block': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getFlagDescription = (key: string) => {
    switch (key) {
      case 'beta_access': return 'Accès à la version bêta de ClearStack';
      case 'prospect_connector': return 'Connecteur vers l\'outil de prospection';
      case 'web_push': return 'Notifications push navigateur';
      case 'economies_block': return 'Bloc des économies suggérées';
      default: return 'Feature flag personnalisé';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement des feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-white">Bêta & Feature Flags</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Gérez les fonctionnalités en cours de développement et l'accès bêta.
        </p>
      </div>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Activez ou désactivez les fonctionnalités par entreprise ou globalement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.map((flag) => (
            <div key={`${flag.key}-${flag.scope}`} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getFlagIcon(flag.key)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{flag.key}</span>
                    <Badge variant={flag.scope === 'global' ? 'secondary' : 'outline'}>
                      {flag.scope}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {getFlagDescription(flag.key)}
                  </p>
                </div>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => handleToggleFlag(flag.key, enabled, flag.scope)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Import Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Whitelist Bêta
          </CardTitle>
          <CardDescription>
            Importez une liste d'emails pour donner accès à la version bêta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-data">Données CSV (email par ligne ou format CSV)</Label>
            <Textarea
              id="csv-data"
              placeholder="email1@example.com&#10;email2@example.com&#10;ou&#10;email,nom,entreprise&#10;user@demo.co,John Doe,Demo Corp"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleImportEmails}
              disabled={importing || !csvData.trim()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? 'Import en cours...' : 'Importer'}
            </Button>
            <Button variant="outline" onClick={() => setCsvData('')}>
              Effacer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Bêta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedbacks Bêta
          </CardTitle>
          <CardDescription>
            Retours des utilisateurs sur la version bêta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {feedbacks.length} feedback{feedbacks.length > 1 ? 's' : ''} reçu{feedbacks.length > 1 ? 's' : ''}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadFeedbacks}
              disabled={loadingFeedbacks}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loadingFeedbacks ? 'Chargement...' : 'Charger'}
            </Button>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun feedback pour le moment</p>
              <p className="text-sm">Les retours utilisateurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.slice(0, 10).map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">
                        {feedback.user.firstName} {feedback.user.lastName}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {feedback.role}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-neutral-500">
                      <div>{feedback.page}</div>
                      <div>{new Date(feedback.createdAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                  {feedback.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span 
                          key={i} 
                          className={i < feedback.rating! ? 'text-yellow-500' : 'text-neutral-300'}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-neutral-600">
                        {feedback.rating}/5
                      </span>
                    </div>
                  )}
                  {feedback.message && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-3 rounded">
                      {feedback.message}
                    </p>
                  )}
                </div>
              ))}
              {feedbacks.length > 10 && (
                <p className="text-center text-sm text-neutral-500">
                  ... et {feedbacks.length - 10} autre{feedbacks.length - 10 > 1 ? 's' : ''} feedback{feedbacks.length - 10 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaFlagsPage;