import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ChevronLeft, BadgeCheck, Lock, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function KYCPage() {
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-black text-white tracking-tight">Verificação KYC</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Nível 3 • Ativo</p>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-[2.5rem] p-8 border border-white/5 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Identidade Verificada</h2>
            <p className="text-zinc-500 text-sm mb-6">Sua conta possui o selo de autenticidade máxima do Matchdeck.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <BadgeCheck className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Documento</span>
                <p className="text-xs font-bold text-white mt-1">Confirmado</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <Sparkles className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Biometria</span>
                <p className="text-xs font-bold text-white mt-1">Aprovado</p>
              </div>
            </div>
          </motion.div>

          <div className="bg-zinc-900/50 rounded-[2.5rem] p-8 border border-white/5">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 px-2">Vantagens do Nível 3</h3>
            <div className="space-y-4">
              {[
                { icon: Lock, title: 'Maior Segurança', desc: 'Sua conta é protegida por criptografia de nível militar.' },
                { icon: ShieldAlert, title: 'Suporte Prioritário', desc: 'Atendimento em menos de 5 minutos.' },
                { icon: BadgeCheck, title: 'Selo de Verificado', desc: 'Destaque visual em todos os feeds.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
