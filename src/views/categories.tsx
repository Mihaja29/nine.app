import { Icons } from '../components/icons';
import { TopBar } from '../components/top_bar';
import { Category } from '../models/app_types';

interface CategoriesProps {
  user: any;
  onProfileClick: () => void;
  categories: Category[];
}

export function Categories({ user, onProfileClick, categories }: CategoriesProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-8">
      <TopBar 
        title="Catégories" 
        user={user}
        onProfileClick={onProfileClick}
        rightActions={
          <button className="w-12 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-sm hover:bg-primary-dark transition-colors">
            <Icons.Plus className="w-6 h-6" />
          </button>
        }
      />

      <div className="px-4 py-6 flex-1 flex flex-col">
        {categories.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <Icons.Folder className="w-12 h-12 text-gray-300" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune catégorie</h3>
             <p className="text-gray-500 text-sm mb-6 max-w-[250px]">
               Ajoutez des catégories pour organiser vos personnes.
             </p>
             <button className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2">
               <Icons.Plus className="w-5 h-5" />
               Ajouter une catégorie
             </button>
           </div>
        ) : (
          <div className="flex flex-col gap-3">
             {categories.map(cat => (
               <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <Icons.Folder className="w-6 h-6 text-gray-400" />
                  <span className="font-medium text-gray-900">{cat.name}</span>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
