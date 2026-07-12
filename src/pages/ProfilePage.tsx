import React, { useState, useEffect, useRef } from 'react';
import { Settings, ShieldCheck, Users, Flame, Wine, Dog, Moon, Baby, Compass, Activity, CreditCard, ChevronRight, Zap, Star, ShieldAlert, CheckCircle2, Lock, MapPin, Heart, Sparkles, Briefcase, GraduationCap, FileText, Crown, Camera, Trash2, Bell, MessageCircle, Ban, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mockUsers } from '../data/mock';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { useFavorites } from '../hooks/useFavorites';
import { getPrivacySetting, getSystemSetting } from '../utils/privacy';
import { playUiSound } from '../utils/audio';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { favorites } = useFavorites();

  const [curtidas, setCurtidas] = useState(() => {
    const stored = localStorage.getItem('truematch_curtidas_count');
    return stored ? parseInt(stored, 10) : 142;
  });

  useEffect(() => {
    const handleCurtidasChange = () => {
      const stored = localStorage.getItem('truematch_curtidas_count');
      setCurtidas(stored ? parseInt(stored, 10) : 142);
    };
    window.addEventListener('curtidas_changed', handleCurtidasChange);
    return () => window.removeEventListener('curtidas_changed', handleCurtidasChange);
  }, []);

  const [me, setMe] = useState(() => {
    const stored = localStorage.getItem('truematch_profile_me');
    if (stored) {
      try {
        return { ...mockUsers[0], ...JSON.parse(stored) };
      } catch (e) {
        // Fallback below
      }
    }
    return mockUsers[0];
  });

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [myImages, setMyImages] = useState(me.images || mockUsers[0].images);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMe(data);
            if (data.images) {
              setMyImages(data.images);
            }
            localStorage.setItem('truematch_profile_me', JSON.stringify(data));
          }
        } catch (err) {
          console.error("Error fetching profile from Firestore:", err);
        }
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const checkGold = () => {
      const stored = localStorage.getItem('truematch_profile_me');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isGold !== me?.isGold) {
            setMe((prev: any) => ({ ...prev, ...parsed }));
            if (parsed.images) setMyImages(parsed.images);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    const interval = setInterval(checkGold, 1000);
    return () => clearInterval(interval);
  }, [me]);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    
    playUiSound('click');
    setShowLogoutModal(true);
    setIsLoggingOut(true);
    playUiSound('success');
    
    setTimeout(() => {
      localStorage.removeItem('matchdeck_user_token');
      localStorage.removeItem('truematch_profile_me');
      navigate('/');
    }, 2500);
  };
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isProfilePhoto: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      let newImages;
      if (isProfilePhoto) {
        newImages = [base64String, ...myImages.filter(img => img !== base64String)];
      } else {
        newImages = [...myImages, base64String];
      }
      setMyImages(newImages);
      const updatedMe = {
        ...me,
        images: newImages
      };
      
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), updatedMe);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }
      
      localStorage.setItem('truematch_profile_me', JSON.stringify(updatedMe));
      setMe(updatedMe);
      showToast('Nova foto adicionada!', 'success');
      playUiSound('success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddPhoto = () => {
    galleryInputRef.current?.click();
  };

  const handleAddProfilePhoto = () => {
    profileInputRef.current?.click();
  };

  const handleDeletePhoto = async (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (myImages.length <= 1) {
      alert("Você precisa manter pelo menos uma foto no seu perfil.");
      return;
    }
    const newImages = myImages.filter((_, idx) => idx !== idxToDelete);
    setMyImages(newImages);
    const updatedMe = {
      ...me,
      images: newImages
    };

    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updatedMe);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }

    localStorage.setItem('truematch_profile_me', JSON.stringify(updatedMe));
    setMe(updatedMe);
    showToast('Foto excluída com sucesso', 'info');
  };

  const handleOpenEdit = () => {
    navigate('/profile/edit');
  };


  return (
    <div className={cn(
      "flex-1 h-full overflow-y-auto pb-32 hide-scrollbar relative transition-colors duration-300",
      "bg-zinc-950 text-white"
    )}>
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

      {/* Hidden inputs for image uploading */}
      <input 
        type="file" 
        ref={profileInputRef} 
        onChange={(e) => handleFileChange(e, true)} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={(e) => handleFileChange(e, false)} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Profile Info */}
      <div className="pt-12 pb-6 px-6 flex flex-col items-center text-center relative mt-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="absolute top-2 right-6 w-10 h-10 rounded-full border border-white/10 bg-zinc-900/50 flex items-center justify-center transition-all active:scale-90 text-zinc-400 hover:text-white"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
          )}
        </button>

        <div className="relative mb-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleAddProfilePhoto}
            className={cn(
              "w-32 h-32 rounded-full p-1 shadow-xl transition-all duration-500 cursor-pointer relative group overflow-hidden",
              me.isGold 
                ? "bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-600 shadow-amber-500/20 scale-105" 
                : "bg-gradient-to-br from-pink-500 to-purple-600 shadow-purple-500/10"
            )}
          >
            <img decoding="async" loading="lazy" src={myImages[0]} referrerPolicy="no-referrer" className={cn("w-full h-full rounded-full object-cover border-4 transition-colors duration-300", "border-zinc-950")} />
            {/* Edit overlay on hover/active */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
              <Camera className="w-5 h-5 text-white" />
              <span>Alterar Foto</span>
            </div>
          </motion.div>
          
          {/* Floating trigger for touch users / visible feedback */}
          <button 
            onClick={handleAddProfilePhoto}
            className="absolute bottom-1 -left-1 w-9 h-9 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-pink-500 hover:text-pink-400 active:scale-95 shadow-lg cursor-pointer transition-all z-10"
            title="Alterar Foto de Perfil"
          >
            <Camera className="w-4 h-4 fill-current" />
          </button>

          <div className={cn("absolute bottom-1 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border transition-colors duration-300", "bg-zinc-900 border border-zinc-800")}>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-1 flex-wrap gap-y-1">
          <h1 className={cn("text-2xl font-bold transition-colors duration-300", "text-white")}>
            {me.name}{!getPrivacySetting('hide_age') ? `, ${me.age}` : ''}
          </h1>
          {getPrivacySetting('hide_age') && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-white/5" title="Idade Ocultada em Configurações">
              <Lock className="w-2.5 h-2.5" />
              <span>Idade Oculta</span>
            </span>
          )}
          {me.isGold && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-amber-500/15 uppercase tracking-wider animate-pulse">
              <Crown className="w-3 h-3 fill-current" />
              <span>GOLD</span>
            </span>
          )}
          <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
            me.isOnline 
              ? `bg-green-500/20 ${'text-green-400'} border border-green-500/30`
              : `bg-red-500/20 ${'text-red-400'} border border-red-500/30`
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              {me.isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${me.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span>{me.isOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-3 text-sm mb-3 font-medium">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-pink-500 mr-1" />
            <span className={"text-zinc-300"}>{me.city}</span>
          </div>
          <span className={"text-zinc-600"}>•</span>
          <div className="flex items-center">
            <Heart className="w-4 h-4 text-purple-500 mr-1" />
            <span className={"text-zinc-300"}>{me.relationshipStatus}</span>
          </div>
        </div>

        <p className="text-xs text-blue-400 mb-6 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          Selo de Verificado • Prioridade AI
        </p>
        
        {/* Quick Stats */}
        <div className={cn(
          "w-full flex justify-between p-4 rounded-3xl border mb-8 backdrop-blur-sm transition-colors duration-300",
          "bg-zinc-900/60 border-white/5 shadow-inner"
        )}>
            <div className="flex flex-col items-center flex-1">
              <span className={cn("text-2xl font-black transition-colors duration-300", "text-white")}>{curtidas}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Curtidas</span>
            </div>
            <div className={cn("w-[1px] transition-colors duration-300", "bg-white/10")}></div>
            <div className="flex flex-col items-center flex-1">
              <span className={cn("text-2xl font-black transition-colors duration-300", "text-white")}>{favorites.length}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Curtiu</span>
            </div>
            <div className={cn("w-[1px] transition-colors duration-300", "bg-white/10")}></div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-black text-pink-500 flex items-baseline gap-0.5">
                99<span className="text-sm">%</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Confiança</span>
            </div>
        </div>

        {/* Active Privacy Settings Banner */}
        {(getPrivacySetting('private') || getPrivacySetting('hide_age') || getPrivacySetting('hide_dist') || getPrivacySetting('antifraud') || getSystemSetting('2fa')) && (
          <div className="w-full bg-zinc-900/40 border border-red-500/10 rounded-3xl p-5 mb-8 text-left relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center space-x-2.5 mb-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest text-red-500">Privacidade & Segurança</span>
            </div>
            <div className="space-y-2">
              {getPrivacySetting('private') && (
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">PRIVADO</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Seu perfil completo (fotos e bio) está restrito apenas para matches confirmados.</p>
                </div>
              )}
              {getPrivacySetting('hide_age') && (
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded border border-white/5 shrink-0">IDADE</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Sua idade foi ocultada do seu perfil público de paquera.</p>
                </div>
              )}
              {getPrivacySetting('hide_dist') && (
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded border border-white/5 shrink-0">DISTÂNCIA</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Sua distância e localização exatas estão ocultas reciprocamente.</p>
                </div>
              )}
              {getPrivacySetting('antifraud') && (
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">ANTIFRAUDE</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Filtro de perfis suspeitos ativo: apenas contas verificadas e seguras são sugeridas.</p>
                </div>
              )}
              {getSystemSetting('2fa') && (
                <div className="flex items-start space-x-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">2FA ATIVO</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Sua conta está protegida com a autenticação de dois fatores por aplicativo.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subscription Banner */}
      <div className="px-4 mb-6">
        {me.isGold ? (
          <div className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-4 shadow-lg shadow-amber-500/5 relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">TrueMatch GOLD</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                  Premium
                </span>
              </div>
              
              <div className="mb-3.5 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Plano Atual</span>
                <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1">
                  PREMIUM (GOLD)
                </span>
              </div>

              <p className="text-zinc-300 text-xs font-medium mb-3 leading-relaxed">
                Parabéns! Você tem acesso completo aos benefícios premium do TrueMatch Gold. Aproveite as curtidas reveladas, mensagens ilimitadas e filtros extras de atividade.
              </p>

              {/* Organized Feature Row - Active */}
              <div className="grid grid-cols-3 gap-2 mb-3.5 mt-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 mb-1" />
                  <span className="text-[9px] font-bold text-amber-400 leading-tight">Ver Curtidas</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 mb-1" />
                  <span className="text-[9px] font-bold text-amber-400 leading-tight">Msgs Ilimitadas</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 mb-1" />
                  <span className="text-[9px] font-bold text-amber-400 leading-tight">Mais Filtros</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  const updatedMe = { ...me, isGold: false };
                  localStorage.setItem('truematch_profile_me', JSON.stringify(updatedMe));
                  setMe(updatedMe);
                }}
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 text-xs font-bold py-2.5 rounded-xl border border-white/5 active:scale-98 transition-all flex items-center justify-center space-x-1"
              >
                <span>Voltar ao Plano Gratuito (FREE)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-4 shadow-lg relative overflow-hidden group transition-all duration-300 hover:border-white/10">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-zinc-500" />
                  <h3 className="font-extrabold text-sm text-zinc-400 uppercase tracking-wider">TrueMatch Standard</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest">Grátis</span>
              </div>
              
              <div className="mb-3.5 px-3 py-2 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Plano Atual</span>
                <span className="text-xs font-black text-zinc-300 uppercase tracking-widest">GRATUITO (FREE)</span>
              </div>

              <p className="text-zinc-400 text-xs font-medium mb-3 leading-relaxed">
                Você está no plano gratuito com limite de mensagens. Assine o <strong className="text-amber-400">TrueMatch GOLD</strong> para liberar curtidas, mensagens ilimitadas e filtros extras de atividade!
              </p>
              
              {/* Organized Feature Row */}
              <div className="grid grid-cols-3 gap-2 mb-3.5 mt-2">
                <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center text-center">
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10 mb-1" />
                  <span className="text-[9px] font-bold text-zinc-400 leading-tight">Ver Curtidas</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center text-center">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10 mb-1" />
                  <span className="text-[9px] font-bold text-zinc-400 leading-tight">Msgs Ilimitadas</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col items-center text-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10 mb-1" />
                  <span className="text-[9px] font-bold text-zinc-400 leading-tight">Mais Filtros</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout', { state: { from: '/profile' } })}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black py-2.5 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-98 transition-all hover:brightness-105 flex items-center justify-center space-x-1"
              >
                <span>Assinar por R$ 19,90/mês</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="px-4 mb-8">
        <div className={cn(
          "rounded-[2rem] p-6 border backdrop-blur-sm space-y-6 transition-colors duration-300",
          "bg-zinc-900/60 border-zinc-800"
        )}>
          <div className={cn("pb-4 mb-4 border-b transition-colors duration-300", "border-white/5")}>
            <h3 className={cn("uppercase text-xs font-bold transition-colors duration-300 text-center tracking-widest", "text-zinc-400")}>Conta e Segurança</h3>
          </div>
          
          <div className="space-y-4">
          <button 
            onClick={() => navigate('/profile/settings/kyc')}
            className={cn(
              "w-full flex justify-between items-center px-4 py-3 rounded-2xl transition-all duration-300 group",
              "hover:bg-blue-500/10 hover:border-blue-500/20"
            )}
          >
            <div className="flex items-center">
               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all duration-300", "bg-zinc-800 group-hover:bg-blue-500/20")}>
                 <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
               </div>
               <div className="text-left">
                 <span className="font-bold text-[14px] leading-snug block">Verificação KYC</span>
                 <span className="text-[9px] text-zinc-500 leading-none block">Nível 3 de segurança ativo</span>
               </div>
            </div>
            <div className="flex items-center">
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest mr-0.5 leading-[12px] h-3 block">Verificado</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/profile/settings/general')}
            className={cn(
              "w-full flex justify-between items-center px-4 py-3 rounded-2xl transition-all duration-300 group",
              "hover:bg-pink-500/10 hover:border-pink-500/20"
            )}
          >
            <div className="flex items-center">
               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all duration-300", "bg-zinc-800 group-hover:bg-pink-500/20")}>
                 <Settings className="w-4.5 h-4.5 text-zinc-500 group-hover:text-pink-500" />
               </div>
               <div className="text-left">
                 <span className="font-bold text-[14px] leading-snug block">Configurações</span>
                 <span className="text-[9px] text-zinc-500 leading-none block">Notificações e preferências</span>
               </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-pink-500 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/profile/settings/privacy')}
            className={cn(
              "w-full flex justify-between items-center px-4 py-3 rounded-2xl transition-all duration-300 group",
              "hover:bg-red-500/10 hover:border-red-500/20"
            )}
          >
            <div className="flex items-center">
               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all duration-300", "bg-zinc-800 group-hover:bg-red-500/20")}>
                 <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
               </div>
               <div className="text-left">
                 <span className="font-bold text-[14px] leading-snug block">Privacidade</span>
                 <span className="text-[9px] text-zinc-500 leading-none block">Antifraude e visibilidade</span>
               </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/profile/settings/security')}
            className={cn(
              "w-full flex justify-between items-center px-4 py-3 rounded-2xl transition-all duration-300 group",
              "hover:bg-emerald-500/10 hover:border-emerald-500/20"
            )}
          >
            <div className="flex items-center">
               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all duration-300", "bg-zinc-800 group-hover:bg-emerald-500/20")}>
                 <Lock className="w-4.5 h-4.5 text-emerald-500" />
               </div>
               <div className="text-left">
                 <span className="font-bold text-[14px] leading-snug block">Segurança e Login</span>
                 <span className="text-[9px] text-zinc-500 leading-none block">Senha e dispositivos</span>
               </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          </button>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "w-full h-[50px] flex justify-between items-center px-5 rounded-[2rem] transition-all duration-500 group mt-8 border relative overflow-hidden",
              isLoggingOut 
                ? "bg-red-600 border-red-600 shadow-xl shadow-red-600/20" 
                : "bg-zinc-900 border-white/5 hover:bg-red-500/10 hover:border-red-500/30"
            )}
          >
            {isLoggingOut && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
              />
            )}
            
            <div className="flex items-center relative z-10">
               <div className={cn(
                 "w-[34px] h-[34px] rounded-xl flex items-center justify-center mr-[15px] transition-all duration-500 shadow-sm", 
                 isLoggingOut ? "bg-white/20" : "bg-red-500/10 group-hover:bg-red-500/20"
               )}>
                 <LogOut className={cn("w-4 h-4", isLoggingOut ? "text-white" : "text-red-500")} />
               </div>
               <div className="text-center w-[140.266px] h-[29px] flex flex-col justify-center">
                 <span className={cn(
                   "font-black text-[12px] uppercase tracking-[0.15em] block leading-none mb-1 transition-colors duration-300",
                   isLoggingOut ? "text-white" : "text-white group-hover:text-red-500"
                 )}>
                   {isLoggingOut ? "Saindo..." : "Sair da Conta"}
                 </span>
                 <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest leading-none block transition-colors duration-300",
                   isLoggingOut ? "text-white/80" : "text-zinc-500 group-hover:text-red-500/60"
                 )}>
                   {isLoggingOut ? "Encerrando segurança" : "Finalizar Sessão"}
                 </span>
               </div>
            </div>
            {!isLoggingOut && (
              <div className="w-[35px] h-[34px] rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
              </div>
            )}
          </button>
          
          </div>
        </div>
      </div>

      {/* Informações do Perfil */}
      <div className="px-4 mb-8">
        <div className={cn(
          "rounded-[2rem] p-6 border backdrop-blur-sm space-y-6 transition-colors duration-300",
          "bg-zinc-900/60 border-zinc-800"
        )}>
          <div className={cn("pb-4 mb-4 border-b transition-colors duration-300", "border-white/5")}>
            <h3 className={cn("uppercase text-xs font-bold transition-colors duration-300 text-center tracking-widest", "text-zinc-400")}>Minhas Informações</h3>
          </div>

          {/* Bio */}
          {me.bio && (
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1.5">Sobre mim</span>
              <p className={cn("text-[14px] leading-relaxed font-medium whitespace-pre-wrap transition-colors duration-300", "text-zinc-200")}>{me.bio}</p>
            </div>
          )}

          {/* Job and Education */}
          {(me.jobTitle || me.education) && (
            <div className="grid grid-cols-2 gap-4">
              {me.jobTitle && (
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Profissão</span>
                  <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                    <Briefcase className="w-4 h-4 text-pink-500 mr-2 shrink-0" />
                    <span className="truncate">{me.jobTitle}</span>
                  </div>
                </div>
              )}
              {me.education && (
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Educação</span>
                  <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                    <GraduationCap className="w-4 h-4 text-purple-500 mr-2 shrink-0" />
                    <span className="truncate">{me.education}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Intent / Objetivo */}
          {me.intent && (
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Objetivo no App</span>
              <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                <Sparkles className="w-4 h-4 text-yellow-500 mr-2 shrink-0" />
                <span>{me.intent}</span>
              </div>
            </div>
          )}

          
          {/* Outras Informações do Filtro */}
          <div className="grid grid-cols-2 gap-4">
            {me.gender && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Gênero</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Users className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                  <span className="truncate">{me.gender}</span>
                </div>
              </div>
            )}
            {me.sexuality && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Sexualidade</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Users className="w-4 h-4 text-pink-500 mr-2 shrink-0" />
                  <span className="truncate">{me.sexuality}</span>
                </div>
              </div>
            )}
            {me.smoking && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Cigarro</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Flame className="w-4 h-4 text-orange-500 mr-2 shrink-0" />
                  <span className="truncate">{me.smoking}</span>
                </div>
              </div>
            )}
            {me.drinking && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Bebida</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Wine className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                  <span className="truncate">{me.drinking}</span>
                </div>
              </div>
            )}
            {me.pets && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Pets</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Dog className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
                  <span className="truncate">{me.pets}</span>
                </div>
              </div>
            )}
          </div>


          
            {me.zodiac && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Signo</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Moon className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
                  <span className="truncate">{me.zodiac}</span>
                </div>
              </div>
            )}
            {me.children && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Filhos</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Baby className="w-4 h-4 text-blue-300 mr-2 shrink-0" />
                  <span className="truncate">{me.children}</span>
                </div>
              </div>
            )}
            {me.religion && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Religião</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Compass className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                  <span className="truncate">{me.religion}</span>
                </div>
              </div>
            )}
            {me.personality && (
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Personalidade</span>
                <div className={cn("flex items-center text-[14px] font-medium transition-colors duration-300", "text-zinc-200")}>
                  <Activity className="w-4 h-4 text-pink-400 mr-2 shrink-0" />
                  <span className="truncate">{me.personality}</span>
                </div>
              </div>
            )}

          {/* Lifestyle / Tags */}
          {me.lifestyle && me.lifestyle.length > 0 && (
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-2">Estilo de Vida / Interesses</span>
              <div className="flex flex-wrap gap-1.5">
                {me.lifestyle.map((tag, idx) => (
                  <span key={idx} className={cn(
                    "px-3 py-1 rounded-full border text-[12px] font-semibold transition-colors duration-300",
                    "border-purple-500/20 bg-purple-500/5 text-purple-300"
                  )}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
{/* Editar button no final das informações */}
          <button 
            onClick={handleOpenEdit}
            className="w-full mt-6 px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[15px] font-black shadow-lg shadow-pink-500/25 active:scale-95 transition-all hover:shadow-pink-500/40 flex items-center justify-center space-x-2"
          >
            <FileText className="w-5 h-5 mr-2" />
            Editar Minhas Informações
          </button>
          
          
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="px-4 mb-8">
        <div className={cn(
          "rounded-[2rem] p-6 border backdrop-blur-sm space-y-6 transition-colors duration-300",
          "bg-zinc-900/60 border-zinc-800"
        )}>
          <div className={cn("pb-4 mb-4 border-b transition-colors duration-300", "border-white/5")}>
              <h3 className={cn("uppercase text-xs font-bold transition-colors duration-300 text-center tracking-widest", "text-zinc-400")}>Minhas Fotos</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
          {myImages.map((img, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-white/5 bg-zinc-900">
                <img decoding="async" loading="lazy" src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button 
                      onClick={(e) => handleDeletePhoto(idx, e)}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/90 hover:scale-110 active:scale-95 text-white flex items-center justify-center transition-all shadow-md"
                      title="Excluir Foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-center mb-2">
                    <button 
                      onClick={() => setViewPhoto(img)} 
                      className="bg-white/20 hover:bg-white/35 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
                    >
                      Ver Foto
                    </button>
                  </div>
                </div>
                
                {/* Indicator for primary profile photo */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                    Perfil
                  </span>
                )}
              </div>
          ))}
          <button 
            onClick={handleAddPhoto} 
            className={cn(
              "relative aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300",
              "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/5"
            )}
          >
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors duration-300", "bg-zinc-800")}>
                <Camera className="w-4 h-4" />
             </div>
             <span className="font-bold text-xs uppercase tracking-widest opacity-50">Adicionar</span>
          </button>
        </div>
        </div>
      </div>

      <div className="px-6 pb-24">
        <p className="text-[10px] text-zinc-600 text-center mt-4 font-medium uppercase tracking-widest">
          Versão 2.4.0 (Build 902) • Matchdeck IA Security System
        </p>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-red-500/20 flex items-center justify-center mx-auto mb-8 relative">
                <LogOut className="w-10 h-10 text-red-500 relative z-10" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-[2rem] blur-xl"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wider">Encerrando Sessão</h3>
              <p className="text-zinc-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest px-4">
                Sua conta está sendo desconectada com segurança do Matchdeck.
              </p>
              
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                />
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">Protegendo Dados...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              onClick={() => setViewPhoto(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img decoding="async" loading="lazy" 
                src={viewPhoto} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
              
              <button 
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
                onClick={() => setViewPhoto(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-pink-500 overflow-hidden">
                      <img decoding="async" loading="lazy" src={myImages[0]} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-wider">{me.name}</h4>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Sua Foto de Perfil</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
