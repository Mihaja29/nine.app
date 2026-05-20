import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/icons';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface NotificationSettingsProps {
  user: any;
  onBack: () => void;
}

export function NotificationSettings({ user, onBack }: NotificationSettingsProps) {
  const [globalSound, setGlobalSound] = useState(user?.globalSound !== undefined ? user.globalSound : true);
  const [ringtone, setRingtone] = useState(user?.ringtone || 'Par défaut');
  const [volume, setVolume] = useState(user?.volume !== undefined ? user.volume : 80);
  
  const [urgentSound, setUrgentSound] = useState(user?.urgentSound || 'Bip urgent');
  const [minorSound, setMinorSound] = useState(user?.minorSound || 'Discret');

  const [dndEnabled, setDndEnabled] = useState(user?.dndEnabled !== undefined ? user.dndEnabled : false);
  const [dndStart, setDndStart] = useState(user?.dndStart || '22:00');
  const [dndEnd, setDndEnd] = useState(user?.dndEnd || '07:00');
  const [urgentExceptions, setUrgentExceptions] = useState(user?.urgentExceptions !== undefined ? user.urgentExceptions : true);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const hasUnsavedChanges = 
    globalSound !== (user?.globalSound !== undefined ? user.globalSound : true) ||
    ringtone !== (user?.ringtone || 'Par défaut') ||
    volume !== (user?.volume !== undefined ? user.volume : 80) ||
    urgentSound !== (user?.urgentSound || 'Bip urgent') ||
    minorSound !== (user?.minorSound || 'Discret') ||
    dndEnabled !== (user?.dndEnabled !== undefined ? user.dndEnabled : false) ||
    dndStart !== (user?.dndStart || '22:00') ||
    dndEnd !== (user?.dndEnd || '07:00') ||
    urgentExceptions !== (user?.urgentExceptions !== undefined ? user.urgentExceptions : true);

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
      setGlobalSound(user.globalSound !== undefined ? user.globalSound : true);
      setRingtone(user.ringtone || 'Par défaut');
      setVolume(user.volume !== undefined ? user.volume : 80);
      setUrgentSound(user.urgentSound || 'Bip urgent');
      setMinorSound(user.minorSound || 'Discret');
      setDndEnabled(user.dndEnabled !== undefined ? user.dndEnabled : false);
      setDndStart(user.dndStart || '22:00');
      setDndEnd(user.dndEnd || '07:00');
      setUrgentExceptions(user.urgentExceptions !== undefined ? user.urgentExceptions : true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        globalSound,
        ringtone,
        volume,
        urgentSound,
        minorSound,
        dndEnabled,
        dndStart,
        dndEnd,
        urgentExceptions,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Update local state if needed
      user.globalSound = globalSound;
      user.ringtone = ringtone;
      user.volume = volume;
      user.urgentSound = urgentSound;
      user.minorSound = minorSound;
      user.dndEnabled = dndEnabled;
      user.dndStart = dndStart;
      user.dndEnd = dndEnd;
      user.urgentExceptions = urgentExceptions;
      
      setToastMessage('Préférences de notification sauvegardées.');
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
          <h1 className="text-xl font-bold text-gray-900 truncate">Préférences</h1>
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
        
        {/* Son de notification global */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 mx-2">Son de notification global</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            <label className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  {globalSound ? <Icons.Volume2 className="w-4 h-4 text-gray-500" /> : <Icons.VolumeX className="w-4 h-4 text-gray-500" />}
                  Son des notifications
                </span>
                <span className="text-xs text-gray-500 mt-1">Activer ou désactiver le son (vibration uniquement si désactivé)</span>
              </div>
              <div className="relative inline-flex items-center ml-4 shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={globalSound}
                  onChange={(e) => setGlobalSound(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <div className="p-4 border-b border-gray-50">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.Music className="w-4 h-4 text-gray-500" />
                  Sonnerie
                </span>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={ringtone}
                  onChange={(e) => setRingtone(e.target.value)}
                  disabled={!globalSound}
                >
                  <option value="Par défaut">Mélodie par défaut</option>
                  <option value="Goutte d'eau">Goutte d'eau</option>
                  <option value="Cloche">Cloche</option>
                  <option value="Bip simple">Bip simple</option>
                </select>
              </label>
            </div>

            <div className="p-4">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.BellRing className="w-4 h-4 text-gray-500" />
                  Volume des notifications ({volume}%)
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  disabled={!globalSound}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </label>
            </div>

          </div>
        </section>

        {/* Son par type de mise à jour */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 mx-2">Son par type de mise à jour</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-gray-50">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-orange-500" />
                  Modifications importantes
                </span>
                <span className="text-xs text-gray-500">Ex: Annulations, réunions urgentes</span>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none mt-1"
                  value={urgentSound}
                  onChange={(e) => setUrgentSound(e.target.value)}
                  disabled={!globalSound}
                >
                  <option value="Bip urgent">Bip urgent</option>
                  <option value="Alarme courte">Alarme courte</option>
                  <option value="Sonnerie forte">Sonnerie forte</option>
                </select>
              </label>
            </div>

            <div className="p-4">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.MessageSquare className="w-4 h-4 text-blue-500" />
                  Mises à jour mineures
                </span>
                <span className="text-xs text-gray-500">Ex: Nouveau document, message simple</span>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none mt-1"
                  value={minorSound}
                  onChange={(e) => setMinorSound(e.target.value)}
                  disabled={!globalSound}
                >
                  <option value="Discret">Discret</option>
                  <option value="Pop">Pop</option>
                  <option value="Silencieux">Silencieux</option>
                </select>
              </label>
            </div>

          </div>
        </section>

        {/* Mode Ne pas déranger */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-3 mx-2">Mode Ne pas déranger</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            <label className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.Moon className="w-4 h-4 text-gray-500" />
                  Horaires de silence
                </span>
                <span className="text-xs text-gray-500 mt-1">Couper les sons pendant la nuit ou les réunions</span>
              </div>
              <div className="relative inline-flex items-center ml-4 shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={dndEnabled}
                  onChange={(e) => setDndEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            {dndEnabled && (
              <div className="p-4 border-b border-gray-50 flex gap-4">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-medium text-gray-600">De</span>
                  <input 
                    type="time" 
                    value={dndStart} 
                    onChange={(e) => setDndStart(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-medium text-gray-600">À</span>
                  <input 
                    type="time" 
                    value={dndEnd} 
                    onChange={(e) => setDndEnd(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </label>
              </div>
            )}

            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-gray-500" />
                  Exceptions
                </span>
                <span className="text-xs text-gray-500 mt-1">Autoriser le son pour les messages urgents/prioritaires</span>
              </div>
              <div className="relative inline-flex items-center ml-4 shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={urgentExceptions}
                  onChange={(e) => setUrgentExceptions(e.target.checked)}
                  disabled={!dndEnabled}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${!dndEnabled ? 'opacity-50' : 'peer-checked:bg-primary'}`}></div>
              </div>
            </label>

          </div>
        </section>

      </div>
    </motion.div>
  );
}
