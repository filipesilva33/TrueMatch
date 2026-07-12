import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Zap, 
  ChevronRight, 
  Star,
  UserPlus,
  Flame,
  BadgeCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { mockUsers, Notification } from '../data/mock';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { playUiSound } from '../utils/audio';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (unreadCount > 0) {
      playUiSound('notification');
    }
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case 'match': return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />;
      case 'superlike': return <Star className="w-5 h-5 text-purple-500 fill-purple-500" />;
      default: return <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setExpandedId(expandedId === notification.id ? null : notification.id);
  };

  const handleAction = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.type === 'message' || notification.type === 'match') {
      navigate('/chat', { state: { userId: notification.user?.id } });
    } else if (notification.type === 'like' || notification.type === 'superlike') {
      navigate('/matches');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-black pb-32 hide-scrollbar">
      <div className="pt-6 px-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-[20px]">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Atividade</h1>
            <p className="text-zinc-500 text-sm font-bold mt-1 uppercase tracking-widest">Suas notificações</p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-pink-500 transition-colors bg-zinc-900/50 px-3 py-2 rounded-xl border border-white/5"
              >
                Ler tudo
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-zinc-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{unreadCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
        {notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "group relative p-4 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden",
              notification.isRead 
                ? "bg-zinc-900/20 border-white/5 hover:bg-zinc-900/40" 
                : "bg-zinc-900 border-pink-500/20 shadow-lg shadow-pink-500/5 hover:border-pink-500/40"
            )}
          >
            <div className="flex items-start space-x-4">
              <div className="relative shrink-0">
                {notification.user ? (
                  <div className="relative">
                    <img decoding="async" loading="lazy" 
                      src={notification.user.images[0]} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/5"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-900 flex items-center justify-center shadow-lg">
                      {getIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center ring-2 ring-white/5">
                    {getIcon(notification.type)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {notification.timestamp}
                  </span>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  )}
                </div>
                <p className={cn(
                  "text-[15px] leading-snug transition-all duration-300",
                  expandedId === notification.id ? "text-white font-bold" : (notification.isRead ? "text-zinc-400 font-medium line-clamp-2" : "text-white font-bold line-clamp-2")
                )}>
                  {notification.content}
                </p>

                <AnimatePresence>
                  {expandedId === notification.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <div className="h-px w-full bg-white/5 mb-4" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Lido</span>
                        </div>

                        {(notification.type !== 'system') && (
                          <button 
                            onClick={(e) => handleAction(notification, e)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-pink-500 text-white text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                          >
                            <span>Ver Agora</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="self-center">
                <motion.div
                  animate={{ rotate: expandedId === notification.id ? 90 : 0 }}
                >
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-pink-500 transition-colors" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
  );
}
