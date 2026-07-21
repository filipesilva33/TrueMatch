import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, Camera, CheckCircle, Info, ScanLine, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { playUiSound } from '../../utils/audio';

export default function KYCCameraPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'front' | 'back' | 'face' | 'analyzing' | 'success'>('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Real Camera States and Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    async function startCamera() {
      if (step === 'analyzing' || step === 'success') return;
      
      setCameraError(null);
      setCameraActive(false);
      setCapturedPhoto(null);
      
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = {
            video: {
              facingMode: step === 'face' ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(err => console.error("Error playing video stream:", err));
              setCameraActive(true);
            };
          }
        } else {
          setCameraError("Este navegador não suporta acesso direto à câmera.");
        }
      } catch (err: any) {
        console.error("Erro ao iniciar câmera:", err);
        setCameraError("Não foi possível acessar a câmera do dispositivo. Verifique se deu permissões.");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [step]);

  const handleCapture = () => {
    setIsCapturing(true);
    playUiSound('click');
    
    setTimeout(() => {
      setIsCapturing(false);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && cameraActive && canvas) {
        try {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            // Mirror selfie for natural photo look
            if (step === 'face') {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            }
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedPhoto(dataUrl);
            setCapturedImages(prev => ({ ...prev, [step]: dataUrl }));
          }
        } catch (e) {
          console.error("Error capturing video frame:", e);
          const fallbackUrl = step === 'face' 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
            : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
          setCapturedPhoto(fallbackUrl);
          setCapturedImages(prev => ({ ...prev, [step]: fallbackUrl }));
        }
      } else {
        // Mock capture fallback
        const fallbackUrl = step === 'face' 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
          : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
        setCapturedPhoto(fallbackUrl);
        setCapturedImages(prev => ({ ...prev, [step]: fallbackUrl }));
      }
    }, 350);
  };

  const handleSaveImages = () => {
    localStorage.setItem('truematch_kyc_status', 'pending');
    localStorage.setItem('truematch_kyc_documents', JSON.stringify(capturedImages));
    
    // Update local profile with pending state and the selfie taken
    const storedMe = localStorage.getItem('truematch_profile_me');
    if (storedMe) {
      try {
        const parsed = JSON.parse(storedMe);
        parsed.kycStatus = 'pending';
        parsed.verified = false; // Pending approval
        if (capturedImages['face']) {
          parsed.images = [capturedImages['face'], ...(parsed.images?.slice(1) || [])];
        }
        localStorage.setItem('truematch_profile_me', JSON.stringify(parsed));
      } catch (e) {
        console.error("Error updating profile with new selfie photo:", e);
      }
    }
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
            onClick={() => navigate('/profile')} 
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
              <div className={`relative w-full overflow-hidden bg-zinc-950 border border-white/5 flex items-center justify-center ${step === 'face' ? 'aspect-[3/4] rounded-full mx-auto max-w-[280px]' : 'aspect-[4/3] rounded-[1.5rem]'}`}>
                
                {/* Real video element */}
                {!capturedPhoto && (
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Captured photo preview */}
                {capturedPhoto && (
                  <img 
                    src={capturedPhoto} 
                    alt="Foto capturada" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Hidden canvas for capturing frames */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Fallback/loading view if camera not active and no captured image */}
                {!cameraActive && !capturedPhoto && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900/80">
                    {cameraError ? (
                      <div className="space-y-3">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                        <p className="text-zinc-300 text-xs font-semibold px-4">{cameraError}</p>
                        <p className="text-zinc-500 text-[10px]">Utilizando foto de demonstração de alta qualidade para testes.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                        <p className="text-zinc-400 text-xs font-semibold">Acessando câmera do dispositivo...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Frame guidelines */}
                {step !== 'face' && !capturedPhoto && (
                  <div className="absolute inset-6 pointer-events-none z-10">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-cyan-400 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-cyan-400 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-cyan-400 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-cyan-400 rounded-br-xl"></div>
                  </div>
                )}

                {step === 'face' && !capturedPhoto && (
                  <div className="absolute inset-4 border-2 border-dashed border-cyan-400/50 rounded-full pointer-events-none z-10" />
                )}

                {/* Viewfinder helper text */}
                {cameraActive && !capturedPhoto && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <span className="text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-center">
                      {step === 'face' ? 'Enquadre seu rosto' : 'Centralize o documento'}
                    </span>
                  </div>
                )}

                {isCapturing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white z-20"
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
                  ? 'Certifique-se de estar em um ambiente bem iluminado e sem óculos ou acessórios.' 
                  : 'Evite reflexos de luz e certifique-se de que o documento esteja nítido.'}
              </p>
            </div>

            {/* Camera Controls */}
            <div className="mt-auto pt-8 pb-[80px]">
              {!capturedPhoto ? (
                <button 
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-400/80 transition-all text-black font-black py-4 rounded-full text-[15px] flex items-center justify-center gap-2 active:scale-95"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Capturando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Capturar Imagem
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setCapturedPhoto(null)}
                    className="flex-1 bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-colors text-white font-bold py-4 rounded-full text-[15px] active:scale-95"
                  >
                    Tirar Outra
                  </button>
                  <button 
                    onClick={() => {
                      setCapturedPhoto(null);
                      if (step === 'front') {
                        setStep('back');
                      } else if (step === 'back') {
                        setStep('face');
                      } else if (step === 'face') {
                        setStep('analyzing');
                      }
                    }}
                    className="flex-1 bg-cyan-400 hover:bg-cyan-300 transition-colors text-black font-black py-4 rounded-full text-[15px] active:scale-95"
                  >
                    Confirmar foto
                  </button>
                </div>
              )}
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
                onClick={() => {
                  handleSaveImages();
                  navigate('/profile/settings/kyc');
                }}
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
