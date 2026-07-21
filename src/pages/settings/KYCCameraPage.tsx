import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Camera, CheckCircle, Info, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function KYCCameraPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'front' | 'back' | 'face' | 'analyzing' | 'success'>('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleCapture = () => {
    setIsCapturing(true);
    
    // Simulate capture delay
    setTimeout(() => {
      setIsCapturing(false);
      
      if (step === 'front') {
        setStep('back');
      } else if (step === 'back') {
        setStep('face');
      } else if (step === 'face') {
        setStep('analyzing');
      }
    }, 800);
  };

  useEffect(() => {
    if (step === 'analyzing') {
      const delays = [1200, 1800, 1500, 1800, 2000, 1500, 1000];
      let currentStep = 0;
      let timer: NodeJS.Timeout;

      const nextStep = () => {
        if (currentStep < delays.length) {
          setAnalysisStep(currentStep);
          timer = setTimeout(nextStep, delays[currentStep]);
          currentStep++;
        } else {
          setStep('success');
        }
      };

      timer = setTimeout(nextStep, 600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const stepTitle = step === 'front' 
    ? 'PASSO 2: FRENTE DO DOCUMENTO'
    : step === 'back'
      ? 'PASSO 3: VERSO DO DOCUMENTO'
      : step === 'face'
        ? 'PASSO 4: RECONHECIMENTO FACIAL'
        : 'PASSO 5: ANÁLISE';

  const instructionTitle = step === 'front'
    ? 'Tire foto da FRENTE do documento'
    : step === 'back'
      ? 'Tire foto do VERSO do documento'
      : step === 'face'
        ? 'Faça uma selfie do seu rosto'
        : 'Analisando a qualidade das imagens...';

  const instructionSubtitle = step === 'front'
    ? 'Posicione a parte frontal do seu CNH (Motorista) no retângulo abaixo'
    : step === 'back'
      ? 'Posicione a parte de trás do seu CNH (Motorista) no retângulo abaixo'
      : step === 'face'
        ? 'Posicione seu rosto no centro da tela e olhe diretamente para a câmera'
        : '';

  return (
    <div className="relative h-full w-full bg-black font-sans overflow-hidden text-white flex flex-col">
      {/* Header */}
      <div className="relative flex justify-center items-center px-5 py-6 shrink-0 z-10">
        {step !== 'success' && step !== 'analyzing' && (
          <button 
            onClick={() => {
              if (step === 'back') setStep('front');
              else navigate(-1);
            }} 
            className="absolute left-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex flex-col items-center">
          <span className="text-white font-bold text-[17px] leading-tight">Verificação KYC</span>
          <span className="text-cyan-400 font-black text-[9px] tracking-widest uppercase mt-0.5">{stepTitle}</span>
        </div>

        {step !== 'success' && step !== 'analyzing' && (
          <button 
            onClick={() => navigate('/profile/settings/kyc')} 
            className="absolute right-5 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(step === 'front' || step === 'back' || step === 'face') && (
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-5 overflow-y-auto hide-scrollbar"
          >
            <div className="mt-2 shrink-0 text-center">
              <h2 className="text-[19px] font-bold mb-3">
                {instructionTitle}
              </h2>
              <p className="text-zinc-400 text-[13px] max-w-[280px] mx-auto leading-relaxed">
                {instructionSubtitle}
              </p>
            </div>

            {/* Camera Viewfinder */}
            <div className="mt-8 mb-6">
              <div className={`relative w-full overflow-hidden bg-[#0a0a0a] border border-white/[0.03] flex items-center justify-center ${step === 'face' ? 'aspect-[3/4] rounded-full mx-auto max-w-[280px]' : 'aspect-[4/3] rounded-[1.5rem]'}`}>
                
                {/* Frame guidelines */}
                {step !== 'face' && (
                  <div className="absolute inset-6">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-cyan-400 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-cyan-400 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-cyan-400 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-cyan-400 rounded-br-xl"></div>
                  </div>
                )}

                {step === 'face' && (
                  <div className="absolute inset-4 border-2 border-dashed border-cyan-400/50 rounded-full" />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {step === 'face' ? (
                     <Camera className="w-12 h-12 text-zinc-700 mb-6" />
                  ) : (
                     <ScanLine className="w-12 h-12 text-zinc-700 mb-6" />
                  )}
                  <span className="text-zinc-700 text-xs font-medium px-4 py-1.5 rounded-full bg-zinc-900/50 backdrop-blur-sm text-center">
                    {step === 'face' ? 'Enquadre seu rosto' : 'Posicione o documento na moldura'}
                  </span>
                </div>

                {isCapturing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white"
                  />
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#0a0a0a] border border-white/[0.03] rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                {step === 'face' 
                  ? 'Certifique-se de estar em um ambiente bem iluminado e sem acessórios (óculos escuros, chapéu).' 
                  : 'Evite reflexos e certifique-se de que o texto está legível.'}
              </p>
            </div>

            {/* Camera Controls */}
            <div className="mt-auto pt-8 pb-[80px]">
              <button 
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-400/80 transition-all text-black font-black py-4 rounded-full text-[15px] flex items-center justify-center gap-2 active:scale-95"
              >
                {isCapturing ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    Capturando...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Capturar Imagem
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 pb-20"
          >
            <div className="relative w-24 h-24 flex items-center justify-center mb-10">
              <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full"
              />
              <ScanLine className="w-8 h-8 text-cyan-400" />
            </div>
            
            <h2 className="text-xl font-bold mb-8 text-center">Análise de Autenticidade</h2>
            
            <div className="w-full max-w-[300px] space-y-4">
              {[
                'Verificando nitidez e brilho...',
                'Procurando hologramas e marcas de segurança...',
                'Checando fontes e formatação do documento...',
                'Verificando integridade física (Real ou Fake)...',
                'Analisando biometria facial...',
                'Cruzando rosto com documento...',
                'Consultando bancos oficiais...'
              ].map((text, idx) => (
                <div key={idx} className={`flex items-center gap-3 transition-all duration-300 ${analysisStep >= idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {analysisStep > idx ? (
                    <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                  ) : analysisStep === idx ? (
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700 shrink-0" />
                  )}
                  <span className={`text-[13px] font-medium ${analysisStep >= idx ? 'text-white' : 'text-zinc-500'}`}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col px-6 pt-20 pb-12"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-cyan-400/20 flex items-center justify-center mb-8">
                <CheckCircle className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Imagens Recebidas</h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px]">
                Seus documentos foram enviados para análise. O processo de verificação KYC leva de 5 a 15 minutos.
              </p>
            </div>
            
            <div className="w-full pb-8">
              <button 
                onClick={() => navigate('/profile/settings/kyc')}
                className="w-full bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-black py-4 rounded-full text-[15px] active:scale-95"
              >
                Concluir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
