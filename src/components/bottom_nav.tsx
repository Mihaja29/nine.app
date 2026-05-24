import { useState } from 'react';
import { IconSvg1, IconSvg2, IconSvg3, IconSvg4, IconSvg5, IconSvg6, IconSvg7, IconSvg8, IconSvg9, IconSvg10, IconSvg11, IconSvg12, IconSvg13, IconSvg14 } from './svg_icons';
import { ViewState } from '../models/app_types';
import { Icons } from './icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LogoText } from './logo';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function BottomNav({ currentView, onChangeView, isOpen, setIsOpen }: BottomNavProps) {
  // Only show nav on specific views
  const showNav = ['home', 'dashboard', 'annuaire', 'agenda', 'planning', 'bilans', 'outils', 'finance', 'categories', 'settings'].includes(currentView);
  
  if (!showNav) {
    return null;
  }

  const menuGroups = [
    {
      title: "Principal",
      items: [
        { 
          id: 'home', 
          label: 'Accueil', 
          iconActive: <IconSvg1 />,
          iconInactive: <IconSvg2 />
        },
      ]
    },
    {
      title: "Activités & Suivi",
      items: [
        { 
          id: 'agenda', 
          label: 'Agenda', 
          iconActive: <IconSvg3 />,
          iconInactive: <IconSvg4 />
        },
        { 
          id: 'planning', 
          label: 'Planning des Activités', 
          iconActive: <IconSvg5 />,
          iconInactive: <IconSvg6 />
        },
        { 
          id: 'bilans', 
          label: 'Suivis & Rapports', 
          iconActive: <IconSvg7 />,
          iconInactive: <IconSvg8 />
        },
      ]
    },
    {
      title: "Gestion du Groupe",
      items: [
        { 
          id: 'dashboard', 
          label: 'Annuaire du Groupe',
          iconActive: <IconSvg9 />,
          iconInactive: <IconSvg10 />
        },
        { 
          id: 'finance', 
          label: 'Gestion Financière', 
          iconActive: <IconSvg11 />,
          iconInactive: <IconSvg12 />
        },
      ]
    }
  ] as const;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.4, 0.0, 1, 1] } }}
              transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}
              className="fixed inset-0 bg-white/60 backdrop-blur-md z-[50]" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%", transition: { duration: 0.2, ease: [0.4, 0.0, 1, 1] } }}
              transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white rounded-r-3xl shadow-[4px_0_24px_rgba(229,231,235,0.8)] z-[60] flex flex-col pt-8 pb-6 overflow-y-auto no-scrollbar"
            >
              <div className="px-6 mb-6 flex items-center justify-between">
                <button onClick={() => setIsOpen(false)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"/></svg>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => onChangeView('outils'), 300);
                    }}
                    className={cn(
                      "p-2 rounded-xl transition-colors flex items-center justify-center hover:bg-gray-100",
                      currentView === 'outils' ? "text-primary" : "text-gray-500"
                    )}
                    title="Boîte à Outils"
                  >
                    <IconSvg13 />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => onChangeView('settings'), 300);
                    }}
                    className={cn(
                      "p-2 rounded-xl transition-colors flex items-center justify-center hover:bg-gray-100",
                      currentView === 'settings' ? "text-primary" : "text-gray-500"
                    )}
                    title="Paramètres"
                  >
                    <IconSvg14 />
                  </button>
                </div>
              </div>

              <div className="flex-1 px-4 flex flex-col gap-4">
                {menuGroups.map((group) => (
                  <div key={group.title} className="flex flex-col gap-2">
                    <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {group.title}
                    </h3>
                    {group.items.map((item) => {
                      const isActive = currentView === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onChangeView(item.id as ViewState);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-4 px-3 h-12 rounded-full transition-colors text-left",
                            isActive ? "text-primary font-bold" : "text-gray-600 hover:bg-gray-50 font-medium"
                          )}
                        >
                          {isActive ? item.iconActive : item.iconInactive}
                          <span className="text-[15px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 px-6 flex justify-end gap-3">
                {/* Icons moved to top bar */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
