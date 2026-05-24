// To help organize the code, we extract the logic into a custom hook
import React, { useState, useEffect } from 'react';
import { UserRepository } from '../models/user_repository';
import { auth } from '../config/firebase';

export function useProfileSetupViewModel(user: any, onComplete: () => void, isEditMode: boolean) {
  const [step, setStep] = useState(1);
  
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [photoBase64, setPhotoBase64] = useState('');
  
  const [coverPhotoURL, setCoverPhotoURL] = useState(user?.coverPhotoURL || '');
  const [coverPhotoBase64, setCoverPhotoBase64] = useState('');
  
  const [hasTotem, setHasTotem] = useState<'oui' | 'non' | ''>(user?.hasTotem || '');
  const [totemName, setTotemName] = useState(user?.totemName || '');
  const [useTotemAsMainName, setUseTotemAsMainName] = useState(user?.useTotemAsMainName || false);
  const [joinDate, setJoinDate] = useState(user?.joinDate || '');

  const [role, setRole] = useState(user?.role || '');
  const [groupe, setGroupe] = useState(user?.groupe || '');
  const [branche, setBranche] = useState(user?.branche || '');
  const [fonctionBranche, setFonctionBranche] = useState(user?.fonctionBranche || '');
  const [etapeFormation, setEtapeFormation] = useState(user?.etapeFormation || '');
  const initGuideDate = (user?.promesseGuideDate || '').split('-');
  const initChefDate = (user?.promesseChefDate || '').split('-');
  
  const [promesseGuideDay, setPromesseGuideDay] = useState(initGuideDate[2] || '');
  const [promesseGuideMonth, setPromesseGuideMonth] = useState(initGuideDate[1] || '');
  const [promesseGuideYear, setPromesseGuideYear] = useState(initGuideDate[0] || '');
  
  const [promesseChefDay, setPromesseChefDay] = useState(initChefDate[2] || '');
  const [promesseChefMonth, setPromesseChefMonth] = useState(initChefDate[1] || '');
  const [promesseChefYear, setPromesseChefYear] = useState(initChefDate[0] || '');

  const [loading, setLoading] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    if (user?.displayName && !user?.firstName && !user?.lastName) {
      const parts = user.displayName.split(' ');
      if (parts.length > 1) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else {
        setLastName(parts[0] || '');
      }
    }
  }, [user]);

  const getFinalDate = (y: string, m: string, d: string) => {
    if (!y && !m && !d) return '';
    return `${y || ''}-${m || ''}-${d || ''}`;
  };

  const finalPromesseGuideDate = getFinalDate(promesseGuideYear, promesseGuideMonth, promesseGuideDay);
  const finalPromesseChefDate = getFinalDate(promesseChefYear, promesseChefMonth, promesseChefDay);

  const hasUnsavedChanges = 
    lastName !== (user?.lastName || '') ||
    firstName !== (user?.firstName || (user?.displayName ? user.displayName.split(' ')[0] : '')) ||
    birthDate !== (user?.birthDate || '') ||
    address !== (user?.address || '') ||
    bio !== (user?.bio || '') ||
    phone !== (user?.phone || '') ||
    email !== (user?.email || '') ||
    photoURL !== (user?.photoURL || '') ||
    photoBase64 !== '' ||
    hasTotem !== (user?.hasTotem || '') ||
    totemName !== (user?.totemName || '') ||
    useTotemAsMainName !== (user?.useTotemAsMainName || false) ||
    joinDate !== (user?.joinDate || '') ||
    role !== (user?.role || '') ||
    groupe !== (user?.groupe || '') ||
    branche !== (user?.branche || '') ||
    fonctionBranche !== (user?.fonctionBranche || '') ||
    etapeFormation !== (user?.etapeFormation || '') ||
    finalPromesseGuideDate !== (user?.promesseGuideDate || '') ||
    finalPromesseChefDate !== (user?.promesseChefDate || '');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoBase64 && !photoURL) {
      console.error("Veuillez fournir une photo de profil (via importation ou URL).");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (auth.currentUser) {
        const finalDisplayName = (hasTotem === 'oui' && useTotemAsMainName && totemName) 
          ? totemName 
          : `${firstName} ${lastName}`.trim();
        
        await UserRepository.saveUserProfile(auth.currentUser.uid, {
          displayName: finalDisplayName,
          lastName,
          firstName,
          birthDate,
          address,
          bio,
          phone,
          email,
          hasTotem,
          totemName: hasTotem === 'oui' ? totemName : '',
          useTotemAsMainName: hasTotem === 'oui' ? useTotemAsMainName : false,
          role,
          groupe: (role === 'tonia' || role === 'mpiandraikitra') ? groupe : '',
          branche: role === 'kp' || role === 'fmt2s' || (role === 'mpiandraikitra' && groupe !== '') ? branche : '',
          fonctionBranche: (role === 'mpiandraikitra' && branche !== '') ? fonctionBranche : '',
          etapeFormation: (role === 'tonia' || role === 'mpiandraikitra') && groupe !== '' ? etapeFormation : '',
          joinDate,
          promesseGuideDate: finalPromesseGuideDate,
          promesseChefDate: finalPromesseChefDate,
          photoURL: photoBase64 || photoURL,
          coverPhotoURL: coverPhotoBase64 || coverPhotoURL,
        });

        localStorage.setItem(`profile_setup_done_${auth.currentUser.uid}`, 'true');
        
        if (isEditMode) {
          console.log('Modifications sauvegardées avec succès !');
        }
        
        setLoading(false);
        onComplete();
      }
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + (err as Error).message + '\\n\\nSi cela bloque, vérifiez que Firestore est bien activé pour votre projet Firebase.');
      setLoading(false);
    }
  };

  return {
    step, setStep,
    lastName, setLastName,
    firstName, setFirstName,
    birthDate, setBirthDate,
    address, setAddress,
    bio, setBio,
    phone, setPhone,
    email, setEmail,
    photoURL, setPhotoURL,
    photoBase64, setPhotoBase64,
    coverPhotoURL, setCoverPhotoURL,
    coverPhotoBase64, setCoverPhotoBase64,
    hasTotem, setHasTotem,
    totemName, setTotemName,
    useTotemAsMainName, setUseTotemAsMainName,
    joinDate, setJoinDate,
    role, setRole,
    groupe, setGroupe,
    branche, setBranche,
    fonctionBranche, setFonctionBranche,
    etapeFormation, setEtapeFormation,
    promesseGuideDay, setPromesseGuideDay,
    promesseGuideMonth, setPromesseGuideMonth,
    promesseGuideYear, setPromesseGuideYear,
    promesseChefDay, setPromesseChefDay,
    promesseChefMonth, setPromesseChefMonth,
    promesseChefYear, setPromesseChefYear,
    loading, showUnsavedModal, setShowUnsavedModal,
    hasUnsavedChanges, handleNextStep, handleSubmit
  };
}
