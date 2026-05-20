import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/icons';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface SecurityPrivacyProps {
  user: any;
  onBack: () => void;
}

export function SecurityPrivacy({ user, onBack }: SecurityPrivacyProps) {
  const [profileVisibility, setProfileVisibility] = useState(user?.profileVisibility || 'Public');
  const [showPhone, setShowPhone] = useState(user?.showPhone !== undefined ? user.showPhone : true);
  const [saving, setSaving] = useState(false);

  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const hasUnsavedChanges = 
    profileVisibility !== (user?.profileVisibility || 'Public') ||
    showPhone !== (user?.showPhone !== undefined ? user.showPhone : true);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onBack();
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (user) {
      setProfileVisibility(user.profileVisibility || 'Public');
      setShowPhone(user.showPhone !== undefined ? user.showPhone : true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        profileVisibility,
        showPhone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      // Update local state if needed
      user.profileVisibility = profileVisibility;
      user.showPhone = showPhone;
      setToastMessage('Paramètres de sécurité sauvegardés.');
    } catch (error) {
      console.error(error);
      setToastMessage('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 flex flex-col bg-gray-50 pb-8 overflow-y-auto relative"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-[60] flex items-center gap-2 whitespace-nowrap">
          <Icons.Check className="w-4 h-4 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={handleBackClick}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate">Sécurité</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors ${hasUnsavedChanges ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-gray-400 bg-transparent disabled:opacity-50'}`}
        >
          {saving ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Save className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Sécurité du compte */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 mx-2">Sécurité du compte</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <SettingsItem 
              icon={<Icons.Smartphone />} 
              label="Déconnexion des autres appareils" 
              onClick={() => setShowDevicesModal(true)}
            />
            <SettingsItem 
              icon={<Icons.History />} 
              label="Historique des connexions" 
              borderBottom={false} 
              onClick={() => setShowHistoryModal(true)}
            />
          </div>
        </section>

        {/* Confidentialité */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 mx-2">Confidentialité</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-50">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.Eye className="w-4 h-4 text-gray-500" />
                  Qui peut voir mon profil ?
                </span>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                >
                  <option value="Public">Tout le monde (Public)</option>
                  <option value="Groupe">Membres de mon groupe uniquement</option>
                  <option value="Branche">Membres de ma branche uniquement</option>
                  <option value="Privé">Moi uniquement (Privé)</option>
                </select>
              </label>
            </div>
            
            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.Phone className="w-4 h-4 text-gray-500" />
                  Afficher mon numéro de téléphone aux autres membres ?
                </span>
              </div>
              <div className="relative inline-flex items-center ml-4 shrink-0">
                <input 
                  type="checkbox" 
                  value="" 
                  className="sr-only peer" 
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Modals */}
      
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-2">
                <Icons.AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Modifications non enregistrées</h3>
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir quitter sans sauvegarder vos modifications ?
              </p>
              <div className="w-full flex gap-3 mt-4">
                <button 
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowUnsavedModal(false);
                    onBack();
                  }}
                  className="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Quitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Devices Modal */}
      {showDevicesModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Autres appareils</h3>
              <button onClick={() => setShowDevicesModal(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <Icons.Smartphone className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-600">
                Vous êtes sur le point de vous déconnecter de tous vos autres appareils (navigateurs, applications mobiles).
                Vous resterez connecté sur cet appareil.
              </p>
              <div className="w-full flex gap-3 mt-4">
                <button 
                  onClick={() => setShowDevicesModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowDevicesModal(false);
                    setToastMessage("Vos autres sessions ont été révoquées (simulation).");
                  }}
                  className="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showHistoryModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-xl max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Historique des connexions</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto w-full">
              {/* Dummy data */}
              <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                  <Icons.Smartphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Appareil actuel</span>
                  <span className="text-xs text-gray-500">Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-full">
                  <Icons.Monitor className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Chrome sur Windows</span>
                  <span className="text-xs text-gray-500">Hier à 14:32 • Antananarivo</span>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-full">
                  <Icons.Smartphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">Safari sur iPhone</span>
                  <span className="text-xs text-gray-500">Le 26 Avr à 09:15 • Majunga</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SettingsItem({ icon, label, borderBottom = true, onClick }: { icon: React.ReactNode, label: string, borderBottom?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${borderBottom ? 'border-b border-gray-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-gray-500 w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-sm text-left">{label}</span>
      </div>
      <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
