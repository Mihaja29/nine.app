import React from 'react';
import { Icons } from '../components/icons';
import { TopBar } from '../components/top_bar';

interface ProfileProps {
  user: any;
  onBack: () => void;
}

export function Profile({ user, onBack }: ProfileProps) {
  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <TopBar 
        title="Mon Profil" 
        onBackClick={onBack}
      />

      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden mb-4 flex items-center justify-center text-gray-300">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <Icons.User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">
            {user.useTotemAsMainName && user.totemName ? user.totemName : `${user.firstName} ${user.lastName}`}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Informations Personnelles" />
          <div className="flex flex-col">
            {user.useTotemAsMainName && user.totemName && (
              <InfoItem label="Nom complet" value={`${user.firstName} ${user.lastName}`} />
            )}
            <InfoItem label="Email" value={user.email || '-'} />
            <InfoItem label="Date de naissance" value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : '-'} />
            <InfoItem label="Adresse" value={user.address || '-'} />
            <InfoItem label="Téléphone" value={user.phone || '-'} borderBottom={false} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Informations scoutes" />
          <div className="flex flex-col">
            {user.hasTotem === 'oui' && (
              <InfoItem label="Totem" value={user.totemName || '-'} />
            )}
            <InfoItem label="Rôle / Comité" value={formatRole(user.role)} />
            
            {(user.role === 'tonia' || user.role === 'mpiandraikitra') && (
              <InfoItem label="Groupe" value={user.groupe || '-'} />
            )}
            
            {(user.role === 'kp' || user.role === 'fmt2s' || (user.role === 'mpiandraikitra' && user.groupe !== '')) && (
              <InfoItem label="Branche" value={formatBranche(user.branche) || '-'} />
            )}
            
            {(user.role === 'mpiandraikitra' && user.branche !== '') && (
               <InfoItem label="Responsabilité" value={user.fonctionBranche || '-'} />
            )}
            
            {(user.role === 'tonia' || user.role === 'mpiandraikitra') && user.groupe !== '' && (
              <InfoItem label="Étape de formation" value={user.etapeFormation || '-'} />
            )}

            <InfoItem label="Date d'intégration" value={user.joinDate ? new Date(user.joinDate).toLocaleDateString('fr-FR') : '-'} />
            
            <InfoItem label="Date de promesse" value={user.promesseGuideDate ? new Date(user.promesseGuideDate).toLocaleDateString('fr-FR') : '-'} />
            
            <InfoItem label="Date de promesse de chef" value={user.promesseChefDate ? new Date(user.promesseChefDate).toLocaleDateString('fr-FR') : '-'} />
            
            {/* Keeping spacing clean at the bottom */}
            <div className="border-b border-gray-100 hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 sm:bg-white sm:border-b border-gray-100">
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function InfoItem({ label, value, borderBottom = true }: { label: string, value: string, borderBottom?: boolean }) {
  return (
    <div className={`px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 ${borderBottom ? 'border-b border-gray-50' : ''}`}>
      <span className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-gray-900 sm:text-right break-words">{value}</span>
    </div>
  );
}

function formatRole(role: string) {
  switch (role) {
    case 'kp': return 'Komitim-pivondronana (KP)';
    case 'fmt2s': return 'FMT2S';
    case 'tonia': return 'Tonia / Mpandrindra';
    case 'mpiandraikitra': return 'Mpiandraikitra';
    default: return role || '-';
  }
}

function formatBranche(branche: string) {
  switch (branche) {
    case 'Lovitao': return 'Lovitao (Louveteaux / Sampana Mavo)';
    case 'Tily': return 'Tily (Éclaireurs / Sampana Maitso)';
    case 'Voronkely': return 'Voronkely (Branche Jaune / Sampana Mavo)';
    case 'Mpanazava': return 'Mpanazava (Branche Verte / Sampana Maitso)';
    case 'Mpiandalana': return 'Mpiandalana (Routiers / Sampana Mena)';
    case 'Mpitarika': return 'Mpitarika (Branche Aînée / Sampana Menafify)';
    case 'Afo': return 'Afo ou Mpanazava Zokiny (Branche Rouge / Sampana Mena)';
    default: return branche || '-';
  }
}
