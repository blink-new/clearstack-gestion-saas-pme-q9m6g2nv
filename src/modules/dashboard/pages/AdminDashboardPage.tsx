// path: src/modules/dashboard/pages/AdminDashboardPage.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  PiggyBank, 
  Plus, 
  Upload, 
  UserPlus, 
  FolderPlus,
  Eye,
  Share2,
  Building2,
  Users,
  Euro
} from 'lucide-react';
import { useDashboardCosts, useEconomies, useContractAlerts } from '../../../hooks';

interface MockData {
  totalCosts: {
    annual: number;
    monthly: number;
    byEntity: Array<{ name: string; amount: number; color: string }>;
  };
  renewals: Array<{
    id: string;
    software: string;
    entity: string;
    endDate: string;
    noticeDays: number;
    cost: number;
    status: 'urgent' | 'warning' | 'normal';
  }>;
  completion: {
    percentage: number;
    missing: {
      softwareWithoutCost: number;
      softwareWithoutEndDate: number;
      usersWithoutSoftware: number;
    };
  };
  savings: {
    total: number;
    breakdown: Array<{
      type: 'INACTIVE_LICENSE' | 'REDUNDANCY' | 'LOW_SATISFACTION' | 'RENEWAL';
      label: string;
      amount: number;
      count: number;
    }>;
  };
}

const mockData: MockData = {
  totalCosts: {
    annual: 245800,
    monthly: 20483,
    byEntity: [
      { name: 'Direction', amount: 89200, color: 'hsl(var(--primary))' },
      { name: 'IT', amount: 67400, color: 'hsl(var(--teal))' },
      { name: 'Marketing', amount: 45600, color: 'hsl(var(--gold))' },
      { name: 'RH', amount: 28400, color: 'hsl(var(--salmon))' },
      { name: 'Finance', amount: 15200, color: 'hsl(var(--success))' }
    ]
  },
  renewals: [
    {
      id: '1',
      software: 'Microsoft Office 365',
      entity: 'Direction',
      endDate: '2024-03-15',
      noticeDays: 30,
      cost: 12500,
      status: 'urgent'
    },
    {
      id: '2',
      software: 'Salesforce CRM',
      entity: 'Marketing',
      endDate: '2024-04-22',
      noticeDays: 60,
      cost: 8900,
      status: 'warning'
    },
    {
      id: '3',
      software: 'Adobe Creative Suite',
      entity: 'Marketing',
      endDate: '2024-05-10',
      noticeDays: 90,
      cost: 4200,
      status: 'normal'
    },
    {
      id: '4',
      software: 'Slack Business',
      entity: 'IT',
      endDate: '2024-05-28',
      noticeDays: 95,
      cost: 2800,
      status: 'normal'
    },
    {
      id: '5',
      software: 'Figma Professional',
      entity: 'IT',
      endDate: '2024-06-05',
      noticeDays: 30,
      cost: 1500,
      status: 'normal'
    }
  ],
  completion: {
    percentage: 73,
    missing: {
      softwareWithoutCost: 8,
      softwareWithoutEndDate: 12,
      usersWithoutSoftware: 15
    }
  },
  savings: {
    total: 34500,
    breakdown: [
      { type: 'INACTIVE_LICENSE', label: 'Licences inactives', amount: 15200, count: 23 },
      { type: 'REDUNDANCY', label: 'Redondances', amount: 8900, count: 6 },
      { type: 'LOW_SATISFACTION', label: 'Satisfaction faible', amount: 6700, count: 4 },
      { type: 'RENEWAL', label: 'Renégociation', amount: 3700, count: 8 }
    ]
  }
};

const CostChart: React.FC<{ data: MockData['totalCosts']['byEntity'] }> = ({ data }) => {
  const maxAmount = Math.max(...data.map(item => item.amount));
  
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-neutral-950">{item.name}</span>
          </div>
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1 bg-neutral-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(item.amount / maxAmount) * 100}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
            <span className="text-sm font-semibold text-neutral-950 min-w-[80px] text-right">
              {item.amount.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const RenewalList: React.FC<{ renewals: MockData['renewals'] }> = ({ renewals }) => {
  const getStatusBadge = (status: string, noticeDays: number) => {
    switch (status) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent ({noticeDays}j)</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="text-xs bg-warning-500/10 text-warning-500">Attention ({noticeDays}j)</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Normal ({noticeDays}j)</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {renewals.map((renewal) => (
        <div key={renewal.id} className="flex items-center justify-between p-3 bg-neutral-100/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm text-neutral-950">{renewal.software}</h4>
              {getStatusBadge(renewal.status, renewal.noticeDays)}
            </div>
            <div className="flex items-center space-x-4 text-xs text-neutral-600">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>{renewal.entity}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(renewal.endDate).toLocaleDateString('fr-FR')}</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-sm text-neutral-950">
              {renewal.cost.toLocaleString('fr-FR')} €
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CompletionBlock: React.FC<{ completion: MockData['completion'] }> = ({ completion }) => {
  const { percentage, missing } = completion;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-950">Complétion globale</span>
        <span className="text-2xl font-bold text-primary-600">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-3" />
      
      <div className="space-y-2 pt-2">
        <h4 className="font-medium text-sm text-neutral-950">Données manquantes :</h4>
        <div className="space-y-1 text-sm text-neutral-600">
          {missing.softwareWithoutCost > 0 && (
            <div className="flex items-center justify-between">
              <span>Logiciels sans coût</span>
              <Badge variant="outline" className="text-xs">{missing.softwareWithoutCost}</Badge>
            </div>
          )}
          {missing.softwareWithoutEndDate > 0 && (
            <div className="flex items-center justify-between">
              <span>Logiciels sans date de fin</span>
              <Badge variant="outline" className="text-xs">{missing.softwareWithoutEndDate}</Badge>
            </div>
          )}
          {missing.usersWithoutSoftware > 0 && (
            <div className="flex items-center justify-between">
              <span>Utilisateurs sans logiciels</span>
              <Badge variant="outline" className="text-xs">{missing.usersWithoutSoftware}</Badge>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Users className="w-4 h-4 mr-2" />
          Compléter
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-teal-500 border-teal-500 hover:bg-teal-50">
          <UserPlus className="w-4 h-4 mr-2" />
          Inviter
        </Button>
      </div>
    </div>
  );
};

const SavingsBlock: React.FC<{ savings: MockData['savings'] }> = ({ savings }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-950">Économies suggérées</span>
        <span className="text-2xl font-bold text-success-500">
          {savings.total.toLocaleString('fr-FR')} €
        </span>
      </div>
      
      <div className="space-y-2">
        {savings.breakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-neutral-100/50 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-950">{item.label}</span>
              <Badge variant="outline" className="text-xs">{item.count}</Badge>
            </div>
            <span className="text-sm font-semibold text-success-500">
              {item.amount.toLocaleString('fr-FR')} €
            </span>
          </div>
        ))}
      </div>
      
      <Button size="sm" className="w-full bg-success-500 hover:bg-success-600 text-white">
        <Eye className="w-4 h-4 mr-2" />
        Voir le détail
      </Button>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  // Hooks API
  const { data: dashboardCosts, isLoading: costsLoading } = useDashboardCosts();
  const { data: economies, isLoading: economiesLoading } = useEconomies();
  const { data: contractAlerts, isLoading: alertsLoading } = useContractAlerts();

  // TODO connect other fields - Fallback vers mock data si API pas encore connectée
  const displayCosts = dashboardCosts || mockData.totalCosts;
  const displayEconomies = economies || mockData.savings.breakdown;
  const displayAlerts = contractAlerts || mockData.renewals;
  
  const hasData = displayCosts.annual > 0;

  // Loading state
  if (costsLoading || economiesLoading || alertsLoading) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!hasData) {
    return (
      <main className="min-h-screen bg-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-950">Tableau de bord</h1>
            <p className="text-neutral-600 mt-2">Vue d'ensemble de vos logiciels et dépenses</p>
          </header>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-950 mb-2">
                  Aucune donnée disponible
                </h3>
                <p className="text-neutral-600 mb-6">
                  Commencez par ajouter vos premiers logiciels ou importer vos données existantes.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un logiciel
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer un tableau
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-950">Tableau de bord</h1>
              <p className="text-neutral-600 mt-2">Vue d'ensemble de vos logiciels et dépenses</p>
            </div>
            <Button variant="outline" size="sm" className="text-teal-500 border-teal-500 hover:bg-teal-50">
              <Share2 className="w-4 h-4 mr-2" />
              Partager le rapport
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Bloc Dépenses */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="w-5 h-5 text-primary-600" />
                <span>Dépenses annuelles</span>
              </CardTitle>
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-primary-600">
                  {mockData.totalCosts.annual.toLocaleString('fr-FR')} €
                </span>
                <span className="text-sm text-neutral-600">
                  ({mockData.totalCosts.monthly.toLocaleString('fr-FR')} €/mois)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CostChart data={mockData.totalCosts.byEntity} />
            </CardContent>
          </Card>

          {/* Bloc Complétion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <span>Complétion des données</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompletionBlock completion={mockData.completion} />
            </CardContent>
          </Card>

          {/* Bloc Échéances */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-warning-500" />
                  <span>Prochaines échéances</span>
                </div>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RenewalList renewals={mockData.renewals} />
            </CardContent>
          </Card>

          {/* Bloc Économies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-success-500" />
                <span>Économies suggérées</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsBlock savings={mockData.savings} />
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-auto p-4 flex-col space-y-2">
                <Plus className="w-6 h-6" />
                <span className="text-sm">Ajouter un logiciel</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Upload className="w-6 h-6" />
                <span className="text-sm">Importer un tableau</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2 text-teal-500 border-teal-500 hover:bg-teal-50">
                <UserPlus className="w-6 h-6" />
                <span className="text-sm">Inviter un collègue</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <FolderPlus className="w-6 h-6" />
                <span className="text-sm">Créer un projet d'achat</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AdminDashboardPage;