// path: src/layouts/Sidebar.tsx
import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Layers, 
  FilePlus, 
  Briefcase, 
  Upload, 
  Bell,
  Settings
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  role: 'ADMIN' | 'USER';
  unread: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  role, 
  unread, 
  isOpen = true,
  onClose 
}) => {
  // Mock active route - dans une vraie app, utiliser useLocation()
  const [activeRoute, setActiveRoute] = React.useState('/dashboard');

  const adminMenuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      route: '/dashboard' 
    },
    { 
      icon: Layers, 
      label: 'Logiciels', 
      route: '/softwares' 
    },
    { 
      icon: FilePlus, 
      label: 'Demandes', 
      route: '/requests' 
    },
    { 
      icon: Briefcase, 
      label: 'Projets', 
      route: '/projects' 
    },
    { 
      icon: Upload, 
      label: 'Import', 
      route: '/import' 
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      route: '/notifications',
      badge: unread 
    },
    { 
      icon: Settings, 
      label: 'Bêta & Flags', 
      route: '/beta-flags' 
    }
  ];

  const userMenuItems = [
    { 
      icon: Trophy, 
      label: 'Réalisations', 
      route: '/achievements' 
    },
    { 
      icon: Layers, 
      label: 'Logiciels', 
      route: '/softwares' 
    },
    { 
      icon: FilePlus, 
      label: 'Demandes', 
      route: '/requests' 
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      route: '/notifications',
      badge: unread 
    }
  ];

  const menuItems = role === 'ADMIN' ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-950 
        border-r border-neutral-300 dark:border-neutral-700 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-300 dark:border-neutral-700">
          <a href="/" className="flex items-center gap-2" aria-label="Accueil ClearStack">
            <img className="h-7 dark:hidden" src="/brand/clearstack-logo.svg" alt="ClearStack" />
            <img className="h-7 hidden dark:block" src="/brand/clearstack-logo-dark.svg" alt="ClearStack" />
          </a>
          
          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              isActive={activeRoute === item.route}
              badge={item.badge}
              onClick={() => {
                setActiveRoute(item.route);
                // Dans une vraie app : navigate(item.route)
                onClose?.(); // Fermer sur mobile après clic
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-300 dark:border-neutral-700">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
            ClearStack v1.0
          </div>
        </div>
      </aside>
    </>
  );
};