import React from 'react';
import type { View } from '../types';

interface NavItem {
  id: View;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { id: 'create', label: 'Criar Post', icon: '✏️' },
  { id: 'calendar', label: 'Calendário', icon: '📅' },
  { id: 'library', label: 'Biblioteca', icon: '📚' },
];

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  clientCount: number;
  postCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, clientCount, postCount }) => {
  return (
    <aside className="w-64 min-h-screen bg-app-card border-r border-app-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <div>
            <h1 className="text-app-text font-heading font-bold text-lg leading-tight">Lumina Social</h1>
            <p className="text-app-text2 text-xs">Gerenciador de Mídias</p>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="px-4 py-3 border-b border-app-border">
        <div className="flex gap-2">
          <div className="flex-1 bg-app-card2 rounded-lg p-2 text-center">
            <p className="text-accent font-bold text-lg font-heading">{clientCount}</p>
            <p className="text-app-text2 text-xs">Clientes</p>
          </div>
          <div className="flex-1 bg-app-card2 rounded-lg p-2 text-center">
            <p className="text-accent-light font-bold text-lg font-heading">{postCount}</p>
            <p className="text-app-text2 text-xs">Posts</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeView === item.id
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'text-app-text2 hover:bg-app-card2 hover:text-app-text'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {activeView === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-app-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-app-card2">
          <div className="w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center text-accent text-xs font-bold">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-app-text text-xs font-medium truncate">Minha Agência</p>
            <p className="text-app-text2 text-xs truncate">Plano Pro</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-success shrink-0"></span>
        </div>
      </div>
    </aside>
  );
};
