import React, { useState } from 'react';
import { Icons } from '../components/icons';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../components/top_bar';

interface SettingsProps {
  user: any;
  onProfileClick: () => void;
  onMenuClick: () => void;
  onLogout: () => void;
  onAccountSettings: () => void;
  onSecuritySettings: () => void;
  onNotificationSettings: () => void;
}

export function Settings({ user, onProfileClick, onMenuClick, onLogout, onAccountSettings, onSecuritySettings, onNotificationSettings }: SettingsProps) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // Small loading delay
      onLogout();
    } catch (e) {
      console.error("Logout error", e);
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
      className="flex-1 flex flex-col bg-gray-50 pb-8 min-h-screen"
    >
      <TopBar title="Paramètres" user={user} onProfileClick={onProfileClick} onMenuClick={onMenuClick} />

      <div className="px-5 py-6 flex flex-col flex-1 pb-20">
        <div className="space-y-4">
          
          {/* Profile Card */}
  <button 
            onClick={onAccountSettings}
            className="w-full bg-white p-4 rounded-3xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase flex-shrink-0">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-semibold text-gray-900 text-[17px] truncate max-w-full w-full text-left">
                  {user?.firstName} {user?.lastName || ''}
                </span>
                <span className="text-sm text-gray-500 mt-0.5 truncate max-w-full w-full text-left">
                  {user?.email || '@' + (user?.firstName?.toLowerCase() || 'user')}
                </span>
              </div>
            </div>
            <Icons.ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
          </button>

          {/* Group: Notifications & Security */}
          <div className="bg-white rounded-3xl p-2 shadow-sm flex flex-col">
            <SettingsItem 
              icon={<Icons.Bell />} 
              label="Préférences de notification" 
              onClick={onNotificationSettings} 
            />
            <SettingsItem 
              icon={<Icons.Shield />} 
              label="Sécurité et confidentialité" 
              onClick={onSecuritySettings} 
              borderBottom={false}
            />
          </div>

        </div>

        {/* Spacer to push logout button to bottom */}
        <div className="flex-1" />

        {/* Logout Button */}
        <div className="mt-8">
          <button 
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full bg-white rounded-full py-4 flex items-center justify-center gap-2 font-semibold text-red-500 shadow-sm border border-red-50"
          >
            <Icons.LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isLogoutConfirmOpen && !isLoggingOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-2">Déconnexion</h2>
              <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 h-10 py-0 px-4 rounded-full font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Oui
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLoggingOut && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium animate-pulse">Déconnexion en cours...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SettingsItem({ icon, label, borderBottom = true, onClick }: { icon: React.ReactNode, label: string, borderBottom?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-xl ${borderBottom ? 'border-b border-gray-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-gray-500 w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium text-[15px] text-gray-900">{label}</span>
      </div>
      <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

