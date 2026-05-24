import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/icons';
import { useProfileSetupViewModel } from '../view_models/use_profile_setup_vm';
import { renderBrancheOptions, renderEtapeFormationOptions, renderFonctionBrancheOptions } from '../utils/scout_options';

interface ProfileSetupProps {
  user: any;
  onComplete: () => void;
  onBack?: () => void;
}

export function ProfileSetup({ user, onComplete, onBack }: ProfileSetupProps) {
  const isEditMode = !!onBack;
  const {
    step, setStep,
    lastName, setLastName,
    firstName, setFirstName,
    birthDate, setBirthDate,
    address, setAddress,
    phone, setPhone,
    email, setEmail,
    photoURL, setPhotoURL,
    photoBase64, setPhotoBase64,
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
    loading, showUnsavedModal, setShowUnsavedModal,
    hasUnsavedChanges, handleNextStep, handleSubmit
  } = useProfileSetupViewModel(user, onComplete, isEditMode);

  const handleBackClick = () => {
    if (isEditMode && hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      if (onBack) onBack();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
        setPhotoURL(''); // Clear URL if a file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const showBrancheQuestion = 
    role === 'kp' || 
    role === 'fmt2s' || 
    (role === 'mpiandraikitra' && groupe !== '');

  const activeBranches = ['Lovitao', 'Tily', 'Mpanazava', 'Voronkely', 'Mpiandalana', 'Mpitarika', 'Afo'];
  const showFonctionBrancheQuestion = activeBranches.includes(branche);

  const showEtapeFormationQuestion = !!renderEtapeFormationOptions(groupe);

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen relative overflow-y-auto no-scrollbar">
      {/* Decorative background shape */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-primary/10 -z-0 rounded-b-[2rem]"></div>

      {/* Optional Top Bar for editing profile */}
      {onBack && (
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
          <button 
            onClick={handleBackClick}
            className="w-12 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-2">
                <Icons.AlertTriangle className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Modifications non enregistrées</h3>
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir quitter sans sauvegarder vos modifications ?
              </p>
              <div className="w-full flex gap-3 mt-4">
                <button 
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium h-12 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowUnsavedModal(false);
                    if (onBack) onBack();
                  }}
                  className="flex-1 bg-red-500 text-white font-medium h-12 rounded-full hover:bg-red-600 transition-colors"
                >
                  Quitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center p-4 mt-16 mb-8 w-full max-w-sm mx-auto">
        <div className="relative z-10 flex flex-col w-full">

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md mb-4 border-4 border-white overflow-hidden">
            {(photoBase64 || photoURL) ? (
              <img src={photoBase64 || photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <Icons.User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center">
            {isEditMode ? 'Modifier mon profil' : (step === 1 ? 'Finalisez votre profil' : 'Informations sur le Scoutisme')}
          </h1>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {isEditMode 
              ? 'Mettez à jour vos informations puis enregistrez.'
              : (step === 1 
                ? 'Veuillez vérifier ou modifier vos informations avant de continuer.' 
                : 'Dites-nous en plus sur vous.')}
          </p>
        </div>

        <form onSubmit={isEditMode ? handleSubmit : (step === 1 ? handleNextStep : handleSubmit)} className="flex flex-col gap-4 relative z-10 w-full overflow-hidden">
<AnimatePresence initial={false}>
        
        {(step === 1 || isEditMode) && (
          <motion.div key="step1" 
             initial={{ x: step === 1 && !isEditMode ? "100%" : "-100%" }} 
             animate={{ x: 0 }} 
             exit={{ x: step === 2 ? "-100%" : "100%", position: 'absolute', top: 0, left: 0, width: '100%' }} 
             transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}
          >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Nom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Prénom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Prénom"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Date de naissance</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Calendar className="w-4 h-4" />
                </div>
                <input 
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Adresse postale</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.MapPin className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Votre adresse"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Le numéro de téléphone doit contenir exactement 10 chiffres"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Adresse e-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Votre adresse e-mail"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Photo de profil</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                  <Icons.Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Importer depuis la galerie</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm text-gray-400 uppercase font-semibold">OU</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.Image className="w-4 h-4" />
                  </div>
                  <input 
                    type="url"
                    value={photoURL}
                    onChange={e => {
                      setPhotoURL(e.target.value);
                      if (photoBase64) setPhotoBase64('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="URL de l'image"
                  />
                </div>
              </div>
            </div>

            {!isEditMode && (
              <button 
                type="submit" 
                className="w-full py-3 mt-4 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
              >
                Continuer
              </button>
            )}
          </div>
          </motion.div>
        )}

        { (step === 2 || isEditMode) && (
<motion.div key="step2" 
   initial={{ x: "100%" }} 
   animate={{ x: 0 }} 
   exit={{ x: "100%", position: 'absolute', top: 0, left: 0, width: '100%' }} 
   transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}
>
            <div className="flex flex-col gap-4">
            {/* Step 2 Form */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">Avez-vous un Totem ?</label>
              <div className="flex gap-4">
                <label className={`flex-1 h-12 rounded-full border text-center cursor-pointer transition-colors text-sm font-medium ${hasTotem === 'oui' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  <input 
                    type="radio" 
                    name="hasTotem" 
                    value="oui"
                    checked={hasTotem === 'oui'}
                    onChange={() => setHasTotem('oui')}
                    className="hidden"
                  />
                  OUI
                </label>
                <label className={`flex-1 h-12 rounded-full border text-center cursor-pointer transition-colors text-sm font-medium ${hasTotem === 'non' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  <input 
                    type="radio" 
                    name="hasTotem" 
                    value="non"
                    checked={hasTotem === 'non'}
                    onChange={() => {
                      setHasTotem('non');
                      setTotemName('');
                      setUseTotemAsMainName(false);
                    }}
                    className="hidden"
                  />
                  NON
                </label>
              </div>
            </div>

            {hasTotem === 'oui' && (
              <div className="flex flex-col gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-600">Quel est votre Totem ?</label>
                  <input 
                    type="text"
                    value={totemName}
                    onChange={e => setTotemName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Ex: Tigre joyeux"
                    required
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer mt-2 group">
                  <div className={`mt-0.5 flex shrink-0 items-center justify-center w-5 h-5 rounded border transition-colors ${useTotemAsMainName ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                    {useTotemAsMainName && <Icons.Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input 
                    type="checkbox"
                    checked={useTotemAsMainName}
                    onChange={(e) => setUseTotemAsMainName(e.target.checked)}
                    className="hidden"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Utiliser comme nom principal</span>
                    <span className="text-sm text-gray-500">Ce nom sera affiché sur votre profil au lieu de votre nom/prénom.</span>
                  </div>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-gray-600">Quand as-tu rejoint le mouvement ?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Calendar className="w-4 h-4" />
                </div>
                <input 
                  type="date"
                  value={joinDate}
                  onChange={e => setJoinDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-gray-600">Quel comité ou membre occupes-tu ?</label>
              <div className="relative">
                <select 
                  value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    setGroupe('');
                    setBranche('');
                    setFonctionBranche('');
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Sélectionner...</option>
                  <option value="kp">Komitim-pivondronana (KP)</option>
                  <option value="fmt2s">FMT2S</option>
                  <option value="tonia">Tonia / Mpandrindra</option>
                  <option value="mpiandraikitra">Mpiandraikitra</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {(role === 'tonia' || role === 'mpiandraikitra') && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">De quel Groupe es-tu responsable ?</label>
                <div className="relative">
                  <select 
                    value={groupe}
                    onChange={e => {
                      setGroupe(e.target.value);
                      setBranche('');
                      setFonctionBranche('');
                      setEtapeFormation('');
                    }}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Sélectionner...</option>
                    <option value="Tily Eto Madagasikara">Tily Eto Madagasikara</option>
                    <option value="Mpanazava Eto Madagasikara">Mpanazava Eto Madagasikara</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            )}

            {showBrancheQuestion && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">À quelle branche appartiens-tu ?</label>
                <div className="relative">
                  <select 
                    value={branche}
                    onChange={e => {
                      setBranche(e.target.value);
                      setFonctionBranche('');
                    }}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {renderBrancheOptions(role, groupe)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            )}

            {showFonctionBrancheQuestion && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Quelle est ta responsabilité au sein de la branche ?</label>
                <div className="relative">
                  <select 
                    value={fonctionBranche}
                    onChange={e => setFonctionBranche(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {renderFonctionBrancheOptions(branche)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            )}

            {showEtapeFormationQuestion && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Quelle étape de formation suis-tu actuellement ?</label>
                <div className="relative">
                  <select 
                    value={etapeFormation}
                    onChange={e => setEtapeFormation(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {renderEtapeFormationOptions(groupe)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-gray-600">Date de la Promesse (Optionnel)</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <select 
                    value={promesseGuideDay}
                    onChange={e => setPromesseGuideDay(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Jour</option>
                    {Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={promesseGuideMonth}
                    onChange={e => setPromesseGuideMonth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Mois</option>
                    {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={promesseGuideYear}
                    onChange={e => setPromesseGuideYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Année</option>
                    {Array.from({length: new Date().getFullYear() - 1950 + 1}, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-gray-600">Date de la Promesse de Chef d'unité (Optionnel)</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <select 
                    value={promesseChefDay}
                    onChange={e => setPromesseChefDay(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Jour</option>
                    {Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={promesseChefMonth}
                    onChange={e => setPromesseChefMonth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Mois</option>
                    {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={promesseChefYear}
                    onChange={e => setPromesseChefYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                  >
                    <option value="">Année</option>
                    {Array.from({length: new Date().getFullYear() - 1950 + 1}, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {!isEditMode && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className={`${isEditMode ? 'w-full' : 'w-2/3'} py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 ${loading ? 'opacity-70 blur-[1px]' : ''}`}
              >
                {loading ? <Icons.Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continuer'}
              </button>
            </div>
          </div>
          </motion.div>
        )}
        </AnimatePresence>
</form>
      </div>
     </div>
    </div>
  );
}
