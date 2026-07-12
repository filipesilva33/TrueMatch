import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Loader2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('matchdeck_user_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setProgress(0);

    const startTime = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        localStorage.setItem('matchdeck_user_token', 'google-demo-token');
        navigate('/');
      }, 500);
    }, duration);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Pulsing Background */}
            <motion.div 
              animate={{ 
                scale: [1, 2, 2.5],
                opacity: [0.5, 0.2, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute w-64 h-64 bg-pink-500/30 rounded-full blur-xl pointer-events-none"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.8, 2.2],
                opacity: [0.5, 0.2, 0]
              }}
              transition={{ 
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute w-64 h-64 bg-purple-500/30 rounded-full blur-xl pointer-events-none"
            />

            <motion.div
              animate={{ 
                scale: [1, 1.15, 1, 1.15, 1],
              }}
              transition={{ 
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity
              }}
              className="w-28 h-28 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.4)] mb-8 relative z-10 animate-heartbeat"
            >
              <Heart className="w-14 h-14 text-white fill-white" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white text-2xl font-black tracking-tight relative z-10"
            >
              Autenticando...
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-3 relative z-10"
            >
              Conectando ao Matchdeck
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-40 h-1 bg-zinc-900 rounded-full mt-8 relative z-10 overflow-hidden"
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </motion.div>
            
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-3 relative z-10 tabular-nums"
            >
              {Math.round(progress)}%
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-gradient-to-br from-pink-500/10 via-zinc-950 to-purple-900/10 blur-[100px] pointer-events-none" />
      
      <div 
        className="w-full max-w-sm mx-auto flex flex-col items-center px-8 relative z-10 mb-12 mt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-pink-500/20"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-white tracking-tight mb-4 text-center"
        >
          Matchdeck
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400 text-center text-sm font-medium leading-relaxed max-w-[280px]"
        >
          Descubra conexões reais em um ambiente seguro e exclusivo.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm px-6 relative z-10 flex flex-col items-center mb-10"
      >
        <button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-pink-500/20 w-full max-w-[260px] h-11 mb-3"
        >
          <span>Criar Conta</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div 
          className="grid grid-cols-1 gap-3 w-full max-w-[260px]"
        >
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-[2rem] hover:bg-zinc-100 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-70 disabled:pointer-events-none w-full h-11"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Entrar com Google</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="bg-zinc-900 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[2rem] hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center space-x-3 w-full h-10"
          >
            <span>Entrar com sua conta</span>
          </button>
        </div>

        <p className="text-center text-[10px] font-bold text-zinc-600 mt-6 px-4 leading-relaxed uppercase tracking-widest">
          Ao entrar, você concorda com nossos <span className="text-white">Termos</span> e <span className="text-white">Privacidade</span>
        </p>
      </motion.div>
    </div>
  );
}
