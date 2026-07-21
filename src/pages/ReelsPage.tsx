import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  Heart, 
  ChevronRight,
  ChevronDown,
  Flame,
  Star,
  Zap,
  Info,
  BadgeCheck,
  Moon,
  Briefcase,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  User,
  Coffee,
  Wine,
  Dumbbell,
  Cigarette,
  PawPrint,
  Compass,
  Baby,
  Users,
  Bell,
  MessageCircle
} from 'lucide-react';
import { mockUsers } from '../data/mock';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';

const SIMULATED_NEW_USERS = [
  {
    id: "sim_1",
    name: "Gabriela",
    age: 22,
    gender: "feminino",
    bio: "Amante da natureza, trilhas de fim de semana e cafés literários. Vamos trocar uma ideia sobre música e livros!",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 3,
    verified: true,
    interests: ["Livros", "Trilhas", "Música Indie", "Café"],
    compatibility: 96,
    isOnline: true,
    jobTitle: "Designer Gráfica",
    city: "Belo Horizonte",
    isGold: false,
    isNew: true
  },
  {
    id: "sim_2",
    name: "Rodrigo",
    age: 26,
    gender: "masculino",
    bio: "Sempre pronto para uma nova aventura gastronômica ou um pedal pela cidade. Apaixonado por vinhos e jazz.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 5,
    verified: true,
    interests: ["Vinho", "Jazz", "Ciclismo", "Gastronomia"],
    compatibility: 89,
    isOnline: true,
    jobTitle: "Arquiteto",
    city: "Belo Horizonte",
    isGold: true,
    isNew: true
  },
  {
    id: "sim_3",
    name: "Beatriz",
    age: 24,
    gender: "feminino",
    bio: "Formada em Letras, adoro cinema clássico, escrever e adotar pets. Vamos bater um papo divertido?",
    images: [
      "https://images.unsplash.com/photo-1524504280099-c1224cd822f4?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 1,
    verified: true,
    interests: ["Cinema", "Escrita", "Pets", "Teatro"],
    compatibility: 92,
    isOnline: true,
    jobTitle: "Redatora",
    city: "Belo Horizonte",
    isGold: false,
    isNew: true
  }
];

export default function ReelsPage() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  
  // Real-time active users list state
  const [usersList, setUsersList] = useState<any[]>(mockUsers);
  const [toastNotification, setToastNotification] = useState<{ name: string; image: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [genderFilter, setGenderFilter] = useState<string>("Todos");
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [maxDistance, setMaxDistance] = useState(50);
  const [onlineStatus, setOnlineStatus] = useState<string>("Todos");

  // Draft filters for the modal
  const [draftGender, setDraftGender] = useState(genderFilter);
  const [draftAge, setDraftAge] = useState(ageRange);
  const [draftDistance, setDraftDistance] = useState(maxDistance);
  const [draftOnlineStatus, setDraftOnlineStatus] = useState(onlineStatus);

  const simulatedAddedRef = useRef(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Add Gabriela after 7 seconds
    if (simulatedAddedRef.current < 1) {
      const t1 = setTimeout(() => {
        setUsersList(prev => {
          if (prev.some(u => u.id === "sim_1")) return prev;
          setToastNotification({ name: "Gabriela", image: SIMULATED_NEW_USERS[0].images[0] });
          return [SIMULATED_NEW_USERS[0], ...prev];
        });
        simulatedAddedRef.current = 1;
      }, 7000);
      timeouts.push(t1);
    }

    // Add Rodrigo after 17 seconds
    if (simulatedAddedRef.current < 2) {
      const t2 = setTimeout(() => {
        setUsersList(prev => {
          if (prev.some(u => u.id === "sim_2")) return prev;
          setToastNotification({ name: "Rodrigo", image: SIMULATED_NEW_USERS[1].images[0] });
          return [SIMULATED_NEW_USERS[1], ...prev];
        });
        simulatedAddedRef.current = 2;
      }, 17000);
      timeouts.push(t2);
    }

    // Add Beatriz after 27 seconds
    if (simulatedAddedRef.current < 3) {
      const t3 = setTimeout(() => {
        setUsersList(prev => {
          if (prev.some(u => u.id === "sim_3")) return prev;
          setToastNotification({ name: "Beatriz", image: SIMULATED_NEW_USERS[2].images[0] });
          return [SIMULATED_NEW_USERS[2], ...prev];
        });
        simulatedAddedRef.current = 3;
      }, 27000);
      timeouts.push(t3);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    // Simulate finding new profiles / shuffling
    setTimeout(() => {
      setUsersList(prev => {
        // Randomly adjust compatibilities to reshuffle the list
        return prev.map(u => ({
          ...u,
          compatibility: Math.floor(Math.random() * (99 - 70 + 1)) + 70
        }));
      });
      setIsRefreshing(false);
    }, 1200);
  };

  const applyDraftFilters = () => {
    setGenderFilter(draftGender);
    setAgeRange(draftAge);
    setMaxDistance(draftDistance);
    setOnlineStatus(draftOnlineStatus);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftGender("Todos");
    setDraftAge([18, 60]);
    setDraftDistance(50);
    setDraftOnlineStatus("Todos");
  };

  const toggleLike = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedUsers.includes(userId)) {
      setLikedUsers(likedUsers.filter(id => id !== userId));
    } else {
      setLikedUsers([...likedUsers, userId]);
    }
  };

  // Filtered profiles from the active users list
  const filteredProfiles = useMemo(() => {
    return usersList.filter(user => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase().trim();
      
      const matchesSearch = searchLower === '' || 
                           user.name.toLowerCase().includes(searchLower) ||
                           (user.city && user.city.toLowerCase().includes(searchLower)) ||
                           (user.jobTitle && user.jobTitle.toLowerCase().includes(searchLower));
      
      // Gender filter
      const matchesGender = genderFilter === "Todos" || user.gender === (genderFilter === "Mulheres" ? "feminino" : "masculino");
      
      // Age filter
      const matchesAge = user.age >= ageRange[0] && user.age <= ageRange[1];
      
      // Distance filter
      const matchesDistance = user.distance <= maxDistance;
      
      // Online status filter
      const matchesOnline = onlineStatus === "Todos" || (onlineStatus === "Online" ? user.isOnline : !user.isOnline);
      
      return matchesSearch && matchesGender && matchesAge && matchesDistance && matchesOnline;
    });
  }, [usersList, searchQuery, genderFilter, ageRange, maxDistance, onlineStatus]);

  // Sort: prioritize isNew and isOnline users
  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return (b.compatibility || 0) - (a.compatibility || 0);
    });
  }, [filteredProfiles]);

  const hasActiveFilters = genderFilter !== "Todos" || ageRange[0] !== 18 || ageRange[1] !== 60 || onlineStatus !== "Todos" || maxDistance !== 50;

  return (
    <div className={cn(
      "flex-1 h-full relative flex flex-col transition-colors duration-300",
      "bg-zinc-950"
    )}>
      
      {/* Toast Notification for newly joined users */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm bg-zinc-950/90 backdrop-blur-xl border border-green-500/30 shadow-[0_8px_32px_rgba(16,185,129,0.15)] rounded-2xl p-3 flex items-center space-x-3"
          >
            <div className="relative shrink-0">
              <img 
                src={toastNotification.image} 
                alt={toastNotification.name} 
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse text-green-400" /> ACABOU DE ENTRAR
                </span>
              </div>
              <p className="text-white text-xs font-bold truncate">
                {toastNotification.name} acabou de se conectar!
              </p>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-8 pb-3 px-5 flex-none">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">Descoberta IA</h1>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Conexões inteligentes sugeridas pelo algoritmo</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 border bg-zinc-900/80 border-white/5 text-zinc-400 hover:text-white relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-950" />
              )}
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "w-9 h-9 rounded-full bg-purple-950/20 border border-purple-500/25 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all active:scale-95",
                isRefreshing && "opacity-50 cursor-not-allowed bg-purple-900/40"
              )}
            >
              <Compass className={cn("w-4 h-4", isRefreshing ? "animate-spin text-purple-300" : "animate-spin-slow")} />
            </button>
          </div>
        </div>

        {/* Search Bar & Advanced Filter Button */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
            <input 
              type="text" 
              placeholder="Nome, cidade, profissão..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-white placeholder-zinc-600 outline-none focus:border-pink-500/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => {
              setDraftGender(genderFilter);
              setDraftAge(ageRange);
              setDraftDistance(maxDistance);
              setDraftOnlineStatus(onlineStatus);
              setShowFilters(true);
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md active:scale-95 transition-all shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
        
        {/* All Profiles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4 mt-1 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">
              {sortedProfiles.length} {sortedProfiles.length === 1 ? 'Perfil encontrado' : 'Perfis encontrados'}
            </h2>
          </div>

          {/* Grid de Perfis Ajustável e Adaptável */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedProfiles.length > 0 ? (
              sortedProfiles.map((user, idx) => {
                const isLiked = likedUsers.includes(user.id);
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx, 12) * 0.05 }}
                    className={cn(
                      "group relative flex flex-col bg-zinc-950 border-[1px] cursor-pointer transition-all duration-300 rounded-none overflow-hidden",
                      user.isGold 
                        ? "border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                        : "border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    )}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowProfile(true);
                    }}
                  >
                    {/* Imagem no topo */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden shrink-0 bg-zinc-900">
                      <img 
                        src={user.images[0]} 
                        alt={user.name} 
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>

                    {/* Bloco de Informações - Abaixo da imagem, sem sobreposição */}
                    <div className="p-3 flex flex-col flex-1 bg-zinc-950">
                      {/* Distintivos (Online, Gold, Novo, Compatibilidade) */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {user.isOnline && (
                            <div className="flex items-center space-x-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                               <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Online</span>
                            </div>
                          )}
                          {user.isGold && (
                            <div className="px-1 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-amber-500/20">
                              <Star className="w-2 h-2 fill-current" /> GOLD
                            </div>
                          )}
                          {user.isNew && (
                            <div className="px-1 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-emerald-500/20">
                              <Sparkles className="w-2 h-2 fill-current" /> NOVO
                            </div>
                          )}
                        </div>
                        <div className="px-1 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-purple-500/20">
                          <Zap className="w-2 h-2 fill-current text-purple-400" /> {user.compatibility}%
                        </div>
                      </div>

                      {/* Nome e Selo de Verificação */}
                      <div className="flex items-center space-x-1 mb-2 max-w-full">
                        <h3 className="text-sm font-bold text-white truncate">
                          {user.name}, {user.age}
                        </h3>
                        {user.verified && (
                          <BadgeCheck className="w-4 h-4 text-cyan-400 fill-cyan-400/10 shrink-0" />
                        )}
                      </div>

                      {/* Profissão e Localização compactas */}
                      <div className="flex flex-col space-y-1.5 mb-3 w-full text-zinc-400">
                        {user.jobTitle && (
                          <div className="flex items-center text-[10px] font-medium truncate">
                            <Briefcase className="w-3 h-3 mr-1.5 shrink-0" />
                            <span className="truncate">{user.jobTitle}</span>
                          </div>
                        )}
                        <div className="flex items-center text-[10px] font-medium truncate">
                          <MapPin className="w-3 h-3 mr-1.5 shrink-0 text-pink-500" />
                          <span className="truncate">{user.city || 'São Paulo'}</span>
                        </div>
                      </div>

                      {/* Tags de Interesses */}
                      {user.interests && user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 w-full mt-auto">
                          {user.interests.slice(0, 2).map((interest, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 bg-zinc-900 border border-white/5 text-[9px] text-zinc-300 font-semibold whitespace-nowrap"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Search className="w-6 h-6 text-zinc-700" />
                </div>
                <h3 className="text-white text-md font-bold mb-1">Sem resultados</h3>
                <p className="text-zinc-500 text-xs px-12 leading-relaxed">Não encontramos perfis com estes filtros.</p>
                <button 
                  onClick={() => {
                    setGenderFilter("Todos");
                    setAgeRange([18, 60]);
                    setMaxDistance(50);
                    setOnlineStatus("Todos");
                    setSearchQuery("");
                  }}
                  className="mt-6 text-pink-500 font-bold text-xs uppercase tracking-wider hover:text-pink-400 transition-colors bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Filters Full Screen Page */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col"
          >
            {/* Header */}
            <div className="pt-12 pb-4 px-6 flex items-center justify-between border-b border-white/5">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 active:scale-90 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Filtros Avançados</h3>
              <button 
                onClick={resetFilters}
                className="text-xs font-bold text-pink-500 uppercase tracking-wider px-2"
              >
                Limpar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide space-y-8">
              {/* Gender Selection */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Interesse em:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {["Todos", "Mulheres", "Homens"].map(label => (
                    <button
                      key={label}
                      onClick={() => setDraftGender(label)}
                      className={cn(
                        "py-3 rounded-2xl text-xs font-bold transition-all border",
                        draftGender === label
                          ? "bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/20"
                          : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-900/80 hover:border-white/10"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Faixa Etária:</h4>
                  <span className="text-xs font-bold text-pink-500 bg-pink-500/10 px-3 py-1 rounded-xl border border-pink-500/10">
                    {draftAge[0]} — {draftAge[1]} anos
                  </span>
                </div>
                
                <div className="px-2">
                  <div className="relative h-12 flex items-center">
                    <div className="absolute w-full h-1 bg-zinc-900 rounded-full" />
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={draftAge[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDraftAge([Math.min(val, draftAge[1] - 1), draftAge[1]]);
                      }}
                      className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
                      style={{ zIndex: draftAge[0] > 30 ? 11 : 10 }}
                    />
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={draftAge[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDraftAge([draftAge[0], Math.max(val, draftAge[0] + 1)]);
                      }}
                      className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
                      style={{ zIndex: draftAge[1] < 30 ? 11 : 10 }}
                    />
                    <div 
                      className="absolute h-1 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                      style={{ 
                        left: `${((draftAge[0] - 18) / 42) * 100}%`, 
                        width: `${((draftAge[1] - draftAge[0]) / 42) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                    <span>18</span>
                    <span>60</span>
                  </div>
                </div>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Distância Máxima:</h4>
                  <span className="text-xs font-bold text-pink-500 bg-pink-500/10 px-3 py-1 rounded-xl border border-pink-500/10">
                    Até {draftDistance} km
                  </span>
                </div>
                
                <div className="px-2">
                  <div className="relative h-12 flex items-center">
                    <div className="absolute w-full h-1 bg-zinc-900 rounded-full" />
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={draftDistance}
                      onChange={(e) => setDraftDistance(parseInt(e.target.value))}
                      className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <div 
                      className="absolute h-1 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.3)]"
                      style={{ 
                        left: '0%', 
                        width: `${(draftDistance / 100) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>

              {/* Online/Offline Selection */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Status de Atividade:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {["Todos", "Online", "Offline"].map(status => (
                    <button
                      key={status}
                      onClick={() => setDraftOnlineStatus(status)}
                      className={cn(
                        "py-3 rounded-2xl text-xs font-bold transition-all border",
                        draftOnlineStatus === status
                          ? (status === 'Online' ? "bg-green-500 border-green-400 text-white" : status === 'Offline' ? "bg-zinc-800 border-zinc-700 text-white" : "bg-pink-500 border-pink-400 text-white")
                          : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-900/80 hover:border-white/10"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-8 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md">
              <button 
                onClick={applyDraftFilters}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 py-4.5 rounded-2xl text-xs font-bold text-white shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar Preferências</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail Overlay */}
      <AnimatePresence>
        {showProfile && selectedUser && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="fixed inset-0 z-[110] overflow-hidden bg-zinc-950"
          >
            <div className="absolute inset-0 overflow-y-auto hide-scrollbar pb-20">
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-12 right-6 z-20 w-11 h-11 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg border border-white/10"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="relative h-[65vh] w-full">
                <img 
                  src={selectedUser.images[0]} 
                  alt={selectedUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                
                <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col justify-end">
                  <div className="mb-4 inline-flex bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full items-center max-w-fit shadow-lg border border-white/20">
                    <Zap className="w-4 h-4 text-white mr-2 fill-current" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Match IA: {selectedUser.compatibility}%</span>
                  </div>
                  <div className="flex items-center space-x-3 flex-wrap">
                    <h2 className="text-5xl font-black tracking-tight text-white">{selectedUser.name}</h2>
                    <span className="text-4xl font-light text-white/70">{selectedUser.age}</span>
                    <div className="flex items-center space-x-2 mt-2">
                      {selectedUser.verified && <BadgeCheck className="w-8 h-8 text-blue-400 fill-blue-400/20" />}
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        selectedUser.isOnline 
                          ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                          : 'bg-zinc-800/50 text-zinc-500 border-white/5'
                      }`}>
                        <div className={cn("w-2 h-2 rounded-full", selectedUser.isOnline ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                        {selectedUser.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.zodiac && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Moon className="w-6 h-6 text-purple-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.zodiac}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Signo</span>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <MapPin className="w-6 h-6 text-pink-500 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.city}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">{selectedUser.distance} km</span>
                    </div>
                  )}
                  {selectedUser.jobTitle && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Briefcase className="w-6 h-6 text-blue-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.jobTitle}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Profissão</span>
                    </div>
                  )}
                  {selectedUser.education && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <GraduationCap className="w-6 h-6 text-green-400 mb-3" />
                      <span className="text-white font-bold text-[15px] truncate">{selectedUser.education}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Educação</span>
                    </div>
                  )}
                  {selectedUser.relationshipStatus && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <HeartHandshake className="w-6 h-6 text-pink-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.relationshipStatus}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Status</span>
                    </div>
                  )}
                  {selectedUser.intent && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Sparkles className="w-6 h-6 text-amber-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.intent}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Busca</span>
                    </div>
                  )}
                  {selectedUser.pets && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <PawPrint className="w-6 h-6 text-orange-300 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.pets}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Pets</span>
                    </div>
                  )}
                  {selectedUser.religion && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Compass className="w-6 h-6 text-emerald-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.religion}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Religião</span>
                    </div>
                  )}
                  {selectedUser.children && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Baby className="w-6 h-6 text-blue-300 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.children}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Filhos</span>
                    </div>
                  )}
                  {selectedUser.sexuality && (
                    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex flex-col">
                      <Users className="w-6 h-6 text-pink-400 mb-3" />
                      <span className="text-white font-bold text-[15px]">{selectedUser.sexuality}</span>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Orientação</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Lifestyle</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedUser.exercise && (
                      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                        <Dumbbell className="w-4 h-4 text-blue-400" />
                        <span className="text-zinc-300 text-sm font-medium">{selectedUser.exercise}</span>
                      </div>
                    )}
                    {selectedUser.smoking && (
                      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                        <Cigarette className="w-4 h-4 text-orange-400" />
                        <span className="text-zinc-300 text-sm font-medium">{selectedUser.smoking}</span>
                      </div>
                    )}
                    {selectedUser.drinking && (
                      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                        <Wine className="w-4 h-4 text-purple-400" />
                        <span className="text-zinc-300 text-sm font-medium">{selectedUser.drinking}</span>
                      </div>
                    )}
                    {selectedUser.personality && (
                      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900/30 border border-white/5">
                        <User className="w-4 h-4 text-teal-400" />
                        <span className="text-zinc-300 text-sm font-medium">{selectedUser.personality}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Sobre mim</h3>
                  <p className="text-zinc-300 text-lg leading-relaxed">{selectedUser.bio}</p>
                </div>

                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest: string, i: number) => (
                        <span key={i} className="px-5 py-2.5 rounded-full bg-zinc-900 border border-white/5 text-pink-400 text-sm font-bold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* More Photos */}
                {selectedUser.images.length > 1 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Galeria</h3>
                    <div className="space-y-4">
                      {selectedUser.images.slice(1).map((img: string, i: number) => (
                        <img key={i} src={img} referrerPolicy="no-referrer" className="w-full aspect-[4/5] object-cover rounded-[2.5rem] shadow-2xl" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
