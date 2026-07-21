import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Bell, 
  Mail, 
  Volume2, 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw,
  Database,
  CloudLightning,
  Wifi,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { playUiSound } from '../../utils/audio';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json';

const ICON_MAP: Record<string, any> = {
  push: Bell,
  email: Mail,
  sounds: Volume2,
  '2fa': ShieldCheck,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false);
  
  const handleFirebaseSync = async () => {
    setIsSyncing(true);
    setSyncCompleted(false);
    playUiSound('click');
    
    try {
      // Load current user profile from localStorage
      const storedMe = localStorage.getItem('truematch_profile_me');
      let meData = {
        id: 'user_temp_id',
        name: 'Usuário TrueMatch',
        gender: 'outro',
        age: 25,
        bio: 'TrueMatch AI Premium User',
        verified: true,
        isOnline: true,
        isGold: true,
      };
      
      if (storedMe) {
        try {
          const parsed = JSON.parse(storedMe);
          if (parsed && parsed.id) meData = parsed;
        } catch (e) {
          // fallback
        }
      }
      
      // Sync user profile document to Firestore!
      const userRef = doc(db, 'users', meData.id);
      await setDoc(userRef, {
        id: meData.id,
        name: meData.name,
        gender: meData.gender || 'outro',
        age: meData.age || 25,
        bio: meData.bio || '',
        verified: meData.verified ?? true,
        isOnline: meData.isOnline ?? true,
        isGold: meData.isGold ?? true,
        updatedAt: new Date().toISOString()
      });
      
      // Simulate success and play standard dynamic alert sound
      setTimeout(() => {
        setIsSyncing(false);
        setSyncCompleted(true);
        playUiSound('success');
        showToast('Banco Firebase Sincronizado! ⚡', 'success');
      }, 1500);
      
    } catch (err) {
      setIsSyncing(false);
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/current`);
      } catch (formattedErr: any) {
        showToast('Erro de permissão no Firebase.', 'error');
      }
    }
  };
  
  // Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'email' | '2fa' | 'disable2fa' | null>(null);
  
  // Email modal state
  const [emailInput, setEmailInput] = useState(() => {
    const storedMe = localStorage.getItem('truematch_profile_me');
    if (storedMe) {
      try {
        return JSON.parse(storedMe).email || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  
  // 2FA modal state
  const [twoFactorStep, setTwoFactorStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  
  // Standard recovery codes
  const backupCodes = [
    '8593-1048',
    '9402-4820',
    '3158-9642',
    '7740-1953',
    '5209-6617',
    '1843-7035',
    '4491-2856',
    '6027-3914'
  ];

  // Load preferences
  const [prefs, setPrefs] = useState(() => {
    const defaultPrefs = [
      { id: 'push', label: 'Notificações Push', checked: true, description: 'Receba alertas de novos matches e mensagens', icon: Bell },
      { id: 'email', label: 'E-mail Promocional', checked: false, description: 'Novidades e ofertas especiais', icon: Mail },
      { id: 'sounds', label: 'Sons do App', checked: true, description: 'Efeitos sonoros ao navegar', icon: Volume2 },
      { id: '2fa', label: 'Autenticação 2FA', checked: false, description: 'Camada extra de segurança', icon: ShieldCheck },
    ];
    const stored = localStorage.getItem('matchdeck_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return defaultPrefs.map(item => {
          const matched = parsed.find((p: any) => p.id === item.id);
          return matched ? { ...item, checked: !!matched.checked } : item;
        });
      } catch (e) {
        return defaultPrefs;
      }
    }
    return defaultPrefs;
  });

  // Generate a random 6-digit code for the interactive 2FA setup
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpHint(code);
  };

  useEffect(() => {
    if (activeModal === '2fa') {
      generateNewOtp();
    }
  }, [activeModal]);

  // Show dynamic custom Toast
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const toggle = async (idx: number) => {
    const item = prefs[idx];
    
    // 1. SOUNDS
    if (item.id === 'sounds') {
      const willBeChecked = !item.checked;
      const newPrefs = [...prefs];
      newPrefs[idx].checked = willBeChecked;
      setPrefs(newPrefs);
      
      // We must temporarily set in localStorage immediately so that playUiSound reads the updated setting
      localStorage.setItem('matchdeck_settings', JSON.stringify(newPrefs));
      
      if (willBeChecked) {
        playUiSound('toggleOn');
        showToast('Efeitos sonoros ativados! 🎵', 'success');
      } else {
        showToast('Efeitos sonoros desativados. 🔇', 'info');
      }
      return;
    }

    // Play generic click sound on change of other items if sounds enabled
    playUiSound('click');

    // 2. PUSH NOTIFICATIONS
    if (item.id === 'push') {
      const willBeChecked = !item.checked;
      const newPrefs = [...prefs];
      newPrefs[idx].checked = willBeChecked;
      setPrefs(newPrefs);
      
      if (willBeChecked) {
        // Request actual browser notifications if available
        if ('Notification' in window) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              showToast('Permissão concedida! Notificações push ativas. 🔔', 'success');
              // Play success sound
              playUiSound('success');
              // Send test notification
              new Notification('TrueMatch Gold', {
                body: 'As notificações em tempo real estão configuradas com sucesso!',
                icon: '/favicon.ico'
              });
            } else {
              showToast('Notificações ativadas no painel do app. ⚠️', 'info');
            }
          } catch (err) {
            showToast('Notificações ativadas no painel do app! 🔔', 'success');
          }
        } else {
          showToast('Notificações ativadas no painel do app! 🔔', 'success');
        }
      } else {
        showToast('Notificações desativadas. 🔕', 'info');
      }
      return;
    }

    // 3. PROMOTIONAL EMAIL
    if (item.id === 'email') {
      if (!item.checked) {
        // Open promotional email subscription modal
        setActiveModal('email');
      } else {
        // Turn off directly
        const newPrefs = [...prefs];
        newPrefs[idx].checked = false;
        setPrefs(newPrefs);
        showToast('Sua inscrição na newsletter foi cancelada. ✉️', 'info');
      }
      return;
    }

    // 4. TWO-FACTOR AUTH (2FA)
    if (item.id === '2fa') {
      if (!item.checked) {
        // Open 2FA step-by-step interactive setup modal
        setTwoFactorStep(1);
        setVerificationCode('');
        setCopiedSecret(false);
        setCopiedBackup(false);
        setActiveModal('2fa');
      } else {
        // Confirm turn off 2FA
        setActiveModal('disable2fa');
      }
      return;
    }
  };

  // Confirm email subscription
  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }
    
    // Save state
    const newPrefs = prefs.map(p => p.id === 'email' ? { ...p, checked: true } : p);
    setPrefs(newPrefs);
    localStorage.setItem('truematch_subscribed_newsletter_email', emailInput);
    
    setActiveModal(null);
    playUiSound('success');
    showToast('Inscrição realizada! Novidades enviadas para ' + emailInput + ' ✉️', 'success');
  };

  // Verify 2FA verification code
  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() === otpHint) {
      // Step success! Go to backup codes display
      playUiSound('success');
      setTwoFactorStep(3);
    } else {
      playUiSound('toggleOff');
      showToast('Código de verificação incorreto. Tente novamente.', 'error');
    }
  };

  // Complete 2FA activation
  const handleActivate2FA = () => {
    const newPrefs = prefs.map(p => p.id === '2fa' ? { ...p, checked: true } : p);
    setPrefs(newPrefs);
    
    setActiveModal(null);
    playUiSound('success');
    showToast('Autenticação em duas etapas (2FA) ativada com sucesso! 🛡️', 'success');
  };

  // Disable 2FA confirmation
  const handleDisable2FA = () => {
    const newPrefs = prefs.map(p => p.id === '2fa' ? { ...p, checked: false } : p);
    setPrefs(newPrefs);
    
    setActiveModal(null);
    playUiSound('toggleOff');
    showToast('Autenticação em duas etapas (2FA) desativada.', 'info');
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    playUiSound('click');
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      showToast('Chave secreta copiada para a área de transferência!', 'success');
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
      showToast('Códigos de recuperação copiados!', 'success');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('matchdeck_settings', JSON.stringify(prefs));
    playUiSound('success');
    showToast('Configurações salvas com sucesso!', 'success');
    setTimeout(() => {
      navigate(-1);
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
              navigate(-1);
            }}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors absolute left-0 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-full text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Configurações</h1>
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest">Preferências do Sistema</p>
          </div>
        </div>

        <div className="space-y-4">
          {prefs.map((item: any, idx: number) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggle(idx)} 
              className={cn(
                "flex items-center p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 group select-none",
                item.checked ? "bg-zinc-900 border-pink-500/30" : "bg-zinc-900/40 border-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors duration-300 shrink-0",
                item.checked ? "bg-pink-500/20" : "bg-zinc-800"
              )}>
                <item.icon className={cn("w-6 h-6", item.checked ? "text-pink-500" : "text-zinc-500")} />
              </div>
              
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-sm font-bold block text-white">{item.label}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{item.description}</p>
              </div>

              <div className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-500 shrink-0",
                item.checked ? "bg-pink-500" : "bg-zinc-800"
              )}>
                <motion.div 
                  animate={{ x: item.checked ? 26 : 4 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              </div>
            </motion.div>
          ))}

          {/* Launcher & Icons Customization Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: prefs.length * 0.05 }}
            onClick={() => {
              playUiSound('click');
              navigate('/profile/settings/launcher');
            }}
            className="flex items-center p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 bg-zinc-900/40 border-white/5 hover:border-pink-500/20 hover:bg-zinc-900 group select-none"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-zinc-800 group-hover:bg-pink-500/20 transition-colors shrink-0">
              <Smartphone className="w-6 h-6 text-zinc-500 group-hover:text-pink-500 transition-colors" />
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-sm font-bold block text-white">Launcher & Ícones</span>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Configurar ícone de coração pulsante, temas premium e splash screen</p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-[8px] font-black uppercase tracking-widest text-pink-400">
              Personalizar
            </div>
          </motion.div>

          {/* Firebase Cloud Sync Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2rem] border border-pink-500/20 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Firebase Cloud Storage</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Conectado</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Project ID</span>
                <span className="text-[9px] font-mono text-pink-400/80 font-bold block mt-0.5 max-w-[150px] truncate">{firebaseConfig.projectId}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Status do Sync</span>
                <span className={cn("font-bold uppercase tracking-widest", syncCompleted ? "text-emerald-400" : "text-amber-500")}>
                  {syncCompleted ? "Sincronizado" : "Pendente"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Clique abaixo para enviar suas configurações de perfil locais e status de conta de forma segura para o banco de dados cloud Firestore.
              </p>
            </div>

            <button
              onClick={handleFirebaseSync}
              disabled={isSyncing}
              className="w-full mt-4 py-4 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando Nuvem...</span>
                </>
              ) : (
                <>
                  <CloudLightning className="w-3.5 h-3.5" />
                  <span>Sincronizar com Firestore</span>
                </>
              )}
            </button>
          </motion.div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full font-black py-5 rounded-[2rem] mt-8 shadow-2xl transition-all active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2",
              isSaving 
                ? "bg-pink-500 text-white" 
                : "bg-white text-black hover:bg-zinc-100"
            )}
          >
            {isSaving ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Alterações Salvas!</span>
              </>
            ) : (
              <span>Salvar Alterações</span>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Modals System */}
      <AnimatePresence>
        {/* 1. NEWSLETTER EMAIL PROMO MODAL */}
        {activeModal === 'email' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playUiSound('click');
                setActiveModal(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl z-10 text-center"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
              <button 
                onClick={() => {
                  playUiSound('click');
                  setActiveModal(null);
                }}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-500">
                <Mail className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">E-mail Promocional</h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                Inscreva-se em nossa newsletter VIP para receber dicas exclusivas de matches, cupons de assinaturas gold e convites para eventos!
              </p>

              <form onSubmit={handleEmailSubscribe} className="mt-8 space-y-4">
                <div className="relative">
                  <input 
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    className="w-full bg-zinc-900 border border-zinc-850 focus:border-pink-500/50 rounded-2xl py-4 px-5 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      playUiSound('click');
                      setActiveModal(null);
                    }}
                    className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/10 hover:brightness-110 active:scale-98 transition-all"
                  >
                    Inscrever-se
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. TWO-FACTOR AUTH SETUP STEP-BY-STEP MODAL */}
        {activeModal === '2fa' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playUiSound('click');
                setActiveModal(null);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl z-10"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600" />
              <button 
                onClick={() => {
                  playUiSound('click');
                  setActiveModal(null);
                }}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Scan QR */}
              {twoFactorStep === 1 && (
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 text-pink-500">
                    <QrCode className="w-7 h-7" />
                  </div>
                  
                  <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-1">Passo 1 de 3</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Escaneie o Código QR</h3>
                  <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
                    Abra o seu aplicativo autenticador (como Google Authenticator ou Authy) e escaneie o QR Code abaixo ou insira a chave manual.
                  </p>

                  {/* QR Code Container */}
                  <div className="my-6 mx-auto w-40 h-40 bg-white rounded-3xl p-4 flex items-center justify-center shadow-lg relative group">
                    {/* Simulated elegant custom SVG QR Code */}
                    <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                      <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                      
                      <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                      
                      <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                      
                      {/* Random QR structures */}
                      <rect x="40" y="10" width="15" height="5" fill="currentColor" />
                      <rect x="45" y="20" width="10" height="10" fill="currentColor" />
                      <rect x="10" y="40" width="25" height="5" fill="currentColor" />
                      <rect x="25" y="50" width="10" height="15" fill="currentColor" />
                      
                      <rect x="70" y="40" width="20" height="20" fill="currentColor" />
                      <rect x="50" y="50" width="15" height="15" fill="currentColor" />
                      <rect x="55" y="70" width="20" height="10" fill="currentColor" />
                      <rect x="80" y="80" width="15" height="15" fill="currentColor" />
                      <rect x="40" y="85" width="10" height="5" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Manual Code */}
                  <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block">Chave manual</span>
                      <code className="text-xs font-mono font-bold text-zinc-200 block mt-0.5">TRUE-MATCH-5K9-2FA</code>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('TRUE-MATCH-5K9-2FA', 'secret')}
                      className="p-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-xl transition-colors shrink-0"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      playUiSound('click');
                      setTwoFactorStep(2);
                    }}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/10 hover:brightness-110 active:scale-98 transition-all"
                  >
                    Avançar para verificação
                  </button>
                </div>
              )}

              {/* Step 2: Verification */}
              {twoFactorStep === 2 && (
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">Passo 2 de 3</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Verificar Código de Segurança</h3>
                  <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
                    Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador para sincronizar.
                  </p>

                  {/* Simulator Box */}
                  <div className="my-6 p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 text-left relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-pink-400 uppercase tracking-wider font-black flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Simulador de Authenticator
                      </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          playUiSound('click');
                          generateNewOtp();
                        }}
                        className="text-[9px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Atualizar
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Para fins de teste, seu app autenticador simulou o seguinte código temporário ativo agora:
                    </p>
                    <div className="mt-2 text-2xl font-mono font-black text-pink-400 tracking-[0.2em] bg-black/40 py-2.5 rounded-xl text-center border border-pink-500/10">
                      {otpHint.substring(0, 3)} {otpHint.substring(3)}
                    </div>
                  </div>

                  <form onSubmit={handleVerify2FACode} className="space-y-4">
                    <input 
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-zinc-900 border border-zinc-850 focus:border-purple-500/50 rounded-2xl py-4 text-center text-lg font-mono tracking-[0.3em] text-white placeholder-zinc-700 outline-none transition-colors"
                      required
                    />

                    <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          playUiSound('click');
                          setTwoFactorStep(1);
                        }}
                        className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors"
                      >
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-pink-500/10 hover:brightness-110 active:scale-98 transition-all"
                      >
                        Sincronizar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {twoFactorStep === 3 && (
                <div>
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Passo 3 de 3</span>
                    <h3 className="text-lg font-black text-white tracking-tight">Sua segurança está pronta!</h3>
                    <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
                      Guarde estes códigos de recuperação de emergência. Eles servem para recuperar sua conta caso você perca seu dispositivo autenticador.
                    </p>
                  </div>

                  {/* Backup Codes Grid */}
                  <div className="my-5 p-4 bg-zinc-900 border border-zinc-850 rounded-2xl">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs font-bold text-zinc-300 text-center">
                      {backupCodes.map((code, index) => (
                        <span key={index} className="py-1">{code}</span>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                      className="w-full mt-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      {copiedBackup ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado com sucesso!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar códigos de emergência</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-zinc-500 text-[9px] leading-relaxed flex items-start gap-2 bg-zinc-950 p-2.5 rounded-xl border border-white/5 mb-6">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Ao clicar em ativar, sua sessão passará a exigir o token autenticador para novas conexões em outros navegadores.</span>
                  </div>

                  <button 
                    onClick={handleActivate2FA}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 active:scale-98 transition-all"
                  >
                    Copiar e Ativar 2FA
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* 3. DISABLE 2FA CONFIRMATION MODAL */}
        {activeModal === 'disable2fa' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playUiSound('click');
                setActiveModal(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl z-10 text-center"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
              <button 
                onClick={() => {
                  playUiSound('click');
                  setActiveModal(null);
                }}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">Desativar 2FA?</h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                Tem certeza de que deseja remover a Autenticação em Duas Etapas (2FA)? Isso reduzirá drasticamente a proteção e privacidade da sua conta.
              </p>

              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => {
                    playUiSound('click');
                    setActiveModal(null);
                  }}
                  className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors"
                >
                  Manter Ativo
                </button>
                <button 
                  onClick={handleDisable2FA}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-black font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-red-500/10 active:scale-98 transition-all animate-pulse"
                >
                  Desativar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
