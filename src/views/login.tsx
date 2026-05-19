import React, { useState } from 'react';
import { IconSvg20 } from '../components/svg_icons';
import { Icons } from '../components/icons';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [method, setMethod] = useState<'password' | 'magicLink'>('password');
  const [isCompletingMagicLink, setIsCompletingMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setMethod('magicLink');
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (savedEmail) {
        setLoading(true);
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            // Check and create user doc if needed
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              let migrated = false;
              if (result.user.email) {
                const emailQuery = query(collection(db, 'users'), where('email', '==', result.user.email));
                const emailSnap = await getDocs(emailQuery);
                if (!emailSnap.empty) {
                  const existingData = emailSnap.docs[0].data();
                  await setDoc(userRef, {
                    ...existingData,
                    uid: result.user.uid,
                    migratedFromId: emailSnap.docs[0].id,
                    authMethod: 'magic_link',
                    updatedAt: serverTimestamp()
                  });
                  migrated = true;
                }
              }
              
              if (!migrated) {
                await setDoc(userRef, {
                  email: result.user.email,
                  uid: result.user.uid,
                  authMethod: 'magic_link',
                  createdAt: serverTimestamp(),
                  status: 'pending_approval'
                });
              }
            }
          })
          .catch((err) => {
            setError(err.message || 'Le lien de connexion est expiré ou invalide.');
            setLoading(false);
          });
      } else {
        setIsCompletingMagicLink(true);
        setMessage("Sécurité : Veuillez confirmer votre adresse e-mail pour finaliser la connexion sur ce nouvel appareil.");
      }
    }
  }, []);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Veuillez entrer votre e-mail pour réinitialiser le mot de passe.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setMessage('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const trimmedEmail = email.trim();

    if (isCompletingMagicLink) {
      if (!trimmedEmail) {
        setError('Veuillez entrer votre e-mail');
        setLoading(false);
        return;
      }
      try {
        const result = await signInWithEmailLink(auth, trimmedEmail, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        // Check and create user doc if needed
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          let migrated = false;
          if (result.user.email) {
            const emailQuery = query(collection(db, 'users'), where('email', '==', result.user.email));
            const emailSnap = await getDocs(emailQuery);
            if (!emailSnap.empty) {
              const existingData = emailSnap.docs[0].data();
              await setDoc(userRef, {
                ...existingData,
                uid: result.user.uid,
                migratedFromId: emailSnap.docs[0].id,
                authMethod: 'magic_link',
                updatedAt: serverTimestamp()
              });
              migrated = true;
            }
          }
          
          if (!migrated) {
            await setDoc(userRef, {
              email: result.user.email,
              uid: result.user.uid,
              authMethod: 'magic_link',
              createdAt: serverTimestamp(),
              status: 'pending_approval'
            });
          }
        }
      } catch (err: any) {
        setError(err.message || 'Le lien de connexion est expiré ou invalide.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (method === 'magicLink') {
      if (!trimmedEmail) {
        setError('Veuillez entrer votre e-mail');
        setLoading(false);
        return;
      }
      try {
        const actionCodeSettings = {
          url: window.location.href,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', trimmedEmail);
        setMessage('Lien magique envoyé ! Vérifiez votre boîte mail.');
      } catch (err: any) {
        setError(err.message || "Une erreur s'est produite lors de l'envoi du lien.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!trimmedEmail || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await sendEmailVerification(userCredential.user);
        
        // Save request/user to database
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          authMethod: 'email_password',
          createdAt: serverTimestamp(),
          status: 'pending_approval'
        });

        setMessage("Un e-mail de confirmation a été envoyé. Veuillez cliquer sur le lien pour valider votre compte.");
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Cet e-mail est déjà utilisé. Veuillez vous connecter.");
        setIsLogin(true);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("E-mail ou mot de passe incorrect.");
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError("Un compte existe déjà avec cette adresse e-mail mais une méthode de connexion différente.");
      } else {
        setError(err.message || "Une erreur s'est produite lors de l'authentification.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check and save request/user to database
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        let migrated = false;
        if (result.user.email) {
          const emailQuery = query(collection(db, 'users'), where('email', '==', result.user.email));
          const emailSnap = await getDocs(emailQuery);
          if (!emailSnap.empty) {
            const existingData = emailSnap.docs[0].data();
            await setDoc(userRef, {
              ...existingData,
              uid: result.user.uid,
              migratedFromId: emailSnap.docs[0].id,
              authMethod: 'google',
              updatedAt: serverTimestamp()
            });
            migrated = true;
          }
        }
        
        if (!migrated) {
          await setDoc(userRef, {
            email: result.user.email,
            uid: result.user.uid,
            authMethod: 'google',
            displayName: result.user.displayName,
            createdAt: serverTimestamp(),
            status: 'pending_approval'
          });
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError("Cet e-mail est déjà utilisé avec un mot de passe. Veuillez vous connecter avec e-mail et mot de passe.");
        setIsLogin(true);
      } else {
        setError(err.message || "Erreur de connexion avec Google");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-white px-6 py-4 overflow-y-auto no-scrollbar">
      <div className="w-full max-w-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Logo area */}
        <div className="w-full flex flex-col items-center justify-center mb-1">
          <img 
            src="/logo.png" 
            alt="Logo NINE" 
            className="w-28 h-28 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight uppercase">
            {isLogin ? "Bienvenue sur Nine" : "Créer un compte"}
          </h1>
          <div className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
            {isLogin 
              ? (
                <div className="italic">
                  « Rappelez-vous toujours que vous devez prendre la tête du mouvement et non pas pousser par derrière. »<br/>
                  <span className="font-semibold block mt-1 not-italic">— Baden-Powell</span>
                </div>
              )
              : "Usage restreint aux responsables officiels du groupe. Merci de ne pas continuer si tu n’es pas concerné."}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg mb-4 text-center font-medium">
            {message}
          </div>
        )}

        {method === 'password' && (
          <>
            <button 
              onClick={handleGoogleAuth}
              disabled={loading}
              type="button"
              className="w-full py-2.5 bg-[#f2f2f2] text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors mb-3 text-sm font-semibold"
            >
              {loading ? (
                <Icons.Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <IconSvg20 className="w-5 h-5 mr-3" />
                  Continuer avec Google
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setMethod('magicLink');
                setError('');
                setMessage('');
              }}
              disabled={loading}
              type="button"
              className="w-full py-2.5 bg-[#f2f2f2] text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors mb-5 text-sm font-semibold"
            >
              <Icons.Mail className="w-5 h-5 mr-3" />
              Continuer avec un e-mail
            </button>

            <div className="flex items-center w-full mb-5">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-[11px] text-gray-400 font-bold">OU</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="flex flex-col w-full">
          {/* Email input */}
          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-gray-700 mb-1 ml-1 uppercase tracking-wide">
              E-mail
            </label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all placeholder:font-normal placeholder:text-gray-400"
              placeholder="Entrez votre e-mail"
              required
            />
          </div>

          {/* Password input */}
          {method === 'password' && (
            <div className="mb-1">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1 ml-1 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all placeholder:font-normal placeholder:text-gray-400"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <Icons.EyeOff className="w-4 h-4" />
                  ) : (
                    <Icons.Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {method === 'password' && isLogin && (
            <div className="flex justify-end mb-5 text-[11px] font-bold text-gray-800">
              <button type="button" className="hover:underline" onClick={handleResetPassword} disabled={loading}>
                Mot de passe oublié ?
              </button>
            </div>
          )}
          
          {method === 'magicLink' && <div className="h-4"></div>}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 mt-1 bg-red-600 text-white rounded-full font-bold text-sm tracking-wide transition-all hover:bg-red-700 shadow-md ${loading ? 'opacity-70 blur-[1px]' : ''}`}
          >
            {loading ? <Icons.Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              method === 'magicLink' ? 'Continuer' : (isLogin ? 'Se connecter' : 'S\'inscrire')
            )}
          </button>
          
          {method === 'magicLink' && !isCompletingMagicLink && (
            <div className="mt-5 text-center">
              <button 
                type="button" 
                onClick={() => {
                  setMethod('password');
                  setError('');
                  setMessage('');
                }} 
                className="text-xs font-bold text-gray-600 hover:text-black hover:underline"
              >
                 Retour aux autres options
              </button>
            </div>
          )}

          {method === 'password' && (
            <div className="mt-5 text-center text-xs font-medium text-gray-600">
              {isLogin ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
                className="font-bold text-black hover:underline ml-1"
              >
                {isLogin ? "Créer un compte" : "Se connecter"}
              </button>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}

