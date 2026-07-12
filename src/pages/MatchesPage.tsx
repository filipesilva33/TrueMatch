import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, Crown, Sparkles, Bell } from 'lucide-react';
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
    const interval = setInterval(checkGold, 1000);
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
      "flex flex-col h-full p-4 pt-6 overflow-y-auto pb-32 hide-scrollbar transition-colors duration-300",
      "bg-zinc-950 text-white"
    )}>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className={cn("text-3xl font-bold transition-colors duration-300", "text-white")}>Curtidas</h1>
        <button 
          onClick={() => navigate('/notifications')}
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90 relative",
            "border-white/10 text-zinc-400"
          )}
        >
           <Bell className="w-5 h-5" />
           {unreadCount > 0 && (
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
           )}
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn("text-xs font-bold uppercase tracking-wider transition-colors duration-300", "text-white/50")}>Curtiram Você</h2>
          <span className="text-xs font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">{likedYouUsers.length} Novos</span>
        </div>
        
        {isGold ? (
          <div className="grid grid-cols-2 gap-3">
            {likedYouUsers.map((user) => (
              <motion.div 
                key={`liked-${user.id}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat', { state: { userId: user.id } })}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-amber-500/30 cursor-pointer shadow-lg shadow-amber-500/5"
              >
                <img decoding="async" loading="lazy" src={user.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 text-black uppercase tracking-wider shadow-md">
                   <Crown className="w-2.5 h-2.5 fill-current animate-pulse" />
                   <span>REVELADO</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left">
                   <p className="font-bold text-sm text-white">{user.name}, {user.age}</p>
                   <div className="flex items-center justify-between gap-1 mb-2">
                     <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                       <Heart className="w-3 h-3 fill-current" /> Curtiu você
                     </p>
                     <span className="text-[9px] font-extrabold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full">
                       {user.compatibility}% Match
                     </span>
                   </div>
                   <div className="w-full py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-[10px] font-black rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-md">
                     <span>Combinar e Conversar</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
             <div 
               onClick={() => setShowGoldSubscriptionModal(true)}
               className={cn(
                 "relative aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer border border-white/5",
                 "bg-zinc-900 hover:border-amber-500/20"
               )}
             >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 mb-2 flex items-center justify-center shadow-[0_0_15px_1px_rgba(245,158,11,0.15)]">
                   <Crown className="w-5 h-5 fill-current" />
                </div>
                <h3 className={cn("font-bold text-center text-xs transition-colors duration-300 mb-2.5", "text-white")}>Ver Quem<br/>Te Curtiu</h3>
                <button className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95">
                  Ativar Gold
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
             </div>

             <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer" onClick={() => setShowGoldSubscriptionModal(true)}>
                <img decoding="async" loading="lazy" src={mockUsers[2].images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover blur-xl opacity-40" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                      <Heart className="w-4 h-4 text-white" />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        {favoriteUsers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className={cn("text-xs font-bold uppercase tracking-wider transition-colors duration-300", "text-white/50")}>Favoritos Salvos</h2>
              <Star className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2">
              {favoriteUsers.map(u => (
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/chat', { state: { userId: u.id } })}
                  key={`fav-${u.id}`} 
                  className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer group"
                >
                   <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-orange-500 group-active:scale-95 transition-transform shadow-lg relative">
                      <div className={cn("w-full h-full rounded-full p-0.5 transition-colors duration-300", "bg-zinc-950")}>
                         <img decoding="async" loading="lazy" src={u.images[0]} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                      </div>
                   </div>
                   <span className={cn("text-xs font-medium text-center line-clamp-1 transition-colors duration-300", "text-zinc-300")}>{u.name.split(' ')[0]}</span>
                   <span className="text-[10px] font-extrabold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full">{u.compatibility}% Match</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <h2 className={cn("text-xs font-bold uppercase tracking-wider mb-4 transition-colors duration-300", "text-white/50")}>Suas Curtidas</h2>
        <div className="grid grid-cols-3 gap-3">
          {filteredMatches.map(u => (
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat', { state: { userId: u.id } })}
              key={u.id} 
              className="flex flex-col items-center space-y-2 cursor-pointer group"
            >
               <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-purple-500 group-active:scale-95 transition-transform shadow-lg relative">
                  <div className={cn("w-full h-full rounded-full p-0.5 transition-colors duration-300", "bg-zinc-950")}>
                     <img decoding="async" loading="lazy" src={u.images[0]} referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                  </div>
                  {u.isOnline && <div className={cn("absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] transition-colors duration-300", "border-zinc-950")} />}
               </div>
               <span className={cn("text-xs font-medium text-center line-clamp-1 transition-colors duration-300", "text-zinc-300")}>{u.name.split(' ')[0]}</span>
               <span className="text-[10px] font-extrabold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full">{u.compatibility}% Match</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
