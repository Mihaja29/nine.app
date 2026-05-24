import React, { useState, useEffect } from 'react';
import { Icons } from '../components/icons';
import { TopBar } from '../components/top_bar';
import { Person, Beneficiary, Unite, Equipe } from '../models/app_types';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../models/firebase_utils';
import { db } from '../config/firebase';
import { createGroupNotification as createGroupNotificationUtil } from '../utils/notifications';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  user: any;
  onProfileClick: () => void;
  onBack?: () => void;
  onMenuClick?: () => void;
  people: Person[];
  onPersonClick: (id: string, personObj?: any) => void;
  onViewChange?: (view: string) => void;
}

export function Dashboard({ user, onProfileClick, onBack, onMenuClick, people, onPersonClick, onViewChange }: DashboardProps) {
  const isMpiandraikitra = user?.role === 'mpiandraikitra';
  const [activeTab, setActiveTab] = useState<'mpiandraikitra' | 'membres'>(
    (sessionStorage.getItem('dashboard_active_tab') as 'mpiandraikitra' | 'membres') || 'mpiandraikitra'
  );

  useEffect(() => {
    sessionStorage.setItem('dashboard_active_tab', activeTab);
  }, [activeTab]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loadingBen, setLoadingBen] = useState(false);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabMenu, setFabMenu] = useState<'main' | 'unites' | 'equipes' | 'membres'>('main');
  const [showUniteModal, setShowUniteModal] = useState(false);
  const [showEquipeModal, setShowEquipeModal] = useState(false);
  const [showMembreModal, setShowMembreModal] = useState(false);
  const [membreModalStep, setMembreModalStep] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);
  
  const [newMemberData, setNewMemberData] = useState({
    lastName: '',
    firstName: '',
    birthDateDay: '',
    birthDateMonth: '',
    birthDateYear: '',
    birthPlace: '',
    address: '',
    phone: '',
    school: '',
    schoolClass: '',
    siblingsCount: '',
    fatherName: '',
    fatherProfession: '',
    fatherPhone: '',
    motherName: '',
    motherProfession: '',
    motherPhone: '',
    tuteurName: '',
    tuteurProfession: '',
    tuteurPhone: '',
    tutriceName: '',
    tutriceProfession: '',
    tutricePhone: '',
    commonIllness: '',
    foodIntolerance: '',
    totem: '',
    equipeId: '',
    etape: '',
    responsabilite: '',
    photoURL: '',
  });

  const [hasTuteur, setHasTuteur] = useState(false);
  const [newUniteType, setNewUniteType] = useState('');
  const [newUniteName, setNewUniteName] = useState('');
  const [newEquipeType, setNewEquipeType] = useState('');
  const [newEquipeName, setNewEquipeName] = useState('');
  const [selectedUniteId, setSelectedUniteId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bProfile = user?.branche || '';

  const getEtapesOptions = () => {
    if (user?.groupe !== 'Tily Eto Madagasikara') return [];
    switch (bProfile) {
      case 'Lovitao':
        return ['Miana-mandady (Patte tendre)', 'Vakimaso I (Premier œil ouvert)', 'Vakimaso II (Deuxième œil ouvert)', 'Mpiremby (Le Chasseur)'];
      case 'Tily':
        return ['Zazavao (Aspirant)', 'Mpikatroka (Deuxième classe)', 'Menavazana (Première classe)'];
      case 'Mpiandalana':
        return ['Mpiomana (Novice)', 'Mpiatrika (Compagnon)', 'Mpihary (Citoyen)'];
      case 'Mpitarika':
        return ['Mpiketrika mameno', 'Mpialoha lalana', 'Mahatsangy no ary'];
      default:
        return [];
    }
  };

  const getResponsabilitesOptions = () => {
    switch (bProfile) {
      case 'Voronkely':
        return ['Lohan\'ny Tarika', 'Solon-dohan\'ny Tarika', 'Autre'];
      case 'Louveteau':
      case 'Louvetaux':
        return ['Zokin\'ny Enina', 'Solon-jokin\'ny Enina', 'Autre'];
      case 'Mpanazava':
      case 'Tily':
        return ['Lohan-tsokajy', 'Solon-dohan-tsokajy', 'Autre'];
      case 'Mpanazava Zokiny':
      case 'Tily Mena':
      case 'Mpiandalana':
      case 'Mena Fify':
        return ['Loholona', 'Autre'];
      default:
        return ['Responsable', 'Assistant(e)', 'Membre', 'Autre'];
    }
  };

  const getUniteOptions = () => {
    if (['Lovitao', 'Voronkely'].includes(bProfile)) return ['Andiany'];
    if (['Tily', 'Mpanazava'].includes(bProfile)) return ['Antoko'];
    if (['Mpiandalana', 'Mpitarika', 'Afo'].includes(bProfile)) return ['Fileovana'];
    return ['Andiany', 'Antoko', 'Fileovana'];
  };

  const getEquipeOptions = () => {
    if (bProfile === 'Lovitao') return ['Sizaine'];
    if (['Tily', 'Mpanazava'].includes(bProfile)) return ['Patrouille'];
    if (['Mpiandalana', 'Mpitarika', 'Afo', 'Voronkely'].includes(bProfile)) return ['Équipe'];
    return ['Sizaine', 'Patrouille', 'Équipe'];
  };

  useEffect(() => {
    const opts = getUniteOptions();
    if (opts.length === 1 && !newUniteType) setNewUniteType(opts[0]);
  }, [bProfile]);

  useEffect(() => {
    const opts = getEquipeOptions();
    if (opts.length === 1 && !newEquipeType) setNewEquipeType(opts[0]);
  }, [bProfile]);

  useEffect(() => {
    if (isMpiandraikitra && user?.groupe) {
      const qUnites = query(collection(db, 'unites'), where('groupe', '==', user.groupe));
      const unsubscribeUnites = onSnapshot(qUnites, (snapshot) => {
        const u = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unite));
        setUnites(u);
      });
      const qEquipes = query(collection(db, 'equipes'), where('groupe', '==', user.groupe));
      const unsubscribeEquipes = onSnapshot(qEquipes, (snapshot) => {
        const e = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipe));
        setEquipes(e);
      });
      return () => {
        unsubscribeUnites();
        unsubscribeEquipes();
      };
    }
  }, [isMpiandraikitra, user?.groupe]);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openMenuId]);

  const createGroupNotification = async (message: string) => {
    await createGroupNotificationUtil(user, message);
  };

  const handleDeleteBeneficiary = async () => {
    if (!personToDelete) return;
    try {
      const person = beneficiaries.find(b => b.id === personToDelete);
      await deleteDoc(doc(db, 'beneficiaries', personToDelete));
      
      if (person) {
        const creatorName = user?.useTotemAsMainName && user?.totemName ? user.totemName : `${user?.firstName} ${user?.lastName}`;
        await createGroupNotification(`${creatorName} a supprimé le membre bénéficiaire : ${person.firstName} ${person.lastName}`);
      }
      
      setShowDeleteConfirm(false);
      setPersonToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUnite = async () => {
    if (!newUniteName || !newUniteType) return;
    setIsSubmitting(true);
    try {
      const creatorName = user?.useTotemAsMainName && user?.totemName ? user.totemName : `${user?.firstName} ${user?.lastName}`;
      await addDoc(collection(db, 'unites'), {
        name: newUniteName.toUpperCase(),
        type: newUniteType,
        createdBy: user?.uid,
        creatorName: creatorName,
        createdAt: new Date().toISOString(),
        groupe: user?.groupe
      });
      await createGroupNotification(`${creatorName} a ajouté une nouvelle unité : ${newUniteName.toUpperCase()}`);
      
      setShowUniteModal(false);
      setNewUniteName('');
    } catch (e) {
      console.error(e);
      console.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEquipe = async () => {
    if (!newEquipeName || !newEquipeType || !selectedUniteId) return;
    setIsSubmitting(true);
    try {
      const creatorName = user?.useTotemAsMainName && user?.totemName ? user.totemName : `${user?.firstName} ${user?.lastName}`;
      await addDoc(collection(db, 'equipes'), {
        name: newEquipeName.toUpperCase(),
        type: newEquipeType,
        uniteId: selectedUniteId,
        createdBy: user?.uid,
        creatorName: creatorName,
        createdAt: new Date().toISOString(),
        groupe: user?.groupe
      });
      await createGroupNotification(`${creatorName} a ajouté une nouvelle équipe : ${newEquipeName.toUpperCase()}`);

      setShowEquipeModal(false);
      setNewEquipeName('');
    } catch (e) {
      console.error(e);
      console.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMember = async () => {
    if (!newMemberData.lastName || !newMemberData.firstName) return;
    setIsSubmitting(true);
    try {
      const { birthDateDay, birthDateMonth, birthDateYear, ...saveData } = newMemberData;
      const birthDate = (birthDateDay && birthDateMonth && birthDateYear) 
        ? `${birthDateDay.padStart(2, '0')}/${birthDateMonth.padStart(2, '0')}/${birthDateYear}` 
        : '';

      const creatorName = user?.useTotemAsMainName && user?.totemName ? user.totemName : `${user?.firstName} ${user?.lastName}`;

      await addDoc(collection(db, 'beneficiaries'), {
        ...saveData,
        birthDate,
        createdBy: user?.uid,
        creatorName: creatorName,
        dateAdded: new Date().toISOString(),
        groupe: user?.groupe,
        branche: bProfile,
        status: 'actif'
      });
      await createGroupNotification(`${creatorName} a ajouté un nouveau membre bénéficiaire : ${saveData.firstName} ${saveData.lastName}`);

      setShowMembreModal(false);
      setMembreModalStep(1);
      setHasTuteur(false);
      setNewMemberData({
        lastName: '', firstName: '', birthDateDay: '', birthDateMonth: '', birthDateYear: '', birthPlace: '',
        address: '', phone: '', school: '', schoolClass: '',
        siblingsCount: '', fatherName: '', fatherProfession: '', fatherPhone: '',
        motherName: '', motherProfession: '', motherPhone: '',
        tuteurName: '', tuteurProfession: '', tuteurPhone: '',
        tutriceName: '', tutriceProfession: '', tutricePhone: '',
        commonIllness: '', foodIntolerance: '', totem: '', equipeId: '', etape: '', responsabilite: '', photoURL: ''
      });
    } catch (e) {
      console.error(e);
      console.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setNewMemberData(prev => ({ ...prev, photoURL: dataUrl }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isMpiandraikitra && user?.groupe) {
      setLoadingBen(true);
      const q = query(
        collection(db, 'beneficiaries'),
        where('groupe', '==', user.groupe),
        ...(user.branche ? [where('branche', '==', user.branche)] : [])
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const b: Beneficiary[] = [];
        snapshot.forEach(doc => {
          b.push({ id: doc.id, ...doc.data() } as Beneficiary);
        });
        setBeneficiaries(b);
        setLoadingBen(false);
      }, (err) => {
        console.error(err);
        setBeneficiaries([{ id: 'error', firstName: 'Erreur', lastName: 'de permission Firebase', status: 'actif' } as unknown as Beneficiary]);
        setLoadingBen(false);
      });
      return () => unsub();
    }
  }, [isMpiandraikitra, user?.groupe, user?.branche]);

  const displayedList = (isMpiandraikitra && activeTab === 'membres') 
    ? beneficiaries 
    : people;

  const totalCount = displayedList.length;
  const activeCount = displayedList.filter(p => p.status === 'Actif').length;
  const inactiveCount = displayedList.filter(p => p.status === 'Inactif').length;

  const formatLastActive = (lastActiveISO: string | null | undefined): { label: string; isOnline: boolean } => {
    if (!lastActiveISO) return { label: 'Actif', isOnline: false };
    const lastActive = new Date(lastActiveISO).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - lastActive) / 60000);
    
    if (diffMins < 5) return { label: 'En ligne', isOnline: true };
    if (diffMins < 60) return { label: `${diffMins} min`, isOnline: false };
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return { label: `${diffHours} h`, isOnline: false };
    
    const diffDays = Math.floor(diffHours / 24);
    return { label: `${diffDays} j`, isOnline: false };
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <TopBar 
        title="Annuaire de Groupe" 
        user={user}
        onProfileClick={onProfileClick}
        onBackClick={onBack}
        onMenuClick={onMenuClick}
        onSearchClick={() => {}} 
        bgClass="bg-gray-50"
      />

      <div className="pt-6 flex-1 flex flex-col">
        <div className="relative drop-shadow-sm max-w-full flex-1 flex flex-col">
          {isMpiandraikitra && (
            <div className="flex relative z-10 w-full shrink-0">
              <div className="flex-1 relative">
                {activeTab === 'mpiandraikitra' && (
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-white rounded-tr-[20px]">
                    <div className="absolute bottom-0 -right-[20px] w-[20px] h-[20px] bg-transparent pointer-events-none"
                         style={{ borderBottomLeftRadius: '20px', boxShadow: '-10px 10px 0 10px white' }} />
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('mpiandraikitra')}
                  className={cn(
                    "relative w-full py-3 text-[14px] transition-all duration-200 outline-none focus:outline-none select-none z-20",
                    activeTab === 'mpiandraikitra' ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-700 font-medium"
                  )}
                >
                  Chefs d'Unité
                </button>
              </div>
              
              <div className="flex-1 relative z-10">
                {activeTab === 'membres' && (
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-white rounded-tl-[20px]">
                    <div className="absolute bottom-0 -left-[20px] w-[20px] h-[20px] bg-transparent pointer-events-none"
                         style={{ borderBottomRightRadius: '20px', boxShadow: '10px 10px 0 10px white' }} />
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('membres')}
                  className={cn(
                    "relative w-full py-3 text-[14px] transition-all duration-200 outline-none focus:outline-none select-none z-20",
                    activeTab === 'membres' ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-700 font-medium"
                  )}
                >
                  Bénéficiaires
                </button>
              </div>
            </div>
          )}

          <div className={cn(
            "bg-white px-4 pt-6 pb-24 min-h-[500px] flex-1 relative z-20 w-full",
            isMpiandraikitra ? "rounded-none" : "rounded-none"
          )}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <StatCard icon={<Icons.User className="w-5 h-5 text-primary" />} count={totalCount} label="Total" />
              <StatCard icon={<Icons.UserCheck className="w-5 h-5 text-gray-800" />} count={activeCount} label="Actifs" />
              <StatCard icon={<Icons.UserMinus className="w-5 h-5 text-gray-400" />} count={inactiveCount} label="Inactifs" />
            </div>

            {/* Content */}
            {displayedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Icons.Users className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun membre</h3>
                <p className="text-gray-500 text-sm max-w-[250px]">
                  {activeTab === 'membres' 
                    ? "Vous n'avez pas encore de membres bénéficiaires dans votre unité."
                    : "Il n'y a pas encore d'autres membres de votre type dans l'annuaire."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                 {displayedList.map((person: any) => (
                   <div 
                     key={person.id}
                     onClick={() => {
                       if (person.id === user?.uid) {
                         onProfileClick();
                       } else if (activeTab === 'mpiandraikitra') {
                         onPersonClick(person.id, person);
                       }
                     }}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         if (person.id === user?.uid) {
                           onProfileClick();
                         } else if (activeTab === 'mpiandraikitra') {
                           onPersonClick(person.id, person);
                         }
                       }
                     }}
                     className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 text-left cursor-pointer relative"
                   >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    {person.photoURL ? (
                      <img src={person.photoURL} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <Icons.User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {person.useTotemAsMainName && person.totemName ? person.totemName : `${person.firstName} ${person.lastName}`}
                    </h4>
                    {activeTab === 'membres' ? (
                      <div className="flex flex-col mt-0.5">
                        <span className="text-gray-500 text-sm truncate">{person.responsabilite || person.branche}</span>
                        {person.equipeId && (
                          <span className="text-gray-400 text-[11px] truncate mt-0.5">
                            {equipes.find(eq => eq.id === person.equipeId)?.name || ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm truncate font-normal font-sans text-left capitalize">
                        {person.role}
                      </p>
                    )}
                  </div>
                  {activeTab === 'membres' ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-full flex flex-col justify-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === person.id ? null : person.id);
                        }}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center shrink-0 w-12 h-12"
                      >
                        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                          <path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"/>
                        </svg>
                      </button>

                      <AnimatePresence>
                        {openMenuId === person.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-10 top-1/2 -translate-y-1/2 mt-0 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-[60]"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  onPersonClick(person.id, person);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <svg className="w-4 h-4 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                  <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"/>
                                </svg>
                                Voir le profil
                              </button>
                              <div className="h-px bg-gray-100 my-1 mx-2"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setPersonToDelete(person.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <svg className="w-4 h-4 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                  <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/>
                                </svg>
                                Supprimer le profil
                              </button>
                            </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (() => {
                    const presence = formatLastActive(person.lastActive);
                    const isMissingLastActive = !person.lastActive;
                    
                    return (
                      <div className={cn(
                        "px-2.5 py-1 text-sm font-medium rounded-full flex items-center gap-2 shrink-0",
                        presence.isOnline ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {presence.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>}
                        {isMissingLastActive && person.status === 'Actif' ? 'Actif' : presence.label}
                      </div>
                    );
                  })()}
                </div>
             ))}
          </div>
        )}
        </div>
        </div>

        {/* FAB Backdrop */}
        <AnimatePresence>
          {isMpiandraikitra && activeTab === 'membres' && isFabOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-30"
              onClick={() => {
                setIsFabOpen(false);
                setTimeout(() => setFabMenu('main'), 300);
              }}
            />
          )}
        </AnimatePresence>

        {/* Floating Action Menu for adding beneficiary / Unite / Equipe */}
        {isMpiandraikitra && activeTab === 'membres' && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            <AnimatePresence>
              {isFabOpen && (
                <motion.div 
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-[220px]"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {fabMenu === 'main' && (
                      <motion.div
                        key="main"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="py-2"
                      >
                        {equipes.length > 0 && (
                          <button 
                            onClick={() => setFabMenu('membres')}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <Icons.UserRound className="w-[18px] h-[18px] text-gray-400" />
                              Membres
                            </div>
                            <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        {unites.length > 0 && (
                          <button 
                            onClick={() => setFabMenu('equipes')}
                            className={cn("w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors", unites.length > 0 ? "border-b border-gray-100" : "")}
                          >
                            <div className="flex items-center gap-3">
                              <Icons.Users className="w-[18px] h-[18px] text-gray-400" />
                              Équipes
                            </div>
                            <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <button 
                          onClick={() => setFabMenu('unites')}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icons.Group className="w-[18px] h-[18px] text-gray-400" />
                            Unités
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </motion.div>
                    )}
                    
                    {fabMenu === 'membres' && (
                      <motion.div
                        key="membres"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="py-2"
                      >
                        <div className="flex items-center px-4 py-2 mb-1 border-b border-gray-100">
                          <button 
                            onClick={() => setFabMenu('main')}
                            className="p-1 -ml-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 mr-2 transition-colors"
                          >
                            <Icons.ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 font-semibold text-gray-800">
                            <Icons.UserRound className="w-[18px] h-[18px] text-gray-500" />
                            Membres
                          </div>
                        </div>
                        <button 
                          onClick={() => { setShowMembreModal(true); setIsFabOpen(false); setFabMenu('main'); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium border-b border-gray-100"
                        >
                          Ajouter un Membre
                        </button>
                      </motion.div>
                    )}

                    {fabMenu === 'unites' && (
                      <motion.div
                        key="unites"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="py-2"
                      >
                        <div className="flex items-center px-4 py-2 mb-1 border-b border-gray-100">
                          <button 
                            onClick={() => setFabMenu('main')}
                            className="p-1 -ml-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 mr-2 transition-colors"
                          >
                            <Icons.ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 font-semibold text-gray-800">
                            <Icons.Group className="w-[18px] h-[18px] text-gray-500" />
                            Unités
                          </div>
                        </div>
                        <button 
                          onClick={() => { setShowUniteModal(true); setIsFabOpen(false); setFabMenu('main'); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium border-b border-gray-100"
                        >
                          Ajouter une Unité
                        </button>
                        <button 
                          onClick={() => { onViewChange?.('unites_list'); setIsFabOpen(false); setFabMenu('main'); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                        >
                          Voir les Unités
                        </button>
                      </motion.div>
                    )}

                    {fabMenu === 'equipes' && (
                      <motion.div
                        key="equipes"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="py-2"
                      >
                        <div className="flex items-center px-4 py-2 mb-1 border-b border-gray-100">
                          <button 
                            onClick={() => setFabMenu('main')}
                            className="p-1 -ml-1 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 mr-2 transition-colors"
                          >
                            <Icons.ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 font-semibold text-gray-800">
                            <Icons.Users className="w-[18px] h-[18px] text-gray-500" />
                            Équipes
                          </div>
                        </div>
                        <button 
                          onClick={() => { setShowEquipeModal(true); setIsFabOpen(false); setFabMenu('main'); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium border-b border-gray-100"
                        >
                          Ajouter une Équipe
                        </button>
                        <button 
                          onClick={() => { onViewChange?.('equipes_list'); setIsFabOpen(false); setFabMenu('main'); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                        >
                          Voir les Équipes
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              className={cn(
                "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
                isFabOpen ? "bg-gray-200 text-gray-800" : "bg-primary text-white"
              )}
              onClick={() => {
                if (isFabOpen) {
                  setIsFabOpen(false);
                  setTimeout(() => setFabMenu('main'), 300);
                } else {
                  setIsFabOpen(true);
                  setFabMenu('main');
                }
              }}
            >
              <Icons.Plus className={cn("w-6 h-6 transition-transform duration-300", isFabOpen ? "rotate-[135deg]" : "rotate-0")} />
            </button>
          </div>
        )}
      </div>

      {/* Unite Modal */}
      {showUniteModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Choisissez votre Unité :</h3>
              <button onClick={() => setShowUniteModal(false)} className="text-gray-400 hover:text-gray-600">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <select
                  value={newUniteType}
                  onChange={(e) => setNewUniteType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium"
                >
                  <option value="" disabled>Type d'Unité</option>
                  {getUniteOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Entrez le nom de l'Unité ici"
                  value={newUniteName}
                  onChange={(e) => setNewUniteName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase placeholder:normal-case font-medium"
                />
              </div>

              <button
                onClick={handleCreateUnite}
                disabled={!newUniteType || !newUniteName || isSubmitting}
                className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Equipe Modal */}
      {showEquipeModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Veuillez sélectionner l'Unité :</h3>
              <button onClick={() => setShowEquipeModal(false)} className="text-gray-400 hover:text-gray-600">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <select
                  value={selectedUniteId}
                  onChange={(e) => setSelectedUniteId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium"
                >
                  <option value="" disabled>Sélectionnez une Unité</option>
                  {unites.map(u => (
                    <option key={u.id} value={u.id}>{u.type} {u.name}</option>
                  ))}
                </select>
              </div>

              <h4 className="text-sm font-semibold text-gray-700 pt-2">Choisissez votre Équipe :</h4>
              
              <div>
                <select
                  value={newEquipeType}
                  onChange={(e) => setNewEquipeType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none font-medium"
                >
                  <option value="" disabled>Type d'Équipe</option>
                  {getEquipeOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Entrez le nom de l'Équipe ici"
                  value={newEquipeName}
                  onChange={(e) => setNewEquipeName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase placeholder:normal-case font-medium"
                />
              </div>

              <button
                onClick={handleCreateEquipe}
                disabled={!selectedUniteId || !newEquipeType || !newEquipeName || isSubmitting}
                className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Membre Modal Form */}
      {showMembreModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-full max-w-sm overflow-hidden"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {membreModalStep === 1 && (
                  <>
                    <Icons.IdCard className="w-5 h-5 text-gray-400" />
                    Identité
                  </>
                )}
                {membreModalStep === 2 && (
                  <>
                    <Icons.BookUser className="w-5 h-5 text-gray-400" />
                    Contact / Adresse
                  </>
                )}
                {membreModalStep === 3 && (
                  <>
                    <Icons.School className="w-5 h-5 text-gray-400" />
                    Scolarité
                  </>
                )}
                {membreModalStep === 4 && (
                  <>
                    <Icons.HousePlus className="w-5 h-5 text-gray-400" />
                    Famille
                  </>
                )}
                {membreModalStep === 5 && (
                  <>
                    <Icons.HeartPulse className="w-5 h-5 text-gray-400" />
                    Santé
                  </>
                )}
                {membreModalStep === 6 && (
                  <>
                    <Icons.TentTree className="w-5 h-5 text-gray-400" />
                    Scoutisme
                  </>
                )}
              </h3>
              <button 
                onClick={() => {
                  setShowMembreModal(false);
                  setMembreModalStep(1);
                  setHasTuteur(false);
                  setNewMemberData({ lastName: '', firstName: '', birthDateDay: '', birthDateMonth: '', birthDateYear: '', birthPlace: '', address: '', phone: '', school: '', schoolClass: '', siblingsCount: '', fatherName: '', fatherProfession: '', fatherPhone: '', motherName: '', motherProfession: '', motherPhone: '', tuteurName: '', tuteurProfession: '', tuteurPhone: '', tutriceName: '', tutriceProfession: '', tutricePhone: '', commonIllness: '', foodIntolerance: '', totem: '', equipeId: '', etape: '', responsabilite: '', photoURL: '' });
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative overflow-visible h-auto min-h-[300px]">
              <AnimatePresence mode="wait" initial={false}>
                {membreModalStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: '-10%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-10%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {newMemberData.photoURL ? (
                          <img src={newMemberData.photoURL} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                          <Icons.Image className="w-12 h-12 text-gray-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Ajouter une photo</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nom :</label>
                      <input
                        type="text"
                        placeholder="Nom"
                        value={newMemberData.lastName}
                        onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase placeholder:normal-case font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom :</label>
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={newMemberData.firstName}
                        onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium capitalize"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance :</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="JJ"
                          min="1"
                          max="31"
                          value={newMemberData.birthDateDay}
                          onChange={(e) => setNewMemberData({ ...newMemberData, birthDateDay: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                        <input
                          type="number"
                          placeholder="MM"
                          min="1"
                          max="12"
                          value={newMemberData.birthDateMonth}
                          onChange={(e) => setNewMemberData({ ...newMemberData, birthDateMonth: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                        <input
                          type="number"
                          placeholder="AAAA"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={newMemberData.birthDateYear}
                          onChange={(e) => setNewMemberData({ ...newMemberData, birthDateYear: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Lieu de naissance :</label>
                      <input
                        type="text"
                        placeholder="Lieu de naissance"
                        value={newMemberData.birthPlace}
                        onChange={(e) => setNewMemberData({ ...newMemberData, birthPlace: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <button
                      onClick={() => setMembreModalStep(2)}
                      disabled={!newMemberData.lastName || !newMemberData.firstName || !newMemberData.birthDateDay || !newMemberData.birthDateMonth || !newMemberData.birthDateYear || !newMemberData.birthPlace}
                      className="w-full py-2.5 mt-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Suivant
                     </button>
                  </motion.div>
                )}

                {membreModalStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse postale :</label>
                      <input
                        type="text"
                        placeholder="Adresse postale"
                        value={newMemberData.address}
                        onChange={(e) => setNewMemberData({ ...newMemberData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de téléphone :</label>
                      <input
                        type="tel"
                        placeholder="Numéro de téléphone"
                        value={newMemberData.phone}
                        onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setMembreModalStep(1)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 flex items-center justify-center w-12"
                      >
                        <Icons.ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setMembreModalStep(3)}
                        disabled={!newMemberData.address || (newMemberData.phone.length > 0 && newMemberData.phone.length !== 10)}
                        className="py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                      >
                        Suivant
                      </button>
                    </div>
                  </motion.div>
                )}

                {membreModalStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Établissement scolaire :</label>
                      <input
                        type="text"
                        placeholder="Nom de l'établissement"
                        value={newMemberData.school}
                        onChange={(e) => setNewMemberData({ ...newMemberData, school: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Classe :</label>
                      <select
                        value={newMemberData.schoolClass}
                        onChange={(e) => setNewMemberData({ ...newMemberData, schoolClass: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      >
                        <option value="" disabled>Sélectionner une classe</option>
                        <option value="Jardin d'enfant">Jardin d'enfant / Maternelle</option>
                        <option value="11ème">11ème (CP)</option>
                        <option value="10ème">10ème (CE1)</option>
                        <option value="9ème">9ème (CE2)</option>
                        <option value="8ème">8ème (CM1)</option>
                        <option value="7ème">7ème (CM2)</option>
                        <option value="6ème">6ème</option>
                        <option value="5ème">5ème</option>
                        <option value="4ème">4ème</option>
                        <option value="3ème">3ème</option>
                        <option value="Seconde">Seconde</option>
                        <option value="Première">Première</option>
                        <option value="Terminale">Terminale</option>
                        <option value="Université">Université / Études supérieures</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setMembreModalStep(2)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 flex items-center justify-center w-12"
                      >
                        <Icons.ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setMembreModalStep(4)}
                        disabled={!newMemberData.school || !newMemberData.schoolClass}
                        className="py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                      >
                        Suivant
                      </button>
                    </div>
                  </motion.div>
                )}

                {membreModalStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de frères et sœurs :</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ex: 2"
                        value={newMemberData.siblingsCount}
                        onChange={(e) => setNewMemberData({ ...newMemberData, siblingsCount: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Parents</h4>
                      
                      <div className="space-y-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <label className="block text-sm font-bold text-blue-800">Père</label>
                        <div>
                          <input
                            type="text"
                            placeholder="Nom du père"
                            value={newMemberData.fatherName}
                            onChange={(e) => setNewMemberData({ ...newMemberData, fatherName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Profession"
                            value={newMemberData.fatherProfession}
                            onChange={(e) => setNewMemberData({ ...newMemberData, fatherProfession: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Numéro de téléphone"
                            value={newMemberData.fatherPhone}
                            onChange={(e) => setNewMemberData({ ...newMemberData, fatherPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100/50">
                        <label className="block text-sm font-bold text-pink-800">Mère</label>
                        <div>
                          <input
                            type="text"
                            placeholder="Nom de la mère"
                            value={newMemberData.motherName}
                            onChange={(e) => setNewMemberData({ ...newMemberData, motherName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Profession"
                            value={newMemberData.motherProfession}
                            onChange={(e) => setNewMemberData({ ...newMemberData, motherProfession: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Numéro de téléphone"
                            value={newMemberData.motherPhone}
                            onChange={(e) => setNewMemberData({ ...newMemberData, motherPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex border-t border-gray-100 pt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasTuteur}
                            onChange={(e) => setHasTuteur(e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Ajouter un tuteur / une tutrice</span>
                        </label>
                      </div>

                      {hasTuteur && (
                        <>
                          <div className="space-y-3 mt-4 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                            <label className="block text-sm font-bold text-purple-800">Tuteur</label>
                            <div>
                              <input
                                type="text"
                                placeholder="Nom du tuteur"
                                value={newMemberData.tuteurName}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tuteurName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Profession"
                                value={newMemberData.tuteurProfession}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tuteurProfession: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                            <div>
                              <input
                                type="tel"
                                placeholder="Numéro de téléphone"
                                value={newMemberData.tuteurPhone}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tuteurPhone: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 mt-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                            <label className="block text-sm font-bold text-orange-800">Tutrice</label>
                            <div>
                              <input
                                type="text"
                                placeholder="Nom de la tutrice"
                                value={newMemberData.tutriceName}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tutriceName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Profession"
                                value={newMemberData.tutriceProfession}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tutriceProfession: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                            <div>
                              <input
                                type="tel"
                                placeholder="Numéro de téléphone"
                                value={newMemberData.tutricePhone}
                                onChange={(e) => setNewMemberData({ ...newMemberData, tutricePhone: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setMembreModalStep(3)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 flex items-center justify-center w-12"
                      >
                        <Icons.ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setMembreModalStep(5)}
                        disabled={!newMemberData.siblingsCount}
                        className="py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                      >
                        Suivant
                      </button>
                    </div>
                  </motion.div>
                )}

                {membreModalStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Maladies courantes :</label>
                      <input
                        type="text"
                        placeholder="Ex: Asthme, allergies..."
                        value={newMemberData.commonIllness}
                        onChange={(e) => setNewMemberData({ ...newMemberData, commonIllness: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                      <p className="text-sm text-gray-500 mt-1">Laissez vide si aucune</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Intolérances alimentaires :</label>
                      <input
                        type="text"
                        placeholder="Ex: Gluten, lactose, arachides..."
                        value={newMemberData.foodIntolerance}
                        onChange={(e) => setNewMemberData({ ...newMemberData, foodIntolerance: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                      <p className="text-sm text-gray-500 mt-1">Laissez vide si aucune</p>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setMembreModalStep(4)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 flex items-center justify-center w-12"
                      >
                        <Icons.ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setMembreModalStep(6)}
                        className="py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                      >
                        Suivant
                      </button>
                    </div>
                  </motion.div>
                )}

                {membreModalStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Totem :</label>
                      <input
                        type="text"
                        placeholder="Ex: Liona..."
                        value={newMemberData.totem}
                        onChange={(e) => setNewMemberData({ ...newMemberData, totem: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Équipe :</label>
                      <select
                        value={newMemberData.equipeId}
                        onChange={(e) => setNewMemberData({ ...newMemberData, equipeId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      >
                        <option value="" disabled>Sélectionner une équipe</option>
                        {equipes.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.name} ({eq.type})</option>
                        ))}
                      </select>
                    </div>
                    
                    {user?.groupe === 'Tily Eto Madagasikara' && getEtapesOptions().length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Étapes :</label>
                        <select
                          value={newMemberData.etape}
                          onChange={(e) => setNewMemberData({ ...newMemberData, etape: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                        >
                          <option value="" disabled>Sélectionner une étape</option>
                          {getEtapesOptions().map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Responsabilité :</label>
                      <select
                        value={newMemberData.responsabilite}
                        onChange={(e) => setNewMemberData({ ...newMemberData, responsabilite: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                      >
                        <option value="" disabled>Sélectionner une responsabilité</option>
                        {getResponsabilitesOptions().map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setMembreModalStep(5)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors shrink-0 flex items-center justify-center w-12"
                      >
                        <Icons.ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCreateMember}
                        disabled={isSubmitting || !newMemberData.equipeId || !newMemberData.responsabilite}
                        className="h-10 py-0 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                      >
                        {isSubmitting ? 'Enregistrement...' : 'Valider'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer le profil</h2>
              <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer ce bénéficiaire ? Cette action est irréversible.</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setShowDeleteConfirm(false); setPersonToDelete(null); }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteBeneficiary}
                  className="flex-1 h-10 py-0 px-4 rounded-full font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, count, label }: { icon: React.ReactNode, count: number, label: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
      <div className="mb-2">{icon}</div>
      <div className="text-xl font-bold text-gray-900">{count}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  );
}
