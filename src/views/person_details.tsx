import React from 'react';
import { Icons } from '../components/icons';
import { Person } from '../models/app_types';

interface PersonDetailsProps {
  person: Person;
  onBack: () => void;
  onTalentClick?: () => void;
}

export function PersonDetails({ person, onBack, onTalentClick }: PersonDetailsProps) {
  if (!person) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        <div className="bg-primary px-6 py-6 text-white flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center text-gray-500">
          Membre introuvable.
        </div>
      </div>
    );
  }

  const personAny = person as any;
  const fullName = `${person.firstName} ${person.lastName}`;
  const displayName = personAny.useTotemAsMainName && personAny.totemName ? personAny.totemName : fullName;

  return (
    <div className="flex-1 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative h-full">
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
            className="p-2 -ml-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"
          >
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => onTalentClick && onTalentClick()} 
            className="p-2 -mr-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none"
          >
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 64C337.7 64 352 78.3 352 96L352 304C352 312.8 359.2 320 368 320C376.8 320 384 312.8 384 304L384 128C384 110.3 398.3 96 416 96C433.7 96 448 110.3 448 128L448 304C448 312.8 455.2 320 464 320C472.8 320 480 312.8 480 304L480 192C480 174.3 494.3 160 512 160C529.7 160 544 174.3 544 192L544 370.2C524.8 375.6 509.3 390.6 503.6 410.5L497.1 433.2L474.4 439.7C449.2 446.9 431.9 469.9 431.9 496.1C431.9 518.2 444.3 538.1 463.3 548C435.8 565.8 403.1 576.1 367.9 576.1L348.7 576.1C289.1 576.1 231.8 553.2 188.7 512.1L76.4 405C60.4 389.8 59.8 364.4 75 348.4C90.2 332.4 115.6 331.8 131.6 347L192.1 404.6C192.1 403.1 192 401.5 192 400L192 128C192 110.3 206.3 96 224 96C241.7 96 256 110.3 256 128L256 304C256 312.8 263.2 320 272 320C280.8 320 288 312.8 288 304L288 96C288 78.3 302.3 64 320 64zM312.7 390.6C311.6 386.7 308 384 304 384C300 384 296.4 386.7 295.3 390.6L288 416L262.6 423.3C258.7 424.4 256 428 256 432C256 436 258.7 439.6 262.6 440.7L288 448L295.3 473.4C296.4 477.3 300 480 304 480C308 480 311.6 477.3 312.7 473.4L320 448L345.4 440.7C349.3 439.6 352 436 352 432C352 428 349.3 424.4 345.4 423.3L320 416L312.7 390.6zM104 184L152.3 197.8C156.9 199.1 160 203.3 160 208C160 212.7 156.9 216.9 152.3 218.2L104 232L90.2 280.3C88.9 284.9 84.7 288 80 288C75.3 288 71.1 284.9 69.8 280.3L56 232L7.7 218.2C3.1 216.9 0 212.7 0 208C0 203.3 3.1 199.1 7.7 197.8L56 184L69.8 135.7C71.1 131.1 75.3 128 80 128C84.7 128 88.9 131.1 90.2 135.7L104 184zM584 472L632.3 485.8C636.9 487.1 640 491.3 640 496C640 500.7 636.9 504.9 632.3 506.2L584 520L570.2 568.3C568.9 572.9 564.7 576 560 576C555.3 576 551.1 572.9 549.8 568.3L536 520L487.7 506.2C483.1 504.9 480 500.7 480 496C480 491.3 483.1 487.1 487.7 485.8L536 472L549.8 423.7C551.1 419.1 555.3 416 560 416C564.7 416 568.9 419.1 570.2 423.7L584 472z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white relative z-20 px-6 pb-32">
        
        {/* Avatar and Info Row */}
        <div className="flex px-2 mb-4">
          <div className="-mt-12 w-24 h-24 rounded-full bg-white border-[6px] border-white overflow-hidden flex items-center justify-center text-gray-400 flex-shrink-0 z-30 relative shrink-0">
            {personAny.photoURL ? (
              <img src={personAny.photoURL} alt="Profil" className="w-full h-full object-cover" />
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
            href={(personAny.phone || person.phone) ? `tel:${personAny.phone || person.phone}` : '#'}
            className="flex-1 bg-primary text-white font-semibold h-12 rounded-full hover:bg-primary-dark transition-colors text-sm text-center flex items-center justify-center"
          >
            Contacter
          </a>
          {personAny.email ? (
            <a href={`mailto:${personAny.email}`} className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
              <Icons.Send className="w-5 h-5 -ml-0.5 mt-0.5" />
            </a>
          ) : (
            <button disabled className="w-12 h-10 bg-gray-100 flex items-center justify-center rounded-full text-gray-400">
              <Icons.Send className="w-5 h-5 -ml-0.5 mt-0.5 opacity-50" />
            </button>
          )}
        </div>

        <div className="space-y-4 max-w-lg mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Informations Personnelles
              </h3>
              <div className="flex flex-col">
                <DetailRow icon={<Icons.User />} label="Nom complet" value={fullName} />
                <DetailRow icon={<Icons.Calendar />} label="Date de naissance" value={personAny.birthDate} />
                <DetailRow icon={<Icons.MapPin />} label="Lieu de naissance" value={personAny.birthPlace} />
                <DetailRow icon={<Icons.MapPin />} label="Adresse" value={personAny.address} />
                <DetailRow icon={<Icons.Phone />} label="Téléphone" value={personAny.phone || person.phone} />
                <DetailRow icon={<Icons.Mail />} label="Email" value={personAny.email} borderBottom={false} />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Profil Scout
              </h3>
              <div className="flex flex-col">
                <DetailRow icon={<Icons.Badge />} label="Totem" value={personAny.totem} />
                <DetailRow icon={<Icons.Building2 />} label="Groupe" value={personAny.groupe} />
                <DetailRow icon={<Icons.Users />} label="Branche" value={personAny.branche} />
                <DetailRow icon={<Icons.BookOpen />} label="Étape" value={personAny.etape} />
                <DetailRow icon={<Icons.Briefcase />} label="Responsabilité" value={personAny.responsabilite || person.role} />
                <DetailRow icon={<Icons.Calendar />} label="Inscrit depuis le" value={person.dateAdded ? new Date(person.dateAdded).toLocaleDateString("fr-FR") : null} borderBottom={false} />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Scolarité
              </h3>
              <div className="flex flex-col">
                <DetailRow icon={<Icons.Building2 />} label="Établissement" value={personAny.school} />
                <DetailRow icon={<Icons.BookOpen />} label="Classe" value={personAny.schoolClass} borderBottom={false} />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Famille
              </h3>
              <div className="flex flex-col">
                <DetailRow icon={<Icons.Users />} label="Nombre de frères et sœurs" value={personAny.siblingsCount} />
                
                {personAny.fatherName && (
                  <>
                    <h4 className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50">Père</h4>
                    <DetailRow icon={<Icons.User />} label="Nom" value={personAny.fatherName} />
                    <DetailRow icon={<Icons.Briefcase />} label="Profession" value={personAny.fatherProfession} />
                    <DetailRow icon={<Icons.Phone />} label="Téléphone" value={personAny.fatherPhone} />
                  </>
                )}
                
                {personAny.motherName && (
                  <>
                    <h4 className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50">Mère</h4>
                    <DetailRow icon={<Icons.User />} label="Nom" value={personAny.motherName} />
                    <DetailRow icon={<Icons.Briefcase />} label="Profession" value={personAny.motherProfession} />
                    <DetailRow icon={<Icons.Phone />} label="Téléphone" value={personAny.motherPhone} />
                  </>
                )}
                
                {personAny.tuteurName && (
                  <>
                    <h4 className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50">Tuteur</h4>
                    <DetailRow icon={<Icons.User />} label="Nom" value={personAny.tuteurName} />
                    <DetailRow icon={<Icons.Briefcase />} label="Profession" value={personAny.tuteurProfession} />
                    <DetailRow icon={<Icons.Phone />} label="Téléphone" value={personAny.tuteurPhone} />
                  </>
                )}

                {personAny.tutriceName && (
                  <>
                    <h4 className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-50">Tutrice</h4>
                    <DetailRow icon={<Icons.User />} label="Nom" value={personAny.tutriceName} />
                    <DetailRow icon={<Icons.Briefcase />} label="Profession" value={personAny.tutriceProfession} />
                    <DetailRow icon={<Icons.Phone />} label="Téléphone" value={personAny.tutricePhone} borderBottom={false} />
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-5 py-4 text-sm font-semibold tracking-wide text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100">
                Informations Médicales
              </h3>
              <div className="flex flex-col">
                <DetailRow icon={<Icons.Info />} label="Maladies fréquentes" value={personAny.commonIllness} />
                <DetailRow icon={<Icons.Info />} label="Intolérances alimentaires" value={personAny.foodIntolerance} borderBottom={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

function DetailRow({ icon, label, value, borderBottom = true }: { icon: React.ReactNode, label: string, value: string | null | undefined, borderBottom?: boolean }) {
  if (!value || value === '-') return null;
  return (
    <div className={`px-5 py-4 flex items-start gap-4 ${borderBottom ? 'border-b border-gray-100' : ''}`}>
      <div className="mt-0.5 text-gray-400 w-5 h-5 flex-shrink-0">
        {icon}
      </div>
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
