import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  Star,
  Flame,
  Check,
  Trash2,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { playUiSound } from '../utils/audio';
import { Notification } from '../data/mock';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setExpandedId(expandedId === notification.id ? null : notification.id);
    playUiSound('click');
  };

  const handleAction = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    playUiSound('click');
    if (notification.type === 'message' || notification.type === 'match') {
      navigate('/chat', { state: { userId: notification.user?.id } });
    } else {
      navigate('/matches');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playUiSound('click');
    if (expandedId === id) setExpandedId(null);
    deleteNotification(id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'match':
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'superlike':
        return <Star className="w-4 h-4 text-purple-400 fill-purple-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || !n.isRead;
    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower === '') return matchesFilter;

    const userName = n.user?.name || "Sistema";
    const nameWords = userName.toLowerCase().split(/\s+/);
    const matchesSearch = nameWords.some(word => word.startsWith(searchLower));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-black text-zinc-100 pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
        
        {/* Header Section */}
        <div className="relative flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 transition-colors group cursor-pointer z-10"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
          </button>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Notificações
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-bold border border-pink-500/20">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>

          {unreadCount > 0 ? (
            <button
              onClick={() => {
                playUiSound('click');
                markAllAsRead();
              }}
              className="text-[10px] font-bold text-pink-500 hover:text-pink-400 transition-colors flex items-center gap-1 cursor-pointer z-10 uppercase tracking-wider"
            >
              <Check className="w-3 h-3" />
              Limpar
            </button>
          ) : (
            <div className="w-10" /> /* Spacer to maintain center alignment */
          )}
        </div>

        <div className="text-center pb-2">
          <p className="text-zinc-500 text-[10px] max-w-xs mx-auto leading-relaxed">
            Acompanhe suas curtidas, conexões e mensagens recentes
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por usuário ou mensagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="flex bg-zinc-900/40 border border-zinc-800/80 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                filter === 'all' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                filter === 'unread' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Não Lidas
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => {
              const isExpanded = expandedId === notification.id;
              return (
                <motion.div
                  key={notification.id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "border rounded-xl transition-all overflow-hidden cursor-pointer",
                    notification.isRead 
                      ? "bg-zinc-900/20 border-zinc-800/40 hover:bg-zinc-900/40 hover:border-zinc-800/80" 
                      : "bg-zinc-900/50 border-pink-500/10 shadow-[0_4px_20px_rgba(236,72,153,0.02)] hover:border-pink-500/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Status Dot */}
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                    )}

                    {/* Avatar / Icon Container */}
                    <div className="relative shrink-0">
                      {notification.user ? (
                        <div className="relative">
                          <img
                            src={notification.user.images[0]}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover ring-1 ring-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-950 rounded-full border border-zinc-850 flex items-center justify-center shadow-md">
                            {getIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {notification.user?.name || "Sistema"}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed transition-colors",
                        notification.isRead ? "text-zinc-400" : "text-white font-medium"
                      )}>
                        {notification.content}
                      </p>
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <ChevronRight className={cn(
                      "w-4 h-4 text-zinc-600 transition-transform duration-200 shrink-0",
                      isExpanded && "rotate-90 text-zinc-400"
                    )} />
                  </div>

                  {/* Expanded View */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-zinc-900/40 border-t border-zinc-800/40"
                      >
                        <div className="p-4 space-y-4">
                          {/* Rich metadata depending on type */}
                          {notification.user && (
                            <div className="flex items-start gap-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                              <div className="flex-1 space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 font-semibold text-white">
                                  <span>{notification.user.name}, {notification.user.age} anos</span>
                                  {notification.user.city && (
                                    <span className="text-[10px] text-zinc-500 font-normal">• {notification.user.city}</span>
                                  )}
                                </div>
                                {notification.user.bio && (
                                  <p className="text-zinc-400 leading-relaxed italic">
                                    "{notification.user.bio}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </button>

                            {notification.type !== 'system' && (
                              <button
                                onClick={(e) => handleAction(notification, e)}
                                className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-black/10"
                              >
                                {notification.type === 'message' || notification.type === 'match' ? 'Abrir conversa' : 'Ver perfil'}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="py-16 text-center bg-zinc-900/10 border border-zinc-800/40 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center mx-auto">
                <Inbox className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-300">Nenhuma notificação encontrada</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {searchQuery ? "Nenhum resultado corresponde à sua pesquisa de texto." : "Tudo limpo por aqui! Você está atualizado."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
