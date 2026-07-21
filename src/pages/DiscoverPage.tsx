import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'motion/react';
import { mockUsers } from '../data/mock';
import { 
  BadgeCheck, MapPin, Briefcase, Zap, X, Heart, Star, Info, ChevronDown, Sparkles, 
  Compass, HeartHandshake, Moon, Sun, Coffee, Baby, Dog, Cigarette, Wine, GraduationCap, 
  Flame, Smile, ShieldCheck, HelpCircle, Users, Activity, SlidersHorizontal, Crown, Lock,
  ShieldAlert, UserMinus, AlertTriangle, Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { calculateCompatibility } from '../utils/compatibility';
import { playUiSound } from '../utils/audio';
import { getPrivacySetting, getSystemSetting } from '../utils/privacy';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface PillSelectorProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  currentValue: string;
  onChange: (value: string) => void;
  isPremium?: boolean;
  onPremiumClick?: () => void;
}

function PillSelector({ label, icon, options, currentValue, onChange, isPremium, onPremiumClick }: PillSelectorProps) {
  return (
    <div className={cn(
      "p-4 rounded-3xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden",
      isPremium 
        ? "bg-amber-500/[0.02] border-amber-500/10 hover:border-amber-500/20"
        : "bg-zinc-900/40 border-white/5 hover:border-white/10"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "p-1.5 rounded-xl border transition-all duration-300",
            isPremium
              ? "text-amber-400 bg-amber-500/10 border-amber-500/15"
              : "text-pink-400 bg-pink-500/10 border-pink-500/10"
          )}>
            {icon}
          </div>
          <span className={cn(
            "text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5",
            isPremium ? "text-amber-400/80" : "text-zinc-400"
          )}>
            {label}
            {isPremium && (
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-widest flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-current" /> Gold
              </span>
            )}
          </span>
        </div>
        {isPremium && (
          <Lock className="w-3.5 h-3.5 text-amber-400/50" />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = currentValue === opt;
          return (
            <button
              key={opt}
              onClick={() => {
                if (isPremium) {
                  if (onPremiumClick) onPremiumClick();
                } else {
                  onChange(isSelected ? "" : opt);
                }
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border",
                isSelected
                  ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/50 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)] scale-[1.03]"
                  : isPremium
                    ? "bg-amber-500/5 border-amber-500/10 text-zinc-400 hover:text-amber-300 hover:border-amber-500/30"
                    : "bg-zinc-950/60 border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface SwipeCardProps {
  key?: React.Key;
  user: any;
  isTop: boolean;
  isSecond: boolean;
  index: number;
  totalCards: number;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  swipeDirection: 'left' | 'right' | 'up' | null;
  onSwipe: (dir: 'left' | 'right' | 'up') => void;
  onReportBlockClick: (user: any) => void;
}

const SwipeCard = React.memo(function SwipeCard({
  user,
  isTop,
  isSecond,
  index,
  totalCards,
  showProfile,
  setShowProfile,
  swipeDirection,
  onSwipe,
  onReportBlockClick
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);

  // Custom opacities for swipe indicator badges
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const favoriteOpacity = useTransform(y, [-80, 0], [1, 0]);

  useEffect(() => {
    if (isTop && swipeDirection) {
      if (swipeDirection === 'left') {
        animate(x, -500, { duration: 0.2 });
      } else if (swipeDirection === 'right') {
        animate(x, 500, { duration: 0.2 });
      } else if (swipeDirection === 'up') {
        animate(y, -800, { duration: 0.2 });
      }
    }
  }, [isTop, swipeDirection, x, y]);

  return (
    <motion.div
      className="absolute inset-0 cursor-pointer"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        scale: isTop ? scale : isSecond ? 0.95 : 0.9,
        zIndex: totalCards - index,
        originY: 1,
        willChange: "transform"
      }}
      drag={isTop && !showProfile ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={(e, { offset }) => {
        const swipeThreshold = 80;
        if (offset.y < -swipeThreshold) {
          onSwipe('up');
        } else if (offset.x > swipeThreshold) {
          onSwipe('right');
        } else if (offset.x < -swipeThreshold) {
          onSwipe('left');
        }
      }}
      onTap={(e, info) => {
        if (isTop && !showProfile) {
          setShowProfile(true);
        }
      }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      animate={{ 
        scale: isTop ? 1 : isSecond ? 0.95 : 0.9, 
        y: isTop ? 0 : isSecond ? 20 : 40, 
        opacity: 1 
      }}
      exit={{ 
        x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : (x.get() > 50 ? 500 : x.get() < -50 ? -500 : 0),
        y: swipeDirection === 'up' ? -800 : (y.get() < -50 ? -800 : 0),
        opacity: 0, 
        transition: { duration: 0.3 } 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Visual Card */}
      <div 
        className={cn(
          "w-full h-full overflow-hidden relative shadow-2xl transition-colors duration-300 rounded-3xl",
          "bg-zinc-900 border border-white/10"
        )}
      >
        {/* Visual Swipe Indicators */}
        {isTop && (
          <>
            {/* Swipe Left Badge */}
            <motion.div 
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-12 z-20 border-4 border-red-500 text-red-500 font-black text-3xl px-5 py-2 rounded-2xl uppercase tracking-widest rotate-12 select-none pointer-events-none bg-black/20 backdrop-blur-xs"
            >
              Não curti
            </motion.div>

            {/* Swipe Right Badge */}
            <motion.div 
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-12 z-20 border-4 border-emerald-500 text-emerald-500 font-black text-3xl px-5 py-2 rounded-2xl uppercase tracking-widest -rotate-12 select-none pointer-events-none bg-black/20 backdrop-blur-xs"
            >
              Curti
            </motion.div>

            {/* Super Like Badge */}
            <motion.div 
              style={{ opacity: favoriteOpacity }}
              className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 border-4 border-blue-500 text-blue-500 font-black text-3xl px-5 py-2 rounded-2xl uppercase tracking-widest select-none pointer-events-none bg-black/20 backdrop-blur-xs"
            >
              Super Like
            </motion.div>
          </>
        )}
        <img 
          src={user.images[0]} 
          alt={user.name} 
          loading={isTop ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        
        {/* Card Content Overlay */}
        <div 
          className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex flex-col justify-end w-full pb-20 xs:pb-24 sm:pb-[100px] md:pb-6"
        >
          
          {/* AI Score Badge */}
          <div className="mb-3 inline-flex bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md px-3 py-1.5 rounded-full items-center max-w-fit border border-white/20">
            <Zap className="w-3.5 h-3.5 text-white mr-1.5 fill-current" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">Match IA: {user.compatibility}%</span>
          </div>

          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white tracking-tight">{user.name}</h2>
              <span className="text-xl xs:text-2xl sm:text-3xl font-light text-white/80">{user.age}</span>
              <div className="flex items-center space-x-1.5 mt-1">
                {user.verified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />}
                {user.popular && <Heart className="w-5 h-5 text-pink-400 fill-pink-400/20" />}
                <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                  user.isOnline 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <span className="relative flex h-1.5 w-1.5">
                    {user.isOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${user.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </span>
                  <span>{user.isOnline ? 'Online' : 'Offline'}</span>
                </span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReportBlockClick(user);
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center mb-1 transition-all active:scale-90"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-center text-sm font-medium text-white/80">
              <MapPin className="w-4 h-4 mr-2 text-pink-400" />
              {getPrivacySetting('hide_dist') ? 'Distância Ocultada' : `${user.distance} km`}
            </div>
            {(user.jobTitle || user.education) && (
              <div className="flex items-center text-sm font-medium text-white/80">
                <Briefcase className="w-4 h-4 mr-2 text-purple-400" />
                <span>
                  {user.jobTitle && `${user.jobTitle}${user.company ? ` na ${user.company}` : ''}`}
                  {user.jobTitle && user.education && ' • '}
                  {user.education && user.education}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function DiscoverPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('truematch_blocked_users');
    return stored ? JSON.parse(stored) : [];
  });

  const getUpdatedUsers = (currentBlocked: string[] = []) => {
    const storedMe = localStorage.getItem('truematch_profile_me');
    let meData = mockUsers[0];
    if (storedMe) {
      try {
        meData = { ...mockUsers[0], ...JSON.parse(storedMe) };
      } catch (e) {
        console.error(e);
      }
    }

    const activeBlocked = currentBlocked.length > 0 ? currentBlocked : blockedUserIds;
    const antifraudActive = getPrivacySetting('antifraud');

    return mockUsers
      .filter(u => {
        if (antifraudActive && !u.verified) return false;
        return u.id !== meData.id && !activeBlocked.includes(u.id);
      })
      .map(user => ({
        ...user,
        compatibility: calculateCompatibility(meData, user)
      }));
  };

  const [cards, setCards] = useState(() => {
    const storedBlocked = localStorage.getItem('truematch_blocked_users');
    const blocked = storedBlocked ? JSON.parse(storedBlocked) : [];
    const storedMe = localStorage.getItem('truematch_profile_me');
    let meData = mockUsers[0];
    if (storedMe) {
      try {
        meData = { ...mockUsers[0], ...JSON.parse(storedMe) };
      } catch (e) {
        // ignore
      }
    }
    const antifraudActive = getPrivacySetting('antifraud');
    return mockUsers
      .filter(u => {
        if (antifraudActive && !u.verified) return false;
        return u.id !== meData.id && !blocked.includes(u.id);
      })
      .map(user => ({
        ...user,
        compatibility: calculateCompatibility(meData, user)
      }));
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showAIFilters, setShowAIFilters] = useState(false);
  const [showMatch, setShowMatch] = useState<any | null>(null);

  useEffect(() => {
    if (showMatch) {
      playUiSound('match');
      if (getSystemSetting('push') && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Match no TrueMatch! ❤️', {
          body: `Você e ${showMatch.name} se curtiram! Envie uma mensagem agora.`,
          icon: showMatch.images?.[0] || '/favicon.ico'
        });
      }
    }
  }, [showMatch]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const [reportBlockUser, setReportBlockUser] = useState<any | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showReportReasonModal, setShowReportReasonModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBlockUser = (userId: string) => {
    const newBlocked = [...blockedUserIds, userId];
    setBlockedUserIds(newBlocked);
    localStorage.setItem('truematch_blocked_users', JSON.stringify(newBlocked));
    
    // Remove from active cards
    setCards(prev => prev.filter(c => c.id !== userId));
    
    // Show Toast
    setToastMessage("Usuário bloqueado com sucesso.");
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const [superLikesCount, setSuperLikesCount] = useState(0);
  const [showGoldSubscriptionModal, setShowGoldSubscriptionModal] = useState(false);

  useEffect(() => {
    if (showGoldSubscriptionModal) {
      setShowGoldSubscriptionModal(false);
      navigate('/checkout', { state: { from: '/' } });
    }
  }, [showGoldSubscriptionModal, navigate]);

  useEffect(() => {
    // Handle initial user passed from other pages (like ReelsPage)
    if (location.state && (location.state as any).initialUser) {
      const initialUser = (location.state as any).initialUser;
      setCards(prev => {
        const filtered = prev.filter(u => u.id !== initialUser.id);
        return [initialUser, ...filtered];
      });
      setShowProfile(true);
      // Clear state to avoid re-opening on refresh
      window.history.replaceState({}, document.title);
    }

    // Only update if there's a real difference
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
  }, []); // Run once on mount to sync status

  const [filterCompatibility, setFilterCompatibility] = useState(70);
  const [filterGender, setFilterGender] = useState('Todos');
  const [filterMinAge, setFilterMinAge] = useState(18);
  const [filterMaxAge, setFilterMaxAge] = useState(60);
  const [filterDistance, setFilterDistance] = useState(50);
  const [filterPopular, setFilterPopular] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterOnlineStatus, setFilterOnlineStatus] = useState<string>('Todos');
  const [filterHeight, setFilterHeight] = useState(150);
  const [filterSexuality, setFilterSexuality] = useState<string>('');
  const [filterIntent, setFilterIntent] = useState<string>('');
  const [filterZodiac, setFilterZodiac] = useState<string>('');
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterLifestyle, setFilterLifestyle] = useState<string>('');
  const [filterChildren, setFilterChildren] = useState<string>('');
  const [filterPets, setFilterPets] = useState<string>('');
  const [filterSmoking, setFilterSmoking] = useState<string>('');
  const [filterDrinking, setFilterDrinking] = useState<string>('');
  const [filterEducation, setFilterEducation] = useState<string>('');
  const [filterReligion, setFilterReligion] = useState<string>('');
  const [filterRelationshipStatus, setFilterRelationshipStatus] = useState<string>('');
  const [filterPersonality, setFilterPersonality] = useState<string>('');

  const handleClearFilters = () => {
    setFilterCompatibility(70);
    setFilterGender('Todos');
    setFilterMinAge(18);
    setFilterMaxAge(60);
    setFilterDistance(50);
    setFilterPopular(false);
    setFilterVerified(false);
    setFilterOnlineStatus('Todos');
    setFilterHeight(150);
    setFilterSexuality('');
    setFilterIntent('');
    setFilterZodiac('');
    setFilterLanguage('');
    setFilterLifestyle('');
    setFilterChildren('');
    setFilterPets('');
    setFilterSmoking('');
    setFilterDrinking('');
    setFilterEducation('');
    setFilterReligion('');
    setFilterRelationshipStatus('');
    setFilterPersonality('');
  };

  const [isTrueMatchExpanded, setIsTrueMatchExpanded] = useState(false);
  const [trueMatchMode, setTrueMatchMode] = useState<'Equilibrado' | 'Profundo' | 'Química' | 'Afinidade' | 'Personalizado'>('Equilibrado');
  const [trueMatchInterestsWeight, setTrueMatchInterestsWeight] = useState(60);
  const [trueMatchLifestyleWeight, setTrueMatchLifestyleWeight] = useState(60);
  const [trueMatchVibeWeight, setTrueMatchVibeWeight] = useState(60);

  const handleTrueMatchModeChange = (mode: 'Equilibrado' | 'Profundo' | 'Química' | 'Afinidade' | 'Personalizado') => {
    setTrueMatchMode(mode);
    if (mode === 'Equilibrado') {
      setTrueMatchInterestsWeight(60);
      setTrueMatchLifestyleWeight(60);
      setTrueMatchVibeWeight(60);
    } else if (mode === 'Profundo') {
      setTrueMatchInterestsWeight(90);
      setTrueMatchLifestyleWeight(50);
      setTrueMatchVibeWeight(80);
    } else if (mode === 'Química') {
      setTrueMatchInterestsWeight(40);
      setTrueMatchLifestyleWeight(70);
      setTrueMatchVibeWeight(90);
    } else if (mode === 'Afinidade') {
      setTrueMatchInterestsWeight(95);
      setTrueMatchLifestyleWeight(90);
      setTrueMatchVibeWeight(95);
    }
  };

  const handleSliderChange = (type: 'interests' | 'lifestyle' | 'vibe', value: number) => {
    setTrueMatchMode('Personalizado');
    if (type === 'interests') setTrueMatchInterestsWeight(value);
    if (type === 'lifestyle') setTrueMatchLifestyleWeight(value);
    if (type === 'vibe') setTrueMatchVibeWeight(value);
  };

  const applyFilters = () => {
    setShowAIFilters(false);
    setIsOptimizing(true);
    
    setTimeout(() => {
      const filtered = getUpdatedUsers().filter(user => {
        if (user.compatibility < filterCompatibility) return false;
        if (user.age < filterMinAge || user.age > filterMaxAge) return false;
        if (filterVerified && !user.verified) return false;
        if (filterPopular && !user.popular) return false;
        if (filterOnlineStatus === 'Online' && !user.isOnline) return false;
        if (filterOnlineStatus === 'Offline' && user.isOnline) return false;

        const dist = user.distance;
        if (dist > filterDistance) return false;

        if (filterIntent && user.intent && filterIntent.toLowerCase() !== user.intent.toLowerCase()) {
          return false;
        }

        if (filterLifestyle.length > 0 && user.lifestyle) {
          const hasCommon = user.lifestyle.some(l => filterLifestyle.includes(l));
          if (!hasCommon) return false;
        }

        return true;
      });

      setCards(filtered);
      setIsOptimizing(false);
    }, 2500);
  };
  
  const removeTopCard = React.useCallback((dir: 'left' | 'right' | 'up') => {
    setCards((currentCards) => {
      const card = currentCards[0];
      if (!card) return currentCards;

      if (dir === 'up') {
        if (!isGold) {
          if (superLikesCount >= 1) {
            setShowGoldSubscriptionModal(true);
            return currentCards;
          } else {
            setSuperLikesCount((prev) => prev + 1);
          }
        }
      }

      setShowProfile(false);
      setSwipeDirection(dir);
      
      if (dir === 'up' || dir === 'right') {
        if (!isFavorite(card.id)) {
          toggleFavorite(card.id);
        }

        // Dynamic increment for "Curtidas" (likes received)
        const currentCurtidas = localStorage.getItem('truematch_curtidas_count');
        const count = currentCurtidas ? parseInt(currentCurtidas, 10) : 142;
        const nextCount = count + Math.floor(Math.random() * 2) + 1; // Increment by 1 or 2
        localStorage.setItem('truematch_curtidas_count', String(nextCount));
        window.dispatchEvent(new Event('curtidas_changed'));
      }

      // Persist Swipe to Firestore
      const user = auth.currentUser;
      if (user) {
        const swipeId = `swipe_${Date.now()}`;
        setDoc(doc(db, 'users', user.uid, 'swipes', swipeId), {
          id: swipeId,
          swiperId: user.uid,
          swipedId: card.id,
          direction: dir,
          timestamp: new Date().toISOString()
        }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/swipes/${swipeId}`);
        });
      }

      // Simulate a match on specific conditions (e.g. every right swipe on verified users)
      if (dir === 'right' && card.verified) {
        setTimeout(() => setShowMatch(card), 400);
      }

      setTimeout(() => {
        setCards((prev) => prev.slice(1));
        setSwipeDirection(null);
      }, 150);
      return currentCards;
    });
  }, [isGold, superLikesCount, isFavorite, toggleFavorite]);

  const handleReportBlockClick = React.useCallback((u: any) => {
    setReportBlockUser(u);
    setShowOptionsModal(true);
  }, []);

  const currentCard = cards[0];

  return (
    <div className={cn(
      "flex-1 flex flex-col pt-6 px-0 pb-[72px] md:pb-[80px] h-full relative overflow-hidden transition-colors duration-300",
      "bg-zinc-950"
    )}>
      
      {/* Top Header */}
      <div 
        className="flex justify-between items-center z-10 w-full mb-5 mt-1 px-4"
      >
        <div className="flex items-center">
          <div className="w-[45px] h-[45px] mr-[12px] rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center">
             <Heart className="w-[30px] h-[30px] text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <div 
              className="flex items-center gap-1.5"
            >
              <span 
                className={cn(
                  "font-bold text-xl tracking-tight leading-none transition-colors duration-300",
                  "text-white"
                )}
              >TrueMatch<span className="text-pink-500">.</span>ai</span>
              {isGold && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                  <Crown className="w-2.5 h-2.5 fill-current" /> GOLD
                </span>
              )}
            </div>
            <div 
              className="flex flex-col mt-1"
            >
              <span className="text-pink-400 font-semibold text-[10px] tracking-widest uppercase">Encontros</span>
              <div className="flex items-center gap-1.5 ml-0 mt-0">
                {getPrivacySetting('private') && (
                  <span className="text-[8px] bg-red-500/15 text-red-400 font-bold px-1 py-0.5 rounded border border-red-500/10 flex items-center gap-0.5" title="Perfil Privado Ativo">
                    <Lock className="w-2 h-2 shrink-0" /> PRIVADO
                  </span>
                )}
                {getPrivacySetting('antifraud') && (
                  <span className="text-[8px] bg-blue-500/15 text-blue-400 font-bold px-1 py-0.5 rounded border border-blue-500/10 flex items-center gap-0.5" title="Modo Antifraude Ativo">
                    <ShieldCheck className="w-2 h-2 shrink-0" /> ANTIFRAUDE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button */}
          

          {/* Notifications Button */}
          <button 
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 rounded-full glass-surface flex items-center justify-center active:scale-90 transition-transform border border-white/5 bg-zinc-900/50 hover:border-pink-500/30 group relative"
          >
            <Bell className="w-5 h-5 text-zinc-400 group-hover:text-pink-400 transition-colors" />
            {unreadCount > 0 && (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
            )}
          </button>

          {/* Filter Button */}
          <button 
            onClick={() => setShowAIFilters(true)}
            className="relative w-10 h-10 rounded-full glass-surface flex items-center justify-center active:scale-90 transition-transform hover:border-pink-500/30 group"
          >
            <SlidersHorizontal className="w-5 h-5 text-purple-400 group-hover:text-pink-400 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </button>
        </div>
      </div>

      {/* Cards Area */}
      <div className="relative w-full max-w-[340px] flex-1 min-h-0 mt-2 mb-[12px] md:mb-[16px] mx-auto px-2 md:px-0 flex items-center justify-center max-h-[720px]">
        <AnimatePresence>
          {cards.map((user, index) => {
            const isTop = index === 0;
            const isSecond = index === 1;

            if (index > 2) return null;

            return (
              <SwipeCard
                key={user.id}
                user={user}
                isTop={isTop}
                isSecond={isSecond}
                index={index}
                totalCards={cards.length}
                showProfile={showProfile}
                setShowProfile={setShowProfile}
                swipeDirection={isTop ? swipeDirection : null}
                onSwipe={removeTopCard}
                onReportBlockClick={handleReportBlockClick}
              />
            );
          })}
        </AnimatePresence>
        
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 h-full z-0">
            <div className={cn(
              "w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center mb-6 transition-colors duration-300",
              "border-white/20"
            )}>
               <SlidersHorizontal className={cn("w-8 h-8 transition-colors duration-300", "text-white/40")} />
            </div>
            <h3 className={cn("text-2xl font-bold mb-2 transition-colors duration-300", "text-white")}>Você ficou sem perfis!</h3>
            <p className={cn("text-sm mb-6 transition-colors duration-300", "text-white/50")}>Tente ajustar seus filtros de IA ou aumentar a distância nas preferências.</p>
            <button className={cn(
              "px-6 py-3 rounded-full font-semibold max-w-fit shadow-md transition-all duration-300 active:scale-95",
              "bg-white text-black hover:bg-zinc-100"
            )}
               onClick={() => setCards(getUpdatedUsers())}
            >
              Atualizar Perfis
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {cards.length > 0 && (
        <div 
          className="absolute bottom-[75px] md:bottom-[85px] left-0 w-full flex justify-center items-center space-x-6 z-20 pb-4 pointer-events-none"
        >
          <button 
            onClick={() => removeTopCard('left')}
            className="w-14 h-14 rounded-full border border-red-500/30 flex items-center justify-center bg-zinc-900/80 text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 pointer-events-auto backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => removeTopCard('up')}
            className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center bg-zinc-900/80 text-blue-400 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 pointer-events-auto backdrop-blur-md"
          >
            <Star className="w-6 h-6" />
          </button>
          <button 
            onClick={() => removeTopCard('right')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/50 transition-all transform hover:scale-105 pointer-events-auto"
          >
            <Heart className="w-8 h-8 fill-current" />
          </button>
        </div>
      )}

      {/* Full Profile Overlay */}
      <AnimatePresence>
        {showProfile && currentCard && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className={cn(
              "absolute inset-0 z-50 overflow-hidden transition-colors duration-300",
              "bg-zinc-950"
            )}
          >
            <div className="absolute inset-0 overflow-y-auto hide-scrollbar">
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronDown className="w-8 h-8" />
              </button>

              <div className="relative h-[65vh] w-full">
                <img 
                  src={currentCard.images[0]} 
                  alt={currentCard.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-all duration-300",
                  "from-zinc-950"
                )} />
                
                <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
                  <div className="mb-3 inline-flex bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-md px-3 py-1.5 rounded-full items-center max-w-fit border border-white/20">
                    <Zap className="w-3.5 h-3.5 text-white mr-1.5 fill-current" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">Match IA: {currentCard.compatibility}%</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h2 className={cn(
                      "text-5xl font-bold tracking-tight transition-colors duration-300",
                      "text-white"
                    )}>{currentCard.name}</h2>
                    <span className={cn(
                      "text-4xl font-light transition-colors duration-300",
                      "text-white/80"
                    )}>{currentCard.age}</span>
                    <div className="flex items-center space-x-1.5 mt-1">
                      {currentCard.verified && <BadgeCheck className="w-8 h-8 text-blue-400 fill-blue-400/20" />}
                      {currentCard.popular && <Heart className="w-7 h-7 text-pink-400 fill-pink-400/20" />}
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                        currentCard.isOnline 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        <span className="relative flex h-2 w-2">
                          {currentCard.isOnline && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${currentCard.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </span>
                        <span>{currentCard.isOnline ? 'Online' : 'Offline'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* About Me */}
                <section>
                  <div className="grid grid-cols-2 gap-3 mb-6">

                    {currentCard.zodiac && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Moon className="w-6 h-6 text-purple-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.zodiac}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Signo</span>
                      </div>
                    )}
                    {currentCard.children && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Baby className="w-6 h-6 text-blue-300 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.children}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Filhos</span>
                      </div>
                    )}
                    {currentCard.religion && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Compass className="w-6 h-6 text-emerald-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.religion}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Religião</span>
                      </div>
                    )}
                    {currentCard.personality && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Activity className="w-6 h-6 text-pink-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.personality}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Personalidade</span>
                      </div>
                    )}

                    {currentCard.gender && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Users className="w-6 h-6 text-indigo-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.gender}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Gênero</span>
                      </div>
                    )}
                    {currentCard.sexuality && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Users className="w-6 h-6 text-pink-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.sexuality}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Sexualidade</span>
                      </div>
                    )}
                    {currentCard.smoking && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Flame className="w-6 h-6 text-orange-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.smoking}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Cigarro</span>
                      </div>
                    )}
                    {currentCard.drinking && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Wine className="w-6 h-6 text-red-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.drinking}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Bebida</span>
                      </div>
                    )}
                    {currentCard.pets && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Dog className="w-6 h-6 text-amber-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.pets}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Pets</span>
                      </div>
                    )}
                    {currentCard.city && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <MapPin className="w-6 h-6 text-pink-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.city}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">
                          {getPrivacySetting('hide_dist') ? 'Distância Ocultada' : `${currentCard.distance} km de distância`}
                        </span>
                      </div>
                    )}
                    {currentCard.relationshipStatus && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Heart className="w-6 h-6 text-purple-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.relationshipStatus}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Status</span>
                      </div>
                    )}
                    {currentCard.jobTitle && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Briefcase className="w-6 h-6 text-blue-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>
                          {currentCard.jobTitle}{currentCard.company ? ` na ${currentCard.company}` : ''}
                        </span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Profissão</span>
                      </div>
                    )}
                    {currentCard.education && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <GraduationCap className="w-6 h-6 text-purple-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.education}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Educação</span>
                      </div>
                    )}
                    {currentCard.intent && (
                      <div className={cn(
                        "p-4 rounded-[1.25rem] border flex flex-col justify-center col-span-2 transition-all duration-300",
                        "bg-zinc-900/60 border-white/5"
                      )}>
                        <Sparkles className="w-6 h-6 text-yellow-400 mb-2" />
                        <span className={cn("text-[15px] font-semibold leading-tight transition-colors duration-300", "text-white")}>{currentCard.intent}</span>
                        <span className="text-[13px] text-zinc-500 mt-0.5">Objetivo no App</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={cn(
                    "text-[18px] font-bold mb-3 pb-2 border-b transition-colors duration-300",
                    "text-white border-white/10"
                  )}>Sobre mim</h3>
                  <p className={cn(
                    "text-[16px] leading-relaxed font-normal transition-colors duration-300",
                    "text-zinc-300"
                  )}>
                    {currentCard.bio}
                  </p>
                </section>

                {/* Interests */}
                {currentCard.interests && currentCard.interests.length > 0 && (
                  <section>
                    <h3 className={cn(
                      "text-lg font-bold mb-3 pb-2 border-b transition-colors duration-300",
                      "text-white border-white/10"
                    )}>Interesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.interests.map((interest, idx) => (
                        <span key={idx} className={cn(
                          "px-4 py-2 rounded-full border transition-all duration-300 text-[14px] font-semibold",
                          "border-pink-500/30 bg-pink-500/10 text-pink-300"
                        )}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Lifestyle */}
                {currentCard.lifestyle && currentCard.lifestyle.length > 0 && 
                 JSON.stringify(currentCard.lifestyle) !== JSON.stringify(currentCard.interests) && (
                  <section>
                    <h3 className={cn(
                      "text-lg font-bold mb-3 pb-2 border-b transition-colors duration-300",
                      "text-white border-white/10"
                    )}>Estilo de Vida</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.lifestyle.map((life, idx) => (
                        <span key={idx} className={cn(
                          "px-4 py-2 rounded-full border transition-all duration-300 text-[14px] font-semibold",
                          "border-purple-500/30 bg-purple-500/10 text-purple-300"
                        )}>
                          {life}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* More Photos */}
                {currentCard.images.length > 1 && (
                  <section className="space-y-4">
                    <h3 className={cn(
                      "text-lg font-bold mb-3 pb-2 border-b transition-colors duration-300",
                      "text-white border-white/10"
                    )}>Galeria</h3>
                    {currentCard.images.slice(1).map((img, idx) => (
                      <img key={idx} src={img} decoding="async" loading="lazy" referrerPolicy="no-referrer" className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-lg" />
                    ))}
                  </section>
                )}

                {/* Bottom Actions inside the profile view */}
                <div className="flex justify-center items-center pt-12 pb-8 space-x-8">
                  <button 
                    onClick={() => removeTopCard('left')}
                    className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all backdrop-blur-md shadow-lg shadow-red-500/10 active:scale-95"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => removeTopCard('up')}
                    className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all backdrop-blur-md shadow-lg shadow-blue-500/10 active:scale-95"
                  >
                    <Star className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => removeTopCard('right')}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/50 transition-all active:scale-95"
                  >
                    <Heart className="w-10 h-10 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Found Overlay */}
      <AnimatePresence>
        {showMatch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
             <motion.div 
               initial={{ scale: 0, rotate: -20 }}
               animate={{ scale: 1, rotate: 0 }}
               className="text-6xl font-black italic text-pink-500 mb-8 tracking-tighter"
             >
               DEU MATCH!
             </motion.div>
             
             <div className="flex items-center space-x-[-20px] mb-12">
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-32 h-32 rounded-full border-4 border-pink-500 overflow-hidden shadow-2xl z-10"
                >
                  <img decoding="async" loading="lazy" src={me?.images?.[0] || mockUsers[0].images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </motion.div>
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden shadow-2xl"
                >
                  <img decoding="async" loading="lazy" src={showMatch.images[0]} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </motion.div>
             </div>

             <h2 className="text-2xl font-bold mb-1">Você e {showMatch.name} se curtiram!</h2>
             <p className="text-pink-400 font-bold text-sm mb-4">Vocês têm {showMatch.compatibility}% de Compatibilidade! ✨</p>
             <p className="text-zinc-400 mb-12 max-w-xs">Não deixe a conversa esfriar. A IA recomenda começar com um "Oi!".</p>

             <div className="w-full max-w-xs space-y-4">
               <button 
                 onClick={() => {
                   const matchId = showMatch.id;
                   setShowMatch(null);
                   navigate('/chat', { state: { userId: matchId } });
                 }}
                 className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-full shadow-lg shadow-pink-500/20 active:scale-95 transition-transform"
               >
                 Enviar Mensagem
               </button>
               <button 
                 onClick={() => setShowMatch(null)}
                 className="w-full bg-white/10 text-white font-bold py-4 rounded-full border border-white/10 active:scale-95 transition-transform"
               >
                 Continuar Deslizando
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Filters Page (Full Screen Slide) */}
      <AnimatePresence>
        {showAIFilters && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col pt-safe overflow-hidden"
          >
            {/* Header Area */}
            <div className="p-6 pb-2 shrink-0 relative z-10 border-b border-white/5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600/20 to-pink-600/20 flex items-center justify-center border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                    <SlidersHorizontal className="w-5 h-5 text-pink-400" />
                    <div className="absolute inset-0 bg-pink-500/20 blur-md rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-[18px] leading-[25px] font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Filtros IA TrueMatch</h2>
                    <p className="text-[9px] text-pink-400 uppercase tracking-widest font-semibold mt-0.5">Preferências Avançadas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAIFilters(false)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 active:scale-90 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto hide-scrollbar pb-8 px-6 py-6 relative z-10 custom-scrollbar">
                {/* SECTION 1: ESSENCIAIS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Filtros Essenciais</h3>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] font-bold text-pink-500 hover:text-pink-400 active:scale-95 transition-all uppercase tracking-wider bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/20"
                    >
                      Limpar Filtro
                    </button>
                  </div>
                  
                  {/* Compatibility */}
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-pink-400" />
                        <label className="font-bold text-sm text-white">Compatibilidade Mínima</label>
                      </div>
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md shadow-pink-500/20">
                        {filterCompatibility}%+
                      </div>
                    </div>
                    <div className="relative h-2 bg-zinc-950/80 rounded-full mb-3 border border-white/5">
                      <div 
                                                                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
                                                                  style={{ width: `${((filterCompatibility - 50) / 49) * 100}%` }}
                                                                >
                                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 pointer-events-none" />
                                                                  </div>
                      <input 
                        type="range" 
                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" 
                        min="50" 
                        max="99" 
                        value={filterCompatibility} 
                        onChange={(e) => setFilterCompatibility(Number(e.target.value))} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-0.5">
                      <span>Equilibrado (50%)</span>
                      <span>Alma Gêmea (99%)</span>
                    </div>
                  </div>

                  {/* estoy buscando */}
                  <div className="flex flex-col space-y-3 bg-zinc-900/40 p-5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <label className="font-bold text-sm text-white">Estou buscando</label>
                    </div>
                    <div className="flex bg-zinc-950/80 border border-white/5 rounded-2xl p-1.5 shadow-inner">
                       {['Mulheres', 'Homens', 'Todos'].map(g => (
                         <button 
                           key={g} 
                           onClick={() => setFilterGender(g)}
                           className={cn(
                             "flex-1 py-3 text-xs font-extrabold rounded-xl transition-all duration-300",
                             filterGender === g 
                               ? "bg-gradient-to-r from-zinc-800 to-zinc-700 text-white shadow-md border border-white/10" 
                               : "text-zinc-500 hover:text-white"
                           )}
                         >
                           {g}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Idade */}
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center space-x-2">
                        <Smile className="w-4 h-4 text-pink-400" />
                        <label className="font-bold text-sm text-white">Faixa de Idade</label>
                      </div>
                      <div className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-black border border-white/10 shadow-sm">
                        {filterMinAge} - {filterMaxAge} anos
                      </div>
                    </div>
                    <div className="flex space-x-6">
                      <div className="flex-1 relative">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2.5 block text-center">Mínima</span>
                        <div className="relative h-2 bg-zinc-950/80 rounded-full mb-2 border border-white/5">
                          <div className="absolute left-0 top-0 bottom-0 bg-pink-500/50 rounded-full" style={{ width: `${((filterMinAge - 18) / (filterMaxAge - 18 || 1)) * 100}%` }}>
                                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-pink-500 pointer-events-none" />
                                                                          </div>
                          <input type="range" className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" min="18" max={filterMaxAge} value={filterMinAge} onChange={(e) => setFilterMinAge(Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2.5 block text-center">Máxima</span>
                        <div className="relative h-2 bg-zinc-950/80 rounded-full mb-2 border border-white/5">
                          <div className="absolute left-0 top-0 bottom-0 bg-purple-500/50 rounded-full" style={{ width: `${((filterMaxAge - filterMinAge) / (100 - filterMinAge || 1)) * 100}%` }}>
                                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 pointer-events-none" />
                                                                          </div>
                          <input type="range" className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" min={filterMinAge} max="60" value={filterMaxAge} onChange={(e) => setFilterMaxAge(Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distância */}
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-pink-400" />
                        <label className="font-bold text-sm text-white">Distância Máxima</label>
                      </div>
                      <div className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-black border border-white/10 shadow-sm">
                        Até {filterDistance} km
                      </div>
                    </div>
                    <div className="relative h-2 bg-zinc-950/80 rounded-full mb-3 border border-white/5">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${(filterDistance / 100) * 100}%` }}>
                                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 pointer-events-none" />
                                                                  </div>
                      <input type="range" className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" min="1" max="100" value={filterDistance} onChange={(e) => setFilterDistance(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-0.5">
                      <span>Próximo (1 km)</span>
                      <span>Explorar (100 km)</span>
                    </div>
                  </div>

                  {/* Altura Mínima */}
                  <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-4 h-4 text-pink-400" />
                        <span className="font-bold text-sm text-white">Altura Mínima</span>
                      </div>
                      <div className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-black border border-white/10">
                        {filterHeight} cm+
                      </div>
                    </div>
                    <div className="relative h-2 bg-zinc-950/80 rounded-full mb-3 border border-white/5">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${((filterHeight - 140) / (220 - 140)) * 100}%` }}>
                                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500 pointer-events-none" />
                                                                  </div>
                      <input type="range" className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" min="140" max="220" value={filterHeight} onChange={(e) => setFilterHeight(Number(e.target.value))} />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-0.5">
                      <span>140 cm</span>
                      <span>220 cm</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: STATUS & VERIFICAÇÃO */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 px-1">
                    <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Status da Conta</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-3xl border cursor-pointer transition-all duration-300 backdrop-blur-md",
                        filterPopular 
                          ? "bg-gradient-to-b from-pink-500/10 to-purple-600/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.1)] scale-[1.02]" 
                          : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40 hover:border-white/10"
                      )}
                      onClick={() => setFilterPopular(!filterPopular)}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl mb-3 transition-colors",
                        filterPopular ? "bg-pink-500/20 text-pink-400" : "bg-zinc-950/40 text-zinc-500"
                      )}>
                        <Heart className={cn("w-6 h-6 transition-colors", filterPopular ? "fill-pink-400" : "")} />
                      </div>
                      <span className={cn("font-bold text-xs mb-1", filterPopular ? "text-pink-100" : "text-zinc-400")}>Perfil Popular</span>
                      <p className="text-[10px] text-zinc-500 text-center font-medium">Mais curtidos</p>
                    </div>

                    <div 
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-3xl border cursor-pointer transition-all duration-300 backdrop-blur-md",
                        filterVerified 
                          ? "bg-gradient-to-b from-blue-500/10 to-cyan-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.02]" 
                          : "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40 hover:border-white/10"
                      )}
                      onClick={() => setFilterVerified(!filterVerified)}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl mb-3 transition-colors",
                        filterVerified ? "bg-blue-500/20 text-blue-400" : "bg-zinc-950/40 text-zinc-500"
                      )}>
                        <BadgeCheck className="w-6 h-6" />
                      </div>
                      <span className={cn("font-bold text-xs mb-1", filterVerified ? "text-blue-100" : "text-zinc-400")}>Verificado</span>
                      <p className="text-[10px] text-zinc-500 text-center font-medium">Conta autêntica</p>
                    </div>

                    <div className="space-y-4 pt-2 col-span-2">
                      <div className="flex items-center space-x-2 px-1">
                        <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Status de Atividade</h3>
                      </div>
                      <div className="flex bg-zinc-950/80 border border-white/5 rounded-2xl p-1.5 shadow-inner">
                        {['Todos', 'Online', 'Offline'].map((status) => {
                          const isActive = filterOnlineStatus === status;
                          return (
                            <button 
                              key={status}
                              onClick={() => setFilterOnlineStatus(status)}
                              className={cn(
                                "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 select-none cursor-pointer",
                                isActive 
                                  ? "bg-gradient-to-r from-zinc-800 to-zinc-700 text-white shadow-md border border-white/10" 
                                  : "text-zinc-500 hover:text-white"
                              )}
                            >
                              <span className="relative flex h-1.5 w-1.5">
                                {status === 'Online' && isActive && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                )}
                                <span className={cn(
                                  "relative inline-flex rounded-full h-1.5 w-1.5",
                                  status === 'Online' 
                                    ? (isActive ? "bg-green-400" : "bg-green-500/50") 
                                    : status === 'Offline' 
                                    ? (isActive ? "bg-zinc-200" : "bg-zinc-600") 
                                    : (isActive ? "bg-purple-400" : "bg-purple-500/50")
                                )}></span>
                              </span>
                              <span>{status}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ESTILO DE VIDA */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 px-1">
                    <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Relacionamento</h3>
                  </div>

                  <div className="space-y-3.5">
                    <PillSelector 
                      label="Aqui para" 
                      icon={<HeartHandshake className="w-4 h-4" />} 
                      options={['Relacionamento Sério', 'Algo Casual', 'Amizade']} 
                      currentValue={filterIntent} 
                      onChange={setFilterIntent} 
                    />

                    <PillSelector 
                      label="Orientação / Sexualidade" 
                      icon={<Users className="w-4 h-4" />} 
                      options={['Hetero', 'Gay', 'Lésbica', 'Bissexual']} 
                      currentValue={filterSexuality} 
                      onChange={setFilterSexuality} 
                    />

                    <PillSelector 
                      label="Focos / Hábitos" 
                      icon={<Flame className="w-4 h-4" />} 
                      options={['Não Fuma', 'Bebe Socialmente', 'Gosta de Pets', 'Treina', 'Caseiro', 'Baladeiro', 'Gamer', 'Viajante', 'Leitor(a)', 'Vegano(a)', 'Vegetariano(a)', 'Cozinha', 'Café', 'Esportes', 'Música', 'Cinema']} 
                      currentValue={filterLifestyle} 
                      onChange={setFilterLifestyle} 
                    />

                    <PillSelector 
                      label="Sobre Cigarro" 
                      icon={<Cigarette className="w-4 h-4" />} 
                      options={['Fumante', 'Não fumante', 'Socialmente']} 
                      currentValue={filterSmoking} 
                      onChange={setFilterSmoking} 
                    />

                    <PillSelector 
                      label="Sobre Bebida" 
                      icon={<Wine className="w-4 h-4" />} 
                      options={['Bebo socialmente', 'Bebo com frequência', 'Não bebo']} 
                      currentValue={filterDrinking} 
                      onChange={setFilterDrinking} 
                    />

                    <PillSelector 
                      label="Animais de Estimação" 
                      icon={<Dog className="w-4 h-4" />} 
                      options={['Cachorro', 'Gato', 'Outros', 'Nenhum']} 
                      currentValue={filterPets} 
                      onChange={setFilterPets} 
                    />
                  </div>
                </div>

                {/* SECTION 4: VALORES & IDENTIDADE */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 px-1">
                    <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">Valores & Identidade</h3>
                  </div>

                  <div className="space-y-3.5">
                    <PillSelector 
                      label="Signo do Zodíaco" 
                      icon={<Moon className="w-4 h-4" />} 
                      options={['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']} 
                      currentValue={filterZodiac} 
                      onChange={setFilterZodiac} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Sobre Filhos" 
                      icon={<Baby className="w-4 h-4" />} 
                      options={['Tenho e quero mais', 'Tenho e não quero mais', 'Não tenho e quero', 'Não quero']} 
                      currentValue={filterChildren} 
                      onChange={setFilterChildren} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Nível de Educação" 
                      icon={<GraduationCap className="w-4 h-4" />} 
                      options={['Ensino Médio', 'Ensino Técnico', 'Graduação', 'Especialização', 'Mestrado', 'Doutorado']} 
                      currentValue={filterEducation} 
                      onChange={setFilterEducation} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Estilo de Vida" 
                      icon={<Coffee className="w-4 h-4" />} 
                      options={['Fitness', 'Caseiro', 'Baladeiro', 'Aventureiro', 'Trabalhador', 'Nômade Digital', 'Geek', 'Espiritualizado', 'Criativo', 'Atleta']} 
                      currentValue={filterLifestyle} 
                      onChange={setFilterLifestyle} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Crença / Religião" 
                      icon={<Compass className="w-4 h-4" />} 
                      options={['Ateu', 'Agnóstico', 'Cristão', 'Católico', 'Evangélico', 'Espírita', 'Outras']} 
                      currentValue={filterReligion} 
                      onChange={setFilterReligion} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Status de Relacionamento" 
                      icon={<Smile className="w-4 h-4" />} 
                      options={['Solteiro(a)', 'Separado(a)', 'Divorciado(a)', 'Viúvo(a)']} 
                      currentValue={filterRelationshipStatus} 
                      onChange={setFilterRelationshipStatus} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />

                    <PillSelector 
                      label="Vibe de Personalidade" 
                      icon={<Activity className="w-4 h-4" />} 
                      options={['Extrovertido', 'Introvertido', 'Ambivertido', 'Espirituoso(a)', 'Calmo(a)', 'Aventureiro(a)', 'Espontâneo(a)', 'Criativo(a)', 'Intelectual', 'Engraçado(a)', 'Carismático(a)', 'Empático(a)']} 
                      currentValue={filterPersonality} 
                      onChange={setFilterPersonality} 
                      isPremium={!isGold}
                      onPremiumClick={() => setShowGoldSubscriptionModal(true)}
                    />
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "p-6 pt-4 shrink-0 relative z-10 mt-auto transition-colors duration-300",
                "border-t border-white/5 bg-zinc-950/50 backdrop-blur-md"
              )}>
                <button 
                  onClick={applyFilters}
                  className="w-full relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-full shadow-lg active:scale-[0.98] transition-transform duration-300 flex items-center justify-center space-x-2 border border-white/20">
                    <Sparkles className="w-5 h-5" />
                    <span className="tracking-wide">Aplicar Filtros Inteligentes</span>
                  </div>
                </button>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* AI Optimizing Overlay */}
      <AnimatePresence>
        {isOptimizing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-pink-500 border-r-purple-500 mb-8"
            />
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Otimizando Perfil...</h2>
            <p className="text-zinc-400 max-w-sm text-sm">
              A IA de TrueMatch está analisando milhões de dados para encontrar os perfis que melhor combinam com seus novos filtros.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="px-5 py-3.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-xl max-w-[300px] transition-all bg-zinc-900/80 text-white">
              <div className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-pink-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.1em]">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Options Bottom Sheet / Modal */}
      <AnimatePresence>
        {showOptionsModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowOptionsModal(false);
              setReportBlockUser(null);
            }}
            className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col p-6 pb-8"
            >
              {/* Header profile preview */}
              <div className="flex flex-col items-center text-center mb-6">
                <img 
                  src={reportBlockUser.images[0]} 
                  referrerPolicy="no-referrer" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-lg mb-2.5" 
                />
                <h3 className="font-bold text-lg text-white">{reportBlockUser.name}, {reportBlockUser.age}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">O que você gostaria de fazer?</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowReportReasonModal(true);
                  }}
                  className="w-full h-12 rounded-2xl bg-pink-500/10 hover:bg-pink-500/15 border border-pink-500/20 flex items-center justify-between px-5 font-bold text-sm text-pink-400 active:scale-98 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-pink-500" />
                    <span>Denunciar Perfil</span>
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                </button>

                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowBlockConfirmModal(true);
                  }}
                  className="w-full h-12 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 flex items-center justify-between px-5 font-bold text-sm text-zinc-200 active:scale-98 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <UserMinus className="w-5 h-5 text-zinc-400" />
                    <span>Bloquear Perfil</span>
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                </button>

                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setReportBlockUser(null);
                  }}
                  className="w-full h-12 rounded-2xl bg-transparent hover:bg-white/5 flex items-center justify-center font-bold text-sm text-zinc-400 active:scale-98 transition-all mt-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Confirm Modal */}
      <AnimatePresence>
        {showBlockConfirmModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowBlockConfirmModal(false);
              setReportBlockUser(null);
            }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-zinc-900 rounded-[2.5rem] border border-white/10 p-6 text-center shadow-2xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500">
                <UserMinus className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-white mb-1.5">Bloquear {reportBlockUser.name}?</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">Você não receberá mais mensagens ou curtidas de {reportBlockUser.name}, e o perfil desaparecerá permanentemente.</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleBlockUser(reportBlockUser.id);
                    setShowBlockConfirmModal(false);
                    setReportBlockUser(null);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg shadow-red-500/10"
                >
                  Bloquear e Remover
                </button>
                <button
                  onClick={() => {
                    setShowBlockConfirmModal(false);
                    setReportBlockUser(null);
                  }}
                  className="w-full bg-transparent hover:bg-white/5 text-zinc-400 font-bold py-3 text-xs uppercase tracking-wider"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Reasons Selection Modal */}
      <AnimatePresence>
        {showReportReasonModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowReportReasonModal(false);
              setReportBlockUser(null);
              setReportReason("");
            }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-zinc-900 rounded-[2.5rem] border border-white/5 p-6 shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-3 text-pink-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Denunciar {reportBlockUser.name}</h3>
                <p className="text-zinc-400 text-xs mt-1">Por qual motivo você quer denunciar este perfil?</p>
              </div>

              {/* Reason choices */}
              <div className="space-y-2 mb-6">
                {[
                  "Perfil falso / Catfish",
                  "Comportamento ofensivo ou abusivo",
                  "Mensagens de Spam ou Propaganda",
                  "Conteúdo impróprio / Fotos obscenas",
                  "Outro motivo"
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={cn(
                      "w-full h-11 rounded-xl text-left px-4 text-xs font-semibold flex items-center justify-between border transition-all active:scale-98",
                      reportReason === reason
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white"
                        : "bg-zinc-800/30 border-white/5 text-zinc-300 hover:bg-zinc-800/60"
                    )}
                  >
                    <span>{reason}</span>
                    {reportReason === reason && (
                      <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setShowReportReasonModal(false);
                    setReportBlockUser(null);
                    setReportReason("");
                  }}
                  className="flex-1 bg-transparent hover:bg-white/5 text-zinc-400 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider"
                >
                  Voltar
                </button>
                <button
                  disabled={!reportReason}
                  onClick={() => {
                    // Block user automatically on report
                    const newBlocked = [...blockedUserIds, reportBlockUser.id];
                    setBlockedUserIds(newBlocked);
                    localStorage.setItem('truematch_blocked_users', JSON.stringify(newBlocked));
                    setCards(prev => prev.filter(c => c.id !== reportBlockUser.id));

                    setShowReportReasonModal(false);
                    setShowReportSuccess(true);
                  }}
                  className={cn(
                    "flex-1 font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg",
                    reportReason
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white active:scale-95 shadow-pink-500/15"
                      : "bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed"
                  )}
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Success Modal */}
      <AnimatePresence>
        {showReportSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowReportSuccess(false);
              setReportBlockUser(null);
              setReportReason("");
            }}
            className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-zinc-900 rounded-[2.5rem] border border-white/10 p-6 text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.635 2.407-1.61 3.097a11.95 11.95 0 0 1-1.61 3.097c-.69.975-1.829 1.61-3.097 1.61h-5.366c-1.268 0-2.407-.635-3.097-1.61A11.95 11.95 0 0 1 4.7 15.097C3.725 14.407 3.09 13.268 3.09 12V6.634c0-1.268.635-2.407 1.61-3.097A11.95 11.95 0 0 1 7.8 1.927C8.49.952 9.629.317 10.897.317h5.366c1.268 0 2.407.635 3.097 1.61a11.95 11.95 0 0 1 3.037 3.097c.975.69 1.61 1.829 1.61 3.097V12Z"/></svg>
              </div>
              <h3 className="font-bold text-lg text-white mb-2">Denúncia Enviada!</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">Muito obrigado! Para sua segurança, o perfil foi permanentemente bloqueado e removido do seu app. Nossa equipe de moderação analisará o caso em até 24 horas.</p>
              
              <button
                onClick={() => {
                  setShowReportSuccess(false);
                  setReportBlockUser(null);
                  setReportReason("");
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg shadow-pink-500/10"
              >
                Concluir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
