import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ChevronRight, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { playUiSound } from '../utils/audio';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playUiSound('click');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      // Get real ID token
      const token = await user.getIdToken();
      localStorage.setItem('matchdeck_user_token', token);
      
      // Attempt to load and cache profile from Firestore, or store basic info
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          localStorage.setItem('truematch_profile_me', JSON.stringify(docSnap.data()));
        } else {
          const baseProfile = {
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email,
            gender: 'outro',
            age: 25,
            bio: 'TrueMatch AI Premium User',
            verified: true,
            isOnline: true,
            isGold: false,
          };
          localStorage.setItem('truematch_profile_me', JSON.stringify(baseProfile));
        }
      } catch (firestoreErr) {
        console.error('Failed to sync profile on login:', firestoreErr);
      }
      
      playUiSound('success');
      showToast('Acesso concedido! ⚡', 'success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Firebase sign-in error:', err);
      playUiSound('click');
      let friendlyMessage = 'Falha ao entrar. Verifique suas credenciais.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Endereço de e-mail inválido.';
      } else if (err.code === 'auth/user-disabled') {
        friendlyMessage = 'Esta conta foi desativada.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      showToast(friendlyMessage, 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <button 
          id="btn-back-welcome"
          onClick={() => navigate('/welcome')}
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Bem-vindo <span className="text-pink-500">de volta.</span></h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">Acesse sua conta Matchdeck</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              id="input-login-email"
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-pink-500/30 focus:bg-zinc-900 transition-all"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              id="input-login-password"
              type="password"
              placeholder="SENHA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-pink-500/30 focus:bg-zinc-900 transition-all"
              required
            />
          </div>

          <button 
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl py-5 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Não tem uma conta? <button id="btn-goto-register" onClick={() => navigate('/register')} className="text-pink-500 hover:underline">Cadastre-se</button>
          </p>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-3xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl min-w-[280px]",
              toast.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              toast.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-400",
              toast.type === 'info' && "bg-pink-500/10 border-pink-500/20 text-pink-400"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Lock className="w-5 h-5 text-pink-500" />}
            <span className="text-[10px] font-black uppercase tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
