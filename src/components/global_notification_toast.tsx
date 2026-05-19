import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';

export function GlobalNotificationToast({ 
  notifications, 
  onClick,
  user,
  isNotificationCenterOpen,
  systemToast,
  onClearSystemToast
}: { 
  notifications: any[], 
  onClick: () => void,
  user: any,
  isNotificationCenterOpen: boolean,
  systemToast?: {title: string, message: string} | null,
  onClearSystemToast?: () => void
}) {
  const [activeToast, setActiveToast] = useState<any | null>(null);
  
  // Track when the grouped notification or individual notification was last shown to implement the 10 min rule
  const [lastShownTime, setLastShownTime] = useState<any>(null);
  const [lastShownCount, setLastShownCount] = useState<number>(0);

  useEffect(() => {
    if (systemToast) {
       setActiveToast({
          id: 'system_action',
          title: systemToast.title,
          message: systemToast.message,
          isSystem: true
       });
    }
  }, [systemToast]);

  // Auto-dismiss separate effect
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
        if (activeToast.isSystem && onClearSystemToast) {
           onClearSystemToast();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToast]);

  useEffect(() => {
    if (systemToast) return; // Don't override system toast
    if (!user || activeToast || isNotificationCenterOpen) return;
    
    const unread = notifications.filter(n => !n.read && !n.archived);
    if (unread.length === 0) return;

    // Only consider notifications created in the last 15 seconds
    const recentUnread = unread.filter(n => (Date.now() - new Date(n.date).getTime()) < 15000);
    if (recentUnread.length === 0) return;

    // Get the newest recent unread notification
    const newest = recentUnread.reduce((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime() ? a : b);

    if (newest.id !== lastShownTime) {
      if (unread.length >= 2) {
        setActiveToast({
          id: `grouped_${newest.id}`,
          title: 'Nouvelles notifications',
          message: `Vous avez ${unread.length} notifications.`,
          isSystem: false
        });
      } else {
        setActiveToast({
          ...newest,
          isSystem: false
        });
      }
      setLastShownTime(newest.id); // Reusing lastShownTime state to store last shown id
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, activeToast, isNotificationCenterOpen, user, lastShownTime, systemToast]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 16 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 flex justify-center w-full z-[100] px-4 pointer-events-none"
        >
          <div 
            onClick={() => {
              setActiveToast(null);
              if (activeToast && activeToast.isSystem) {
                 if (onClearSystemToast) onClearSystemToast();
              } else {
                 onClick();
              }
            }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-4 flex items-start gap-4 cursor-pointer pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {activeToast && activeToast.isSystem ? <Icons.Info className="w-5 h-5 text-blue-500" /> : <Icons.Bell className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{activeToast.title}</h4>
              <p className="text-gray-600 text-sm line-clamp-2 mt-0.5 leading-snug">{activeToast.message}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
                if (activeToast && activeToast.isSystem && onClearSystemToast) {
                   onClearSystemToast();
                }
              }}
              className="p-1 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 flex-shrink-0"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
