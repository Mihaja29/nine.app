import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './auth_context';
import { handleFirestoreError, OperationType } from '../models/firebase_utils';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  archived?: boolean;
  deletedBy?: string[];
  readBy?: string[];
  archivedBy?: string[];
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  handleMarkAsRead: (id: string | number) => void;
  handleMarkAllAsRead: () => void;
  handleDeleteNotification: (id: string | number) => void;
  handleArchiveNotification: (id: string | number) => void;
  handleRestoreNotification: (id: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  handleMarkAsRead: () => {},
  handleMarkAllAsRead: () => {},
  handleDeleteNotification: () => {},
  handleArchiveNotification: () => {},
  handleRestoreNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const q = query(collection(db, 'notifications'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Skip if user deleted it
        if (data.deletedBy && data.deletedBy.includes(user.uid)) return;

        // Filter Annuaire de Groupe notifications for people in the same role/committee, group, and branch.
        if (data.title === 'Annuaire de Groupe') {
          if ((data.targetRole || '') !== (user.role || '')) return;
          if ((data.targetGroupe || '') !== (user.groupe || '')) return;
          if ((data.targetBranche || '') !== (user.branche || '')) return;
        }

        notifs.push({
          id: docSnap.id,
          title: data.title,
          message: data.message,
          date: data.date,
          readBy: data.readBy || [],
          archivedBy: data.archivedBy || [],
          deletedBy: data.deletedBy || [],
          read: data.readBy?.includes(user.uid) || false,
          archived: data.archivedBy?.includes(user.uid) || false,
        });
      });
      setNotifications(notifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const handleMarkAsRead = async (id: string | number) => {
    if (!user) return;
    try {
      const ref = doc(db, 'notifications', id as string);
      await updateDoc(ref, {
        readBy: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unreadNotifs = notifications.filter(n => !n.read);
    for (const notif of unreadNotifs) {
      handleMarkAsRead(notif.id);
    }
  };

  const handleDeleteNotification = async (id: string | number) => {
    if (!user) return;
    try {
      const ref = doc(db, 'notifications', id as string);
      await updateDoc(ref, {
        deletedBy: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveNotification = async (id: string | number) => {
    if (!user) return;
    try {
      const ref = doc(db, 'notifications', id as string);
      await updateDoc(ref, {
        archivedBy: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreNotification = async (id: string | number) => {
    if (!user) return;
    try {
      const ref = doc(db, 'notifications', id as string);
      // to remove from archivedBy, we don't have arrayRemove easily here without importing it.
      // let's fetch current array, remove uid, and update.
      const notif = notifications.find(n => n.id === id);
      if (notif && notif.archivedBy) {
        const newArchivedBy = notif.archivedBy.filter(uid => uid !== user.uid);
        await updateDoc(ref, {
          archivedBy: newArchivedBy
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleDeleteNotification,
      handleArchiveNotification,
      handleRestoreNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
