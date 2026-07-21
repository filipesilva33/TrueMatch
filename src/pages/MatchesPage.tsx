import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, Crown, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { mockUsers } from '../data/mock';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { calculateCompatibility } from '../utils/compatibility';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { unreadCount } = useNotifications();

  const [me, setMe] = useState(() => {
    const stored = localStorage.getItem('truematch_profile_me');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const isGold = me?.isGold || false;
  const [showGoldSubscriptionModal, setShowGoldSubscriptionModal] = useState(false);

  useEffect(() => {
    if (showGoldSubscriptionModal) {
      setShowGoldSubscriptionModal(false);
      navigate('/checkout', { state: { from: '/matches' } });
    }
  }, [showGoldSubscriptionModal, navigate]);

  useEffect(() => {
    const checkGold = () => {
      if (document.hidden) return;
      const stored = localStorage.getItem('truematch_profile_me');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isGold !== me?.isGold) {
            setMe(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    const interval = setInterval(checkGold, 1500); // Relax interval slightly for better performance
    return () => clearInterval(interval);
  }, [me]);

  const meData = me || mockUsers[0];

  const blockedUserIds = React.useMemo<string[]>(() => {
    const stored = localStorage.getItem('truematch_blocked_users');
    return stored ? JSON.parse(stored) : [];
  }, []);

  const filteredMatches = mockUsers
    .filter(u => u.id !== meData.id && !blockedUserIds.includes(u.id))
    .map(u => ({
      ...u,
      compatibility: calculateCompatibility(meData, u)
    }));

  const likedYouUsers = mockUsers
    .filter(u => u.id !== meData.id && !blockedUserIds.includes(u.id))
    .slice(0, 6) // Simulating a list of people who liked you
    .map(u => ({
      ...u,
      compatibility: calculateCompatibility(meData, u)
    }));

  const favoriteUsers = mockUsers
    .filter(u => favorites.includes(u.id) && u.id !== meData.id && !blockedUserIds.includes(u.id))
    .map(u => ({
      ...u,
      compatibility: calculateCompatibility(meData, u)
    }));

  return (
    <div className={cn(
      "flex flex-col h-full p-5 pt-8 overflow-y-auto pb-32 hide-scrollbar transition-colors duration-300",
      "bg-zinc-950 text-white"
    )}>
      
      {/* Header */}
      <div className="relative flex items-center justify-center mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
          Curtidas
        </h1>
        <button 
          onClick={() => navigate('/notifications')}
          className="absolute right-0 w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center transition-all hover:bg-zinc-800 active:scale-95 shadow-lg"
        >
           <Bell className="w-5 h-5 text-zinc-400" />
           {unreadCount > 0 && (
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
           )}
        </button>
      </div>

      {/* Curtiram Você Section */}
      <div className="mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1.5 opacity-80">
              Curtiram Você
            </h2>
            <div className="px-3 py-1 rounded-full bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
              <p className="text-xs text-zinc-500 font-bold tracking-tight">
                <span className="text-pink-500">{likedYouUsers.length}</span> pessoas com interesse
              </p>
            </div>
          </div>
        </div>
        
        {isGold ? (
          <div className="grid grid-cols-3 gap-1.5">
            {likedYouUsers.map((user, idx) => (
              <motion.div 
                key={`liked-${user.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/chat', { state: { userId: user.id } })}
                className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer bg-zinc-900 border border-amber-500/20 hover:border-amber-500/40 shadow-lg transition-all"
              >
                <img decoding="async" loading="lazy" src={user.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2">
                  <div className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[8px] font-black uppercase tracking-widest flex items-center shadow-md">
                     <Crown className="w-2.5 h-2.5 fill-current mr-0.5" /> Ouro
                  </div>
                </div>

                {/* Info Block */}
                <div className="absolute bottom-0 inset-x-0 p-2 flex flex-col justify-end">
                   <h3 className="font-bold text-xs text-white truncate drop-shadow-sm">{user.name.split(' ')[0]}</h3>
                   <div className="flex items-center space-x-1 mt-0.5 mb-1.5">
                     <Heart className="w-2.5 h-2.5 text-amber-400 fill-amber-400/20" />
                     <span className="text-[9px] font-bold text-amber-400">{user.compatibility}%</span>
                   </div>
                   <div className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-[9px] font-bold rounded-lg transition-colors flex items-center justify-center">
                     Match
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">


             {/* Blurred Cards */}
             {likedYouUsers.map((user, idx) => (
                <div 
                  key={`blurred-${user.id}`} 
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5 cursor-pointer bg-zinc-900 group" 
                  onClick={() => setShowGoldSubscriptionModal(true)}
                >
                   <img decoding="async" loading="lazy" src={user.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover blur-xl opacity-40 scale-110 transition-transform duration-700 group-hover:scale-125" />
                   
                   <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10">
                         <Heart className="w-3.5 h-3.5 text-white/50" />
                      </div>
                   </div>

                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-2 bg-zinc-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-zinc-950 mb-1 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                         <Crown className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight text-center leading-none">
                        Obter Gold
                      </span>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Favoritos Salvos Section */}
      {favoriteUsers.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 opacity-80">Favoritos</h2>
            <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5">
            {favoriteUsers.map(u => (
              <motion.div 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/chat', { state: { userId: u.id } })}
                key={`fav-${u.id}`} 
                className="flex-shrink-0 flex flex-col w-[72px] cursor-pointer group items-center"
              >
                 <div className="w-[72px] h-[72px] rounded-2xl p-0.5 bg-gradient-to-br from-amber-500/40 to-orange-500/40 group-hover:from-amber-500 group-hover:to-orange-500 shadow-lg relative mb-2 transition-all duration-300">
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900">
                       <img decoding="async" loading="lazy" src={u.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
                 <span className="text-[11px] font-bold text-center truncate w-full text-zinc-300 mb-0.5">{u.name.split(' ')[0]}</span>
                 <div className="flex items-center justify-center">
                   <span className="text-[9px] font-black text-amber-500 tracking-tighter">{u.compatibility}%</span>
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mais Curtidas Section */}
      <div className="flex-1">
        <div className="flex items-center justify-center mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 opacity-80">Recentes</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredMatches.map(u => (
            <motion.div 
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat', { state: { userId: u.id } })}
              key={u.id} 
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-white/5 bg-zinc-900"
            >
               <img decoding="async" loading="lazy" src={u.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
               
               {u.isOnline && (
                 <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 px-2 py-1 rounded-md bg-zinc-950/60 backdrop-blur-md border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Online</span>
                 </div>
               )}

               <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col">
                  <h3 className="font-bold text-sm text-white truncate drop-shadow-sm">{u.name.split(' ')[0]}, {u.age}</h3>
                  <div className="flex items-center mt-1 text-zinc-400">
                    <Heart className="w-3 h-3 text-pink-500 fill-pink-500/20 mr-1.5" />
                    <span className="text-[10px] font-medium">
                      {u.compatibility}% Compatível
                    </span>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

