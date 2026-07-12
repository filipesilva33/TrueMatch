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
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { cn } from "../lib/utils";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planName?: string;
  price?: string;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  planName = "TrueMatch Gold",
  price = "R$ 19,90"
}: PaymentCheckoutModalProps) {
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
        const [month, year] = cardExpiry.split("/").map(Number);
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
      "Processando com a adquirente...",
      "Aprovando assinatura e liberando recursos..."
    ];
    
    let currentPhaseIdx = 0;
    setLoadingPhase(phases[0]);
    
    const interval = setInterval(() => {
      currentPhaseIdx++;
      if (currentPhaseIdx < phases.length) {
        setLoadingPhase(phases[currentPhaseIdx]);
      } else {
        clearInterval(interval);
        setStep("success");
      }
    }, 1200);
  };

  const handleFinishSuccess = () => {
    onSuccess();
    setStep("method");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step !== "processing" ? onClose : undefined}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col text-white"
        >
          {/* Top visual accent */}
          {step !== "success" && (
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
          )}

          {/* Secure SSL indicator */}
          {step !== "success" && step !== "processing" && (
            <div className="flex items-center justify-between px-6 pt-5 pb-2 text-zinc-500 text-[10px] uppercase tracking-widest font-extrabold select-none">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <ShieldCheck className="w-4 h-4" /> SSL SEGURO ATIVO
              </span>
              <span>STRIPE CHECKOUT</span>
            </div>
          )}

          {/* Content area */}
          <div className="p-6 flex flex-col">
            
            {/* Step 1: Selection of Method */}
            {step === "method" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
                    <Crown className="w-6 h-6 fill-amber-500/10 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white uppercase">Adquirir {planName}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Selecione a forma de pagamento desejada</p>
                </div>

                {/* Plan Summary */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Assinatura Anual</span>
                    <span className="font-extrabold text-sm text-zinc-100 block mt-0.5">{planName} Premium</span>
                    <span className="text-[10px] text-zinc-500 block">Cancelamento grátis a qualquer momento</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white block">{price}</span>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5">Ativo na Hora</span>
                  </div>
                </div>

                {/* Methods Grid */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Escolha a forma de pagamento</label>
                  
                  {/* Credit card option */}
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                      paymentMethod === "card"
                        ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white"
                        : "bg-zinc-900/50 border-white/5 hover:border-zinc-700 text-zinc-400"
                    )}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 transition-colors",
                        paymentMethod === "card" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800 text-zinc-500"
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-100 block">Cartão de Crédito</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">Até 12x sem juros, aprovação instantânea</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      paymentMethod === "card" ? "border-amber-400 bg-amber-400/20" : "border-zinc-700"
                    )}>
                      {paymentMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </div>
                  </button>

                  {/* PIX option */}
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                      paymentMethod === "pix"
                        ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white"
                        : "bg-zinc-900/50 border-white/5 hover:border-zinc-700 text-zinc-400"
                    )}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 transition-colors",
                        paymentMethod === "pix" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800 text-zinc-500"
                      )}>
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-100 block">Pix (Recomendado)</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">Liberação imediata, código QR seguro</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      paymentMethod === "pix" ? "border-amber-400 bg-amber-400/20" : "border-zinc-700"
                    )}>
                      {paymentMethod === "pix" && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </div>
                  </button>

                  {/* Boleto option */}
                  <button
                    onClick={() => setPaymentMethod("boleto")}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                      paymentMethod === "boleto"
                        ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white"
                        : "bg-zinc-900/50 border-white/5 hover:border-zinc-700 text-zinc-400"
                    )}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 transition-colors",
                        paymentMethod === "boleto" ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800 text-zinc-500"
                      )}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-100 block">Boleto Bancário</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">Compensação em até 1 dia útil</span>
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

                {/* Secure Seal */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ambiente seguro criptografado de ponta a ponta</span>
                </div>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={onClose}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold py-3 px-4 rounded-xl border border-white/5 hover:border-white/10 active:scale-98 transition-all text-xs uppercase tracking-wider text-center"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep("input")}
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    Continuar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Form/Code Inputs */}
            {step === "input" && (
              <div className="space-y-5">
                <div className="text-center">
                  <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {paymentMethod === "card" ? "Cartão de Crédito" : paymentMethod === "pix" ? "PIX QR Code" : "Boleto Bancário"}
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white mt-2 uppercase">Detalhes do Pagamento</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Preencha os campos para concluir com segurança</p>
                </div>

                {/* IF CREDIT CARD */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    {/* Visual Credit Card Preview */}
                    <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-zinc-900 via-neutral-900 to-amber-500/15 p-5 border border-zinc-800 relative overflow-hidden flex flex-col justify-between shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex flex-col">
                          <Crown className="w-6 h-6 text-amber-400 fill-amber-400/20" />
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mt-1">TrueMatch Gold Member</span>
                        </div>
                        {/* Card brand logo */}
                        <div className="text-right">
                          {cardBrand === "visa" && <span className="font-black italic text-lg text-white">VISA</span>}
                          {cardBrand === "mastercard" && <span className="font-black italic text-lg text-zinc-300">MasterCard</span>}
                          {cardBrand === "elo" && <span className="font-black italic text-lg text-amber-400">Elo</span>}
                          {cardBrand === "unknown" && <CreditCard className="w-5 h-5 text-zinc-400" />}
                        </div>
                      </div>

                      <div className="space-y-4 relative z-10">
                        {/* Number */}
                        <div className="text-base font-mono tracking-[0.18em] text-zinc-100 text-center py-1">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        {/* Name & Expiry */}
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                          <div className="truncate max-w-[180px]">
                            <span className="text-[7px] text-zinc-600 block leading-none">Titular</span>
                            <span className="text-zinc-300 font-bold block truncate">{cardName || "NOME DO TITULAR"}</span>
                          </div>
                          <div>
                            <span className="text-[7px] text-zinc-600 block leading-none">Validade</span>
                            <span className="text-zinc-300 font-bold block">{cardExpiry || "MM/AA"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input Form Fields */}
                    <div className="space-y-3.5">
                      {/* Name on Card */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Nome impresso no Cartão</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={handleNameChange}
                          placeholder="EX: FILIPE S SILVA"
                          className={cn(
                            "w-full bg-zinc-900 border text-xs font-bold px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors",
                            errors.cardName ? "border-red-500/50" : "border-white/5"
                          )}
                        />
                        {errors.cardName && (
                          <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.cardName}
                          </span>
                        )}
                      </div>

                      {/* Card Number */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Número do Cartão</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4000 1234 5678 9010"
                            className={cn(
                              "w-full bg-zinc-900 border text-xs font-bold pl-3.5 pr-10 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                              errors.cardNumber ? "border-red-500/50" : "border-white/5"
                            )}
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                            <CreditCard className="w-4 h-4" />
                          </div>
                        </div>
                        {errors.cardNumber && (
                          <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans">
                            <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
                          </span>
                        )}
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Validade</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/AA"
                            className={cn(
                              "w-full bg-zinc-900 border text-xs font-bold px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                              errors.cardExpiry ? "border-red-500/50" : "border-white/5"
                            )}
                          />
                          {errors.cardExpiry && (
                            <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans">
                              <AlertCircle className="w-3 h-3" /> {errors.cardExpiry}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">CVV (Código)</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="123"
                            className={cn(
                              "w-full bg-zinc-900 border text-xs font-bold px-3.5 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider",
                              errors.cardCvv ? "border-red-500/50" : "border-white/5"
                            )}
                          />
                          {errors.cardCvv && (
                            <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 font-sans">
                              <AlertCircle className="w-3 h-3" /> {errors.cardCvv}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* IF PIX */}
                {paymentMethod === "pix" && (
                  <div className="space-y-4 flex flex-col items-center">
                    {/* Simulated Pix QR Code Box */}
                    <div className="p-4 bg-white rounded-3xl border-2 border-amber-500/40 relative shadow-2xl flex flex-col items-center max-w-[200px] w-full">
                      {/* Scanning visual effect line */}
                      <div className="absolute left-4 right-4 top-4 h-[2px] bg-amber-500 opacity-80 animate-pulse rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]" style={{
                        animation: "bounce 2s infinite"
                      }} />
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=00020101021226870014BR.GOV.BCB.PIX2565truematchpayments0139f76a59bc-d9ee-47b8-89c0-9f5b6cae13ef520400005303986540519.905802BR5915TrueMatch Inc6009Sao Paulo62070503***6304CA1F" 
                        alt="PIX QR Code"
                        referrerPolicy="no-referrer"
                        className="w-40 h-40 object-contain rounded-xl select-none"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-zinc-500 font-medium block">Escaneie o código QR acima ou copie o código Pix abaixo</span>
                      <span className="text-xs font-black text-amber-400 font-mono tracking-wider bg-amber-500/10 px-3 py-1 rounded-full inline-block">
                        Tempo Restante: {formatTimer(pixTimer)}
                      </span>
                    </div>

                    {/* Copy and Paste code */}
                    <button
                      onClick={copyPixCode}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-300",
                        pixCopied 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                          : "bg-zinc-900 border-white/5 text-zinc-300 hover:border-zinc-700"
                      )}
                    >
                      <div className="truncate pr-4">
                        <span className="text-[8px] font-black uppercase tracking-wider block text-zinc-500">Pix Copia e Cola</span>
                        <span className="text-[10px] font-mono truncate block mt-0.5">
                          00020101021226870014BR.GOV.BCB.PIX2565truematchpayments0139f76a...
                        </span>
                      </div>
                      <div className="p-2 bg-zinc-800/80 rounded-xl shrink-0">
                        {pixCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                      </div>
                    </button>
                    
                    <div className="flex items-start gap-2 bg-zinc-900 p-3.5 rounded-2xl border border-white/5 w-full text-left">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-zinc-400 leading-normal">
                        O sistema confirmará automaticamente após o pagamento via Pix. Não feche este modal até que a aprovação apareça na tela.
                      </p>
                    </div>
                  </div>
                )}

                {/* IF BOLETO */}
                {paymentMethod === "boleto" && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-100">Boleto Gerado</span>
                        </div>
                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full">PDF Pronto</span>
                      </div>

                      {/* Mock Barcode visual */}
                      <div className="bg-white p-3.5 rounded-xl flex flex-col items-center space-y-1.5 select-none">
                        <div className="w-full h-8 flex justify-between overflow-hidden opacity-90">
                          {Array.from({ length: 48 }).map((_, idx) => (
                            <div 
                              key={idx} 
                              className="bg-black h-full" 
                              style={{ 
                                width: `${[1, 2, 3, 4][(idx * 7) % 4]}px`,
                                opacity: idx % 11 === 0 ? 0.2 : 1
                              }} 
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[8px] text-zinc-600 tracking-widest font-black text-center block">
                          34191.79001 01043.513184 91020.150008 7 90020000023880
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Vencimento</span>
                        <span className="text-[11px] font-bold text-zinc-300 block">
                          {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} (Em 3 dias)
                        </span>
                      </div>

                      <p className="text-[9px] text-zinc-400 leading-normal">
                        Você receberá uma cópia do boleto no seu e-mail cadastrado. A liberação do TrueMatch Gold será feita em até 1 dia útil após o pagamento.
                      </p>
                    </div>
                  </div>
                )}

                {/* Back and Confirm buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setStep("method")}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold py-3 px-4 rounded-xl border border-white/5 hover:border-white/10 active:scale-98 transition-all text-xs uppercase tracking-wider text-center"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    Confirmar & Pagar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Processing Animation */}
            {step === "processing" && (
              <div className="space-y-6 py-8 flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center">
                  <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black tracking-wider text-white uppercase">Processando Transação</h3>
                  <p className="text-xs text-zinc-500 max-w-xs leading-normal min-h-[32px] flex items-center justify-center text-center">
                    {loadingPhase}
                  </p>
                </div>

                <div className="px-5 py-3 rounded-full bg-zinc-900 border border-white/5 text-[9px] text-zinc-400 tracking-widest font-black flex items-center gap-2 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  Transação protegida por criptografia de ponta a ponta
                </div>
              </div>
            )}

            {/* Step 4: Success confirmation */}
            {step === "success" && (
              <div className="space-y-6 text-center py-4">
                <div className="relative flex justify-center">
                  {/* Outer sparks effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-24 h-24 bg-amber-400/20 rounded-full blur-xl"
                    />
                  </div>
                  
                  {/* Crown Circle */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/25 border border-amber-300 relative z-10"
                  >
                    <Crown className="w-10 h-10 text-black fill-current" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent uppercase">
                    Assinatura Confirmada!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Parabéns! Seu perfil agora possui a insígnia <strong className="text-amber-400">TrueMatch Gold Member</strong>. Todos os filtros e vantagens premium foram liberados instantaneamente!
                  </p>
                </div>

                {/* Micro bento highlights */}
                <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
                  <div className="p-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                    <Crown className="w-4 h-4 text-amber-400 mb-1 fill-amber-400/10" />
                    <span className="text-[8px] font-black text-amber-300 leading-tight uppercase">Selo Gold</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                    <Sparkles className="w-4 h-4 text-amber-400 mb-1 fill-amber-400/10" />
                    <span className="text-[8px] font-black text-amber-300 leading-tight uppercase">Mais Filtros</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 mb-1 fill-amber-400/10" />
                    <span className="text-[8px] font-black text-amber-300 leading-tight uppercase">Ativo</span>
                  </div>
                </div>

                <button
                  onClick={handleFinishSuccess}
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-4 rounded-xl shadow-xl shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  Entrar no TrueMatch Gold
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
