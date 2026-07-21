import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Smartphone, 
  Heart, 
  Sparkles, 
  Layers, 
  Download, 
  RefreshCw, 
  Eye, 
  Volume2, 
  VolumeX, 
  Info,
  CheckCircle2,
  Sliders,
  Sparkle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { playUiSound } from '../../utils/audio';

// Launcher themes definitions with premium styling details
interface LauncherTheme {
  id: string;
  name: string;
  gradient: string;
  heartColor: string;
  badge?: string;
  description: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  bgType: 'gradient' | 'black' | 'dark' | 'neon' | 'glass';
}

const LAUNCHER_THEMES: LauncherTheme[] = [
  {
    id: 'normal',
    name: 'Normal (Clássico)',
    gradient: 'from-pink-500 via-pink-600 to-purple-600',
    heartColor: 'text-white',
    description: 'O visual clássico do Matchdeck com rosa neon e magenta profundo.',
    borderColor: 'border-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    textColor: 'text-pink-400',
    bgType: 'gradient'
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    gradient: 'from-zinc-900 via-zinc-950 to-black',
    heartColor: 'text-pink-500',
    badge: 'DARK',
    description: 'Fundo preto puro com coração vibrante em rosa neon para economizar bateria.',
    borderColor: 'border-zinc-800',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    textColor: 'text-zinc-400',
    bgType: 'dark'
  },
  {
    id: 'light',
    name: 'Clean Light',
    gradient: 'from-zinc-100 via-white to-zinc-50',
    heartColor: 'text-pink-600',
    badge: 'LIGHT',
    description: 'Uma interface limpa e minimalista com tons pastéis elegantes.',
    borderColor: 'border-zinc-200',
    glowColor: 'rgba(219, 39, 119, 0.15)',
    textColor: 'text-pink-600',
    bgType: 'black'
  },
  {
    id: 'premium',
    name: 'Gold Edition',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    heartColor: 'text-zinc-950',
    badge: 'GOLD',
    description: 'Visual dourado metálico exclusivo para membros TrueMatch Gold.',
    borderColor: 'border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    textColor: 'text-amber-400',
    bgType: 'gradient'
  },
  {
    id: 'valentine',
    name: "Valentine's Special",
    gradient: 'from-red-500 via-rose-600 to-pink-600',
    heartColor: 'text-white',
    badge: 'AMOR',
    description: 'Edição especial apaixonante com tons vermelhos intensos e rosas.',
    borderColor: 'border-red-500/30',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    textColor: 'text-red-400',
    bgType: 'gradient'
  },
  {
    id: 'neon',
    name: 'Cyber Neon',
    gradient: 'from-indigo-950 via-purple-900 to-fuchsia-950',
    heartColor: 'text-cyan-400',
    badge: 'CYBER',
    description: 'Contornos cibernéticos com coração ciano brilhante e visual futurista.',
    borderColor: 'border-purple-500/40',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    textColor: 'text-cyan-400',
    bgType: 'neon'
  },
  {
    id: 'luxury',
    name: 'Royal Velvet',
    gradient: 'from-violet-950 via-purple-900 to-indigo-950',
    heartColor: 'text-amber-400',
    badge: 'LUXO',
    description: 'Uma combinação nobre de roxo imperial profundo com detalhes dourados.',
    borderColor: 'border-purple-500/20',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    textColor: 'text-purple-400',
    bgType: 'gradient'
  },
  {
    id: 'black',
    name: 'Black Edition',
    gradient: 'from-zinc-950 via-zinc-900 to-zinc-950',
    heartColor: 'text-white',
    badge: 'NATIVO',
    description: 'Monocromático ultra-elegante inspirado nas maiores grifes de luxo.',
    borderColor: 'border-zinc-800',
    glowColor: 'rgba(255, 255, 255, 0.1)',
    textColor: 'text-zinc-300',
    bgType: 'dark'
  }
];

// Particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'heart' | 'sparkle' | 'dot';
}

export default function LauncherPage() {
  const navigate = useNavigate();
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('truematch_launcher_theme') || 'normal';
  });
  
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return localStorage.getItem('truematch_reduce_motion') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'themes' | 'adaptive' | 'splash'>('themes');
  const [showSplashPreview, setShowSplashPreview] = useState(false);
  const [splashProgress, setSplashProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  // Adaptive layer toggles
  const [showForeground, setShowForeground] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [showMonochrome, setShowMonochrome] = useState(false);
  const [layerOffset, setLayerOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeTheme = LAUNCHER_THEMES.find(t => t.id === activeThemeId) || LAUNCHER_THEMES[0];
  
  // Custom canvas particle system for high-performance 60 FPS
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Success toast helper
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Sound & Vibrate helper
  const handleThemeSelect = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem('truematch_launcher_theme', themeId);
    
    // Play sound and trigger haptic feedback
    playUiSound('success');
    if ('vibrate' in navigator) {
      navigator.vibrate([15]); // Ultra short haptic click
    }
    triggerToast(`Ícone "${LAUNCHER_THEMES.find(t => t.id === themeId)?.name}" configurado!`);
  };

  // Adaptive icon movement simulator
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || showMonochrome) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // max 10px offset
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setLayerOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setLayerOffset({ x: 0, y: 0 });
  };

  // Launch simulated splash sequence
  const handleTriggerSplash = () => {
    playUiSound('click');
    setShowSplashPreview(true);
    setSplashProgress(0);
  };

  useEffect(() => {
    if (!showSplashPreview) return;

    const interval = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowSplashPreview(false);
            playUiSound('success');
            triggerToast('Splash carregada com sucesso!');
          }, 600);
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [showSplashPreview]);

  // Canvas high-performance animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles array
    particlesRef.current = [];
    let nextId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Randomly spawn particles near center
      if (particlesRef.current.length < (reduceMotion ? 10 : 35) && Math.random() < 0.15) {
        const colors = [
          'rgba(244, 63, 94, 0.8)', // Rose/Pink
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(236, 72, 153, 0.8)', // Fuchsia
          'rgba(255, 255, 255, 0.9)'  // White
        ];
        
        particlesRef.current.push({
          id: nextId++,
          x: width / 2 + (Math.random() - 0.5) * 50,
          y: height / 2 + (Math.random() - 0.5) * 40,
          size: Math.random() * 4 + 2,
          speedY: -(Math.random() * 1.5 + 0.5),
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 80 + 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: Math.random() < 0.3 ? 'heart' : Math.random() < 0.6 ? 'sparkle' : 'dot'
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life++;
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) return false;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.type === 'heart') {
          // Draw a small vector heart
          ctx.beginPath();
          const d = p.size;
          ctx.moveTo(p.x, p.y + d / 4);
          ctx.quadraticCurveTo(p.x, p.y, p.x - d / 2, p.y);
          ctx.quadraticCurveTo(p.x - d, p.y, p.x - d, p.y + d / 2);
          ctx.quadraticCurveTo(p.x - d, p.y + (d * 3) / 4, p.x - d / 2, p.y + d);
          ctx.lineTo(p.x, p.y + d * 1.3);
          ctx.lineTo(p.x + d / 2, p.y + d);
          ctx.quadraticCurveTo(p.x + d, p.y + (d * 3) / 4, p.x + d, p.y + d / 2);
          ctx.quadraticCurveTo(p.x + d, p.y, p.x + d / 2, p.y);
          ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + d / 4);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'sparkle') {
          // Draw 4-point sparkle
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size / 3, p.y - p.size / 3);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x + p.size / 3, p.y + p.size / 3);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size / 3, p.y + p.size / 3);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.lineTo(p.x - p.size / 3, p.y - p.size / 3);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
        } else {
          // Soft circular glow point
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 1.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [reduceMotion]);

  // Download Simulated Launcher Assets
  const triggerDownload = (name: string, format: 'svg' | 'png') => {
    playUiSound('click');
    triggerToast(`Baixando asset "${name}.${format}"...`);
    
    // Create a virtual download link
    const element = document.createElement("a");
    let fileContent = "";
    let mime = "";
    
    if (format === 'svg') {
      mime = "image/svg+xml";
      fileContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <rect width="512" height="512" rx="120" fill="url(#grad)"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M256 397.35l-26.45-24.32C122.4 287.36 64 231.28 64 162.5c0-55.88 44.12-100 100-100 31.74 0 62.21 14.81 82 38.09 19.79-23.28 50.26-38.09 82-38.09 55.88 0 100 44.12 100 100 0 68.78-58.4 124.86-165.55 210.54L256 397.35z" fill="#ffffff"/>
      </svg>`;
    } else {
      mime = "text/plain";
      fileContent = "Simulated binary representation of " + name;
    }
    
    const file = new Blob([fileContent], { type: mime });
    element.href = URL.createObjectURL(file);
    element.download = `${name}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleReduceMotion = () => {
    const newVal = !reduceMotion;
    setReduceMotion(newVal);
    localStorage.setItem('truematch_reduce_motion', String(newVal));
    playUiSound('click');
    triggerToast(newVal ? 'Animações reduzidas.' : 'Animações fluidas ativadas.');
  };

  return (
    <div className="h-full overflow-y-auto bg-black pb-32 hide-scrollbar relative">
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed inset-x-0 bottom-24 z-[300] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="px-5 py-3 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-black uppercase tracking-[0.1em] flex items-center gap-3 backdrop-blur-xl shadow-2xl">
              <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-pink-500" />
              </div>
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-6 px-6 max-w-2xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center mb-8 relative">
          <button 
            onClick={() => {
              playUiSound('click');
              navigate('/profile/settings/general');
            }}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors absolute left-0 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-full text-center">
            <h1 className="text-xl font-black text-white tracking-tight">Launcher & Ícones</h1>
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest">Aparência do Launcher Nativo</p>
          </div>
        </div>

        {/* Dynamic Beating Heart Box */}
        <div className="relative rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-zinc-950 to-zinc-900 p-8 flex flex-col items-center justify-center overflow-hidden mb-8 min-h-[300px]">
          {/* Canvas-based interactive particle overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Core Halo concentric wave expansion animation */}
          {!reduceMotion && (
            <>
              <motion.div 
                animate={{ scale: [0.9, 1.8, 2.8], opacity: [0.4, 0.1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-28 h-28 rounded-full border border-pink-500/25 pointer-events-none z-0"
              />
              <motion.div 
                animate={{ scale: [0.9, 2.2, 3.4], opacity: [0.3, 0.05, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-28 h-28 rounded-full border border-purple-500/20 pointer-events-none z-0"
              />
              <motion.div 
                animate={{ scale: [0.9, 1.5, 2.2], opacity: [0.5, 0.15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
                className="absolute w-28 h-28 rounded-full border border-fuchsia-500/15 pointer-events-none z-0"
              />
            </>
          )}

          {/* Interactive Simulated Smartphone Frame with launcher theme applied */}
          <div className="relative z-20 w-44 h-44 rounded-[2.5rem] p-1 flex items-center justify-center transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className={cn(
              "absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr opacity-90 border transition-all duration-500",
              activeTheme.gradient,
              activeTheme.borderColor
            )} style={{ boxShadow: `0 10px 40px ${activeTheme.glowColor}` }} />
            
            {/* Beating Heart Vector SVG inside Launcher Icon */}
            <motion.div
              animate={reduceMotion ? { scale: 1 } : {
                scale: [1, 1.08, 0.96, 1.10, 1],
                filter: [
                  "drop-shadow(0 4px 10px rgba(0,0,0,0.2))",
                  "drop-shadow(0 8px 20px rgba(236,72,153,0.5))",
                  "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                  "drop-shadow(0 10px 25px rgba(236,72,153,0.6))",
                  "drop-shadow(0 4px 10px rgba(0,0,0,0.2))"
                ]
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <Heart 
                className={cn("w-20 h-20 fill-current drop-shadow-2xl transition-all duration-300", activeTheme.heartColor)} 
                strokeWidth={1.5}
              />
              {/* Little sparkle attachment */}
              <motion.div 
                animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-2 right-1 text-white opacity-80"
              >
                <Sparkle className="w-5 h-5 fill-current text-white" />
              </motion.div>
            </motion.div>

            {/* Premium Theme Banner Label inside Launcher Icon Preview */}
            {activeTheme.badge && (
              <span className="absolute bottom-4 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[8px] font-black tracking-[0.2em] uppercase text-white backdrop-blur-md">
                {activeTheme.badge}
              </span>
            )}
          </div>

          <div className="mt-6 text-center relative z-20">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">{activeTheme.name}</h2>
            <p className="text-[10px] text-zinc-400 mt-1 max-w-xs">{activeTheme.description}</p>
          </div>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex bg-zinc-900/60 border border-white/5 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { playUiSound('click'); setActiveTab('themes'); }}
            className={cn(
              "flex-1 py-3 text-center rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'themes' ? "bg-pink-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            Temas de Ícone
          </button>
          <button 
            onClick={() => { playUiSound('click'); setActiveTab('adaptive'); }}
            className={cn(
              "flex-1 py-3 text-center rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'adaptive' ? "bg-pink-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            Adaptativo Android
          </button>
          <button 
            onClick={() => { playUiSound('click'); setActiveTab('splash'); }}
            className={cn(
              "flex-1 py-3 text-center rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              activeTab === 'splash' ? "bg-pink-500 text-white shadow-lg" : "text-zinc-400 hover:text-white"
            )}
          >
            Splash Launcher
          </button>
        </div>

        {/* Tab Contents: 1. Icon Themes Selection Grid */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {LAUNCHER_THEMES.map(theme => (
                <motion.div
                  key={theme.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={cn(
                    "p-4 rounded-[2rem] border cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[140px]",
                    activeThemeId === theme.id 
                      ? "bg-zinc-900 border-pink-500/40 shadow-[0_10px_25px_rgba(236,72,153,0.1)]" 
                      : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr shadow-lg relative overflow-hidden",
                    theme.gradient
                  )}>
                    <Heart className={cn("w-7 h-7 fill-current", theme.heartColor)} strokeWidth={2} />
                    {theme.badge && (
                      <span className="absolute bottom-1 px-1.5 py-0.5 rounded-full bg-black/50 text-[5px] font-black text-white uppercase tracking-widest">
                        {theme.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-white block">{theme.name}</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1 block">
                      {activeThemeId === theme.id ? "Ativo" : "Selecionar"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Accessibility Settings card */}
            <div className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Reduzir Movimento</h3>
                    <p className="text-[9px] text-zinc-500">Otimiza animações para melhor desempenho ou acessibilidade</p>
                  </div>
                </div>

                <div 
                  onClick={toggleReduceMotion}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-500 cursor-pointer shrink-0",
                    reduceMotion ? "bg-pink-500" : "bg-zinc-800"
                  )}
                >
                  <motion.div 
                    animate={{ x: reduceMotion ? 26 : 4 }}
                    className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents: 2. Adaptive Icons Layer Simulator */}
        {activeTab === 'adaptive' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/40 space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Ícones Adaptativos Android 13+</h3>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    No Android moderno, os ícones de launcher são compostos por camadas separadas (Plano de Fundo e Primeiro Plano) para criar belos efeitos de paralaxe e física 3D na tela inicial, além de suportar temas monocromáticos nativos do sistema.
                  </p>
                </div>
              </div>

              {/* Layer Playground visualizer with mouse-move interactive offset */}
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-64 bg-black border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center cursor-crosshair group shadow-inner"
              >
                {/* Floating Grid Guide */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none" />
                
                {/* 1. Background Layer */}
                {showBackground && (
                  <motion.div 
                    style={{ 
                      x: layerOffset.x * 0.4, 
                      y: layerOffset.y * 0.4,
                    }}
                    className={cn(
                      "absolute w-44 h-44 rounded-[2.5rem] bg-gradient-to-tr transition-shadow duration-300",
                      showMonochrome ? "from-zinc-800 to-zinc-900" : activeTheme.gradient
                    )}
                  />
                )}

                {/* 2. Foreground Heart Layer */}
                {showForeground && (
                  <motion.div 
                    style={{ 
                      x: layerOffset.x * 0.9, 
                      y: layerOffset.y * 0.9,
                    }}
                    className="absolute z-10 flex items-center justify-center"
                  >
                    <Heart 
                      className={cn(
                        "w-20 h-20 fill-current filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]",
                        showMonochrome ? "text-white" : activeTheme.heartColor
                      )} 
                    />
                  </motion.div>
                )}

                {/* Safe zone boundary circle indicator */}
                <div className="absolute w-48 h-48 rounded-full border border-dashed border-pink-500/20 pointer-events-none flex items-center justify-center">
                  <span className="text-[7px] font-bold text-pink-500/40 uppercase tracking-widest absolute -top-5">Área Segura do Ícone</span>
                </div>

                {/* Live tag label */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                  Paralaxe Interativo
                </span>
              </div>

              {/* Layer Configuration Controls */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button 
                  onClick={() => { playUiSound('click'); setShowBackground(!showBackground); }}
                  className={cn(
                    "py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-colors",
                    showBackground ? "bg-zinc-800 border-pink-500/30 text-white" : "bg-zinc-950 border-white/5 text-zinc-500"
                  )}
                >
                  Plano Fundo
                </button>
                <button 
                  onClick={() => { playUiSound('click'); setShowForeground(!showForeground); }}
                  className={cn(
                    "py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-colors",
                    showForeground ? "bg-zinc-800 border-pink-500/30 text-white" : "bg-zinc-950 border-white/5 text-zinc-500"
                  )}
                >
                  Primeiro Plano
                </button>
                <button 
                  onClick={() => { playUiSound('click'); setShowMonochrome(!showMonochrome); }}
                  className={cn(
                    "py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-colors",
                    showMonochrome ? "bg-zinc-800 border-pink-500/30 text-white" : "bg-zinc-950 border-white/5 text-zinc-500"
                  )}
                >
                  Tema Mono
                </button>
              </div>
            </div>

            {/* Asset Export / Generation List */}
            <div className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/20 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Exportação e Geração de Assets</h3>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Gere e exporte todos os tamanhos obrigatórios exigidos pelo Google Play e App Store (PNG / SVG).
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">launcher_foreground.png</span>
                    <span className="text-[8px] text-zinc-500 uppercase">Primeiro plano vetorizado (512x512)</span>
                  </div>
                  <button 
                    onClick={() => triggerDownload('launcher_foreground', 'svg')}
                    className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">launcher_background.png</span>
                    <span className="text-[8px] text-zinc-500 uppercase">Textura e degradê oficial (512x512)</span>
                  </div>
                  <button 
                    onClick={() => triggerDownload('launcher_background', 'svg')}
                    className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">launcher_monochrome.png</span>
                    <span className="text-[8px] text-zinc-500 uppercase">Contorno de alto contraste (512x512)</span>
                  </div>
                  <button 
                    onClick={() => triggerDownload('launcher_monochrome', 'svg')}
                    className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents: 3. Splash Launcher Simulator */}
        {activeTab === 'splash' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/40 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Splash Launcher Simulator</h3>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Veja uma simulação nativa em tela cheia do aplicativo abrindo, renderizando o coração com a física perfeita de batimentos e a barra de progresso adaptativa no tema selecionado.
              </p>

              <button 
                onClick={handleTriggerSplash}
                className="w-full py-4 rounded-2xl bg-pink-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Simular Abertura do App</span>
              </button>
            </div>

            {/* Quick tips */}
            <div className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/20 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Guia Técnico Nativo</span>
              <ul className="text-[9px] text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>No iOS, o launcher é gerenciado via <strong className="text-white">Assets.xcassets</strong> e configurado em runtime no <strong className="text-white">Info.plist</strong> usando alternate icons.</li>
                <li>No Android, é definido em <strong className="text-white">AndroidManifest.xml</strong> através de <strong className="text-white">activity-alias</strong> apontando para múltiplos ícones configurados em xml adaptativos.</li>
                <li>Este applet implementa a persistência dinâmica em localStorage para simular o comportamento de alternância nativa sem delay em produção.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Splash Screen Simulator Overlay */}
      <AnimatePresence>
        {showSplashPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ambient Background glows according to theme */}
            <div className="absolute w-[350px] h-[350px] rounded-full blur-[120px] opacity-35 animate-pulse pointer-events-none" 
              style={{ background: activeTheme.bgType === 'black' ? 'rgba(219,39,119,0.3)' : activeTheme.glowColor }} 
            />
            
            <div className="relative flex flex-col items-center">
              {/* Launcher Card Heart Container */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                {/* Glow outline circle */}
                {!reduceMotion && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className={cn("absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r opacity-65 blur-md", activeTheme.gradient)}
                  />
                )}

                {/* Primary Card */}
                <div className={cn(
                  "relative w-28 h-28 rounded-[2.5rem] flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl",
                  activeTheme.gradient
                )}>
                  {/* Subtle sweep */}
                  {!reduceMotion && (
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  )}

                  {/* Pulsing Beating Heart icon */}
                  <motion.div
                    animate={reduceMotion ? { scale: 1 } : {
                      scale: [1, 1.08, 0.96, 1.10, 1]
                    }}
                    transition={{
                      duration: 0.75,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10"
                  >
                    <Heart className={cn("w-14 h-14 fill-current", activeTheme.heartColor)} strokeWidth={1.5} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Brand label */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <h1 className="text-2xl font-black tracking-[0.2em] uppercase text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Matchdeck
                </h1>
                <p className="text-[10px] text-pink-500 font-bold uppercase tracking-[0.35em] mt-1.5">
                  Conectando pessoas...
                </p>
              </motion.div>

              {/* Custom loader and loading bar */}
              <div className="w-32 h-[3px] bg-white/5 rounded-full mt-12 relative overflow-hidden">
                <motion.div
                  style={{ width: `${splashProgress}%` }}
                  className={cn("absolute left-0 h-full bg-gradient-to-r", activeTheme.gradient)}
                />
              </div>

              {/* Progress percentage label */}
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-3">
                Iniciando {Math.round(splashProgress)}%
              </span>
            </div>

            {/* Cancel Simulator tap zone */}
            <button 
              onClick={() => setShowSplashPreview(false)}
              className="absolute bottom-10 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest border border-white/5"
            >
              Fechar Simulação
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
