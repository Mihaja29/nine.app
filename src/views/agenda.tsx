import React from 'react';
import { IconSvg18 } from '../components/svg_icons';
import { TopBar } from '../components/top_bar';

interface AgendaProps {
  user: any;
  onProfileClick: () => void;
  onMenuClick?: () => void;
}

export function Agenda({ user, onProfileClick, onMenuClick }: AgendaProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-8 min-h-screen">
      <TopBar title="Agenda" onProfileClick={onProfileClick} user={user} onMenuClick={onMenuClick} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <IconSvg18 />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Votre Agenda</h2>
        <p className="text-gray-500 max-w-sm">
          Planifiez vos événements, réunions et rappels importants ici. (Fonctionnalité à venir)
        </p>
      </div>
    </div>
  );
}
