import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulando autenticação segura
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('truematch_admin_session', 'true');
        navigate('/admin');
      } else {
        setError('CREDENCIAIS DE ACESSO INVÁLIDAS');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
            <ShieldCheck className="w-10 h-10 text-pink-500 group-hover:scale-110 transition-transform" />
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-pink-500 rounded-[2.5rem] blur-2xl"
            />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Matchdeck <span className="text-pink-500">Core</span></h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-2">Acesso Restrito ao Proprietário</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input 
              type="text"
              placeholder="USUÁRIO"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-pink-500/30 focus:bg-zinc-900 transition-all"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password"
              placeholder="SENHA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-pink-500/30 focus:bg-zinc-900 transition-all"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-3xl py-5 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-8 py-4 text-zinc-500 hover:text-white font-black uppercase tracking-widest text-[9px] transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a Home
        </button>
      </motion.div>

      <div className="fixed bottom-8 text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em] pointer-events-none">
        TERMINAL SECURITY V2.4.0
      </div>
    </div>
  );
}
