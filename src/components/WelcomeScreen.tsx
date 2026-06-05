/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Shield, Mail, Lock, User, Check } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

interface WelcomeScreenProps {
  onSuccess: (name: string, email: string) => void;
  initialState?: AuthState;
  key?: number | string;
}

type AuthState = 'splash' | 'welcome' | 'login' | 'signup';

export default function WelcomeScreen({ onSuccess, initialState = 'splash' }: WelcomeScreenProps) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authState === 'splash') {
      const timer = setTimeout(() => {
        setAuthState('welcome');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [authState]);

  const handleGoogleSignIn = async () => {
    setIsSubmitPending(true);
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      let userNameToUse = user.displayName || 'Tosin Oyesanya';
      
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profileData = userSnap.data();
          userNameToUse = profileData.name || userNameToUse;
        } else {
          await setDoc(userRef, {
            name: userNameToUse,
            email: user.email || '',
            avatarUrl: user.photoURL || '',
            orderHistory: []
          });
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
      }

      onSuccess(userNameToUse, user.email || '');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsSubmitPending(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authState === 'signup' && !name) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email || !password) {
      setErrorMsg('Please fully enter your email and password');
      return;
    }

    setIsSubmitPending(true);

    try {
      if (authState === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        await updateProfile(user, { displayName: name });
        
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userRef, {
            name,
            email,
            avatarUrl: '',
            orderHistory: []
          });
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, OperationType.CREATE, `users/${user.uid}`);
        }
        
        onSuccess(name, email);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        let resolvedName = user.displayName || 'Tosin Oyesanya';
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            resolvedName = userSnap.data().name || resolvedName;
          }
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, OperationType.GET, `users/${user.uid}`);
        }
        
        onSuccess(resolvedName, email);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || `An error occurred during ${authState}`);
    } finally {
      setIsSubmitPending(false);
    }
  };

  const LogoComponent = ({ size = 'md' }: { size?: 'md' | 'lg' }) => {
    const isLg = size === 'lg';
    return (
      <div className={`relative ${isLg ? 'w-24 h-24' : 'w-16 h-16'} bg-gradient-to-b from-[#1a1235]/80 to-[#0a0612]/95 border border-purple-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] shrink-0`}>
        {/* Glow point */}
        <div className="absolute inset-0 rounded-3xl bg-purple-500/10 blur-xl animate-pulse" />
        <svg className={`${isLg ? 'w-16 h-16' : 'w-11 h-11'} text-purple-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hook on top of the hanger */}
          <path d="M12 7V3.5a2.5 2.5 0 0 1 5 0" />
          {/* Triangle hanger element representing the jacket shoulders */}
          <path d="M12 7 L3 17 A1 1 0 0 0 4 19 H20 A1 1 0 0 0 21 17 Z" fill="currentColor" fillOpacity="0.08" />
          {/* Bold AI letters centered within hanger */}
          <text x="12" y="15.5" fill="currentColor" fontSize="4.2" fontWeight="bold" textAnchor="middle" stroke="none" className="font-sans font-extrabold tracking-wider">AI</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center overflow-hidden font-sans">
      {/* Immersive high fashion violet background effect */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(26,15,48,0.45)_0%,rgba(5,5,5,1)_85%)]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow font-sans" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-3xl font-sans" />
      <div className="absolute inset-0 bg-[#000]/30 select-none pointer-events-none" />
      
      {/* Grid overlay for digital loom style alignment */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      <AnimatePresence mode="wait">
        {authState === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center select-none"
            id="splash-screen-container"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 flex flex-col items-center"
            >
              {/* Outer scanning visual rings */}
              <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-ping scale-150 opacity-25 pointer-events-none" />
              <div className="absolute -inset-4 rounded-full border border-purple-400/20 animate-spin opacity-40 [animation-duration:15s] pointer-events-none" />
              
              <LogoComponent size="lg" />
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-6 text-3xl font-bold tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-500 text-center"
            >
              FitMuse <span className="text-purple-400">AI</span>
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-1 text-[10px] tracking-widest uppercase text-neutral-400 font-mono"
            >
              Your AI Fashion Stylist
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <div className="w-16 h-[1.5px] bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-[pulse_1.5s_infinite] w-3/4" />
              </div>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase">Loading your style...</span>
            </motion.div>
          </motion.div>
        )}

        {authState === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full max-w-sm px-6 text-center select-none"
            id="welcome-screen-container"
          >
            <div className="flex justify-center mb-6">
              <LogoComponent />
            </div>

            <h2 className="text-3xl font-bold tracking-tight font-display mb-2 leading-tight">
              Your personal <br />style starts here
            </h2>

            <p className="text-neutral-400 text-xs px-2 mb-10 leading-relaxed font-sans font-light">
              AI-powered recommendations just for you.
            </p>

            <div className="space-y-3.5">
              <button
                onClick={() => setAuthState('signup')}
                type="button"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-500 to-[#b53ab5] text-white font-medium rounded-2xl flex items-center justify-center gap-2 font-display transition-all duration-300 active:scale-98 cursor-pointer shadow-[0_4px_30px_rgba(168,85,247,0.3)] text-sm"
                id="get-started-button"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setAuthState('login')}
                type="button"
                className="w-full py-3.5 px-6 bg-[#0f0e15]/70 hover:bg-neutral-900 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-center gap-2 font-display font-medium text-neutral-300 transition-all duration-300 active:scale-98 cursor-pointer text-sm"
                id="login-state-button"
              >
                Login
              </button>

              <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitPending}
                type="button"
                className="w-full py-3.5 px-6 bg-transparent hover:bg-white/2 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 font-display font-medium text-neutral-400 hover:text-white transition-all duration-300 active:scale-98 cursor-pointer text-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping mr-1" />
                {isSubmitPending ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="pt-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                  <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-[#050505] px-2 text-neutral-500 font-mono">Loom Credentials fallback</span></div>
                </div>

                <div className="flex gap-2 justify-center mt-3">
                  <button
                    onClick={() => {
                      setEmail('oyesanyaoluwatosin250@gmail.com');
                      setPassword('fitmuse-prestige');
                      setAuthState('login');
                    }}
                    className="text-[10px] font-mono text-purple-400/80 hover:text-purple-300 border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Quick fill credentials
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* login mode screen with custom layout and Forgot Password options */}
        {authState === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full max-w-sm px-6"
            id="auth-form-card"
          >
            <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />

              <button
                onClick={() => setAuthState('welcome')}
                type="button"
                className="text-[10px] text-neutral-500 hover:text-white transition-colors flex items-center mb-6 font-mono gap-1 cursor-pointer"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-1">
                Welcome back 👋
              </h2>
              <p className="text-neutral-400 text-xs mb-6">
                Login to continue
              </p>

              {errorMsg && (
                <div className="p-3 mb-4 bg-red-900/20 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-neutral-400 tracking-wider mb-1.5 font-semibold">Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-white/5 focus:border-purple-500/50 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      id="user-email-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 tracking-wider font-semibold">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setErrorMsg('Password reset link dispatched inside presentation mock sandbox.')}
                      className="text-[10px] font-mono text-purple-400 hover:text-purple-300/80 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-white/5 focus:border-purple-500/50 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      id="user-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitPending}
                  className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-xs font-display tracking-tight transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-[0_4px_20px_rgba(168,85,247,0.25)]"
                  id="auth-submit-btn"
                >
                  {isSubmitPending ? (
                    <span className="animate-pulse">Signing in...</span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setAuthState('signup')}
                  className="text-[10px] text-neutral-400 hover:text-purple-400 font-mono transition-all cursor-pointer inline-block"
                >
                  Don't have an account? <span className="text-purple-400 font-medium">Sign up</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Registration state screen */}
        {authState === 'signup' && (
          <motion.div
            key="signup-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full max-w-sm px-6"
            id="auth-form-card"
          >
            <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />

              <button
                onClick={() => setAuthState('welcome')}
                type="button"
                className="text-[10px] text-neutral-500 hover:text-white transition-colors flex items-center mb-6 font-mono gap-1 cursor-pointer"
              >
                ← Back
              </button>

              <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-1">
                Create Account ✨
              </h2>
              <p className="text-neutral-400 text-xs mb-6">
                Register to start your style journey
              </p>

              {errorMsg && (
                <div className="p-3 mb-4 bg-red-900/20 border border-red-500/20 text-red-500/40 text-xs rounded-xl font-mono">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-neutral-400 tracking-wider mb-1.5 font-semibold">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tosin Oyesanya"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-white/5 focus:border-purple-500/50 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      id="user-fullname-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-neutral-400 tracking-wider mb-1.5 font-semibold">Email & Login Code</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-white/5 focus:border-purple-500/50 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      id="user-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-neutral-400 tracking-wider mb-1.5 font-semibold">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900/60 border border-white/5 focus:border-purple-500/50 rounded-xl text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      id="user-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitPending}
                  className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-xs font-display tracking-tight transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-[0_4px_20px_rgba(168,85,247,0.25)]"
                >
                  {isSubmitPending ? (
                    <span className="animate-pulse">Setting up Account...</span>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setAuthState('login')}
                  className="text-[10px] text-neutral-400 hover:text-purple-400 font-mono transition-all cursor-pointer inline-block"
                >
                  Already have an account? <span className="text-purple-400 font-medium">Log in</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
