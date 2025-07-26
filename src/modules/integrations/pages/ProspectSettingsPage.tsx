// path: src/modules/integrations/pages/ProspectSettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { 
  Settings, 
  Send, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Shield
} from 'lucide-react';

interface ProspectSettings {
  prospectEnabled: boolean;
  anonymize: boolean;
  lastSyncAt: string | null;
}

interface OutboxStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
  recentEvents: Array<{
    id: string;
    type: string;
    status: string;
    tryCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const ProspectSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ProspectSettings>({
    prospectEnabled: false,
    anonymize: false,
    lastSyncAt: null
  });
  const [stats, setStats] = useState<OutboxStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  // Mock data pour la démo
  const mockPayload = {
    company_id: "demo-company-123",
    software_id: "software-456",
    rating: 4,
    tags: ["productivité", "collaboration"],
    improvement: "Interface plus intuitive",
    created_at: "2024-01-25T10:30:00Z",
    user: {
      email_hash: "a1b2c3d4e5f6..." // Si anonymisation activée
    }
  };

  const loadSettings = async () => {
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/v1/integrations/prospect/settings');
      // const data = await response.json();
      
      // Mock data pour la démo
      const mockSettings = {
        prospectEnabled: false,
        anonymize: true,
        lastSyncAt: "2024-01-25T08:00:00Z"
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setMessage({ type: 'error', text: 'Impossible de charger les paramètres' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/v1/integrations/prospect/stats');
      // const data = await response.json();
      
      // Mock data pour la démo
      const mockStats = {
        pending: 12,
        sent: 156,
        failed: 3,
        total: 171,
        recentEvents: [
          { id: '1', type: 'REVIEW_CREATED', status: 'SENT', tryCount: 1, createdAt: '2024-01-25T10:00:00Z', updatedAt: '2024-01-25T10:01:00Z' },
          { id: '2', type: 'REQUEST_CREATED', status: 'PENDING', tryCount: 0, createdAt: '2024-01-25T09:45:00Z', updatedAt: '2024-01-25T09:45:00Z' },
          { id: '3', type: 'CONTRACT_RENEWAL', status: 'FAILED', tryCount: 3, createdAt: '2024-01-25T09:30:00Z', updatedAt: '2024-01-25T09:35:00Z' }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/v1/integrations/prospect/settings', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde des paramètres' });
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setMessage(null);
    
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/v1/integrations/prospect/test', { method: 'POST' });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ type: 'success', text: 'Test envoyé avec succès vers l\'outil de prospection' });
      loadStats(); // Recharger les stats
      
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setMessage({ type: 'error', text: 'Échec du test de connexion' });
    } finally {
      setTesting(false);
    }
  };

  const exportNow = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/v1/integrations/prospect/export-now', { method: 'POST' });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setMessage({ type: 'success', text: 'Export immédiat lancé : 15 événements créés' });
      loadStats(); // Recharger les stats
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'export immédiat' });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string, tryCount: number) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Envoyé</Badge>;
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Échec ({tryCount})</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'REVIEW_CREATED': 'Avis créé',
      'REQUEST_CREATED': 'Demande créée',
      'REQUEST_ACCEPTED': 'Demande acceptée',
      'CONTRACT_RENEWAL': 'Renouvellement contrat',
      'SOFTWARE_USAGE': 'Usage logiciel',
      'ECONOMY_OPPORTUNITY': 'Opportunité économie'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 dark:text-white">
            Intégration Prospection
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configurez l'export automatique de données vers votre outil de prospection
          </p>
        </div>
      </div>

      {/* Message d'alerte */}
      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-green-500 bg-green-50 dark:bg-green-950'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className={message.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Paramètres principaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Paramètres d'intégration</span>
          </CardTitle>
          <CardDescription>
            Contrôlez l'export automatique de vos données ClearStack vers votre outil de prospection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle principal */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Activer l'export vers l'outil de prospection</label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Envoie automatiquement les avis, demandes, contrats et usages vers votre SaaS de prospection
              </p>
            </div>
            <Switch
              checked={settings.prospectEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, prospectEnabled: checked }))}
            />
          </div>

          <Separator />

          {/* Anonymisation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Anonymiser les données personnelles</span>
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Remplace les emails par des hashs SHA256 pour respecter la confidentialité
              </p>
            </div>
            <Switch
              checked={settings.anonymize}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, anonymize: checked }))}
            />
          </div>

          <Separator />

          {/* Dernière synchronisation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Dernière synchronisation</label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {settings.lastSyncAt 
                  ? new Date(settings.lastSyncAt).toLocaleString('fr-FR')
                  : 'Aucune synchronisation effectuée'
                }
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendTest} 
              disabled={testing || !settings.prospectEnabled}
            >
              <Send className="w-4 h-4 mr-2" />
              {testing ? 'Test en cours...' : 'Envoyer un test'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportNow} 
              disabled={exporting || !settings.prospectEnabled}
            >
              <Activity className="w-4 h-4 mr-2" />
              {exporting ? 'Export en cours...' : 'Exporter maintenant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Statistiques d'export</span>
            </CardTitle>
            <CardDescription>
              Vue d'ensemble des événements envoyés vers votre outil de prospection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.pending}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">En attente</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Envoyés</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Échoués</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div className="text-2xl font-bold text-neutral-950 dark:text-white">{stats.total}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Total</div>
              </div>
            </div>

            {/* Événements récents */}
            <div className="space-y-3">
              <h4 className="font-medium">Événements récents</h4>
              {stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{getEventTypeLabel(event.type)}</div>
                    {getStatusBadge(event.status, event.tryCount)}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {new Date(event.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aperçu du payload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Aperçu des données exportées</span>
          </CardTitle>
          <CardDescription>
            Exemple de données JSON envoyées vers votre outil de prospection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => setShowPayloadPreview(!showPayloadPreview)}
            className="mb-4"
          >
            {showPayloadPreview ? 'Masquer' : 'Afficher'} l'aperçu JSON
          </Button>
          
          {showPayloadPreview && (
            <div className="bg-neutral-900 dark:bg-neutral-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(mockPayload, null, 2)}</pre>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note :</strong> Les données sont envoyées automatiquement toutes les 10 minutes. 
              L'anonymisation remplace les emails par des hashs SHA256 pour protéger la confidentialité.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};