// path: src/layouts/SidebarItem.tsx
import React from 'react';

interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  badge,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
        ${isActive 
          ? 'bg-primary-100 text-primary-600 font-medium' 
          : 'text-neutral-950 hover:bg-primary-100/50 hover:text-primary-600'
        }
      `}
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};