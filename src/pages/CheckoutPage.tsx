import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Crown, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Star
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { mockUsers } from "../data/mock";
import { playUiSound } from "../utils/audio";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to parse return path from state or fallback to profile
  const returnPath = (location.state as any)?.from || "/profile";

  // Load user
  const [me, setMe] = useState(() => {
    const stored = localStorage.getItem("truematch_profile_me");
    if (stored) {
      try {
        return { ...mockUsers[0], ...JSON.parse(stored) };
      } catch (e) {
        // Fallback below
      }
    }
    return mockUsers[0];
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMe(data);
            localStorage.setItem("truematch_profile_me", JSON.stringify(data));
          }
        } catch (err) {
          console.error("Error fetching profile from Firestore:", err);
        }
      }
    };
    fetchProfile();
  }, []);

  const [step, setStep] = useState<"method" | "input" | "processing" | "success">("method");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix" | "boleto">("card");
  
  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardBrand, setCardBrand] = useState<"visa" | "mastercard" | "elo" | "unknown">("unknown");
  
  // Form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // PIX states
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimer, setPixTimer] = useState(300); // 5 minutes
  
  // Processing loading phases
  const [loadingPhase, setLoadingPhase] = useState("");
  
  const planName = "TrueMatch Gold";
  const price = "R$ 19,90";

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    
    // Detect Brand
    if (value.startsWith("4")) {
      setCardBrand("visa");
    } else if (value.startsWith("5")) {
      setCardBrand("mastercard");
    } else if (value.startsWith("6")) {
      setCardBrand("elo");
    } else {
      setCardBrand("unknown");
    }
    
    // Add spaces
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
    
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: "" }));
    }
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2), 10);
      if (month > 12) value = "12" + value.slice(2);
      setCardExpiry(value.slice(0, 2) + "/" + value.slice(2));
    } else {
      setCardExpiry(value);
    }
    
    if (errors.cardExpiry) {
      setErrors(prev => ({ ...prev, cardExpiry: "" }));
    }
  };

  // Format CVV
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
    
    if (errors.cardCvv) {
      setErrors(prev => ({ ...prev, cardCvv: "" }));
    }
  };

  // Format Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCardName(value);
    if (errors.cardName) {
      setErrors(prev => ({ ...prev, cardName: "" }));
    }
  };

  // PIX Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === "input" && paymentMethod === "pix" && pixTimer > 0) {
      interval = setInterval(() => {
        setPixTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, pixTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Copy PIX Code
  const copyPixCode = () => {
    const fakePixCode = "00020101021226870014BR.GOV.BCB.PIX2565truematchpayments0139f76a59bc-d9ee-47b8-89c0-9f5b6cae13ef520400005303986540519.905802BR5915TrueMatch Inc6009Sao Paulo62070503***6304CA1F";
    navigator.clipboard.writeText(fakePixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Validation
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (paymentMethod === "card") {
      const cleanNum = cardNumber.replace(/\s/g, "");
      if (cleanNum.length < 16) {
        tempErrors.cardNumber = "Número de cartão inválido (requer 16 dígitos)";
      }
      if (!cardName.trim()) {
        tempErrors.cardName = "Nome impresso é obrigatório";
      }
      if (cardExpiry.length < 5) {
        tempErrors.cardExpiry = "Validade inválida (MM/AA)";
      } else {
        const [month] = cardExpiry.split("/").map(Number);
        if (month < 1 || month > 12) {
          tempErrors.cardExpiry = "Mês inválido";
        }
      }
      if (cardCvv.length < 3) {
        tempErrors.cardCvv = "CVV inválido (3 dígitos)";
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Start processing simulation
  const handleProceedToPayment = () => {
    if (paymentMethod === "card") {
      if (!validateForm()) return;
    }
    
    setStep("processing");
    
    const phases = [
      "Conectando ao gateway de pagamento seguro...",
      "Criptografando dados de transação (AES-256)...",
      "Autenticando transação com 3D Secure...",
      "Processando com a adquirente de cartões...",
      "Aprovando assinatura e liberando recursos premium..."
    ];
    
    let currentPhaseIdx = 0;
    setLoadingPhase(phases[0]);
    
    const interval = setInterval(() => {
      currentPhaseIdx++;
      if (currentPhaseIdx < phases.length) {
        setLoadingPhase(phases[currentPhaseIdx]);
      } else {
        clearInterval(interval);
        
        // Save state to local storage
        const updatedMe = { ...me, isGold: true };
        
        const user = auth.currentUser;
        if (user) {
          const txId = `tx_${Date.now()}`;
          const transactionDoc = {
            id: txId,
            userId: user.uid,
            planName: "TrueMatch Gold",
            price: "R$ 19,90",
            paymentMethod: paymentMethod,
            timestamp: new Date().toISOString(),
            status: "approved"
          };
          
          setDoc(doc(db, "users", user.uid), updatedMe)
            .then(() => {
              return setDoc(doc(db, "users", user.uid, "transactions", txId), transactionDoc);
            })
            .catch(err => {
              console.error("Error writing transaction/profile update to Firestore:", err);
            });
        }

        localStorage.setItem("truematch_profile_me", JSON.stringify(updatedMe));
        setMe(updatedMe);
        
        playUiSound('gold_unlock');
        setStep("success");
      }
    }, 1200);
  };

  const handleFinishSuccess = () => {
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-black">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors group rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao TrueMatch
          </button>
          
          <div className="flex items-center gap-1.5 font-black text-sm tracking-widest text-zinc-100">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">TRUEMATCH</span>
            <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold uppercase tracking-wider">CHECKOUT</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-xs text-emerald-500 font-extrabold tracking-widest">
            <ShieldCheck className="w-4 h-4" /> SSL CRIPTOGRAFADO
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDE: Plan details & features (Responsive 5 Cols on Desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pr-4">
            <div className="space-y-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5 fill-amber-500/20" /> MEMBRO GOLD ATIVO
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase">
                  Desbloqueie o <br />
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">TrueMatch Gold</span>
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Conecte-se em um nível mais profundo. Tenha acesso a todos os recursos de IA, descubra quem te curtiu e encontre conexões autênticas sem barreiras.
                </p>
              </div>

              {/* Bento Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3.5 text-left">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
                    <Crown className="w-5 h-5 fill-amber-500/10" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest">Ver Quem te Curtiu</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">Chega de suspense. Saiba exatamente quem deu like no seu perfil e inicie uma conversa imediata.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3.5 text-left">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest">Filtros IA Ilimitados</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">Filtre por valores pessoais, religião, posicionamento e traços de personalidade refinados.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-start gap-3.5 text-left">
                  <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400 shrink-0">
                    <Star className="w-5 h-5 fill-pink-500/10" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-pink-300 uppercase tracking-widest">Super Likes & Mensagens Diárias</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">Destaque-se na fila de likes e converse livremente com perfis altamente compatíveis.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial or Trust indicator */}
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Sophia" className="w-7 h-7 rounded-full border border-zinc-950 object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Marcus" className="w-7 h-7 rounded-full border border-zinc-950 object-cover" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal max-w-[200px]">
                  Mais de <span className="text-zinc-300 font-bold">12.500 matches</span> realizados com sucesso nesta semana no Brasil.
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Payment Gateway forms (Responsive 7 Cols on Desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              {/* SSL Banner overlay inside the card */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
              
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                <div className="text-left">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">Checkout Seguro</span>
                  <h2 className="text-sm md:text-base font-extrabold text-white mt-0.5 tracking-tight uppercase">Resumo e Pagamento</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Total da Assinatura</span>
                  <span className="text-xl md:text-2xl font-black text-white block">{price}</span>
                </div>
              </div>

              {/* State Machine screens */}
              <AnimatePresence mode="wait">
                
                {/* Method selection */}
                {step === "method" && (
                  <motion.div
                    key="method-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Selected Plan Summary card */}
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shrink-0">
                          <Crown className="w-5 h-5 fill-amber-500/10" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-zinc-200 block">{planName} Premium</span>
                          <span className="text-[10px] text-zinc-500 block">Cobrança única e segura via Stripe Gateway</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-black text-white block">{price}</span>
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">Economia 40%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selecione o método de pagamento</label>
                      
                      {/* Cartao */}
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                          paymentMethod === "card"
                            ? "bg-amber-500/5 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)] text-white"
                            : "bg-zinc-950/40 border-white/5 hover:border-zinc-800 text-zinc-400"
                        )}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            paymentMethod === "card" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800/80 text-zinc-500"
                          )}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-zinc-100 block">Cartão de Crédito</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">Parcele em até 12x. Aprovação e liberação imediata.</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          paymentMethod === "card" ? "border-amber-400 bg-amber-400/20" : "border-zinc-700"
                        )}>
                          {paymentMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </button>

                      {/* Pix */}
                      <button
                        onClick={() => setPaymentMethod("pix")}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                          paymentMethod === "pix"
                            ? "bg-amber-500/5 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)] text-white"
                            : "bg-zinc-950/40 border-white/5 hover:border-zinc-800 text-zinc-400"
                        )}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            paymentMethod === "pix" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800/80 text-zinc-500"
                          )}>
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-zinc-100 block">PIX (Mais rápido e seguro)</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">Aprovação em segundos com código copia e cola ou QR Code.</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          paymentMethod === "pix" ? "border-amber-400 bg-amber-400/20" : "border-zinc-700"
                        )}>
                          {paymentMethod === "pix" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </button>

                      {/* Boleto */}
                      <button
                        onClick={() => setPaymentMethod("boleto")}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                          paymentMethod === "boleto"
                            ? "bg-amber-500/5 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)] text-white"
                            : "bg-zinc-950/40 border-white/5 hover:border-zinc-800 text-zinc-400"
                        )}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            paymentMethod === "boleto" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800/80 text-zinc-500"
                          )}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-zinc-100 block">Boleto Bancário</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">Aprovação em até 1 dia útil após compensação bancária.</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          paymentMethod === "boleto" ? "border-amber-400 bg-amber-400/20" : "border-zinc-700"
                        )}>
                          {paymentMethod === "boleto" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </button>
                    </div>

                    {/* Bottom Security Seals */}
                    <div className="pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold">
                      <span className="flex items-center gap-1.5 text-emerald-500">
                        <Lock className="w-4 h-4" /> SSL 256-BIT
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-zinc-500" /> COMPRA 100% GARANTIDA
                      </span>
                    </div>

                    {/* Next Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => navigate(returnPath)}
                        className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white font-bold py-3.5 px-4 rounded-xl active:scale-98 transition-all text-xs uppercase tracking-wider text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => setStep("input")}
                        className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        Prosseguir <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Form input details */}
                {step === "input" && (
                  <motion.div
                    key="input-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* IF CREDIT CARD FORM */}
                    {paymentMethod === "card" && (
                      <div className="space-y-6">
                        {/* Interactive Responsive Card graphic */}
                        <div className="w-full aspect-[1.58/1] max-w-sm mx-auto rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-amber-500/15 p-5 border border-zinc-800 relative overflow-hidden flex flex-col justify-between shadow-xl">
                          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                          
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col">
                              <Crown className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mt-1.5">TrueMatch Gold Member</span>
                            </div>
                            <div className="text-right">
                              {cardBrand === "visa" && <span className="font-black italic text-lg text-white">VISA</span>}
                              {cardBrand === "mastercard" && <span className="font-black italic text-lg text-zinc-300">MasterCard</span>}
                              {cardBrand === "elo" && <span className="font-black italic text-lg text-amber-400">Elo</span>}
                              {cardBrand === "unknown" && <CreditCard className="w-5 h-5 text-zinc-600" />}
                            </div>
                          </div>

                          <div className="space-y-4 relative z-10">
                            {/* Card digits */}
                            <div className="text-lg md:text-xl font-mono tracking-[0.18em] text-zinc-100 text-center py-1">
                              {cardNumber || "•••• •••• •••• ••••"}
                            </div>

                            {/* Card Holder & expiration */}
                            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                              <div className="truncate max-w-[190px]">
                                <span className="text-[7px] text-zinc-600 block leading-none">Titular do Cartão</span>
                                <span className="text-zinc-300 font-bold block truncate mt-1">{cardName || "NOME DO TITULAR"}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[7px] text-zinc-600 block leading-none">Expiração</span>
                                <span className="text-zinc-300 font-bold block mt-1">{cardExpiry || "MM/AA"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Text form inputs */}
                        <div className="space-y-4">
                          {/* Name on Card */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Nome Completo do Titular (Como no cartão)</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={handleNameChange}
                              placeholder="EX: FILIPE S SILVA"
                              className={cn(
                                "w-full bg-zinc-950 border text-xs font-bold px-3.5 py-3 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors uppercase",
                                errors.cardName ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"
                              )}
                            />
                            {errors.cardName && (
                              <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.cardName}
                              </span>
                            )}
                          </div>

                          {/* Card number */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Número de Cartão de Crédito</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4000 1234 5678 9010"
                                className={cn(
                                  "w-full bg-zinc-950 border text-xs font-bold pl-3.5 pr-10 py-3 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                                  errors.cardNumber ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"
                                )}
                              />
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                                <CreditCard className="w-4 h-4" />
                              </div>
                            </div>
                            {errors.cardNumber && (
                              <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans mt-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.cardNumber}
                              </span>
                            )}
                          </div>

                          {/* Expiry / CVV Row */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Validade</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                placeholder="MM/AA"
                                className={cn(
                                  "w-full bg-zinc-950 border text-xs font-bold px-3.5 py-3 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                                  errors.cardExpiry ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"
                                )}
                              />
                              {errors.cardExpiry && (
                                <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans mt-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> {errors.cardExpiry}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Código CVV</label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={handleCvvChange}
                                placeholder="123"
                                className={cn(
                                  "w-full bg-zinc-950 border text-xs font-bold px-3.5 py-3 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                                  errors.cardCvv ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"
                                )}
                              />
                              {errors.cardCvv && (
                                <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans mt-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> {errors.cardCvv}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IF PIX QR CODE & CODE COPY */}
                    {paymentMethod === "pix" && (
                      <div className="space-y-6 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-3xl border-2 border-amber-500/40 relative shadow-2xl flex flex-col items-center max-w-[220px] w-full">
                          {/* Scanning visual effect bar */}
                          <div className="absolute left-4 right-4 top-4 h-[2px] bg-amber-500 opacity-80 animate-pulse rounded-full shadow-[0_0_12px_rgba(245,158,11,1)]" style={{
                            animation: "bounce 2s infinite"
                          }} />
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226870014BR.GOV.BCB.PIX2565truematchpayments0139f76a59bc-d9ee-47b8-89c0-9f5b6cae13ef520400005303986540519.905802BR5915TrueMatch Inc6009Sao Paulo62070503***6304CA1F" 
                            alt="PIX QR Code"
                            referrerPolicy="no-referrer"
                            className="w-44 h-44 object-contain rounded-2xl select-none"
                          />
                        </div>

                        <div className="text-center space-y-1 max-w-sm">
                          <span className="text-xs text-zinc-400 block leading-relaxed">
                            Escaneie o código QR acima no aplicativo do seu banco ou utilize o código Copia e Cola abaixo.
                          </span>
                          <span className="text-xs font-black text-amber-400 font-mono tracking-wider bg-amber-500/10 px-3.5 py-1.5 rounded-full inline-block mt-2">
                            O Código expira em: {formatTimer(pixTimer)}
                          </span>
                        </div>

                        {/* Copia e Cola Box */}
                        <button
                          onClick={copyPixCode}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300",
                            pixCopied 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                              : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                          )}
                        >
                          <div className="truncate pr-4 flex-1">
                            <span className="text-[8px] font-black uppercase tracking-wider block text-zinc-500">PIX Copia e Cola</span>
                            <span className="text-[11px] font-mono truncate block mt-1">
                              00020101021226870014BR.GOV.BCB.PIX2565truematchpayments0139f76a59bc-d9ee-47b8-89c0-9f5b6cae13ef520400005303986540519.905802BR5915TrueMatch Inc6009...
                            </span>
                          </div>
                          <div className="p-2.5 bg-zinc-850 rounded-xl shrink-0">
                            {pixCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                          </div>
                        </button>
                        
                        <div className="flex items-start gap-3 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850 w-full text-left">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            O sistema identifica o Pix em tempo real. Assim que o pagamento for concluído, esta tela será redirecionada automaticamente para a confirmação de membro Gold.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* IF BOLETO BANK BILL */}
                    {paymentMethod === "boleto" && (
                      <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4.5 h-4.5 text-zinc-400" />
                              <span className="text-xs font-bold text-zinc-200">Boleto Prontinho para Pagamento</span>
                            </div>
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">PDF Disponível</span>
                          </div>

                          {/* Visual barcode mockup */}
                          <div className="bg-white p-4 rounded-xl flex flex-col items-center space-y-2 select-none">
                            <div className="w-full h-10 flex justify-between overflow-hidden opacity-90">
                              {Array.from({ length: 54 }).map((_, idx) => (
                                <div 
                                  key={idx} 
                                  className="bg-black h-full" 
                                  style={{ 
                                    width: `${[1, 2, 3, 4][(idx * 9) % 4]}px`,
                                    opacity: idx % 13 === 0 ? 0.15 : 1
                                  }} 
                                />
                              ))}
                            </div>
                            <span className="font-mono text-[9px] text-zinc-600 tracking-wider font-black text-center block leading-tight">
                              34191.79001 01043.513184 91020.150008 7 90020000023880
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Vencimento</span>
                              <span className="text-xs font-extrabold text-zinc-200 block mt-1">
                                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Forma de Envio</span>
                              <span className="text-xs font-extrabold text-zinc-200 block mt-1">E-mail Cadastrado</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Uma cópia do PDF foi disparada para seu e-mail cadastrado <span className="text-zinc-200 font-bold">{me.email || "filipesilva20091991@gmail.com"}</span>. Compensações podem levar até 1 dia útil.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => setStep("method")}
                        className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white font-bold py-3.5 px-4 rounded-xl active:scale-98 transition-all text-xs uppercase tracking-wider text-center"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleProceedToPayment}
                        className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        Confirmar & Pagar
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Gateway process visual loader */}
                {step === "processing" && (
                  <motion.div
                    key="processing-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 py-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative flex items-center justify-center">
                      <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-base font-black tracking-widest text-zinc-100 uppercase">Processando Conexão Segura</h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed min-h-[40px] flex items-center justify-center text-center">
                        {loadingPhase}
                      </p>
                    </div>

                    <div className="px-5 py-3 rounded-full bg-zinc-950 border border-zinc-850 text-[9px] text-zinc-500 tracking-widest font-black flex items-center gap-2 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      STRIPE PROTECTED (AES-256 ENCRYPTION)
                    </div>
                  </motion.div>
                )}

                {/* Success triumphant page overlay */}
                {step === "success" && (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8 text-center py-6"
                  >
                    <div className="relative flex justify-center">
                      {/* Radiating visual circles */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0, 0.4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-28 h-28 bg-amber-400/20 rounded-full blur-xl"
                        />
                      </div>
                      
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/25 border border-amber-300 relative z-10"
                      >
                        <Crown className="w-12 h-12 text-black fill-current" />
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent uppercase">
                        Assinatura Confirmada!
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                        Parabéns! Sua conta agora está atualizada. Você acaba de se tornar um <strong className="text-amber-400">Membro TrueMatch Gold</strong>. Todos os filtros de inteligência artificial, visualizadores de likes e mensagens ilimitadas estão 100% disponíveis para uso imediato.
                      </p>
                    </div>

                    {/* Features checklist highlights */}
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                        <Crown className="w-4 h-4 text-amber-400 mb-1.5 fill-amber-400/10" />
                        <span className="text-[9px] font-black text-amber-300 leading-tight uppercase">Selo de Perfil</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                        <Sparkles className="w-4 h-4 text-amber-400 mb-1.5 fill-amber-400/10" />
                        <span className="text-[9px] font-black text-amber-300 leading-tight uppercase">Matches IA</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 mb-1.5 fill-amber-400/10" />
                        <span className="text-[9px] font-black text-amber-300 leading-tight uppercase">Liberado</span>
                      </div>
                    </div>

                    <button
                      onClick={handleFinishSuccess}
                      className="w-full max-w-sm mx-auto bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-4 rounded-xl shadow-xl shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-95 transition-all text-xs uppercase tracking-widest block"
                    >
                      Acessar TrueMatch Gold
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-zinc-900 bg-zinc-950 text-[10px] text-zinc-500 space-y-2">
        <p className="max-w-md mx-auto leading-relaxed">
          Ao assinar, você concorda com os Termos de Uso e Políticas de Privacidade do TrueMatch. Assinaturas renovam automaticamente conforme ciclo escolhido e podem ser canceladas em Configurações.
        </p>
        <p className="text-[9px] font-mono">
          TRUEMATCH BRASIL TECNOLOGIA LTDA. CNPJ 34.582.112/0001-90
        </p>
      </footer>
    </div>
  );
}
