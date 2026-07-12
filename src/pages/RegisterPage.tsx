import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ArrowRight, Camera, Check, ShieldCheck, ScanFace, IdCard, Mail, Lock, User, Calendar, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { playUiSound } from '../utils/audio';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [avatar, setAvatar] = useState('');
  const [documentImage, setDocumentImage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      playUiSound('success');
    };
    reader.readAsDataURL(file);
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentImage(reader.result as string);
      playUiSound('success');
    };
    reader.readAsDataURL(file);
  };

  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age || 25;
  };

  const nextStep = () => {
    playUiSound('click');
    if (step === 1) {
      if (!email.trim() || !email.includes('@')) {
        showToast('Por favor, insira um e-mail válido.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('A senha precisa ter pelo menos 6 caracteres.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!name.trim()) {
        showToast('Por favor, insira seu nome.', 'error');
        return;
      }
      if (!dob) {
        showToast('Por favor, insira sua data de nascimento.', 'error');
        return;
      }
    }
    if (step === 3) {
      if (!avatar) {
        showToast('Por favor, adicione uma foto de perfil.', 'error');
        return;
      }
    }

    if (step < 5) {
      if (step === 4) {
        setStep(5);
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          playUiSound('success');
        }, 3000);
      } else {
        setStep(step + 1);
      }
    } else {
      finish();
    }
  };

  const prevStep = () => {
    playUiSound('click');
    if (step > 1) setStep(step - 1);
    else navigate('/welcome');
  };

  const finish = async () => {
    if (isRegistering) return;
    setIsRegistering(true);
    playUiSound('click');

    try {
      // Create authentication profile
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const calculatedAge = dob ? calculateAge(dob) : 25;
      
      const userProfile = {
        id: user.uid,
        name: name.trim(),
        email: email.trim(),
        gender: 'outro',
        age: calculatedAge,
        bio: 'TrueMatch AI Premium User ⚡',
        images: avatar ? [avatar] : ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&h=250'],
        verified: true,
        isOnline: true,
        isGold: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Register profile details inside Cloud Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Save credentials locally to hydrate main interface
      localStorage.setItem('truematch_profile_me', JSON.stringify(userProfile));
      const token = await user.getIdToken();
      localStorage.setItem('matchdeck_user_token', token);

      playUiSound('success');
      showToast('Cadastro concluído! Bem-vindo ao Matchdeck.', 'success');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      playUiSound('click');
      let friendlyMessage = 'Erro ao realizar cadastro. Tente novamente.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Este e-mail já está cadastrado. Tente fazer login ou use outro.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Endereço de e-mail inválido.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'A senha digitada é muito fraca (mínimo 6 caracteres).';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Provedor de E-mail/Senha desativado no Firebase. Siga o guia na tela.';
        // We'll show the setup guide modal
        setShowSetupGuide(true);
      }
      showToast(friendlyMessage, 'error');
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-pink-500/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="pt-12 px-6 pb-4 flex items-center relative z-10">
        <button 
          id="btn-reg-prev"
          onClick={prevStep}
          className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map(s => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step >= s ? "bg-white w-6" : "bg-zinc-800 w-2"
              )}
            />
          ))}
        </div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pt-8 relative z-10 flex flex-col max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Sua Conta</h2>
              <p className="text-zinc-400 text-sm mb-10">Crie sua conta segura do Matchdeck.</p>
              
              <div className="space-y-4 flex-1">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    id="reg-input-email"
                    type="email"
                    placeholder="SEU E-MAIL"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-transparent focus:border-pink-500 rounded-2xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none transition-all placeholder:text-zinc-750"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    id="reg-input-password"
                    type="password"
                    placeholder="CRIAR SENHA (MÍN. 6 DÍGITOS)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-transparent focus:border-pink-500 rounded-2xl py-5 pl-14 pr-6 text-xs font-black uppercase tracking-widest text-white focus:outline-none transition-all placeholder:text-zinc-750"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Seus Dados</h2>
              <p className="text-zinc-400 text-sm mb-10">Como você quer ser chamado?</p>
              
              <div className="space-y-6 flex-1">
                <div className="relative group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-2 block">Primeiro Nome</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      id="reg-input-name"
                      type="text"
                      placeholder="JOÃO"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-zinc-900 border-2 border-transparent focus:border-pink-500 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none transition-all placeholder:text-zinc-700"
                      required
                    />
                  </div>
                </div>
                
                <div className="relative group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-2 block">Data de Nascimento</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <input 
                      id="reg-input-dob"
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full bg-zinc-900 border-2 border-transparent focus:border-pink-500 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none transition-all block [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Sua Foto</h2>
              <p className="text-zinc-400 text-sm mb-10">Adicione sua melhor foto para começar.</p>
              
              <div className="flex-1 flex items-center justify-center pb-12">
                {avatar ? (
                  <div className="relative w-48 h-64 rounded-[2.5rem] overflow-hidden border-2 border-pink-500 shadow-2xl">
                    <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      id="btn-remove-avatar"
                      type="button"
                      onClick={() => setAvatar('')}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    id="btn-upload-avatar"
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                    className="w-48 h-64 bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center space-y-4 hover:border-pink-500 hover:bg-pink-500/5 transition-colors cursor-pointer group"
                  >
                    <input 
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                      <Camera className="w-8 h-8 text-zinc-500 group-hover:text-pink-500 transition-colors" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-pink-500">Enviar Foto</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Documento</h2>
              <p className="text-zinc-400 text-sm mb-10">Envie a parte da frente de um documento (RG ou CNH) para confirmar que você é real.</p>
              
              <div className="flex-1 flex items-center justify-center pb-12">
                {documentImage ? (
                  <div className="relative w-full max-w-[280px] h-44 rounded-3xl overflow-hidden border-2 border-pink-500 shadow-2xl">
                    <img src={documentImage} alt="Document Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      id="btn-remove-doc"
                      type="button"
                      onClick={() => setDocumentImage('')}
                      className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    id="btn-upload-doc"
                    onClick={() => document.getElementById('doc-file-input')?.click()}
                    className="w-full h-44 bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center space-y-4 hover:border-pink-500 hover:bg-pink-500/5 transition-colors cursor-pointer group"
                  >
                    <input 
                      id="doc-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleDocChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                      <IdCard className="w-8 h-8 text-zinc-500 group-hover:text-pink-500 transition-colors" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-pink-500">Enviar Documento</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Segurança</h2>
              <p className="text-zinc-400 text-sm mb-10">Verificaremos se você é uma pessoa real para manter a comunidade segura.</p>
              
              <div className="flex-1 flex items-center justify-center pb-20">
                <div className="relative flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full border-2 border-zinc-800 relative overflow-hidden flex items-center justify-center">
                    <ScanFace className={cn(
                      "w-16 h-16 transition-colors duration-500",
                      isVerifying ? "text-pink-500" : "text-green-500"
                    )} />
                    
                    {isVerifying && (
                      <motion.div
                        animate={{ top: ['-20%', '120%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                      />
                    )}
                  </div>
                  
                  <div className="mt-8 text-center h-16">
                    <AnimatePresence mode="wait">
                      {isVerifying ? (
                        <motion.div
                          key="verifying"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <p className="text-sm font-bold text-white mb-1">Analisando Biometria...</p>
                          <p className="text-xs text-zinc-500">Por favor, posicione seu rosto no centro</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="verified"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="flex items-center space-x-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full mb-2">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-sm font-bold">Identidade Confirmada</span>
                          </div>
                          <p className="text-xs text-zinc-500">Perfil verificado e seguro.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Action */}
      <div className="p-6 relative z-10 pb-12 w-full max-w-md mx-auto">
        <button
          id="btn-reg-next"
          onClick={nextStep}
          disabled={isVerifying || isRegistering}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-sm uppercase tracking-widest py-5 rounded-[2rem] flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isRegistering ? (
            <>
              <span>Registrando...</span>
              <Loader2 className="w-5 h-5 animate-spin" />
            </>
          ) : (
            <>
              <span>{step === 5 ? 'Concluir Cadastro' : 'Continuar'}</span>
              {step === 5 ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </>
          )}
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-3xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl min-w-[280px]",
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

      {/* Firebase Auth Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSetupGuide(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden z-10"
            >
              {/* Pink Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 to-purple-500" />

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Configurar Firebase Auth</h3>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Erro: operation-not-allowed</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                O provedor de login com <strong>E-mail e Senha</strong> está desativado no console do seu projeto Firebase. Ative-o para habilitar cadastros reais:
              </p>

              <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <p className="text-xs text-zinc-300">
                    Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline inline-flex items-center gap-0.5 font-bold">Console do Firebase</a>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <p className="text-xs text-zinc-300">
                    Vá em <strong>Authentication</strong> &rarr; aba <strong>Sign-in method</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <p className="text-xs text-zinc-300">
                    Clique em <strong>Add new provider</strong> e selecione <strong>E-mail/Senha</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <p className="text-xs text-zinc-300">
                    Habilite o interruptor <strong>E-mail/Senha</strong> e clique em <strong>Salvar</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSetupGuide(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                >
                  Entendi
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-pink-500/20"
                >
                  Recarregar Página
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
