import React from 'react';
import { Shield, X, BadgeCheck, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function KYCPage() {
  const navigate = useNavigate();
  const handleStartVerification = () => {
    navigate('/profile/settings/kyc/document');
  };

  return (
    <div className="relative h-full w-full bg-black font-sans overflow-hidden">
      <div className="h-full overflow-y-auto pb-40 hide-scrollbar">
      
      {/* Header */}
      <div className="relative flex justify-center items-center px-5 py-6">
        <div className="absolute left-5 w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
          <Shield className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-white font-bold text-[17px] leading-tight">Verificação KYC</span>
          <span className="text-cyan-400 font-black text-[9px] tracking-widest uppercase mt-0.5">Segurança e Confiança</span>
        </div>

        <button 
          onClick={() => navigate('/profile')} 
          className="absolute right-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Illustration */}
      <div className="flex flex-col items-center mt-6 mb-12 px-6">
        <div className="relative w-28 h-28 flex items-center justify-center mb-8">
          <div className="absolute inset-0 border-[1.5px] border-cyan-400 rounded-full"></div>
          <BadgeCheck className="w-[52px] h-[52px] text-black fill-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3 text-center">Selo de Verificação IA</h1>
        <p className="text-zinc-400 text-sm text-center leading-relaxed max-w-[280px]">
          Confirme sua identidade usando nossa IA e garanta segurança total contra fakes.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-[#0a0a0a] rounded-[1.5rem] mx-5 p-7 mb-8 border border-white/[0.03]">
        <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-7 text-center">Por que se verificar?</h3>
        
        <div className="space-y-7">
          {/* Item 1 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="mb-1">
              <Shield className="w-[18px] h-[18px] text-white fill-white" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white mb-1.5">Perfil 100% Protegido</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Evite roubo de identidade ou clonagem do seu perfil.</p>
            </div>
          </div>
          
          {/* Item 2 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="mb-1">
              <Zap className="w-[18px] h-[18px] text-white fill-white" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white mb-1.5">TrueMatch Score Ampliado</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Perfis verificados ganham até 3x mais relevância e matches de alta qualidade.</p>
            </div>
          </div>
          
          {/* Item 3 */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="mb-1">
              <Lock className="w-[18px] h-[18px] text-white fill-white" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white mb-1.5">Criptografia de Ponta</h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Seus documentos são analisados e excluídos imediatamente após a autenticação.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-5 pb-10">
        <button 
          onClick={handleStartVerification}
          className="w-full bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-black py-4 rounded-full text-sm active:scale-95"
        >
          Iniciar Verificação de Identidade
        </button>
      </div>

      </div>



    </div>
  );
}
