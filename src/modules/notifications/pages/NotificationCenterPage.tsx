// path: src/modules/notifications/pages/NotificationCenterPage.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { registerPush, unregisterPush } from '@/lib/push';
import { toast } from 'sonner';
import { 
  Bell, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Mail,
  Smartphone,
  Plus,
  Eye
} from 'lucide-react';

// Types pour les notifications selon le PROMPT MASTER
interface Notification {
  id: string;
  type: 'ALERT_CONTRACT' | 'REQUEST' | 'PROJECT_TASK' | 'SYSTEM';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  payload?: any;
}

// Mock data conforme au PROMPT MASTER
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'ALERT_CONTRACT',
    title: 'Échéance contrat Slack',
    description: 'Le contrat expire dans 15 jours. Préavis de 30 jours requis.',
    timestamp: '2024-01-28T10:30:00Z',
    read: false,
    payload: { contract_id: 'c1', software_name: 'Slack', days_remaining: 15 }
  },
  {
    id: '2',
    type: 'REQUEST',
    title: 'Nouvelle demande : Canva Pro',
    description: 'Marie Dubois demande l\'ajout de Canva Pro pour l\'équipe Marketing.',
    timestamp: '2024-01-28T09:15:00Z',
    read: false,
    payload: { request_id: 'r1', requester: 'Marie Dubois', software: 'Canva Pro' }
  },
  {
    id: '3',
    type: 'PROJECT_TASK',
    title: 'Tâche assignée : Négociation Figma',
    description: 'Vous devez négocier le prix pour le projet Figma Enterprise.',
    timestamp: '2024-01-27T16:45:00Z',
    read: true,
    payload: { task_id: 't1', project_id: 'p1', task_title: 'Négocier le prix' }
  },
  {
    id: '4',
    type: 'SYSTEM',
    title: 'Rapport hebdomadaire disponible',
    description: 'Votre digest hebdomadaire des activités ClearStack est prêt.',
    timestamp: '2024-01-27T08:00:00Z',
    read: true,
    payload: { report_type: 'weekly_digest' }
  }
];

// Composant NotificationItem selon les spécifications
const NotificationItem: React.FC<{
  notification: Notification;
  onQuickAction: (id: string, action: string) => void;
}> = ({ notification, onQuickAction }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'ALERT_CONTRACT':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      case 'REQUEST':
        return <FileText className="w-5 h-5 text-primary-600" />;
      case 'PROJECT_TASK':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'SYSTEM':
        return <Bell className="w-5 h-5 text-neutral-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getQuickAction = () => {
    switch (notification.type) {
      case 'ALERT_CONTRACT':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onQuickAction(notification.id, 'view_contract')}
          >
            <Eye className="w-3 h-3 mr-1" />
            Voir contrat
          </Button>
        );
      case 'REQUEST':
        return (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              className="bg-success-500 hover:bg-success-600 text-white"
              onClick={() => onQuickAction(notification.id, 'approve')}
            >
              Approuver
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onQuickAction(notification.id, 'vote')}
            >
              <Plus className="w-3 h-3 mr-1" />
              +1
            </Button>
          </div>
        );
      case 'PROJECT_TASK':
        return (
          <div className="flex items-center gap-2">
            <Checkbox 
              id={`task-${notification.id}`}
              onCheckedChange={(checked) => 
                onQuickAction(notification.id, checked ? 'mark_done' : 'mark_todo')
              }
            />
            <label htmlFor={`task-${notification.id}`} className="text-sm">
              Fait
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <li className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
      !notification.read 
        ? 'bg-primary-100/20 border-primary-600/20 font-medium' 
        : 'bg-white border-neutral-300'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-neutral-950`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs bg-primary-600 text-white">
                Nouveau
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-neutral-600 mb-2">
            {notification.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(notification.timestamp)}
            </span>
            
            <div className="flex items-center gap-2">
              {getQuickAction()}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

// Composant NotificationFilters selon les spécifications
const NotificationFilters: React.FC<{
  filter: 'ALL' | 'CONTRACT' | 'REQUEST' | 'PROJECT' | 'SYSTEM';
  onFilterChange: (filter: 'ALL' | 'CONTRACT' | 'REQUEST' | 'PROJECT' | 'SYSTEM') => void;
  onMarkAllRead: () => void;
  unreadCount: number;
}> = ({ filter, onFilterChange, onMarkAllRead, unreadCount }) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Button
        variant={filter === 'ALL' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('ALL')}
        className={filter === 'ALL' ? 'bg-primary-600' : ''}
      >
        Toutes
      </Button>
      <Button
        variant={filter === 'CONTRACT' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('CONTRACT')}
        className={filter === 'CONTRACT' ? 'bg-primary-600' : ''}
      >
        Échéances
      </Button>
      <Button
        variant={filter === 'REQUEST' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('REQUEST')}
        className={filter === 'REQUEST' ? 'bg-primary-600' : ''}
      >
        Demandes
      </Button>
      <Button
        variant={filter === 'PROJECT' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('PROJECT')}
        className={filter === 'PROJECT' ? 'bg-primary-600' : ''}
      >
        Projets
      </Button>
      <Button
        variant={filter === 'SYSTEM' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('SYSTEM')}
        className={filter === 'SYSTEM' ? 'bg-primary-600' : ''}
      >
        Système
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-2" />
      
      {unreadCount > 0 && (
        <Button variant="outline" size="sm" onClick={onMarkAllRead}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Marquer tout comme lu
        </Button>
      )}
    </div>
  );
};

// Composant SettingsDrawer selon les spécifications
const SettingsDrawer: React.FC<{
  emailCritical: boolean;
  pushNotifications: boolean;
  onEmailChange: (enabled: boolean) => void;
  onPushChange: (enabled: boolean) => void;
}> = ({ emailCritical, pushNotifications, onEmailChange, onPushChange }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Réglages
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Paramètres de notification</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-600" />
                <div>
                  <div className="text-sm font-medium">Emails critiques</div>
                  <div className="text-xs text-neutral-600">Échéances et alertes importantes</div>
                </div>
              </div>
              <Switch
                checked={emailCritical}
                onCheckedChange={onEmailChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-neutral-600" />
                <div>
                  <div className="text-sm font-medium">Notifications push</div>
                  <div className="text-xs text-neutral-600">Notifications navigateur</div>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={onPushChange}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="text-xs text-neutral-600">
            Les paramètres sont sauvegardés automatiquement.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Composant principal selon la structure suggérée
const NotificationCenterPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'CONTRACT' | 'REQUEST' | 'PROJECT' | 'SYSTEM'>('ALL');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [emailCritical, setEmailCritical] = useState(true); // ON par défaut
  const [pushNotifications, setPushNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'ALL') return true;
    if (filter === 'CONTRACT') return notification.type === 'ALERT_CONTRACT';
    if (filter === 'REQUEST') return notification.type === 'REQUEST';
    if (filter === 'PROJECT') return notification.type === 'PROJECT_TASK';
    if (filter === 'SYSTEM') return notification.type === 'SYSTEM';
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // récentes → anciennes

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleQuickAction = (id: string, action: string) => {
    // TODO: Connecter à l'API selon l'action
    console.log(`Action ${action} sur notification ${id}`);
    
    // Marquer comme lu après action
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await registerPush();
      if (!result.ok) {
        toast.error('Impossible d\'activer les notifications push', {
          description: result.reason === 'unsupported' 
            ? 'Votre navigateur ne supporte pas les notifications push'
            : 'Une erreur est survenue lors de l\'activation'
        });
        return;
      }
      toast.success('Notifications push activées');
    } else {
      const result = await unregisterPush();
      if (!result.ok) {
        toast.error('Erreur lors de la désactivation des notifications push');
        return;
      }
      toast.success('Notifications push désactivées');
    }
    setPushNotifications(enabled);
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header selon les spécifications */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-neutral-950 flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary-600" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary-600 text-white ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            
            <SettingsDrawer
              emailCritical={emailCritical}
              pushNotifications={pushNotifications}
              onEmailChange={setEmailCritical}
              onPushChange={handlePushToggle}
            />
          </div>

          {/* Filtres selon les spécifications */}
          <NotificationFilters
            filter={filter}
            onFilterChange={setFilter}
            onMarkAllRead={handleMarkAllRead}
            unreadCount={unreadCount}
          />
        </div>

        {/* Liste selon les spécifications (ordre : récentes → anciennes) */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="font-semibold text-neutral-950 mb-2">
                Aucune notification pour l'instant 👌
              </h3>
              <p className="text-neutral-600 mb-4">
                Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600">
                <Users className="w-4 h-4 mr-2" />
                Inviter un collègue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onQuickAction={handleQuickAction}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default NotificationCenterPage;