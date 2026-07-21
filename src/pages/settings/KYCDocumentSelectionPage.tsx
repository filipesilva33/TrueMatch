import React, { useState } from 'react';
import { ArrowLeft, X, Car, IdCard, Plane, Circle, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function KYCDocumentSelectionPage() {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<string>('cnh');

  const documents = [
    {
      id: 'cnh',
      title: 'CNH (Carteira de Motorista)',
      description: 'Ideal para verificação rápida por QR Code integrado',
      icon: Car
    },
    {
      id: 'rg',
      title: 'RG (Registro Geral)',
      description: 'Documento de identidade nacional padrão',
      icon: IdCard
    },
    {
      id: 'passaporte',
      title: 'Passaporte Oficial',
      description: 'Recomendado para verificação internacional',
      icon: Plane
    }
  ];

  return (
    <div className="relative h-full w-full bg-black font-sans overflow-hidden text-white">
      <div className="h-full overflow-y-auto pb-40 hide-scrollbar">
      
        {/* Header */}
        <div className="relative flex justify-center items-center px-5 py-6">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-[17px] leading-tight">Verificação KYC</span>
            <span className="text-cyan-400 font-black text-[9px] tracking-widest uppercase mt-0.5">Passo 1: Documento</span>
          </div>

          <button 
            onClick={() => navigate('/profile')} 
            className="absolute right-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 mt-4">
          <h2 className="text-2xl font-bold mb-4 leading-tight">Escolha o documento que<br/>deseja usar para validação</h2>
          <p className="text-zinc-400 text-[13px] mb-8 leading-relaxed">
            Certifique-se de que o documento selecionado está em mãos, válido e dentro do prazo de vencimento.
          </p>

          <div className="space-y-4">
            {documents.map((doc) => {
              const isSelected = selectedDoc === doc.id;
              
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={`w-full bg-[#0a0a0a] rounded-[1.5rem] p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] border ${
                    isSelected ? 'border-cyan-400 bg-[#0a0a0a]' : 'border-white/[0.03] hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-900/80 flex items-center justify-center shrink-0">
                    <doc.icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-white'}`} />
                  </div>
                  <div className="flex flex-col items-start flex-1 text-left">
                    <span className="font-bold text-[15px] text-white mb-1">{doc.title}</span>
                    <span className="text-[12px] text-zinc-500 leading-snug">{doc.description}</span>
                  </div>
                  <div className="pl-2">
                    {isSelected ? (
                      <CircleDot className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-[80px] left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent pointer-events-none z-40">
        <div className="pointer-events-auto">
          <button 
            onClick={() => {
              navigate('/profile/settings/kyc/camera'); 
            }}
            className="w-full bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-black py-4 rounded-full text-sm active:scale-95"
          >
            Continuar para Câmera
          </button>
        </div>
      </div>
    </div>
  );
}
