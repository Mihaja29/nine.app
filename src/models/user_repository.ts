import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export const UserRepository = {
  async saveUserProfile(uid: string, profileData: any) {
    if (auth.currentUser && auth.currentUser.uid === uid) {
      if (profileData.displayName || profileData.photoURL) {
        const updateParams: any = {};
        if (profileData.displayName) updateParams.displayName = profileData.displayName;
        if (profileData.photoURL && !profileData.photoURL.startsWith('data:')) {
            updateParams.photoURL = profileData.photoURL;
        }
        await updateProfile(auth.currentUser, updateParams);
      }
    }

    const savePromise = setDoc(doc(db, 'users', uid), {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La connexion à Firestore a expiré. Veuillez vérifier que Firestore est bien activé et créé dans votre console Firebase, ou vérifiez vos règles de sécurité.')), 10000)
    );

    return Promise.race([savePromise, timeoutPromise]);
  }
};
