import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  UserPlus, 
  Ban, 
  CheckCircle2, 
  Settings, 
  Search,
  MoreVertical,
  Activity,
  CreditCard,
  MessageSquare,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Trash2,
  Heart,
  Crown,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { mockUsers } from '../../data/mock';

interface AdminStats {
  totalUsers: number;
  activeNow: number;
  newToday: number;
  matchesToday: number;
  revenue: string;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [settings, setSettings] = useState([
    { id: 'maintenance', label: 'Sistema em Manutenção', desc: 'Desligar acesso público global', active: false },
    { id: 'registrations', label: 'Permitir Cadastros', desc: 'Ativar fluxo de novos usuários', active: true },
    { id: 'faceid', label: 'FaceID Obrigatório', desc: 'Verificação facial para novos perfis', active: false },
    { id: 'event_mode', label: 'Modo de Evento (GPS)', desc: 'Priorizar matches por proximidade física', active: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    const setting = settings.find(s => s.id === id);
    showToast(`${setting?.label} ${!setting?.active ? 'Ativado' : 'Desativado'}`, 'info');
  };

  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = localStorage.getItem('truematch_admin_session') === 'true';
      if (!isAdmin) {
        navigate('/admin/login');
        return;
      }
      setTimeout(() => setIsLoading(false), 800);
    };
    checkAuth();
  }, [navigate]);

  const stats: AdminStats = {
    totalUsers: 12840,
    activeNow: 452,
    newToday: 124,
    matchesToday: 890,
    revenue: 'R$ 14.250,00'
  };

  const handleLogout = () => {
    localStorage.removeItem('truematch_admin_session');
    navigate('/admin/login');
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
    showToast('Usuário verificado com sucesso!', 'success');
  };

  const handleBanUser = (userId: string) => {
    showToast('Usuário banido da plataforma', 'info');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-pink-500/20 border-t-pink-500 rounded-full mb-4" 
          />
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[8px]">Acesso Autorizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 md:h-20 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 z-[100] px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div>
            <h1 className="font-black uppercase tracking-tighter text-lg md:text-xl leading-none">Matchdeck <span className="text-pink-500">Sistema</span></h1>
            <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Nível de Acesso: Proprietário</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex flex-col items-end mr-1 md:mr-2 text-right">
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">Admin Raiz</span>
            <span className="text-[7px] md:text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-[1px] hidden xs:block">
            <div className="w-full h-full rounded-[11px] md:rounded-[15px] bg-zinc-900 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 md:pt-28 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'overview', label: 'Início', icon: BarChart3 },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'moderation', label: 'Moderação', icon: ShieldAlert },
            { id: 'settings', label: 'Sistema', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap active:scale-95",
                activeTab === tab.id 
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" 
                  : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5"
              )}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Total de Usuários', value: '12.8k', icon: Users, color: 'text-blue-500', trend: '+12%', up: true },
                { label: 'Ativos Agora', value: stats.activeNow, icon: Activity, color: 'text-emerald-500', trend: '+5%', up: true },
                { label: 'Novos Hoje', value: stats.newToday, icon: UserPlus, color: 'text-pink-500', trend: '+18%', up: true },
                { label: 'Receita', value: 'R$ 14k', icon: CreditCard, color: 'text-amber-500', trend: '+24%', up: true },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label} 
                  className="bg-zinc-900/50 border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:border-pink-500/20 transition-all group active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className={cn("w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color.replace('text', 'bg').replace('500', '500/10'))}>
                      <stat.icon className={cn("w-4 h-4 md:w-6 md:h-6", stat.color)} />
                    </div>
                    <div className={cn("flex items-center gap-0.5 md:gap-1 text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-full", stat.up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                      {stat.up ? <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3" /> : <ArrowDownRight className="w-2 h-2 md:w-3 md:h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <h3 className="text-zinc-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 md:mb-1">{stat.label}</h3>
                  <p className="text-lg md:text-2xl font-black truncate">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                      <h2 className="text-base md:text-lg font-black uppercase tracking-tight">Atividade do Sistema</h2>
                      <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Logs em Tempo Real</p>
                    </div>
                    <button className="text-[8px] md:text-[9px] font-black text-pink-500 uppercase tracking-widest hover:underline active:scale-95">Ver Histórico</button>
                  </div>
                  
                  <div className="space-y-5 md:space-y-6">
                    {[
                      { type: 'user', title: 'Novo Registro', desc: 'Carlos Henrique se juntou', time: '2m', icon: UserPlus, color: 'text-blue-500' },
                      { type: 'match', title: 'Novo Match', desc: 'Ana e Roberto deram match!', time: '5m', icon: Heart, color: 'text-pink-500' },
                      { type: 'payment', title: 'Upgrade Gold', desc: 'Beatriz assinou o plano', time: '12m', icon: Crown, color: 'text-amber-500' },
                      { type: 'report', title: 'Denúncia', desc: 'Perfil "Fake123" reportado', time: '20m', icon: ShieldAlert, color: 'text-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-zinc-800 flex items-center justify-center", item.color.replace('text', 'bg').replace('500', '500/10'))}>
                            <item.icon className={cn("w-4 h-4 md:w-5 md:h-5", item.color)} />
                          </div>
                          <div>
                            <h4 className="font-black text-[11px] md:text-sm text-white uppercase tracking-wide group-hover:text-pink-500 transition-colors">{item.title}</h4>
                            <p className="text-[9px] md:text-[11px] text-zinc-500 font-medium truncate max-w-[150px] md:max-w-none">{item.desc}</p>
                          </div>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
                  <h2 className="text-base md:text-lg font-black uppercase tracking-tight mb-5 md:mb-6">Status dos Serviços</h2>
                  <div className="space-y-4 md:space-y-5">
                    {[
                      { label: 'API Principal', status: 'Online', color: 'text-emerald-500' },
                      { label: 'Serviço de Auth', status: 'Online', color: 'text-emerald-500' },
                      { label: 'Nós de Mídia', status: 'Lento', color: 'text-amber-500' },
                      { label: 'Pagamentos', status: 'Online', color: 'text-emerald-500' },
                    ].map(s => (
                      <div key={s.label} className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em]", s.color)}>{s.status}</span>
                          <div className={cn("w-1 h-1 rounded-full animate-pulse", s.color.replace('text', 'bg'))} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 md:mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95">
                    <RefreshCw className="w-3 h-3 md:w-3.5 md:h-3.5" /> Forçar Sincronia
                  </button>
                </div>

                <div className="bg-pink-500/10 border border-pink-500/20 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MessageSquare className="w-16 h-16 text-pink-500 rotate-12" />
                  </div>
                  <h2 className="text-base md:text-lg font-black uppercase tracking-tight text-pink-500 mb-2">Suporte</h2>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-black text-white">12</p>
                    <p className="text-[8px] md:text-[9px] font-black text-pink-500/50 uppercase tracking-widest">Pendentes</p>
                  </div>
                  <button className="w-full mt-5 md:mt-6 py-3 bg-pink-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-pink-500/20 active:scale-95">Responder Agora</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="FILTRAR POR NOME OU ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl md:rounded-2xl py-4 pl-12 pr-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-pink-500/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-3 md:py-4 bg-zinc-900 border border-white/5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest active:scale-95 transition-colors">Filtros</button>
                <button className="flex-1 md:flex-none px-4 py-3 md:py-4 bg-pink-500 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-pink-500/20 active:scale-95 transition-colors">Exportar</button>
              </div>
            </div>

            {/* Responsive User Display */}
            <div className="hidden md:block bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Usuário</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Localização</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden relative border border-white/10">
                            <img src={user.images[0]} className="w-full h-full object-cover" loading="lazy" />
                            {user.verified && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-zinc-950 shadow-xl">
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase tracking-wider">{user.name}, {user.age}</h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ID: #{user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{user.location}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          user.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {user.verified ? 'Verificado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleVerifyUser(user.id)}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/20 transition-all active:scale-95"
                          >
                            <ShieldCheck className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleBanUser(user.id)}
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95"
                          >
                            <Ban className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
                          >
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile User Card List */}
            <div className="md:hidden space-y-4">
              {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                <div key={user.id} className="bg-zinc-900/50 border border-white/5 p-5 rounded-[1.5rem] space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative border border-white/10 shrink-0">
                      <img src={user.images[0]} className="w-full h-full object-cover" />
                      {user.verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-zinc-950">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm uppercase tracking-wider truncate">{user.name}, {user.age}</h4>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ID: #{user.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{user.location}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest",
                          user.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {user.verified ? 'Verificado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleVerifyUser(user.id)}
                      className="flex-1 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-500 active:bg-emerald-500/10 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verificar
                    </button>
                    <button 
                      onClick={() => handleBanUser(user.id)}
                      className="flex-1 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 active:bg-red-500/10 transition-all"
                    >
                      <Ban className="w-4 h-4" /> Banir
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-6 md:mb-8">Denúncias Ativas</h3>
              <div className="space-y-4 md:space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 md:p-6 bg-black/40 border border-white/5 rounded-[1.2rem] md:rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-800 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white truncate">Usuário #{i}29</h4>
                          <p className="text-[8px] md:text-[9px] font-bold text-red-500 uppercase tracking-[0.2em] mt-0.5 truncate">Violência Verbal</p>
                        </div>
                      </div>
                      <span className="text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest">15m</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 md:py-3 bg-red-500 text-white rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] active:scale-95 shadow-lg shadow-red-500/20">Banir</button>
                      <button className="flex-1 py-2.5 md:py-3 bg-white/5 text-zinc-400 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] active:bg-white/10">Ignorar</button>
                      <button className="w-10 md:w-12 py-2.5 md:py-3 bg-white/5 text-zinc-400 rounded-lg md:rounded-xl flex items-center justify-center active:scale-95"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-5 md:mb-6">Filtro Global</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['spam', 'abuso', 'bot', 'fake'].map(word => (
                    <span key={word} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {word} <Trash2 className="w-3 h-3 text-red-500 cursor-pointer" />
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="PALAVRAS-CHAVE..."
                    className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-pink-500/30"
                  />
                  <button className="px-4 md:px-6 py-3 bg-pink-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] active:scale-95">ADD</button>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                  <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-amber-500">Defesa Automática</h3>
                </div>
                <p className="text-[10px] md:text-[11px] text-zinc-400 font-medium leading-relaxed mb-5 md:mb-6">
                  IA de defesa operando em <span className="text-amber-500 font-black">ALERTA MÁXIMO</span>. 
                </p>
                <button className="w-full py-3 md:py-4 bg-amber-500 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-amber-500/20 active:scale-95">Configurar Heurística</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-6 md:mb-8">Configurações Gerais</h3>
              <div className="space-y-6 md:space-y-8">
                {settings.map(s => (
                  <div key={s.id} className="flex justify-between items-center group">
                    <div className="max-w-[70%]">
                      <h4 className="font-black text-xs md:text-sm uppercase tracking-wide group-hover:text-pink-500 transition-colors">{s.label}</h4>
                      <p className="text-[9px] md:text-[11px] text-zinc-500 mt-0.5 md:mt-1">{s.desc}</p>
                    </div>
                    <button 
                      onClick={() => toggleSetting(s.id)}
                      className={cn(
                        "w-12 h-6 md:w-14 md:h-8 rounded-full relative transition-all duration-500 shrink-0 active:scale-90",
                        s.active ? "bg-emerald-500" : "bg-zinc-800"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 md:top-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white shadow-lg transition-all duration-500",
                        s.active ? "right-0.5 md:right-1" : "left-0.5 md:left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8">
              <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-red-500 mb-3 md:mb-4">Zona de Perigo</h3>
              <p className="text-[10px] md:text-[11px] text-zinc-500 font-medium mb-5 md:mb-6">Procedimentos de reset total e limpeza de infraestrutura.</p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button className="flex-1 md:flex-none px-5 py-3.5 md:py-4 bg-white/5 border border-red-500/20 text-red-500 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-red-500 hover:text-white transition-all active:scale-95">Limpar Cache</button>
                <button className="flex-1 md:flex-none px-5 py-3.5 md:py-4 bg-white/5 border border-red-500/20 text-red-500 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-red-500 hover:text-white transition-all active:scale-95">Reiniciar Core</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-0 right-0 z-[300] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className={cn(
              "px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-[280px] transition-all",
              toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-900/90 border-white/10 text-zinc-300"
            )}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
