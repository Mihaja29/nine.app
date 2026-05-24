/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './contexts/auth_context';
import { NotificationProvider, useNotifications } from './contexts/notification_context';
import { PeopleProvider, usePeople } from './contexts/people_context';
import { NavigationProvider, useNavigation } from './contexts/navigation_context';
import { AnimatePresence, motion } from 'motion/react';

import { ViewState } from './models/app_types';
import { Splash } from './views/splash';
import { Login } from './views/login';
import { ProfileSetup } from './views/profile_setup';
import { Home } from './views/home';
import { Planning } from './views/planning';
import { Bilans } from './views/bilans';
import { Dashboard } from './views/dashboard';
import { Finance } from './views/finance';
import { Outils } from './views/outils';
import { Settings } from './views/settings';
import { Agenda } from './views/agenda';
import { Categories } from './views/categories';
import { UnitesList } from './views/unites_list';
import { EquipesList } from './views/equipes_list';
import { NotificationsCenter } from './views/notifications_center';
import { NotificationSettings } from './views/notification_settings';
import { SecurityPrivacy } from './views/security_privacy';
import { PersonDetails } from './views/person_details';
import { PersonTalents } from './views/person_talents';
import { Profile } from './views/profile';
import { BottomNav } from './components/bottom_nav';
import { GlobalNotificationToast } from './components/global_notification_toast';
import { auth } from './config/firebase';

function AppContent() {
  const { user } = useAuth();
  const { notifications, unreadCount, handleMarkAsRead, handleMarkAllAsRead, handleDeleteNotification, handleArchiveNotification, handleRestoreNotification } = useNotifications();
  const { people } = usePeople();
  const { currentView, setCurrentView, selectedPersonId, setSelectedPersonId, selectedPerson, setSelectedPerson, isNavOpen, setIsNavOpen, handleBack, handleProfileClick, handleMenuClick } = useNavigation();

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <Splash onComplete={() => setCurrentView(user ? (user.role ? 'home' : 'profile_setup') : 'login')} />;
      case 'login':
        return <Login />;
      case 'profile_setup':
        return <ProfileSetup user={user} onComplete={() => setCurrentView('home')} onBack={() => setCurrentView('login')} />;
      case 'home':
        return <Home user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onNotificationsClick={() => setCurrentView('notifications_center')} unreadNotificationsCount={unreadCount} />;
      case 'dashboard':
        return <Dashboard user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onBack={handleBack} people={people} onPersonClick={(id, person) => { setSelectedPersonId(id); if (person) setSelectedPerson(person); setCurrentView('person_details'); }} onViewChange={(v) => setCurrentView(v as ViewState)} />;
      case 'person_details':
        return <PersonDetails person={selectedPerson || people.find(p => p.id === selectedPersonId) as any} onBack={() => setCurrentView('dashboard')} onTalentClick={() => setCurrentView('person_talents')} />;
      case 'person_talents':
        return <PersonTalents person={selectedPerson || people.find(p => p.id === selectedPersonId) as any} onBack={() => setCurrentView('person_details')} />;
      case 'agenda':
        return <Agenda user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} />;
      case 'planning':
        return <Planning user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onBack={handleBack}/>;
      case 'bilans':
        return <Bilans user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onBack={handleBack}/>;
      case 'finance':
        return <Finance user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onBack={handleBack}/>;
      case 'outils':
        return <Outils user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} />;
      case 'settings':
        return <Settings user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} onLogout={() => auth.signOut()} onAccountSettings={() => setCurrentView('profile')} onSecuritySettings={() => setCurrentView('security_privacy')} onNotificationSettings={() => setCurrentView('notification_settings')} />;
      case 'unites_list':
        return <UnitesList user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'equipes_list':
        return <EquipesList user={user} onBack={() => setCurrentView('dashboard')} />;
      case 'categories':
        return <Categories user={user} onProfileClick={handleProfileClick} categories={[]} />;
      case 'notifications_center':
        return <NotificationsCenter 
          onBack={handleBack} 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDeleteNotification}
          onArchive={handleArchiveNotification}
          onRestore={handleRestoreNotification}
        />;
      case 'notification_settings':
        return <NotificationSettings user={user} onBack={() => setCurrentView('settings')} />;
      case 'security_privacy':
        return <SecurityPrivacy user={user} onBack={() => setCurrentView('settings')} />;
      case 'profile':
        return <Profile user={user} onBack={handleBack} />;
      default:
        return <Home user={user} onProfileClick={handleProfileClick} onMenuClick={handleMenuClick} unreadNotificationsCount={unreadCount} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1] } }}
          exit={{ x: '100%', opacity: 0, transition: { duration: 0.25, ease: [0.4, 0.0, 1, 1] } }}
          className="w-full h-full absolute inset-0"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <BottomNav 
        currentView={currentView}
        onChangeView={(v) => setCurrentView(v)}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      />
      <GlobalNotificationToast 
        user={user}
        notifications={notifications}
        onClick={() => setCurrentView('notifications_center')}
        isNotificationCenterOpen={currentView === 'notifications_center'} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PeopleProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </PeopleProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
