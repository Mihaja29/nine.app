import React, { useState, useRef, useEffect } from 'react';
import { IconSvg15, IconSvg16, IconSvg17, IconSvg21 } from './svg_icons';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './icons';
import { cn } from '../lib/utils';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export function TopBar({
  title,
  user,
  onProfileClick,
  onBackClick,
  onMenuClick,
  onSearchClick,
  rightActions,
  showProfile = false,
  bgClass = "bg-white"
}: {
  title: string;
  user?: any;
  onProfileClick?: () => void;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  rightActions?: React.ReactNode;
  showProfile?: boolean;
  bgClass?: string;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // Small loading delay
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <>
      <div className={cn("flex items-center justify-between px-4 py-4 sticky top-0 z-30", bgClass)}>
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <button 
              onClick={onMenuClick} 
              className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center focus:outline-none"
            >
              <IconSvg21 className="w-6 h-6 fill-current" />
            </button>
          ) : onBackClick ? (
            <button onClick={onBackClick} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <Icons.ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-12" /> /* Space for floating hamburger menu */
          )}
          <h1 className={cn("text-xl font-semibold text-gray-900", onBackClick || onMenuClick ? "ml-1" : "")}>
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {onSearchClick && (
            <button onClick={onSearchClick} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Icons.Search className="w-6 h-6" />
            </button>
          )}
          {rightActions}
          {showProfile && user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-1 flex items-center justify-center"
              >
                <IconSvg15 />
              </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onProfileClick) onProfileClick();
                        }}
                        className="w-full text-left px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <IconSvg16 />
                        Mon Profil
                      </button>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <button 
                        onClick={handleLogoutClick}
                        className="w-full text-left px-4 h-10 py-0 text-[15px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <IconSvg17 />
                        Se déconnecter
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          )}
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
    </>
  );
}
