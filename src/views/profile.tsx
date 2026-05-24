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
      transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
      className="flex-1 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative min-h-screen"
    >
      {/* Cover Background */}
      <div 
        className="h-32 bg-gray-200 relative rounded-b-[2.5rem] shadow-sm overflow-hidden" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Header buttons over cover */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-6 flex items-center justify-between z-10 text-white">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none backdrop-blur-sm bg-black/10"
          >
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 -mr-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none backdrop-blur-sm bg-black/10"
          >
            <Icons.Edit className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="bg-white relative z-20 px-6 pb-8">
        
        {/* Avatar and Info Row */}
        <div className="flex px-2 mb-4">
          <div className="-mt-12 w-24 h-24 rounded-full bg-white border-[6px] border-white overflow-hidden flex items-center justify-center text-gray-400 flex-shrink-0 z-30 relative shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <Icons.User className="w-12 h-12" />
            )}
          </div>
          
          <div className="flex flex-col justify-center ml-4 mt-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              {displayName}
            </h2>
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mb-6 px-2">
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <a 
            href={user.phone ? `tel:${user.phone}` : '#'}
            className="flex-1 bg-primary text-white font-semibold h-12 rounded-full hover:bg-primary-dark transition-colors text-sm text-center flex items-center justify-center"
          >
            Contacter
          </a>
          <a href={`mailto:${user.email}`} className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
            <Icons.Send className="w-5 h-5 -ml-0.5 mt-0.5" />
          </a>
        </div>

        <div className="space-y-4 max-w-lg mx-auto w-full">
          <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

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
    </motion.div>
  );
}

function InfoItem({ icon, label, value, borderBottom = true }: { icon?: React.ReactNode, label: string, value: string | null | undefined, borderBottom?: boolean }) {
  if (!value || value === '-') return null;
  return (
    <div className={`px-5 py-4 flex items-start gap-4 ${borderBottom ? 'border-b border-gray-100' : ''}`}>
      {icon && <div className="mt-0.5 text-gray-400 w-5 h-5 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</div>
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
    case 'Lovitao': return 'Lovitao (Louveteaux / Sampana Mavo)';
    case 'Tily': return 'Tily (Éclaireurs / Sampana Maitso)';
    case 'Voronkely': return 'Voronkely (Branche Jaune / Sampana Mavo)';
    case 'Mpanazava': return 'Mpanazava (Branche Verte / Sampana Maitso)';
    case 'Mpiandalana': return 'Mpiandalana (Routiers / Sampana Mena)';
    case 'Mpitarika': return 'Mpitarika (Branche Aînée / Sampana Mena)';
    case 'Afo': return 'Afo (Branche Rouge / Sampana Mena)';
    default: return branche || '-';
  }
}
