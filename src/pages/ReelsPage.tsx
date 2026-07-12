import React, { useState, useMemo } from 'react';
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
  Bell
} from 'lucide-react';
import { mockUsers } from '../data/mock';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';

export default function ReelsPage() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  
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

  // Filtered profiles from the entire platform
  const filteredProfiles = useMemo(() => {
    return mockUsers.filter(user => {
      // Search query filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = user.name.toLowerCase().includes(searchLower) || 
                           user.bio.toLowerCase().includes(searchLower) ||
                           (user.interests && user.interests.some(i => i.toLowerCase().includes(searchLower))) ||
                           (user.city && user.city.toLowerCase().includes(searchLower)) ||
                           (user.jobTitle && user.jobTitle.toLowerCase().includes(searchLower)) ||
                           (user.education && user.education.toLowerCase().includes(searchLower)) ||
                           (user.zodiac && user.zodiac.toLowerCase().includes(searchLower)) ||
                           (user.personality && user.personality.toLowerCase().includes(searchLower)) ||
                           (user.intent && user.intent.toLowerCase().includes(searchLower));
      
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
  }, [searchQuery, genderFilter, ageRange, maxDistance, onlineStatus]);

  return (
    <div className={cn(
      "flex-1 h-full relative flex flex-col transition-colors duration-300",
      "bg-zinc-950"
    )}>
      
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex-none">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
              <MapPin className="w-4 h-4 text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Descobrir</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border bg-zinc-900 border-white/5 text-zinc-400 hover:text-white relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
              )}
            </button>
            <button 
              onClick={() => {
              setDraftGender(genderFilter);
              setDraftAge(ageRange);
              setDraftDistance(maxDistance);
              setDraftOnlineStatus(onlineStatus);
              setShowFilters(true);
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border",
              (genderFilter !== "Todos" || ageRange[0] !== 18 || ageRange[1] !== 60 || onlineStatus !== "Todos" || maxDistance !== 50)
                ? "bg-pink-500/10 border-pink-500/50 text-pink-500"
                : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou interesse..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-500 outline-none focus:border-pink-500/30 transition-all"
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
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        
        {/* All Profiles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              {filteredProfiles.length} Perfis Encontrados
            </h2>
            {onlineStatus !== "Todos" && (
              <div className="flex items-center space-x-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", onlineStatus === "Online" ? "bg-green-500 animate-pulse" : "bg-zinc-700")}></span>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", onlineStatus === "Online" ? "text-green-500" : "text-zinc-500")}>
                  {onlineStatus}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(idx, 12) * 0.03 }}
                  className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer shadow-lg hover:shadow-pink-500/5"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowProfile(true);
                  }}
                >
                  <img 
                    src={user.images[0]} 
                    alt={user.name} 
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-90" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-1.5">
                    {user.isGold && (
                      <div className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg backdrop-blur-md">
                        <Zap className="w-2.5 h-2.5 fill-current" /> Gold
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <h3 className="text-sm font-bold text-white truncate">{user.name}, {user.age}</h3>
                      {user.isOnline && (
                        <div className="w-2 h-2 rounded-full bg-green-500 border border-black shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      )}
                    </div>
                    <div className="flex items-center text-white/50 text-[10px] font-semibold">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{user.distance} km de distância</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 text-center">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Search className="w-8 h-8 text-zinc-800" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">Nada por aqui</h3>
                <p className="text-zinc-500 text-sm px-12 leading-relaxed">Não encontramos perfis com esses critérios. Tente ajustar os filtros para ver mais pessoas.</p>
                <button 
                  onClick={() => {
                    setGenderFilter("Todos");
                    setAgeRange([18, 60]);
                    setMaxDistance(50);
                    setOnlineStatus("Todos");
                    setSearchQuery("");
                  }}
                  className="mt-8 text-pink-500 font-bold text-sm uppercase tracking-widest hover:text-pink-400 transition-colors"
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
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">Filtros</h3>
              <button 
                onClick={resetFilters}
                className="text-xs font-black text-pink-500 uppercase tracking-widest px-2"
              >
                Limpar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
              {/* Gender Selection */}
              <div className="mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-5">Interesse em:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {["Todos", "Mulheres", "Homens"].map(label => (
                    <button
                      key={label}
                      onClick={() => setDraftGender(label)}
                      className={cn(
                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        draftGender === label
                          ? "bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/25"
                          : "bg-zinc-900 border-white/5 text-zinc-500 hover:bg-zinc-900/80 hover:border-white/10"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Slider */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Faixa Etária:</h4>
                  <span className="text-xs font-mono font-bold text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/10">
                    {draftAge[0]} — {draftAge[1]} anos
                  </span>
                </div>
                
                <div className="px-2">
                  <div className="relative h-12 flex items-center">
                    <div className="absolute w-full h-1.5 bg-zinc-900 rounded-full" />
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={draftAge[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDraftAge([Math.min(val, draftAge[1] - 1), draftAge[1]]);
                      }}
                      className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
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
                      className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
                      style={{ zIndex: draftAge[1] < 30 ? 11 : 10 }}
                    />
                    <div 
                      className="absolute h-1.5 bg-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                      style={{ 
                        left: `${((draftAge[0] - 18) / 42) * 100}%`, 
                        width: `${((draftAge[1] - draftAge[0]) / 42) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>18</span>
                    <span>60</span>
                  </div>
                </div>
              </div>

              {/* Distance Slider */}
              <div className="mb-12">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Distância Máxima:</h4>
                  <span className="text-xs font-mono font-bold text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/10">
                    Até {draftDistance} km
                  </span>
                </div>
                
                <div className="px-2">
                  <div className="relative h-12 flex items-center">
                    <div className="absolute w-full h-1.5 bg-zinc-900 rounded-full" />
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={draftDistance}
                      onChange={(e) => setDraftDistance(parseInt(e.target.value))}
                      className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <div 
                      className="absolute h-1.5 bg-pink-500 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                      style={{ 
                        left: '0%', 
                        width: `${(draftDistance / 100) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>

              {/* Online/Offline Selection */}
              <div className="mb-12">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-5">Status de Atividade:</h4>
                <div className="grid grid-cols-3 gap-3">
                  {["Todos", "Online", "Offline"].map(status => (
                    <button
                      key={status}
                      onClick={() => setDraftOnlineStatus(status)}
                      className={cn(
                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        draftOnlineStatus === status
                          ? (status === 'Online' ? "bg-green-500 border-green-400 text-white" : status === 'Offline' ? "bg-zinc-800 border-zinc-700 text-white" : "bg-pink-500 border-pink-400 text-white")
                          : "bg-zinc-900 border-white/5 text-zinc-500 hover:bg-zinc-900/80 hover:border-white/10"
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
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 py-5 rounded-2xl text-xs font-black text-white shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-transform flex items-center justify-center space-x-3 uppercase tracking-[0.2em]"
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
                className="absolute top-12 right-6 z-20 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg"
              >
                <ChevronDown className="w-8 h-8" />
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
