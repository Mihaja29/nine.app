import { TopBar } from '../components/top_bar';
import { Icons } from '../components/icons';

export function Finance({ user, onProfileClick, onBack, onMenuClick }: { user: any, onProfileClick: () => void, onBack?: () => void, onMenuClick?: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-8">
      <TopBar title="Gestion Financière" user={user} onProfileClick={onProfileClick} onBackClick={onBack} onMenuClick={onMenuClick} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Icons.Wallet className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Gestion Financière</h2>
        <p className="text-gray-500 text-sm">Gérez les aspects financiers.</p>
      </div>
    </div>
  );
}
