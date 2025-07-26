// path: src/modules/purchase/pages/PurchaseProjectPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  ExternalLink, 
  Users, 
  FileText, 
  AlertTriangle,
  Euro,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react';

// Mock data réaliste
const mockProject = {
  id: 'proj_001',
  name: 'Slack Business+',
  status: 'STEP2',
  createdAt: '2024-01-15',
  requester: {
    name: 'Marie Dubois',
    avatar: null,
    department: 'Marketing'
  },
  requestId: 'req_001',
  budget: 15000,
  roiEstimate: 'Amélioration de la communication interne estimée à 20% de gain de productivité. Réduction des emails internes de 40%.',
  risks: [
    'Résistance au changement des équipes habituées aux emails',
    'Coût de formation des utilisateurs',
    'Intégration avec les outils existants (CRM, ERP)'
  ],
  steps: [
    {
      id: 1,
      title: 'Besoin validé',
      description: 'Analyse du besoin et validation par la direction',
      status: 'DONE',
      completedAt: '2024-01-20',
      tasks: [
        { id: 't1', title: 'Analyser le besoin métier', done: true, assignee: 'Marie D.', dueDate: '2024-01-18' },
        { id: 't2', title: 'Validation direction', done: true, assignee: 'Pierre M.', dueDate: '2024-01-20' }
      ]
    },
    {
      id: 2,
      title: 'Comparaison / Shortlist',
      description: 'Recherche et comparaison des solutions disponibles',
      status: 'IN_PROGRESS',
      tasks: [
        { id: 't3', title: 'Recherche sur LeBonLogiciel', done: true, assignee: 'Marie D.', dueDate: '2024-01-25' },
        { id: 't4', title: 'Demander 3 devis', done: false, assignee: 'Thomas L.', dueDate: '2024-02-01' },
        { id: 't5', title: 'Comparatif fonctionnel', done: false, assignee: 'Marie D.', dueDate: '2024-02-05' }
      ]
    },
    {
      id: 3,
      title: 'Validation & négociation interne',
      description: 'Validation DAF/DSI et négociation des conditions',
      status: 'TODO',
      tasks: [
        { id: 't6', title: 'Présentation au comité', done: false, assignee: null, dueDate: '2024-02-10' },
        { id: 't7', title: 'Négociation tarifs', done: false, assignee: null, dueDate: '2024-02-15' }
      ]
    },
    {
      id: 4,
      title: 'Signature & déploiement',
      description: 'Signature du contrat et mise en place',
      status: 'TODO',
      tasks: [
        { id: 't8', title: 'Signature contrat', done: false, assignee: null, dueDate: '2024-02-20' },
        { id: 't9', title: 'Formation équipes', done: false, assignee: null, dueDate: '2024-02-25' },
        { id: 't10', title: 'Déploiement pilote', done: false, assignee: null, dueDate: '2024-03-01' }
      ]
    }
  ],
  tasks: []
};

// Composant Timeline des étapes
const ProjectTimeline: React.FC<{ steps: typeof mockProject.steps }> = ({ steps }) => {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case 'IN_PROGRESS':
        return <Clock className="w-6 h-6 text-warning" />;
      default:
        return <Circle className="w-6 h-6 text-neutral-400" />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Terminé</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">En cours</Badge>;
      default:
        return <Badge variant="outline">À faire</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <Card key={step.id} className="relative">
          {index < steps.length - 1 && (
            <div className="absolute left-8 top-16 w-0.5 h-16 bg-neutral-200" />
          )}
          
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg font-semibold text-neutral-950">
                    Étape {step.id} : {step.title}
                  </CardTitle>
                  {getStepBadge(step.status)}
                </div>
                <p className="text-sm text-neutral-600 mb-4">{step.description}</p>
                
                {step.status === 'IN_PROGRESS' && (
                  <Button size="sm" className="mb-4">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marquer terminé
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-neutral-950 mb-3">Tâches :</h4>
              {step.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <Checkbox 
                    checked={task.done} 
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.done ? 'line-through text-neutral-500' : 'text-neutral-950'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-neutral-600">
                      {task.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Composant Liste des tâches
const TaskList: React.FC<{ tasks: any[] }> = ({ tasks }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">Aucune tâche supplémentaire</h3>
          <p className="text-neutral-600 mb-4">Ajoute-en une pour avancer sur ce projet !</p>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une tâche
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tâches supplémentaires</CardTitle>
          <Button size="sm" onClick={() => setIsAddingTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Liste des tâches */}
      </CardContent>
    </Card>
  );
};

// Composant Panneau latéral d'informations
const SidePanelInfo: React.FC<{ 
  budget: number; 
  roiEstimate: string; 
  risks: string[] 
}> = ({ budget, roiEstimate, risks }) => {
  const [editingRoi, setEditingRoi] = useState(false);
  const [roiText, setRoiText] = useState(roiEstimate);

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      {/* Budget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Euro className="w-4 h-4 text-primary" />
            Budget estimé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {budget.toLocaleString('fr-FR')} €
          </div>
          <p className="text-sm text-neutral-600">Budget annuel prévisionnel</p>
        </CardContent>
      </Card>

      {/* ROI */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            ROI estimé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingRoi ? (
            <div className="space-y-3">
              <Textarea
                value={roiText}
                onChange={(e) => setRoiText(e.target.value)}
                placeholder="Décris le retour sur investissement attendu..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setEditingRoi(false)}>
                  Sauvegarder
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setRoiText(roiEstimate);
                  setEditingRoi(false);
                }}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-neutral-700 mb-3">{roiText}</p>
              <Button size="sm" variant="outline" onClick={() => setEditingRoi(true)}>
                Modifier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risques */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Risques identifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                <span className="text-neutral-700">{risk}</span>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" className="mt-4 w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un risque
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Convertir en fiche logiciel
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Inviter un collègue
          </Button>
          {import.meta.env.VITE_ENABLE_PDF === 'true' && (
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Exporter le projet (PDF)
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Composant principal
export const PurchaseProjectPage: React.FC = () => {
  const getGlobalStatus = (currentStep: string) => {
    switch (currentStep) {
      case 'STEP1':
        return { label: 'Besoin validé', variant: 'secondary' as const, className: 'bg-success/10 text-success border-success/20' };
      case 'STEP2':
        return { label: 'Comparaison en cours', variant: 'secondary' as const, className: 'bg-warning/10 text-warning border-warning/20' };
      case 'STEP3':
        return { label: 'Validation interne', variant: 'secondary' as const, className: 'bg-primary/10 text-primary border-primary/20' };
      case 'STEP4':
        return { label: 'Signature & déploiement', variant: 'secondary' as const, className: 'bg-primary/10 text-primary border-primary/20' };
      case 'DONE':
        return { label: 'Terminé', variant: 'secondary' as const, className: 'bg-success/10 text-success border-success/20' };
      default:
        return { label: 'En attente', variant: 'outline' as const, className: '' };
    }
  };

  const globalStatus = getGlobalStatus(mockProject.status);

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-950 mb-2">
                Projet d'achat — {mockProject.name}
              </h1>
              <Badge variant={globalStatus.variant} className={globalStatus.className}>
                {globalStatus.label}
              </Badge>
            </div>
          </div>

          {/* Bandeau info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={mockProject.requester.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {mockProject.requester.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-neutral-950">
                      Créé depuis la demande de <span className="font-medium">{mockProject.requester.name}</span>, 
                      le {new Date(mockProject.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-neutral-600">{mockProject.requester.department}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir la demande
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectTimeline steps={mockProject.steps} />
            <TaskList tasks={mockProject.tasks} />
          </div>
          <aside>
            <SidePanelInfo 
              budget={mockProject.budget}
              roiEstimate={mockProject.roiEstimate}
              risks={mockProject.risks}
            />
          </aside>
        </section>
      </div>
    </main>
  );
};