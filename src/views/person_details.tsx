import React from 'react';
import { Icons } from '../components/icons';
import { TopBar } from '../components/top_bar';
import { Person } from '../models/app_types';

interface PersonDetailsProps {
  person: Person;
  onBack: () => void;
}

export function PersonDetails({ person, onBack }: PersonDetailsProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      <TopBar 
        title="" 
        onBackClick={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col items-center mt-6 mb-8 mt-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
            {(person as any).photoURL ? (
              <img src={(person as any).photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <Icons.User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {(person as any).useTotemAsMainName && (person as any).totemName ? (person as any).totemName : `${person.firstName} ${person.lastName}`}
          </h2>
          <div className="mt-3 px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
            {person.status}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DetailRow icon={<Icons.Mail />} label="Email" value={person.email || '-'} />
          <DetailRow icon={<Icons.Phone />} label="Téléphone" value={person.phone || '-'} />
          <DetailRow icon={<Icons.Briefcase />} label="Fonction" value={person.role || '-'} />
          <DetailRow icon={<Icons.Building2 />} label="Groupe / Branche" value={person.department || '-'} />
          <DetailRow icon={<Icons.Calendar />} label="Inscrit depuis le" value={person.dateAdded ? new Date(person.dateAdded).toLocaleDateString("fr-FR") : '-'} borderBottom={false} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, borderBottom = true }: { icon: React.ReactNode, label: string, value: string, borderBottom?: boolean }) {
  return (
    <div className={`p-4 flex items-start gap-4 ${borderBottom ? 'border-b border-gray-50' : ''}`}>
      <div className="mt-1 text-gray-400 w-5 h-5 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}
