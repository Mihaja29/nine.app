import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/top_bar';
import { Icons } from '../components/icons';
import { motion } from 'motion/react';
import { collection, query, getDocs } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { db, auth } from '../config/firebase';

export function Outils({ user, onProfileClick, onMenuClick }: { user: any, onProfileClick: () => void, onMenuClick?: () => void }) {
  const [duplicateAccounts, setDuplicateAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<string[] | null>(null);

  const scanForDuplicates = async () => {
    setLoading(true);
    setDuplicateAccounts([]);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const emailMap = new Map<string, any[]>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          const emailList = emailMap.get(data.email) || [];
          emailList.push({ id: doc.id, ...data });
          emailMap.set(data.email, emailList);
        }
      });

      const duplicates: any[] = [];
      emailMap.forEach((usersCount, email) => {
        if (usersCount.length > 1) {
          duplicates.push({
            email,
            accounts: usersCount
          });
        }
      });
      setDuplicateAccounts(duplicates);
    } catch (e) {
      console.error("Error scanning duplicates", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmail = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    setSearchResult(null);
    try {
      // Check Firestore multiple accounts
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const allMatches = snapshot.docs.map(i => i.data()).filter(d => d.email?.toLowerCase() === searchEmail.trim().toLowerCase());
      
      // Also check Firebase Auth providers
      const methods = await fetchSignInMethodsForEmail(auth, searchEmail.trim().toLowerCase());
      setSearchResult(methods);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/user-not-found') {
        setSearchResult([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 flex flex-col bg-gray-50 pb-8 min-h-screen"
    >
      <TopBar title="Boîte à Outils" user={user} onProfileClick={onProfileClick} onMenuClick={onMenuClick} />
      <div className="flex-1 flex flex-col p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icons.Wrench className="w-6 h-6 text-primary" />
          Outils Avancés
        </h2>

        {/* Manual Email Check */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Vérifier les méthodes de connexion d'un e-mail</h3>
          <p className="text-sm text-gray-500 mb-4">Détectez si un e-mail est utilisé avec Google, Mot de passe, etc.</p>
          
          <div className="flex gap-2">
            <input 
              type="email" 
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="adresse@email.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button 
              onClick={handleSearchEmail}
              disabled={loading || !searchEmail.trim()}
              className="bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              Vérifier
            </button>
          </div>

          {searchResult !== null && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-medium text-gray-900 block mb-2">Résultat :</span>
              {searchResult.length > 0 ? (
                <ul className="list-disc pl-5 text-gray-700">
                  {searchResult.map(method => (
                    <li key={method}>
                      {method === 'password' ? 'Mot de passe (email)' 
                       : method === 'google.com' ? 'Google Connexion' 
                       : method === 'emailLink' ? 'Lien Magique' 
                       : method}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucun compte trouvé avec cet e-mail dans Firebase Auth.</p>
              )}
            </div>
          )}
        </div>

        {/* Database Duplicate Scan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Détection de doublons</h3>
              <p className="text-sm text-gray-500">Rechercher les adresses e-mail utilisées par plusieurs comptes dans la base de données.</p>
            </div>
            <button 
              onClick={scanForDuplicates}
              disabled={loading}
              className="bg-gray-100 text-gray-700 p-2 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Icons.RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {duplicateAccounts.length > 0 ? (
            <div className="space-y-4">
              {duplicateAccounts.map((d, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50/50">
                  <div className="font-medium text-red-900 mb-2 truncate">{d.email}</div>
                  <div className="space-y-2">
                    {d.accounts.map((acc: any) => (
                      <div key={acc.id} className="text-sm bg-white rounded-lg p-2 border border-red-100 flex items-center justify-between">
                        <span>{acc.firstName || 'Sans nom'} - <span className="opacity-70">{acc.authMethod || 'inconnu'}</span></span>
                        <span className="text-xs text-gray-400 font-mono">{acc.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                {loading ? 'Recherche en cours...' : 'Aucun doublon détecté. Cliquez sur le bouton d\'actualisation pour scanner.'}
             </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
