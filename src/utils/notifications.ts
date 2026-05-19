import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { handleFirestoreError, OperationType } from '../models/firebase_utils';

export const createGroupNotification = async (user: any, message: string) => {
  if (!user) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      title: 'Annuaire de Groupe',
      message,
      date: new Date().toISOString(),
      creatorId: user.uid,
      targetRole: user.role || '',
      targetGroupe: user.groupe || '',
      targetBranche: user.branche || '',
      readBy: [],
      archivedBy: [],
      deletedBy: []
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
  }
};
