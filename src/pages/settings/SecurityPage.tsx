import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, Lock, ChevronRight, ShieldCheck, Mail, Phone, Smartphone, Monitor, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { playUiSound } from '../../utils/audio';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  
  // 2FA Setup State
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  
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
    { id: 1, name: 'Este dispositivo (Smartphone)', location: 'São Paulo, Brasil', active: true, type: 'smartphone' },
    { id: 2, name: 'Desktop Chrome (Windows 11)', location: 'Rio de Janeiro, Brasil', active: false, type: 'desktop' },
    { id: 3, name: 'App iOS (iPhone 14)', location: 'Curitiba, Brasil', active: false, type: 'smartphone' },
  ]);

  const handleRevokeDevice = (id: number) => {
    playUiSound('click');
    setDevices(prev => prev.filter(device => device.id !== id));
  };

  const handleLogoutAll = () => {
    playUiSound('click');
    setDevices(prev => prev.filter(device => device.active));
  };

  // Handle password update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    playUiSound('click');

    if (!currentPassword || !newPassword) {
      showToast('Preencha todos os campos.', 'error');
      playUiSound('toggleOff');
      return;
    }

    if (newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      playUiSound('toggleOff');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('As senhas não conferem.', 'error');
      playUiSound('toggleOff');
      return;
    }

    setIsUpdatingPassword(true);
    playUiSound('success');

    // Simulate update
    setTimeout(() => {
      showToast('Sua senha foi alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdatingPassword(false);
      setShowChangePass(false);
    }, 1000);
  };

  return (
    <div className="relative h-full w-full bg-black font-sans overflow-x-hidden text-white">
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
              toast.type === 'success' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
              toast.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-400" :
              "bg-zinc-900/80 border-white/10 text-zinc-300"
            )}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                toast.type === 'success' ? "bg-cyan-500/20" :
                toast.type === 'error' ? "bg-red-500/20" :
                "bg-zinc-500/20"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  toast.type === 'success' ? "bg-cyan-400" :
                  toast.type === 'error' ? "bg-red-400" :
                  "bg-zinc-400"
                )} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-auto pb-32 hide-scrollbar">
        
        {/* Header */}
        <div className="relative flex justify-center items-center px-5 py-6">
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
            className="absolute left-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-[19px] leading-tight">{showChangePass ? 'Alterar Senha' : 'Segurança e Login'}</span>
        </div>

        <div className="px-5 mt-2 space-y-8">
          
          {/* Security Banner */}
          {!showChangePass ? (
            <>
              <div className="bg-[#1a1500] border border-amber-500/20 rounded-[1.5rem] p-5 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-amber-500 font-bold text-[15px] mb-1.5">Nível de Segurança: Médio</h3>
                  <p className="text-amber-500/70 text-[13px] leading-snug font-medium">
                    Ative a autenticação de dois fatores para mais segurança.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              <p className="text-zinc-300 text-[14px] px-1 font-medium text-center">
                Proteja sua conta e monitore acessos
              </p>

              {/* Login and Password Section */}
              <section>
                <h4 className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-3 px-2 text-center">
                  LOGIN E SENHA
                </h4>
                <button 
                  onClick={() => {
                    playUiSound('click');
                    setShowChangePass(true);
                  }}
                  className="w-full bg-[#121212] rounded-[1.5rem] p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-[15px] text-white">Alterar Senha</span>
                      <span className="text-zinc-400 text-[13px]">Última alteração: Há 3 meses</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </button>
              </section>

              {/* Advanced Authentication Section */}
              <section>
                <h4 className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-3 px-2 text-center">
                  AUTENTICAÇÃO AVANÇADA
                </h4>
            <div className="w-full bg-[#121212] rounded-[1.5rem] p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start text-left max-w-[180px]">
                  <span className="font-bold text-[15px] text-white mb-0.5">Autenticação de Dois Fatores (2FA)</span>
                  <span className="text-zinc-400 text-[13px] leading-snug">Adicione uma camada extra de proteção</span>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <button
                onClick={() => {
                  playUiSound('click');
                  if (!twoFactorEnabled) {
                    setShow2FASetupModal(true);
                  } else {
                    setTwoFactorEnabled(false);
                    showToast('Autenticação de dois fatores desativada.', 'info');
                  }
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out shrink-0 border ${
                  twoFactorEnabled ? 'bg-cyan-400 border-cyan-400' : 'bg-transparent border-white/20'
                }`}
              >
                <motion.div
                  animate={{ x: twoFactorEnabled ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-5 h-5 rounded-full ${twoFactorEnabled ? 'bg-black' : 'bg-zinc-500'}`}
                />
              </button>
            </div>
          </section>

          {/* Verified Contacts Section */}
          <section>
            <h4 className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-3 px-2 text-center">
              CONTATOS VERIFICADOS
            </h4>
            <div className="space-y-2">
              <div className="w-full bg-[#121212] rounded-[1.5rem] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-[15px] text-white">E-mail</span>
                    <span className="text-zinc-400 text-[13px]">filipe.s***@gmail.com</span>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <div className="w-full bg-[#121212] rounded-[1.5rem] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-[15px] text-white">Telefone</span>
                    <span className="text-zinc-400 text-[13px]">+55 (11) 9****-1234</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Devices and Sessions Section */}
          <section>
            <h4 className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-3 px-2 text-center">
              DISPOSITIVOS E SESSÕES
            </h4>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {devices.map((device) => (
                  <motion.div 
                    key={device.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="w-full bg-[#121212] rounded-[1.5rem] p-4 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          {device.type === 'smartphone' ? (
                            <Smartphone className="w-5 h-5 text-rose-500" />
                          ) : (
                            <Monitor className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <span className="font-bold text-[15px] text-white">{device.name}</span>
                          <span className="text-zinc-400 text-[13px]">{device.location}</span>
                        </div>
                      </div>
                      
                      {device.active ? (
                        <div className="flex flex-col items-center justify-center gap-0.5 ml-2">
                          {['A', 'T', 'I', 'V', 'O'].map((letter, i) => (
                            <span key={i} className="text-rose-500 text-[8px] font-black leading-none">{letter}</span>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleRevokeDevice(device.id)}
                          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0"
                        >
                          <LogOut className="w-5 h-5 text-rose-500" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {devices.length > 1 && (
              <button 
                onClick={handleLogoutAll}
                className="w-full mt-4 bg-transparent border border-rose-500 rounded-full p-4 flex items-center justify-center text-rose-500 font-bold text-[14px] hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
              >
                Encerrar todas as outras sessões
              </button>
            )}
          </section>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#121212] rounded-[2rem] p-6 border border-white/5"
            >
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white text-left">Definir Nova Senha</h2>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Senha Atual</label>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
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
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
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
                    className="flex-1 py-4 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[14px] transition-all active:scale-95 hover:bg-zinc-700 hover:text-white"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-1 py-4 rounded-full bg-cyan-400 text-black font-black text-[14px] shadow-lg shadow-cyan-400/20 transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        <span>Salvando...</span>
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

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {show2FASetupModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#121212] rounded-t-[2.5rem] p-6 pb-12 w-full border-t border-white/10 flex flex-col"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Configurar 2FA</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-[280px]">
                  Use um aplicativo autenticador como Google Authenticator ou Authy para escanear o código.
                </p>

                {/* Simulated QR Code */}
                <div className="w-48 h-48 bg-white p-2 rounded-2xl mb-6 relative group overflow-hidden">
                  <div className="absolute inset-0 flex flex-wrap p-2 gap-1 opacity-80">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`w-[18px] h-[18px] ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'} ${i % 8 === 0 || i % 8 === 7 || Math.floor(i / 8) === 0 || Math.floor(i / 8) === 7 ? 'bg-black rounded-sm' : ''}`} />
                    ))}
                  </div>
                  <div className="absolute top-4 left-4 w-10 h-10 border-4 border-black rounded-lg" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-4 border-black rounded-lg" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-4 border-black rounded-lg" />
                </div>

                <div className="w-full space-y-2 text-left mb-6">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Código de 6 dígitos</label>
                  <input 
                    type="number"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setTwoFactorCode(val);
                    }}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-2xl text-center tracking-[0.5em] font-mono text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>

                <div className="flex w-full space-x-3">
                  <button 
                    onClick={() => {
                      playUiSound('click');
                      setShow2FASetupModal(false);
                      setTwoFactorCode('');
                    }}
                    className="flex-1 py-4 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[14px] transition-all active:scale-95 hover:bg-zinc-700 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      playUiSound('click');
                      if (twoFactorCode.length !== 6) {
                        showToast('O código deve ter 6 dígitos.', 'error');
                        playUiSound('toggleOff');
                        return;
                      }
                      
                      setIsVerifying2FA(true);
                      
                      // Simulate verification
                      setTimeout(() => {
                        setIsVerifying2FA(false);
                        setTwoFactorEnabled(true);
                        setShow2FASetupModal(false);
                        setTwoFactorCode('');
                        showToast('2FA ativado com sucesso!', 'success');
                        playUiSound('success');
                      }, 1200);
                    }}
                    disabled={isVerifying2FA || twoFactorCode.length !== 6}
                    className="flex-1 py-4 rounded-full bg-cyan-400 text-black font-black text-[14px] shadow-lg shadow-cyan-400/20 transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {isVerifying2FA ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <span>Ativar 2FA</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
