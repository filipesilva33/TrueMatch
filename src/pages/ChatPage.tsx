import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, MoreVertical, Send, Crown, Play, Tv, CheckCircle2, Volume2, Lock, X, Sparkles, Zap, Mic, Trash2, UserMinus, ShieldAlert, AlertTriangle } from 'lucide-react';
import { mockUsers, mockChats } from '../data/mock';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { playUiSound } from '../utils/audio';
import { getSystemSetting } from '../utils/privacy';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

type Message = {
  id: string;
  text?: string;
  audioUrl?: string;
  audioDuration?: number;
  isMe: boolean;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function AudioPlayerMessage({ url, duration, isMe }: { url: string; duration: number; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const synthTimerRef = useRef<any>(null);
  const isSimulated = url.startsWith('data:audio');

  useEffect(() => {
    if (isSimulated) return;

    const audio = new Audio(url);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [url, isSimulated]);

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (synthTimerRef.current) clearTimeout(synthTimerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playSimulatedSynth = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      let tick = 0;
      setCurrentTime(0);

      const playTone = (freq: number, time: number, dur: number) => {
        if (!ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.start(time);
        osc.stop(time + dur);
      };

      // Play start chime immediately
      playTone(isMe ? 320 : 440, ctx.currentTime, 0.2);

      synthIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(synthIntervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          
          // Generate an elegant dynamic melodic tone
          const baseFreq = isMe ? 300 : 380;
          const tone1 = baseFreq + Math.sin(tick) * 40;
          const tone2 = baseFreq * 1.3 + Math.cos(tick) * 60;
          
          playTone(tone1, ctx.currentTime, 0.25);
          playTone(tone2, ctx.currentTime + 0.15, 0.18);
          
          tick++;
          return prev + 1;
        });
      }, 1000);

      synthTimerRef.current = setTimeout(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
        ctx.close().catch(() => {});
      }, duration * 1000);

    } catch (e) {
      console.warn("Could not play synthesized voice note:", e);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (isSimulated) {
        if (synthTimerRef.current) clearTimeout(synthTimerRef.current);
        if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
          audioCtxRef.current = null;
        }
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(true);
      if (isSimulated) {
        playSimulatedSynth();
      } else {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn("Failed to play audio:", e));
        }
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-3 py-1 px-1 min-w-[200px]">
      <button 
        onClick={togglePlay}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0",
          isMe ? "bg-white text-pink-600 hover:bg-white/90" : "bg-pink-500 text-white hover:bg-pink-600"
        )}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center">
        {/* Animated/Interactive sound progress bar */}
        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-100",
              isMe ? "bg-white" : "bg-pink-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <span className={cn("text-[10px]", isMe ? "text-white/80" : "text-zinc-400")}>
            {isPlaying ? formatTime(Math.floor(currentTime)) : (isSimulated ? "Simulado (Audível)" : "Mensagem de voz")}
          </span>
          <span className={cn("text-[10px] font-mono", isMe ? "text-white/80" : "text-zinc-400")}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState(mockChats);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "c1": [
      { id: "m1", text: "Ei! Vi que você curte indie rock. Já ouviu o álbum novo?", isMe: true },
      { id: "m2", text: "Sim! Tá no repeat a semana inteira 🎧", isMe: false },
      { id: "m3", text: "Isso parece uma noite perfeita! ✨", isMe: false },
    ],
    "c2": [
      { id: "m4", text: "Você está livre este fim de semana?", isMe: false },
    ]
  });

  const [me, setMe] = useState(() => {
    const stored = localStorage.getItem('truematch_profile_me');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const isGold = me?.isGold || false;

  const [sentMessagesCount, setSentMessagesCount] = useState(() => {
    const stored = localStorage.getItem('truematch_sent_messages_count');
    return stored ? parseInt(stored, 10) : 0;
  });

  const [showAdPromoModal, setShowAdPromoModal] = useState(false);
  const [showAdPlayerModal, setShowAdPlayerModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [showGoldSubscriptionModal, setShowGoldSubscriptionModal] = useState(false);

  useEffect(() => {
    if (showGoldSubscriptionModal) {
      setShowGoldSubscriptionModal(false);
      navigate('/checkout', { state: { from: '/chat' } });
    }
  }, [showGoldSubscriptionModal, navigate]);

  // Voice recording states and refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef<number>(0);
  const [isSimulated, setIsSimulated] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Safety report and block states
  const [reportBlockUser, setReportBlockUser] = useState<any | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showReportReasonModal, setShowReportReasonModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('truematch_blocked_users');
    return stored ? JSON.parse(stored) : [];
  });

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Subscribe to real-time messages in Firestore when a chat is opened
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(collection(db, "matches", activeChatId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbMsgs: Message[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbMsgs.push({
          id: data.id || docSnap.id,
          text: data.text,
          audioUrl: data.audioUrl,
          audioDuration: data.audioDuration,
          isMe: data.senderId === auth.currentUser?.uid
        });
      });

      if (dbMsgs.length > 0) {
        setMessages(prev => ({
          ...prev,
          [activeChatId]: dbMsgs
        }));
      }
    }, (error) => {
      const isPermissionError = error.message.includes("permission-denied") || error.code === "permission-denied";
      if (!isPermissionError) {
        handleFirestoreError(error, OperationType.GET, `matches/${activeChatId}/messages`);
      }
    });

    return () => unsubscribe();
  }, [activeChatId]);

  const startRecording = async () => {
    if (!isGold) {
      const currentCount = parseInt(localStorage.getItem('truematch_sent_messages_count') || '0', 10);
      if (currentCount >= 3) {
        setShowAdPromoModal(true);
        return;
      }
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setToastMessage("Solicitando permissão de microfone...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setToastMessage("Microfone conectado!");
        setTimeout(() => setToastMessage(null), 1500);

        // Detect supported audio formats dynamically
        let mimeType = 'audio/webm';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
          }
        }

        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const finalType = mimeType || recorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: finalType });
          const audioUrl = URL.createObjectURL(audioBlob);
          const duration = recordingTimeRef.current > 0 ? recordingTimeRef.current : 1;
          sendAudioMessage(audioUrl, duration);
          
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsSimulated(false);
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const next = prev + 1;
            recordingTimeRef.current = next;
            return next;
          });
        }, 1000);
      } else {
        throw new Error("MediaDevices not supported");
      }
    } catch (err) {
      console.warn("Microfone real não disponível, iniciando simulação:", err);
      setToastMessage("Gravando áudio de simulação de alta fidelidade...");
      setTimeout(() => setToastMessage(null), 2500);

      setIsSimulated(true);
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          return next;
        });
      }, 1000);
    }
  };

  const stopRecordingAndSend = () => {
    if (!isRecording) return;
    
    if (isSimulated) {
      const silentAudioUrl = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      const duration = recordingTimeRef.current > 0 ? recordingTimeRef.current : 1;
      sendAudioMessage(silentAudioUrl, duration);
      cleanupRecording();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      cleanupRecording();
    }
  };

  const cancelRecording = () => {
    if (!isRecording) return;
    
    if (!isSimulated && mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // ignore
      }
    }
    cleanupRecording();
  };

  const cleanupRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  const sendAudioMessage = (url: string, duration: number) => {
    if (!activeChatId) return;

    const currentId = activeChatId;
    const newMessageId = Date.now().toString();
    const newMessage: Message = { 
      id: newMessageId, 
      audioUrl: url, 
      audioDuration: duration || 3, 
      isMe: true 
    };

    if (!isGold) {
      const currentCount = parseInt(localStorage.getItem('truematch_sent_messages_count') || '0', 10);
      const newCount = currentCount + 1;
      localStorage.setItem('truematch_sent_messages_count', newCount.toString());
      setSentMessagesCount(newCount);
    }

    playUiSound('message_sent');

    setMessages(prev => ({
      ...prev,
      [currentId]: [...(prev[currentId] || []), newMessage]
    }));

    setChats(prev => prev.map(chat => 
      chat.id === currentId 
        ? { ...chat, lastMessage: "🎤 Mensagem de voz", time: 'Agora', unread: 0 } 
        : chat
    ));

    const chat = chats.find(c => c.id === currentId);
    const matchedUser = mockUsers.find(u => u.id === chat?.userId);
    const aiText = `Nossa, adorei ouvir sua voz, ${matchedUser?.name || "amigo(a)"}! Muito bom conversar assim. 😍`;

    const user = auth.currentUser;
    if (user) {
      const dbMessage = {
        id: newMessageId,
        senderId: user.uid,
        audioUrl: url,
        audioDuration: duration || 3,
        timestamp: new Date().toISOString()
      };
      setDoc(doc(db, "matches", currentId, "messages", newMessageId), dbMessage)
        .catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `matches/${currentId}/messages/${newMessageId}`);
        });

      setTimeout(() => {
        const aiMessageId = (Date.now() + 1).toString();
        const dbAiMessage = {
          id: aiMessageId,
          senderId: "ai-system",
          text: aiText,
          timestamp: new Date().toISOString()
        };
        setDoc(doc(db, "matches", currentId, "messages", aiMessageId), dbAiMessage)
          .catch(err => {
            console.error("Error saving AI response to Firestore:", err);
          });
      }, 1500);
    }

    setTimeout(() => {
      const aiResponse = { 
         id: (Date.now() + 1).toString(), 
         text: aiText,
         isMe: false 
      };
      
      playUiSound('message_received');
      if (getSystemSetting('push') && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nova mensagem de ${matchedUser?.name || "Match"}`, {
          body: aiText,
          icon: matchedUser?.images?.[0] || '/favicon.ico'
        });
      }

      setMessages(prev => ({
        ...prev,
        [currentId]: [...(prev[currentId] || []), aiResponse]
      }));

      setChats(prev => prev.map(c => 
        c.id === currentId 
          ? { ...c, lastMessage: aiText, time: 'Agora', unread: activeChatId === currentId ? 0 : (c.unread + 1) } 
          : c
      ));
    }, 1500);
  };

  const handleBlockUser = (userId: string) => {
    const newBlocked = [...blockedUserIds, userId];
    setBlockedUserIds(newBlocked);
    localStorage.setItem('truematch_blocked_users', JSON.stringify(newBlocked));
    
    // Remove active chat
    setActiveChatId(null);
    
    // Show Toast
    setToastMessage("Usuário bloqueado com sucesso.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const checkGold = () => {
      const stored = localStorage.getItem('truematch_profile_me');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isGold !== me?.isGold) {
            setMe(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
      const countStored = localStorage.getItem('truematch_sent_messages_count');
      const count = countStored ? parseInt(countStored, 10) : 0;
      if (count !== sentMessagesCount) {
        setSentMessagesCount(count);
      }
    };
    const interval = setInterval(checkGold, 1000);
    return () => clearInterval(interval);
  }, [me, sentMessagesCount]);

  useEffect(() => {
    const state = location.state as { userId?: string };
    if (state?.userId) {
      // Find existing chat with this user
      const existingChat = chats.find(c => c.userId === state.userId);
      if (existingChat) {
        setActiveChatId(existingChat.id);
      } else {
        // Create new chat
        const newChatId = `c${Date.now()}`;
        setChats(prev => [{
          id: newChatId,
          userId: state.userId!,
          lastMessage: "Novo Match!",
          time: "Agora",
          unread: 0
        }, ...prev]);
        setMessages(prev => ({ ...prev, [newChatId]: [
          { id: "m_init", text: "Oi! Tudo bem? Vi seu perfil e achei super interessante. :)", isMe: false }
        ] }));
        setActiveChatId(newChatId);
      }
      // clear state so it doesn't reopen on remount
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeChatId) {
      setTimeout(scrollToBottom, 100);
    }
  }, [activeChatId, messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !activeChatId) return;

    if (!isGold) {
      const currentCount = parseInt(localStorage.getItem('truematch_sent_messages_count') || '0', 10);
      if (currentCount >= 3) {
        setShowAdPromoModal(true);
        return;
      }
    }
    
    const currentId = activeChatId;
    const newMessageId = Date.now().toString();
    const newMessage = { id: newMessageId, text: inputValue.trim(), isMe: true };
    const textToSend = inputValue.trim();

    if (!isGold) {
      const currentCount = parseInt(localStorage.getItem('truematch_sent_messages_count') || '0', 10);
      const newCount = currentCount + 1;
      localStorage.setItem('truematch_sent_messages_count', newCount.toString());
      setSentMessagesCount(newCount);
    }
    
    playUiSound('message_sent');

    setMessages(prev => ({
      ...prev,
      [currentId]: [...(prev[currentId] || []), newMessage]
    }));
    
    setChats(prev => prev.map(chat => 
      chat.id === currentId 
        ? { ...chat, lastMessage: textToSend, time: 'Agora', unread: 0 } 
        : chat
    ));

    setInputValue("");

    const chat = chats.find(c => c.id === currentId);
    const matchedUser = mockUsers.find(u => u.id === chat?.userId);
    const aiText = `Com certeza, ${matchedUser?.name || "amigo(a)"}! Adorei sua mensagem. O que mais você me conta? 😊`;

    const user = auth.currentUser;
    if (user) {
      const dbMessage = {
        id: newMessageId,
        senderId: user.uid,
        text: textToSend,
        timestamp: new Date().toISOString()
      };
      setDoc(doc(db, "matches", currentId, "messages", newMessageId), dbMessage)
        .catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `matches/${currentId}/messages/${newMessageId}`);
        });

      setTimeout(() => {
        const aiMessageId = (Date.now() + 1).toString();
        const dbAiMessage = {
          id: aiMessageId,
          senderId: "ai-system",
          text: aiText,
          timestamp: new Date().toISOString()
        };
        setDoc(doc(db, "matches", currentId, "messages", aiMessageId), dbAiMessage)
          .catch(err => {
            console.error("Error saving AI response to Firestore:", err);
          });
      }, 1500);
    }

    setTimeout(() => {
      const aiResponse = { 
        id: (Date.now() + 1).toString(), 
        text: aiText,
        isMe: false 
      };
      
      playUiSound('message_received');
      if (getSystemSetting('push') && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nova mensagem de ${matchedUser?.name || "Match"}`, {
          body: aiText,
          icon: matchedUser?.images?.[0] || '/favicon.ico'
        });
      }

      setMessages(prev => ({
        ...prev,
        [currentId]: [...(prev[currentId] || []), aiResponse]
      }));

      setChats(prev => prev.map(c => 
        c.id === currentId 
          ? { ...c, lastMessage: aiText, time: 'Agora', unread: activeChatId === currentId ? 0 : (c.unread + 1) } 
          : c
      ));
    }, 1500);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdPlayerModal) {
      setAdCountdown(5);
      timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAdPlayerModal]);

  const handleRewardUser = () => {
    localStorage.setItem('truematch_sent_messages_count', '0');
    setSentMessagesCount(0);
    setShowAdPlayerModal(false);
    setShowAdPromoModal(false);
  };

  const renderModals = () => {
    return (
      <AnimatePresence>
        {/* Promo Modal */}
        {showAdPromoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl p-6 flex flex-col justify-center items-center text-center text-white"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20">
              <Crown className="w-10 h-10 text-black fill-current animate-pulse" />
            </div>
            <h2 className="text-2xl font-black mb-1 tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">Limite de Mensagens</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs leading-relaxed">
              Você atingiu o limite de <strong className="text-white font-black">3 mensagens gratuitas</strong> no plano padrão.
            </p>

            <div className="w-full max-w-xs space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-amber-500/20 flex items-start gap-3 text-left">
                <div className="p-1 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">TrueMatch GOLD</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">Mensagens ilimitadas, ver quem te curtiu, Matchmaker IA e mais.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-pink-500/20 flex items-start gap-3 text-left">
                <div className="p-1 bg-pink-500/10 rounded-lg text-pink-400 shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-pink-300 uppercase tracking-wider">Vídeo Patrocinado</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">Assista a um vídeo rápido e ganhe mais 3 mensagens grátis!</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={() => {
                  setShowAdPromoModal(false);
                  setShowAdPlayerModal(true);
                }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Assistir Vídeo (5s)
              </button>

              <button
                onClick={() => {
                  setShowAdPromoModal(false);
                  setShowGoldSubscriptionModal(true);
                }}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
              >
                <Crown className="w-4 h-4 fill-current" /> Assinar TrueMatch GOLD
              </button>

              <button
                onClick={() => setShowAdPromoModal(false)}
                className="w-full text-zinc-500 font-semibold py-2 text-xs hover:text-zinc-400 uppercase tracking-widest transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        )}

        {/* Ad Video Player Modal */}
        {showAdPlayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col justify-between p-6 text-white"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Anúncio Patrocinado</span>
              </span>
              <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 font-mono">
                {adCountdown > 0 ? `Recompensa em ${adCountdown}s` : 'Recompensa pronta!'}
              </span>
            </div>

            {/* Video content placeholder - gorgeous mockup */}
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 shadow-[0_0_50px_10px_rgba(236,72,153,0.15)] animate-pulse">
                <Sparkles className="w-12 h-12 text-pink-400" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">TrueMatch Matchmaker IA</h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Quer saber quem realmente combina com seu estilo de vida? O Matchmaker IA analisa sua personalidade e te apresenta as melhores conexões.
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full mt-8 overflow-hidden relative">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                />
              </div>
            </div>

            {/* Footer button */}
            <div className="w-full max-w-xs mx-auto">
              {adCountdown > 0 ? (
                <button
                  disabled
                  className="w-full bg-zinc-900 text-zinc-500 font-bold py-3.5 rounded-xl border border-white/5 cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Assistindo anúncio...
                </button>
              ) : (
                <button
                  onClick={handleRewardUser}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all animate-bounce shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5" /> Resgatar +3 Mensagens
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Safety Options Modal */}
        {showOptionsModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowOptionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-3xl p-6 text-center text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <ShieldAlert className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Ações de Segurança</h3>
              <p className="text-xs text-zinc-400 mb-6">Selecione uma ação para {reportBlockUser.name}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowReportReasonModal(true);
                  }}
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 border border-white/5 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-between transition-colors active:scale-98"
                >
                  <span className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    Denunciar usuário
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="m9 18 6-6-6-6"/></svg>
                </button>

                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowBlockConfirmModal(true);
                  }}
                  className="w-full bg-zinc-800/80 hover:bg-zinc-800 border border-white/5 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-between transition-colors active:scale-98"
                >
                  <span className="flex items-center gap-2 text-zinc-300">
                    <UserMinus className="w-4 h-4 text-zinc-400 shrink-0" />
                    Bloquear usuário
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="m9 18 6-6-6-6"/></svg>
                </button>

                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="w-full bg-transparent hover:bg-white/5 text-zinc-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors pt-4"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Report Reason Modal */}
        {showReportReasonModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowReportReasonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/5 rounded-3xl p-6 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-1 text-center">Denunciar Perfil</h3>
              <p className="text-xs text-zinc-400 mb-6 text-center">Por que você está denunciando {reportBlockUser.name}?</p>

              <div className="space-y-2 mb-6">
                {[
                  "Conteúdo inadequado ou ofensivo",
                  "Comportamento abusivo ou assédio",
                  "Perfil falso / Spam",
                  "Outro motivo"
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center justify-between",
                      reportReason === reason
                        ? "bg-pink-500/10 border-pink-500 text-pink-400"
                        : "bg-zinc-800/50 border-white/5 text-zinc-300 hover:bg-zinc-800"
                    )}
                  >
                    <span>{reason}</span>
                    {reportReason === reason && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReportReasonModal(false);
                    setReportReason("");
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowReportReasonModal(false);
                    setShowReportSuccess(true);
                  }}
                  disabled={!reportReason}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-pink-500/10"
                >
                  Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Block Confirm Modal */}
        {showBlockConfirmModal && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowBlockConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-zinc-900 border border-white/5 rounded-3xl p-6 text-center text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserMinus className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Bloquear {reportBlockUser.name}?</h3>
              <p className="text-xs text-zinc-400 mb-6">Esta pessoa não poderá ver seu perfil ou enviar mensagens para você.</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockConfirmModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowBlockConfirmModal(false);
                    handleBlockUser(reportBlockUser.id);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-500/10"
                >
                  Bloquear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Report Success Modal */}
        {showReportSuccess && reportBlockUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs bg-zinc-900 border border-white/5 rounded-3xl p-6 text-center text-white"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Denúncia Recebida</h3>
              <p className="text-xs text-zinc-400 mb-6">Agradecemos por nos ajudar a manter a comunidade segura. {reportBlockUser.name} foi denunciado(a) e bloqueado(a).</p>

              <button
                onClick={() => {
                  setShowReportSuccess(false);
                  handleBlockUser(reportBlockUser.id);
                  setReportReason("");
                }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-pink-500/10"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };



  const filteredChats = chats.filter(chat => {
    if (blockedUserIds.includes(chat.userId)) return false;
    const user = mockUsers.find(u => u.id === chat.userId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (activeChatId) {
    const chat = chats.find(c => c.id === activeChatId);
    const user = mockUsers.find(u => u.id === chat?.userId);
    
    return (
      <div className={cn(
        "flex flex-col h-full absolute inset-0 z-50 transition-colors duration-300",
        "bg-zinc-950 text-white"
      )}>
        <div className={cn(
          "flex items-center justify-between px-4 py-4 border-b relative z-10 transition-colors duration-300",
          "border-white/5 bg-zinc-900/50 backdrop-blur-sm"
        )}>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveChatId(null)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300",
                "hover:bg-white/10 text-white"
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="relative">
               <img decoding="async" loading="lazy" src={user?.images[0]} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
               {user?.isOnline && <div className={cn("absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 transition-colors duration-300", "border-zinc-950")}></div>}
            </div>
            <div>
              <h3 className={cn("font-semibold transition-colors duration-300", "text-white")}>{user?.name}</h3>
              <p className={cn("text-xs transition-colors duration-300", "text-white/50")}>{user?.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                if (user) {
                  setReportBlockUser(user);
                  setShowOptionsModal(true);
                }
              }}
              className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
              title="Opções de segurança"
            >
              <MoreVertical className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4 pt-6">
           {messages[activeChatId]?.map(msg => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={msg.id} 
               className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
             >
               <div className={cn(
                 "px-4 py-2.5 max-w-[80%]",
                 msg.isMe 
                   ? "bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-sm text-white shadow-lg shadow-pink-500/20" 
                   : "bg-zinc-800 rounded-2xl rounded-tl-sm text-white"
               )}>
                 {msg.audioUrl ? (
                   <AudioPlayerMessage url={msg.audioUrl} duration={msg.audioDuration || 0} isMe={msg.isMe} />
                 ) : (
                   <p className="text-[15px]">{msg.text}</p>
                 )}
               </div>
             </motion.div>
           ))}
           <div ref={messagesEndRef} />
         </div>

        {!isGold && (
          <div className="px-4 py-2 bg-zinc-900 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
              <span>Mensagens enviadas: <strong className="text-white font-black">{sentMessagesCount}/3</strong></span>
            </span>
            <button 
              onClick={() => setShowAdPromoModal(true)}
              className="text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]"
            >
              <Crown className="w-3.5 h-3.5 fill-current animate-pulse" /> Obter Ilimitado
            </button>
          </div>
        )}

        <div className={cn(
          "px-4 pt-3 pb-6 border-t relative z-10 transition-colors duration-300 md:pb-4",
          "bg-zinc-950 border-white/5"
        )}>
          {isRecording ? (
            <div className="h-14 rounded-2xl px-4 flex items-center justify-between bg-zinc-900 border border-red-500/30 shadow-lg shadow-red-500/10 transition-all duration-300 w-full">
              <div className="flex items-center space-x-3 overflow-hidden min-w-0 flex-1">
                {/* Red Blinking Dot and Label */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-red-500 text-[10px] font-extrabold uppercase tracking-widest hidden xs:inline">Gravando</span>
                </div>
                
                {/* Monospace Time Counter */}
                <span className="text-white text-xs font-mono font-bold bg-white/5 px-2.5 py-1 rounded-xl border border-white/5 shrink-0 shadow-inner">
                  {formatTime(recordingTime)}
                </span>
                
                {/* Visual Audio Waves (responsive, hides on extremely small devices if needed, but fits elegantly) */}
                <div className="flex items-end space-x-1 h-5 px-1 shrink-0">
                  <span className="w-[3px] h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
                  <span className="w-[3px] h-5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.9s' }} />
                  <span className="w-[3px] h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
                  <span className="w-[3px] h-4.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.1s' }} />
                  <span className="w-[3px] h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.8s' }} />
                </div>
              </div>
              
              {/* Responsive Audio Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pl-2">
                <button 
                  onClick={cancelRecording}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all active:scale-90"
                  title="Cancelar gravação"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={stopRecordingAndSend}
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 hover:brightness-110 text-white flex items-center justify-center transition-all active:scale-90 shadow-md shadow-pink-500/20"
                  title="Enviar gravação"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "h-14 rounded-2xl px-2 flex items-center shadow-inner border transition-all duration-300 w-full",
              "bg-zinc-900 border-white/5 focus-within:border-pink-500/30 focus-within:ring-1 focus-within:ring-pink-500/10"
            )}>
              <input 
                 type="text" 
                 placeholder="Digite uma mensagem..." 
                 className={cn(
                   "bg-transparent flex-1 outline-none text-[15px] pl-3 pr-2 min-w-0 transition-colors duration-300",
                   "text-white placeholder-zinc-500"
                 )}
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              
              <div className="flex items-center space-x-1 shrink-0">
                <button 
                  onClick={startRecording}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-pink-400 text-zinc-400 flex items-center justify-center transition-all active:scale-90"
                  title="Gravar áudio"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <button 
                   onClick={handleSendMessage}
                   disabled={!inputValue.trim()}
                   className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 hover:brightness-110 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:hover:brightness-100 disabled:active:scale-100 shadow-lg shadow-pink-500/10"
                   title="Enviar mensagem"
                >
                   <Send className="w-4.5 h-4.5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
        {renderModals()}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full p-4 pt-6 overflow-y-auto pb-32 hide-scrollbar transition-colors duration-300",
      "bg-zinc-950 text-white"
    )}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={cn("text-3xl font-bold transition-colors duration-300", "text-white")}>Chat</h1>
        <button 
          onClick={() => navigate('/notifications')}
          className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-90 relative",
            "border-white/10 text-zinc-400"
          )}
        >
           <Bell className="w-5 h-5" />
           {unreadCount > 0 && (
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-zinc-900" />
           )}
        </button>
      </div>

      <div className="relative mb-6">
        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300", "text-zinc-500")} />
        <input 
          type="text" 
          placeholder="Pesquisar mensagens" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full h-11 border rounded-2xl pl-12 pr-4 text-[15px] outline-none transition-all duration-300 shadow-inner",
            "bg-zinc-900 border-white/5 text-white placeholder-zinc-500 focus:border-pink-500/50"
          )}
        />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
        <div className="flex flex-col space-y-5">
           {filteredChats.length === 0 ? (
             <div className="text-center py-10">
               <p className={cn("text-sm transition-colors duration-300", "text-zinc-500")}>Nenhuma mensagem encontrada.</p>
             </div>
           ) : filteredChats.map(chat => {
             const user = mockUsers.find(u => u.id === chat.userId);
             if (!user) return null;
             
             return (
               <div 
                 key={chat.id} 
                 className={cn(
                   "flex items-center space-x-4 cursor-pointer p-2 -mx-2 rounded-2xl transition-all duration-300 active:scale-[0.98]",
                   "hover:bg-white/5"
                 )}
                 onClick={() => {
                   setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                   setActiveChatId(chat.id);
                 }}
               >
                  <div className="relative">
                    <img decoding="async" loading="lazy" src={user.images[0]} referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover" />
                    {user.isOnline && <div className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] transition-colors duration-300", "border-zinc-950")}></div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={cn("font-semibold text-[16px] transition-colors duration-300", "text-white")}>{user.name}</h3>
                      <span className={cn("text-[11px] transition-colors duration-300", "text-white/40")}>{chat.time}</span>
                    </div>
                    <p className={cn(
                      "text-[14px] truncate transition-colors duration-300",
                      chat.unread > 0 
                        ? "text-white font-medium"
                        : "text-white/50"
                    )}>
                      {(() => {
                        const lastMsg = messages[chat.id]?.length > 0 ? messages[chat.id][messages[chat.id].length - 1] : null;
                        if (lastMsg) {
                          return lastMsg.audioUrl ? "🎤 Mensagem de voz" : lastMsg.text;
                        }
                        return chat.lastMessage;
                      })()}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-pink-500/20">
                      {chat.unread}
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      </div>
      {renderModals()}

       {/* Toast Alert */}
       <AnimatePresence>
         {toastMessage && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 10 }}
             className="fixed inset-0 z-[200] flex items-center justify-center px-6 pointer-events-none"
           >
             <div className="px-5 py-3.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-xl max-w-[300px] transition-all bg-zinc-900/80 text-white">
               <div className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                 <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white">{toastMessage}</p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
