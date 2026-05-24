import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/icons';

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  read: boolean;
  date: string;
  archived?: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'archive' | 'delete' | 'restore' | 'permanent_delete';
  message: string;
  date: string;
}

export function NotificationsCenter({ 
  onBack, 
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onArchive,
  onRestore
}: { 
  onBack: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string | number) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string | number) => void;
  onArchive?: (id: string | number) => void;
  onRestore?: (id: string | number) => void;
}) {
  const visibleNotifications = notifications.filter(n => !n.archived);
  const archivedNotifications = notifications.filter(n => n.archived);
  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const isAllSelected = visibleNotifications.length > 0 && selectedIds.size === visibleNotifications.length;

  // Modals & Menu states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingArchives, setViewingArchives] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState<number | null>(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('app_notifications_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (onMarkAllAsRead && unreadCount > 0) {
      onMarkAllAsRead();
    }
  }, [onMarkAllAsRead, unreadCount]);

  useEffect(() => {
    localStorage.setItem('app_notifications_history', JSON.stringify(history));
  }, [history]);

  const addHistory = (type: HistoryItem['type'], message: string) => {
    setHistory(prev => [{
      id: Date.now().toString() + Math.random().toString(),
      type,
      message,
      date: new Date().toISOString()
    }, ...prev]);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleNotifications.map(n => n.id)));
    }
  };

  const toggleSelection = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Archive Actions
  const handleConfirmArchive = () => {
    if (onArchive) {
      let archivedCount = 0;
      selectedIds.forEach(id => {
        const notif = notifications.find(n => n.id === id);
        if (notif && notif.read) {
          onArchive(id);
          archivedCount++;
        }
      });
      if (archivedCount > 0) {
        addHistory('archive', `Archivage de ${archivedCount} notification(s) lue(s)`);
      }
    }
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setShowArchiveConfirm(false);
    setIsFabOpen(false);
  };

  // Delete Actions
  const handleConfirmDelete = () => {
    if (onDelete) {
      selectedIds.forEach(id => onDelete(id));
      addHistory('delete', `Suppression de ${selectedIds.size} notification(s)`);
    }
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
    setIsFabOpen(false);
  };

  // Inside Archives modal actions
  const handleRestoreFromArchive = (id: string | number) => {
    if (onRestore) onRestore(id);
    addHistory('restore', `Restauration d'une notification`);
  };

  const handlePermanentDeleteFromArchive = (id: string | number) => {
    setPermanentDeleteId(id);
  };

  const confirmPermanentDelete = () => {
    if (permanentDeleteId !== null) {
      if (onDelete) onDelete(permanentDeleteId);
      addHistory('permanent_delete', `Suppression définitive d'une notification`);
      setPermanentDeleteId(null);
    }
  };

  // Close FAB on click outside
  const fabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
      className="flex-1 flex flex-col bg-gray-50 pb-8 overflow-y-auto relative min-h-screen"
    >
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-12 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <button 
                onClick={toggleSelectAll}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                title={isAllSelected ? "Tout décocher" : "Tout cocher"}
              >
                {isAllSelected ? <Icons.CheckSquare className="w-5 h-5 text-primary" /> : <Icons.Square className="w-5 h-5" />}
              </button>
              <button 
                onClick={toggleSelectionMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 ml-1"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              {visibleNotifications.length > 0 && (
                <button 
                  onClick={toggleSelectionMode}
                  className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Sélectionner pour actions multiples"
                >
                  <Icons.CheckSquare className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {visibleNotifications.length === 0 ? (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center flex-1">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Icons.Bell className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Vous êtes à jour ! Vos nouvelles alertes et messages apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {visibleNotifications.map(notification => {
            const isSelected = selectedIds.has(notification.id);
            return (
              <div 
                key={notification.id} 
                className={`p-4 border-b border-gray-100 flex gap-4 ${isSelected ? 'bg-blue-50/30' : !notification.read ? 'bg-blue-50/50' : 'bg-white'}`}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(notification.id);
                  } else if (!notification.read && onMarkAsRead) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div className="flex items-center shrink-0">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                      {isSelected && <Icons.Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}
                
                <div className="mt-1 shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icons.Bell className={`w-5 h-5 ${!notification.read ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h4 className={`text-sm tracking-tight truncate ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-sm text-gray-500 shrink-0">
                      {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(new Date(notification.date))}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'} mb-2`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && !isSelectionMode && (
                  <div className="flex items-center shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FAB Backdrop */}
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-30"
            onClick={() => setIsFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end" ref={fabRef}>
        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl mb-4 py-2 w-56 flex flex-col overflow-hidden border border-gray-100"
            >
              {isSelectionMode && selectedIds.size > 0 && (
                <>
                  <button
                    onClick={() => setShowArchiveConfirm(true)}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                  >
                    <Icons.Archive className="w-4 h-4 mr-3 text-gray-500" />
                    Archiver la sélection
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <Icons.Trash2 className="w-4 h-4 mr-3 text-red-500" />
                    Supprimer la sélection
                  </button>
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                </>
              )}
              <button
                onClick={() => { setViewingArchives(true); setIsFabOpen(false); }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Icons.Folder className="w-4 h-4 mr-3 text-gray-500" />
                Voir les Archives ({archivedNotifications.length})
              </button>
              <button
                onClick={() => { setViewingHistory(true); setIsFabOpen(false); }}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <Icons.History className="w-4 h-4 mr-3 text-gray-500" />
                Historique d'Activités
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isFabOpen ? 'bg-gray-200 text-gray-800 rotate-45' : 'bg-primary text-white'}`}
        >
          <Icons.Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Archiver les notifications</h3>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment archiver ces notifications ? Les notifications archivées seront stockées pendant 7 jours avant d'être supprimées définitivement. (Seules les notifications lues seront archivées).
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 h-12 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleConfirmArchive}
                  className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Archiver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer définitivement</h3>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment supprimer ces notifications ? Cette action est irréversible et elles seront supprimées définitivement.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 h-12 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {permanentDeleteId !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer définitivement</h3>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment supprimer cette notification des archives ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setPermanentDeleteId(null)}
                  className="px-4 h-12 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmPermanentDelete}
                  className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Archives View Modal */}
      <AnimatePresence>
        {viewingArchives && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gray-50 flex flex-col"
          >
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setViewingArchives(false)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Archives</h1>
              </div>
            </div>
            
            {archivedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 mt-10">
                <Icons.Folder className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Vos archives sont vides.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {archivedNotifications.map(notification => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 flex gap-4 bg-white">
                    <div className="mt-1 shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                        <Icons.Archive className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h4 className="text-sm tracking-tight truncate font-medium text-gray-700">
                          {notification.title}
                        </h4>
                        <span className="text-sm text-gray-500 shrink-0">
                          {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }).format(new Date(notification.date))}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2 text-gray-500 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => handleRestoreFromArchive(notification.id)}
                          className="flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          <Icons.RotateCcw className="w-4 h-4 mr-1" />
                          Restaurer
                        </button>
                        <button 
                          onClick={() => handlePermanentDeleteFromArchive(notification.id)}
                          className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Icons.Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* History View Modal */}
      <AnimatePresence>
        {viewingHistory && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gray-50 flex flex-col"
          >
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setViewingHistory(false)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Historique d'Activités</h1>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setShowClearHistoryConfirm(true)}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Vider l'historique"
                >
                  <Icons.Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500 mt-10">
                <Icons.History className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Aucune activité récente.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {history.map(item => (
                  <div key={item.id} className="p-4 border-b border-gray-100 flex gap-4 bg-white items-center">
                    <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gray-50">
                      {item.type === 'delete' || item.type === 'permanent_delete' ? (
                         <Icons.Trash2 className="w-5 h-5 text-red-500" />
                      ) : item.type === 'archive' ? (
                         <Icons.Archive className="w-5 h-5 text-gray-500" />
                      ) : (
                         <Icons.RotateCcw className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Intl.DateTimeFormat('fr-FR', { 
                          dateStyle: 'medium', 
                          timeStyle: 'short' 
                        }).format(new Date(item.date))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearHistoryConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vider l'historique</h3>
              <p className="text-gray-600 mb-6">
                Voulez-vous vraiment vider tout l'historique d'activités ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="px-4 h-12 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setHistory([]);
                    setShowClearHistoryConfirm(false);
                  }}
                  className="px-4 h-12 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Vider
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
