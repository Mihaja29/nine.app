import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/icons';
import { TopBar } from '../components/top_bar';
import { ProfileSetup } from './profile_setup';

interface ProfileProps {
  user: any;
  onBack: () => void;
}

export function Profile({ user, onBack }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  if (isEditing) {
    return (
      <ProfileSetup 
        user={user} 
        onComplete={() => setIsEditing(false)} 
        onBack={() => setIsEditing(false)} 
      />
    );
  }

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 flex flex-col bg-gray-50 pb-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <TopBar 
        title="Mon Profil" 
        onBackClick={onBack}
        rightActions={
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-primary flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"/></svg>
          </button>
        }
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
    </motion.div>
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
