import { TopBar } from '../components/top_bar';
import { IconSvg19 } from '../components/svg_icons';
import { Icons } from '../components/icons';

export function Home({ 
  user, 
  onProfileClick, 
  onNotificationsClick,
  onMenuClick,
  unreadNotificationsCount = 2
}: { 
  user: any; 
  onProfileClick: () => void; 
  onNotificationsClick?: () => void;
  onMenuClick?: () => void;
  unreadNotificationsCount?: number;
}) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-8">
      <TopBar 
        title="Accueil" 
        user={user} 
        onProfileClick={onProfileClick} 
        onMenuClick={onMenuClick}
        showProfile={true} 
        rightActions={
          <button 
            onClick={onNotificationsClick}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <IconSvg19 />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full text-[10px] font-bold text-white border-2 border-white px-1">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        }
      />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bienvenue</h2>
        <p className="text-gray-500 text-sm">Ceci est l'écran d'accueil. Sélectionnez une option dans le menu pour commencer.</p>
      </div>
    </div>
  );
}
