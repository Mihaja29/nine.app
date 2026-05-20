import React, { useState, useEffect } from 'react';
import { Icons } from '../components/icons';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Unite } from '../models/app_types';
import { createGroupNotification } from '../utils/notifications';

interface UnitesListProps {
  user: any;
  onBack: () => void;
}

export function UnitesList({ user, onBack }: UnitesListProps) {
  const [unites, setUnites] = useState<Unite[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<Unite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user?.groupe) return;

    const q = query(
      collection(db, 'unites'), 
      where('groupe', '==', user.groupe)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unite));
      // Sort by createdAt descending
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUnites(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.groupe]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'unites', itemToDelete.id));
      await createGroupNotification(user, `${user.firstName || 'Un membre'} a supprimé l'unité : ${itemToDelete.name.toUpperCase()}`);
      setItemToDelete(null);
    } catch (e) {
      console.error(e);
      console.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Date inconnue';
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-[100dvh]">
      <div className="bg-white px-4 py-4 flex items-center shadow-sm relative z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <Icons.ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="ml-3 text-lg font-bold text-gray-900">Les Unités</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : unites.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
            <Icons.Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-900 mb-1">Aucune Unité</p>
            <p className="text-sm">Il n'y a pas encore d'Unité créée dans votre groupe.</p>
          </div>
        ) : (
          unites.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icons.Folder className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-base font-bold text-gray-900">{u.type} {u.name}</h3>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Créée le {formatDate(u.createdAt)}</p>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    Par: <span className="text-gray-700">{u.creatorName || 'Utilisateur inconnu'}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setItemToDelete(u)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Supprimer"
              >
                <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/>
                </svg>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <Icons.AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Supprimer l'Unité</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer l'unité <span className="font-bold text-gray-700">{itemToDelete.type} {itemToDelete.name}</span> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex justify-center items-center"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
