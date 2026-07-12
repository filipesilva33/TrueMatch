import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ChevronLeft, EyeOff, MapPinOff, UserX, Ghost, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { playUiSound } from '../../utils/audio';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const defaultPrefs = [
      { id: 'private', label: 'Perfil Privado', checked: false, description: 'Apenas matches podem ver seu perfil completo', icon: EyeOff },
      { id: 'hide_age', label: 'Ocultar Idade', checked: false, description: 'Não mostrar sua idade para outros', icon: UserX },
      { id: 'hide_dist', label: 'Ocultar Distância', checked: true, description: 'Sua localização exata não será mostrada', icon: MapPinOff },
      { id: 'antifraud', label: 'Modo Antifraude', checked: true, description: 'Proteção extra contra perfis suspeitos', icon: Ghost },
    ];
    const stored = localStorage.getItem('matchdeck_privacy');
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

  const toggle = (idx: number) => {
    playUiSound('click');
    const newPrefs = [...prefs];
    newPrefs[idx].checked = !newPrefs[idx].checked;
    setPrefs(newPrefs);
  };

  const handleSave = () => {
    setIsSaving(true);
    playUiSound('success');
    localStorage.setItem('matchdeck_privacy', JSON.stringify(prefs));
    setTimeout(() => {
      navigate(-1);
    }, 800);
  };

  return (
    <div className="h-full overflow-y-auto bg-black pb-32 hide-scrollbar">
      <div className="pt-6 px-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-8 relative">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors absolute left-0 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-full text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Privacidade</h1>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Segurança & Visibilidade</p>
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
                "flex items-center p-6 rounded-[2rem] border transition-all duration-300 group",
                item.checked ? "bg-zinc-900 border-red-500/30" : "bg-zinc-900/40 border-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors duration-300",
                item.checked ? "bg-red-500/20" : "bg-zinc-800"
              )}>
                <item.icon className={cn("w-6 h-6", item.checked ? "text-red-500" : "text-zinc-500")} />
              </div>
              
              <div className="flex-1">
                <span className="text-sm font-bold block text-white">{item.label}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.description}</p>
              </div>

              <div className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-500",
                item.checked ? "bg-red-500" : "bg-zinc-800"
              )}>
                <motion.div 
                  animate={{ x: item.checked ? 26 : 4 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                />
              </div>
            </motion.div>
          ))}

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full font-black py-5 rounded-[2rem] mt-8 shadow-2xl transition-all active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2",
              isSaving 
                ? "bg-red-500 text-white" 
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
    </div>
  );
}
