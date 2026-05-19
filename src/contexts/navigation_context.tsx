import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewState } from '../models/app_types';
import { useAuth } from './auth_context';

interface NavigationContextType {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
  isNavOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void;
  handleBack: () => void;
  handleProfileClick: () => void;
  handleMenuClick: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentView: 'splash',
  setCurrentView: () => {},
  selectedPersonId: null,
  setSelectedPersonId: () => {},
  isNavOpen: false,
  setIsNavOpen: () => {},
  handleBack: () => {},
  handleProfileClick: () => {},
  handleMenuClick: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('splash');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (currentView === 'splash' || currentView === 'login') {
          if (!user.role || !user.groupe) {
             setCurrentView('profile_setup');
          } else {
             setCurrentView('home');
          }
        }
      } else {
        if (currentView !== 'splash') {
          setCurrentView('login');
        }
      }
    }
  }, [user, loading, currentView]);

  const handleBack = () => setCurrentView('home');
  const handleProfileClick = () => setCurrentView('profile');
  const handleMenuClick = () => setIsNavOpen(true);

  return (
    <NavigationContext.Provider value={{
      currentView,
      setCurrentView,
      selectedPersonId,
      setSelectedPersonId,
      isNavOpen,
      setIsNavOpen,
      handleBack,
      handleProfileClick,
      handleMenuClick
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
