import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ChevronLeft, Zap, ChevronRight, Smartphone, ShieldCheck, LogOut, Check, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { playUiSound } from '../../utils/audio';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [showChangePass, setShowChangePass] = useState(false);
  
  // Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Connected Devices State
  const [devices, setDevices] = useState([
    { id: 1, name: 'iPhone 15 Pro', location: 'São Paulo, BR', active: true },
    { id: 2, name: 'MacBook Air M2', location: 'São Paulo, BR', active: false },
    { id: 3, name: 'iPad Pro M1', location: 'Rio de Janeiro, BR', active: false },
  ]);

  // Handle password update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');

    if (!currentPassword) {
      showToast('Por favor, informe sua senha atual.', 'error');
      playUiSound('toggleOff');
      return;
    }

    if (!newPassword) {
      showToast('Por favor, insira a nova senha.', 'error');
      playUiSound('toggleOff');
      return;
    }

    if (newPassword.length < 6) {
      showToast('A nova senha deve conter pelo menos 6 caracteres.', 'error');
      playUiSound('toggleOff');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('A nova senha e a confirmação não conferem.', 'error');
      playUiSound('toggleOff');
      return;
    }

    setIsUpdatingPassword(true);
    playUiSound('success');

    // Simulate database update delay
    setTimeout(() => {
      showToast('Sua senha foi alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdatingPassword(false);
      setShowChangePass(false);
    }, 1000);
  };

  // Handle revoking device session
  const handleRevokeDevice = (id: number, name: string) => {
    playUiSound('click');
    setDevices(prev => prev.filter(device => device.id !== id));
    showToast(`Sessão no ${name} encerrada com sucesso!`, 'success');
    playUiSound('success');
  };

  // Handle account logout
  const handleLogout = () => {
    playUiSound('click');
    showToast('Encerrando sua sessão...', 'info');
    playUiSound('success');
    
    setTimeout(() => {
      localStorage.removeItem('matchdeck_user_token');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="h-full overflow-y-auto bg-black pb-32 hide-scrollbar relative">
      {/* Toast alert system */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className={cn(
              "px-5 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-[300px] transition-all",
              toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              toast.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-400" :
              "bg-zinc-900/80 border-white/10 text-zinc-300"
            )}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                toast.type === 'success' ? "bg-emerald-500/20" :
                toast.type === 'error' ? "bg-red-500/20" :
                "bg-zinc-500/20"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  toast.type === 'success' ? "bg-emerald-400" :
                  toast.type === 'error' ? "bg-red-400" :
                  "bg-zinc-400"
                )} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-6 px-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-8 relative">
          <button 
            onClick={() => {
              playUiSound('click');
              if (showChangePass) {
                setShowChangePass(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              } else {
                navigate(-1);
              }
            }}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors absolute left-0 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-full text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Segurança</h1>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Proteção da Conta</p>
          </div>
        </div>

        <div className="space-y-6">
          {!showChangePass ? (
            <>
              {/* Change Password Card */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-[2rem] p-4 border border-white/5 animate-fade-in"
              >
                <button 
                  onClick={() => {
                    playUiSound('click');
                    setShowChangePass(true);
                  }}
                  className="w-full flex justify-between items-center p-6 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block text-white">Alterar Senha</span>
                      <p className="text-[10px] text-zinc-500">Mantenha sua conta sempre protegida</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </button>
              </motion.div>

              {/* Connected Devices Card */}
              <div className="bg-zinc-900 rounded-[2.5rem] p-8 border border-white/5">
                <div className="flex items-center space-x-2 mb-6 px-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Dispositivos Conectados</h3>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {devices.map((device, idx) => (
                      <motion.div 
                        key={device.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-white">{device.name}</span>
                          <span className="text-[10px] text-zinc-500">{device.location}</span>
                        </div>
                        {device.active ? (
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleRevokeDevice(device.id, device.name)}
                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                          >
                            Sair
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {devices.length === 1 && (
                    <p className="text-[10px] text-zinc-500 text-center pt-2">
                      Nenhum outro dispositivo conectado no momento.
                    </p>
                  )}
                </div>
              </div>

              {/* Global Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-[2rem] p-4 border border-red-500/5 hover:border-red-500/10 transition-all"
              >
                <button 
                  onClick={handleLogout}
                  className="w-full flex justify-between items-center p-6 rounded-[1.5rem] bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center mr-4 transition-colors">
                      <LogOut className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block text-red-500">Sair da Conta</span>
                      <p className="text-[10px] text-zinc-500">Encerrar sessão com segurança</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-500/40 group-hover:text-red-500 transition-colors" />
                </button>
              </motion.div>

              {/* Secure Encryption Banner */}
              <div className="bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500/40 mx-auto mb-4" />
                <p className="text-[11px] text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                  Seu tráfego de dados é protegido por criptografia de ponta a ponta SHA-256.
                </p>
              </div>
            </>
          ) : (
            /* Change Password Form Container */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-[2.5rem] p-8 border border-white/5"
            >
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-md font-bold text-white text-left">Definir Nova Senha</h2>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Senha Atual</label>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Nova Senha</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Confirmar Senha</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setShowChangePass(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:bg-zinc-700 hover:text-white"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 animate-bounce" />
                        <span>Atualizando...</span>
                      </>
                    ) : (
                      <span>Atualizar</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
