import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/icons';
import { useProfileSetupViewModel } from '../view_models/use_profile_setup_vm';
import { renderBrancheOptions, renderEtapeFormationOptions, renderFonctionBrancheOptions } from '../utils/scout_options';

interface ProfileProps {
  user: any;
  onBack: () => void;
}

export function Profile({ user, onBack }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'perso' | 'scout'>('perso');

  const {
    lastName, setLastName,
    firstName, setFirstName,
    birthDate, setBirthDate,
    address, setAddress,
    bio, setBio,
    phone, setPhone,
    photoURL, setPhotoURL,
    photoBase64, setPhotoBase64,
    coverPhotoURL, setCoverPhotoURL,
    coverPhotoBase64, setCoverPhotoBase64,
    hasTotem, setHasTotem,
    totemName, setTotemName,
    useTotemAsMainName, setUseTotemAsMainName,
    joinDate, setJoinDate,
    role, setRole,
    groupe, setGroupe,
    branche, setBranche,
    fonctionBranche, setFonctionBranche,
    etapeFormation, setEtapeFormation,
    promesseGuideDay, setPromesseGuideDay,
    promesseGuideMonth, setPromesseGuideMonth,
    promesseGuideYear, setPromesseGuideYear,
    promesseChefDay, setPromesseChefDay,
    promesseChefMonth, setPromesseChefMonth,
    promesseChefYear, setPromesseChefYear,
    loading,
    handleSubmit
  } = useProfileSetupViewModel(user, () => setIsEditing(false), true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
        setPhotoURL(''); // Clear URL if file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoBase64(reader.result as string);
        setCoverPhotoURL(''); // Clear URL if file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : user.lastName;
  const displayName = user.useTotemAsMainName && user.totemName ? user.totemName : fullName;

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
      className="flex-1 bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative h-full"
    >
      {/* Cover Background */}
      <div 
        className="h-32 bg-gray-200 relative rounded-b-[2.5rem] shadow-sm overflow-hidden" 
        style={{ 
          backgroundImage: `url('${coverPhotoBase64 || coverPhotoURL || user.coverPhotoURL || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        {/* Header buttons over cover */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-6 flex items-center justify-between z-10 text-white pointer-events-none">
          <button 
            onClick={isEditing ? () => setIsEditing(false) : onBack} 
            className="p-2 -ml-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none pointer-events-auto"
          >
            {isEditing ? <Icons.X className="w-6 h-6" /> : <Icons.ArrowLeft className="w-6 h-6" />}
          </button>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 -mr-2 rounded-full hover:bg-black/20 transition-colors focus:outline-none bg-transparent text-white border-none pointer-events-auto shadow-sm"
            >
              <Icons.Edit className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        
        {isEditing && (
          <div 
            className="absolute bottom-2 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full cursor-pointer transition-colors z-10"
            onClick={() => coverFileInputRef.current?.click()}
            title="Modifier la photo de couverture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4 text-white fill-current">
              <path d="M257.1 96C238.4 96 220.9 105.4 210.5 120.9L184.5 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L455.5 160L429.5 120.9C419.1 105.4 401.6 96 382.9 96L257.1 96zM250.4 147.6C251.9 145.4 254.4 144 257.1 144L382.8 144C385.5 144 388 145.3 389.5 147.6L422.7 197.4C427.2 204.1 434.6 208.1 442.7 208.1L512 208.1C520.8 208.1 528 215.3 528 224.1L528 480.1C528 488.9 520.8 496.1 512 496.1L128 496C119.2 496 112 488.8 112 480L112 224C112 215.2 119.2 208 128 208L197.3 208C205.3 208 212.8 204 217.3 197.3L250.5 147.5zM320 448C381.9 448 432 397.9 432 336C432 274.1 381.9 224 320 224C258.1 224 208 274.1 208 336C208 397.9 258.1 448 320 448zM256 336C256 300.7 284.7 272 320 272C355.3 272 384 300.7 384 336C384 371.3 355.3 400 320 400C284.7 400 256 371.3 256 336z"/>
            </svg>
            <input 
              type="file" 
              ref={coverFileInputRef}
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="bg-white relative z-20 px-6 pb-32">
        
        {/* Avatar and Info Row */}
        <div className="flex px-2 mb-4">
          <div className="-mt-12 w-24 h-24 rounded-full bg-white border-[6px] border-white flex items-center justify-center text-gray-400 flex-shrink-0 z-30 relative shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden">
              {(photoBase64 || photoURL || user.photoURL) ? (
                <img src={photoBase64 || photoURL || user.photoURL} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <Icons.User className="w-12 h-12" />
              )}
            </div>
            {isEditing && (
              <div 
                className="absolute bottom-0 right-0 bg-white shadow-sm p-1.5 rounded-full cursor-pointer transition-colors border border-gray-200 z-10"
                onClick={() => fileInputRef.current?.click()}
                title="Modifier la photo de profil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4 text-gray-600 fill-current">
                  <path d="M257.1 96C238.4 96 220.9 105.4 210.5 120.9L184.5 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L455.5 160L429.5 120.9C419.1 105.4 401.6 96 382.9 96L257.1 96zM250.4 147.6C251.9 145.4 254.4 144 257.1 144L382.8 144C385.5 144 388 145.3 389.5 147.6L422.7 197.4C427.2 204.1 434.6 208.1 442.7 208.1L512 208.1C520.8 208.1 528 215.3 528 224.1L528 480.1C528 488.9 520.8 496.1 512 496.1L128 496C119.2 496 112 488.8 112 480L112 224C112 215.2 119.2 208 128 208L197.3 208C205.3 208 212.8 204 217.3 197.3L250.5 147.5zM320 448C381.9 448 432 397.9 432 336C432 274.1 381.9 224 320 224C258.1 224 208 274.1 208 336C208 397.9 258.1 448 320 448zM256 336C256 300.7 284.7 272 320 272C355.3 272 384 300.7 384 336C384 371.3 355.3 400 320 400C284.7 400 256 371.3 256 336z"/>
                </svg>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center ml-4 mt-2 w-full pr-2">
            <h2 className={`text-2xl font-bold text-gray-900 tracking-tight leading-tight ${isEditing ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
              {displayName}
            </h2>
            {isEditing && hasTotem === 'oui' && (
              <label className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 cursor-pointer w-max z-30">
                <input 
                  type="checkbox"
                  checked={useTotemAsMainName}
                  onChange={e => setUseTotemAsMainName(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                />
                Utiliser Totem
              </label>
            )}
          </div>
        </div>

        {/* Name and Bio */}
        <div className="mb-6 px-2 flex flex-col text-left text-gray-600 text-sm">
          {isEditing ? (
            <input 
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors"
              placeholder="Entrée votre bio ici"
              maxLength={150}
            />
          ) : user.bio ? (
            <p className="leading-relaxed">{user.bio}</p>
          ) : (
             <p className="italic opacity-70">Aucune biographie pour le moment.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 mb-8 ${isEditing ? 'opacity-30 grayscale pointer-events-none blur-[1px]' : ''}`}>
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

        <div className="max-w-lg mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('perso')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'perso' ? 'text-gray-900 bg-transparent' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
            >
              Infos Personnelles
            </button>
            <button
              onClick={() => setActiveTab('scout')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'scout' ? 'text-gray-900 bg-transparent' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
            >
              Profil Scout
            </button>
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'perso' && (
                <motion.div 
                  key="perso"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden w-full absolute top-0"
                >
                  <div className="flex flex-col py-2">
                    {isEditing ? (
                      <>
                        <InfoItem 
                          icon={<Icons.User />} 
                          label="Prénom" 
                          value={firstName} 
                          isEditing={true} 
                          onChange={e => setFirstName(e.target.value)}
                        />
                        <InfoItem 
                          icon={<Icons.User />} 
                          label="Nom" 
                          value={lastName} 
                          isEditing={true} 
                          onChange={e => setLastName(e.target.value)}
                        />
                      </>
                    ) : (
                      user.useTotemAsMainName && user.totemName && (
                        <InfoItem icon={<Icons.User />} label="Nom complet" value={fullName} isEditing={false} isBlocked={true} />
                      )
                    )}
                    <InfoItem icon={<Icons.Mail />} label="Email" value={user.email} isEditing={isEditing} isBlocked={true} />
                    <InfoItem 
                      icon={<Icons.Calendar />} 
                      label="Date de naissance" 
                      value={isEditing ? birthDate : (user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : null)} 
                      isEditing={isEditing} 
                      onChange={e => setBirthDate(e.target.value)}
                      type="date"
                    />
                    <InfoItem 
                      icon={<Icons.MapPin />} 
                      label="Adresse" 
                      value={isEditing ? address : user.address} 
                      isEditing={isEditing} 
                      onChange={e => setAddress(e.target.value)}
                    />
                    <InfoItem 
                      icon={<Icons.Phone />} 
                      label="Téléphone" 
                      value={isEditing ? phone : user.phone} 
                      isEditing={isEditing} 
                      onChange={e => setPhone(e.target.value)}
                      type="tel"
                      borderBottom={false} 
                    />
                    {isEditing && (
                      <div className="px-5 py-4 w-full flex justify-end">
                        <button 
                          onClick={() => setActiveTab('scout')}
                          className="bg-primary text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-dark transition-colors text-sm"
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'scout' && (
                <motion.div 
                  key="scout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden w-full absolute top-0"
                >
                  <div className="flex flex-col py-2">
                    {(isEditing || user.hasTotem === 'oui') && (
                      <InfoItem 
                        icon={<Icons.Badge />} 
                        label="Totem" 
                        value={isEditing ? totemName : user.totemName} 
                        isEditing={isEditing} 
                        onChange={e => setTotemName(e.target.value)} 
                      />
                    )}
                    
                    {(isEditing || user.role) && (
                      <InfoItem 
                        icon={<Icons.Shield />} 
                        label="Rôle / Comité" 
                        value={isEditing ? role : formatRole(user.role)} 
                        isEditing={isEditing} 
                      >
                        {isEditing && (
                          <div className="relative w-full">
                            <select 
                              value={role}
                              onChange={e => {
                                setRole(e.target.value);
                                setGroupe('');
                                setBranche('');
                                setFonctionBranche('');
                                setEtapeFormation('');
                              }}
                              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors appearance-none pr-6"
                            >
                              <option value="" disabled>Sélectionner...</option>
                              <option value="kp">Komitim-pivondronana (KP)</option>
                              <option value="fmt2s">FMT2S</option>
                              <option value="tonia">Tonia / Mpandrindra</option>
                              <option value="mpiandraikitra">Mpiandraikitra</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-gray-400">
                              <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        )}
                      </InfoItem>
                    )}
                    
                    {(isEditing || user.role === 'tonia' || user.role === 'mpiandraikitra') && (
                      <InfoItem 
                        icon={<Icons.Building2 />} 
                        label="Groupe" 
                        value={isEditing ? groupe : user.groupe} 
                        isEditing={isEditing} 
                      >
                        {isEditing && (
                          <div className="relative w-full">
                            <select 
                              value={groupe}
                              onChange={e => {
                                setGroupe(e.target.value);
                                setBranche('');
                                setFonctionBranche('');
                              }}
                              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors appearance-none pr-6"
                            >
                              <option value="" disabled>Sélectionner...</option>
                              <option value="Tily Eto Madagasikara">Tily Eto Madagasikara</option>
                              <option value="Mpanazava Eto Madagasikara">Mpanazava Eto Madagasikara</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-gray-400">
                              <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        )}
                      </InfoItem>
                    )}
                    
                    {(isEditing || user.role === 'kp' || user.role === 'fmt2s' || (user.role === 'mpiandraikitra' && user.groupe !== '')) && (
                      <InfoItem 
                        icon={<Icons.Users />} 
                        label="Branche" 
                        value={isEditing ? branche : formatBranche(user.branche)} 
                        isEditing={isEditing} 
                      >
                        {isEditing && (
                          <div className="relative w-full">
                            <select 
                              value={branche}
                              onChange={e => {
                                setBranche(e.target.value);
                                setFonctionBranche('');
                              }}
                              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors appearance-none pr-6"
                            >
                              <option value="" disabled>Sélectionner...</option>
                              {renderBrancheOptions(role, groupe)}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-gray-400">
                              <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        )}
                      </InfoItem>
                    )}
                    
                    {(isEditing || (user.role === 'mpiandraikitra' && user.branche !== '')) && (
                       <InfoItem 
                         icon={<Icons.Briefcase />} 
                         label="Responsabilité" 
                         value={isEditing ? fonctionBranche : user.fonctionBranche} 
                         isEditing={isEditing} 
                       >
                         {isEditing && (
                          <div className="relative w-full">
                            <select 
                              value={fonctionBranche}
                              onChange={e => setFonctionBranche(e.target.value)}
                              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors appearance-none pr-6"
                            >
                              <option value="" disabled>Sélectionner...</option>
                              {renderFonctionBrancheOptions(branche)}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-gray-400">
                              <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                         )}
                       </InfoItem>
                    )}
                    
                    {(isEditing || ((user.role === 'tonia' || user.role === 'mpiandraikitra') && user.groupe !== '')) && (
                      <InfoItem 
                        icon={<Icons.BookOpen />} 
                        label="Étape de formation" 
                        value={isEditing ? etapeFormation : user.etapeFormation} 
                        isEditing={isEditing} 
                      >
                         {isEditing && (
                          <div className="relative w-full">
                            <select 
                              value={etapeFormation}
                              onChange={e => setEtapeFormation(e.target.value)}
                              className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors appearance-none pr-6"
                            >
                              <option value="" disabled>Sélectionner...</option>
                              {renderEtapeFormationOptions(groupe)}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none text-gray-400">
                              <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                         )}
                      </InfoItem>
                    )}

                    <InfoItem 
                      icon={<Icons.Calendar />} 
                      label="Date d'intégration" 
                      value={isEditing ? joinDate : (user.joinDate ? new Date(user.joinDate).toLocaleDateString('fr-FR') : null)} 
                      isEditing={isEditing} 
                      onChange={e => setJoinDate(e.target.value)}
                      type="date"
                    />
                    <InfoItem 
                      icon={<Icons.Star />} 
                      label="Date de promesse" 
                      value={isEditing ? (promesseGuideYear ? `${promesseGuideYear}-${promesseGuideMonth || '01'}-${promesseGuideDay || '01'}` : '') : (user.promesseGuideDate ? new Date(user.promesseGuideDate).toLocaleDateString('fr-FR') : null)} 
                      isEditing={isEditing} 
                      type="date"
                      onChange={e => {
                        const d = e.target.value.split('-');
                        setPromesseGuideYear(d[0] || '');
                        setPromesseGuideMonth(d[1] || '');
                        setPromesseGuideDay(d[2] || '');
                      }}
                    />
                    <InfoItem 
                      icon={<Icons.Shield />} 
                      label="Promesse de chef" 
                      value={isEditing ? (promesseChefYear ? `${promesseChefYear}-${promesseChefMonth || '01'}-${promesseChefDay || '01'}` : '') : (user.promesseChefDate ? new Date(user.promesseChefDate).toLocaleDateString('fr-FR') : null)} 
                      isEditing={isEditing} 
                      borderBottom={false} 
                      type="date"
                      onChange={e => {
                        const d = e.target.value.split('-');
                        setPromesseChefYear(d[0] || '');
                        setPromesseChefMonth(d[1] || '');
                        setPromesseChefDay(d[2] || '');
                      }}
                    />
                    
                    {isEditing && (
                      <div className="px-5 py-4 w-full flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubmit(e as any);
                          }}
                          disabled={loading}
                          className={`bg-primary text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-dark transition-colors text-sm flex items-center justify-center ${loading ? 'opacity-50' : ''}`}
                        >
                          {loading ? <Icons.Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                          Enregistrer
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value, borderBottom = true, isEditing = false, onChange, isBlocked = false, type = "text", children }: { icon?: React.ReactNode, label: string, value?: string | null, borderBottom?: boolean, isEditing?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, isBlocked?: boolean, type?: string, children?: React.ReactNode }) {
  if (!isEditing && (!value || value === '-')) return null;
  return (
    <div className={`px-5 py-4 flex items-start gap-4 transition-all duration-300 ${borderBottom ? 'border-b border-gray-100' : ''} ${(isEditing && isBlocked) ? 'opacity-40 grayscale blur-[1px] pointer-events-none' : ''}`}>
      {icon && <div className="mt-0.5 text-gray-400 w-5 h-5 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</div>
        {isEditing && !isBlocked ? (
           children ? children : (
             <input 
               type={type}
               value={value || ''}
               onChange={onChange}
               className="w-full px-0 py-1 bg-transparent border-b border-gray-300 focus:border-primary rounded-none text-sm font-medium text-gray-900 focus:outline-none transition-colors"
             />
           )
        ) : (
           <div className="text-sm font-medium text-gray-900 break-words">{value || '-'}</div>
        )}
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
