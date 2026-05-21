import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/icons';
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

  const fullName = `${user.firstName} ${user.lastName}`;
  const displayName = user.useTotemAsMainName && user.totemName ? user.totemName : fullName;

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 bg-gray-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Custom Header matching the image design */}
      <div className="bg-gray-100 px-6 pt-6 pb-16 relative transition-colors duration-300">
        <div className="flex items-center justify-between relative z-10 text-gray-800">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none"
          >
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 -mr-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none"
          >
            <Icons.Edit className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area with rounded top overlapping the red header */}
      <div className="bg-gray-50 rounded-t-[2.5rem] -mt-10 relative z-20 min-h-screen">
        <div className="px-6 py-8 space-y-6 max-w-lg mx-auto w-full">
          
          {/* Header info matching the image style (Avatar on left, text on right) */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-gray-400 flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <Icons.User className="w-10 h-10" />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm text-gray-500 font-medium tracking-wide uppercase">Mon profil</span>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight mt-0.5">
                {displayName}
              </h2>
              <div className="mt-1">
                <span className="inline-block px-3 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-[11px] rounded-full uppercase tracking-wider">
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Informations Personnelles
              </h3>
              <div className="flex flex-col">
                {user.useTotemAsMainName && user.totemName && (
                  <InfoItem icon={<Icons.User />} label="Nom complet" value={fullName} />
                )}
                <InfoItem icon={<Icons.Mail />} label="Email" value={user.email} />
                <InfoItem icon={<Icons.Calendar />} label="Date de naissance" value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : null} />
                <InfoItem icon={<Icons.MapPin />} label="Adresse" value={user.address} />
                <InfoItem icon={<Icons.Phone />} label="Téléphone" value={user.phone} borderBottom={false} />
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Profil Scout
              </h3>
              <div className="flex flex-col">
                {user.hasTotem === 'oui' && (
                  <InfoItem icon={<Icons.Badge />} label="Totem" value={user.totemName} />
                )}
                
                {(user.role === 'tonia' || user.role === 'mpiandraikitra') && (
                  <InfoItem icon={<Icons.Building2 />} label="Groupe" value={user.groupe} />
                )}
                
                {(user.role === 'kp' || user.role === 'fmt2s' || (user.role === 'mpiandraikitra' && user.groupe !== '')) && (
                  <InfoItem icon={<Icons.Users />} label="Branche" value={formatBranche(user.branche)} />
                )}
                
                {(user.role === 'mpiandraikitra' && user.branche !== '') && (
                   <InfoItem icon={<Icons.Briefcase />} label="Responsabilité" value={user.fonctionBranche} />
                )}
                
                {(user.role === 'tonia' || user.role === 'mpiandraikitra') && user.groupe !== '' && (
                  <InfoItem icon={<Icons.BookOpen />} label="Étape de formation" value={user.etapeFormation} />
                )}

                <InfoItem icon={<Icons.Calendar />} label="Date d'intégration" value={user.joinDate ? new Date(user.joinDate).toLocaleDateString('fr-FR') : null} />
                <InfoItem icon={<Icons.Star />} label="Date de promesse" value={user.promesseGuideDate ? new Date(user.promesseGuideDate).toLocaleDateString('fr-FR') : null} />
                <InfoItem icon={<Icons.Shield />} label="Promesse de chef" value={user.promesseChefDate ? new Date(user.promesseChefDate).toLocaleDateString('fr-FR') : null} borderBottom={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value, borderBottom = true }: { icon?: React.ReactNode, label: string, value: string | null | undefined, borderBottom?: boolean }) {
  if (!value || value === '-') return null;
  return (
    <div className={`px-5 py-4 flex items-start gap-4 ${borderBottom ? 'border-b border-gray-100' : ''}`}>
      {icon && <div className="mt-0.5 text-gray-400 w-5 h-5 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-sm font-medium text-gray-900 break-words">{value}</div>
      </div>
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
    case 'Lovitao': return 'Lovitao (Louveteaux)';
    case 'Tily': return 'Tily (Éclaireurs)';
    case 'Voronkely': return 'Voronkely (Branche Jaune)';
    case 'Mpanazava': return 'Mpanazava (Branche Verte)';
    case 'Mpiandalana': return 'Mpiandalana (Routiers)';
    case 'Mpitarika': return 'Mpitarika (Branche Aînée)';
    case 'Afo': return 'Afo (Branche Rouge)';
    default: return branche || '-';
  }
}
