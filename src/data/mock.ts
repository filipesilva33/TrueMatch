export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  distance: number; // Changed to number for filtering
  verified: boolean;
  interests: string[];
  compatibility: number;
  isOnline: boolean;
  jobTitle?: string;
  company?: string;
  education?: string;
  relationshipStatus?: string;
  city?: string;
  intent?: string;
  lifestyle?: string[];
  gender: 'masculino' | 'feminino'; // Required for filtering
  sexuality?: string;
  smoking?: string;
  drinking?: string;
  pets?: string;
  popular?: boolean;
  zodiac?: string;
  children?: string;
  religion?: string;
  personality?: string;
  isGold?: boolean;
  isNew?: boolean;
}

export const mockUsers: User[] = [
  {
    id: "u_helena",
    name: "Helena",
    age: 27,
    gender: 'feminino',
    bio: "Narrativas visuais emocionantes. Fã de festivais de cinema, fotografia analógica e descobrir novos cafés charmosos pela cidade.",
    images: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 4,
    verified: true,
    interests: ["Cinema", "Direção", "Fotografia", "Vinho"],
    compatibility: 95,
    isOnline: true,
    jobTitle: "Diretora Criativa de Audiovisual",
    city: "Belo Horizonte",
    isGold: true,
    isNew: true,
  },
  {
    id: "u_amanda",
    name: "Amanda",
    age: 27,
    gender: 'feminino',
    bio: "Açúcar, afeto e um bom papo sobre gastronomia internacional. Apaixonada por criar experiências doces e memoráveis.",
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 6,
    verified: true,
    interests: ["Gastronomia", "Confeitaria", "Café", "Viagens"],
    compatibility: 94,
    isOnline: false,
    jobTitle: "Chef Executiva de Confeitaria",
    city: "Belo Horizonte",
    isGold: true,
  },
  {
    id: "u_eduardo",
    name: "Eduardo G.",
    age: 25,
    gender: 'masculino',
    bio: "Café, código limpo e conversas profundas sobre tecnologia, futuro e inteligência artificial. Sempre em busca de novos desafios.",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 8,
    verified: true,
    interests: ["Viagens", "Idiomas", "Tecnologia", "Café"],
    compatibility: 94,
    isOnline: false,
    jobTitle: "Full Stack Developer",
    city: "São Paulo",
    isGold: true,
  },
  {
    id: "u1",
    name: "Isabella",
    age: 24,
    gender: 'feminino',
    bio: "Arquiteta apaixonada por café, design urbano e viagens espontâneas. Vamos conversar sobre arte ou planejar a próxima viagem?",
    images: [
      "https://images.unsplash.com/photo-1524504280099-c1224cd822f4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800"
    ],
    distance: 2,
    verified: true,
    interests: ["Arquitetura", "Café", "Livros", "Museus", "Vinho"],
    compatibility: 93,
    isOnline: false,
    jobTitle: "Arquiteta Sênior",
    education: "Arquitetura e Urbanismo - USP",
    relationshipStatus: "Solteira",
    city: "São Paulo",
    intent: "Relacionamento sério",
    lifestyle: ["Café", "Livros", "Museus", "Ciclismo", "Vinho"],
    isGold: true,
  },
  {
    id: "u2",
    name: "Marcus",
    age: 28,
    gender: 'masculino',
    bio: "Empreendedor de tecnologia de dia, chef experimental à noite. Procurando alguém para debater filmes de ficção científica e testar novas receitas.",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=800",
    ],
    distance: 5,
    verified: true,
    interests: ["Startups", "Culinária", "Ficção Científica", "Trilhas"],
    compatibility: 87,
    isOnline: false,
    jobTitle: "Fundador",
    company: "TechNova",
    relationshipStatus: "Solteiro",
    city: "Rio de Janeiro, RJ",
    intent: "Algo Casual",
    lifestyle: ["Treina", "Bebe Socialmente"],
  },
  {
    id: "u3",
    name: "Sophia",
    age: 26,
    gender: 'feminino',
    bio: "Sempre planejando minha próxima viagem. Falo 3 idiomas e adoro descobrir lugares que só os locais conhecem.",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
    ],
    distance: 1,
    verified: true,
    interests: ["Viagens", "Idiomas", "Degustação de Vinhos", "Arte"],
    compatibility: 91,
    isOnline: true,
    education: "Mestrado em Linguística",
    relationshipStatus: "Solteira",
    city: "Curitiba, PR",
    intent: "Relacionamento Sério",
    lifestyle: ["Bebe Socialmente", "Não Fuma"],
  },
  {
    id: "u4",
    name: "James",
    age: 29,
    gender: 'masculino',
    bio: "Produtor musical / DJ. Se você curte viagens de carro de última hora com música alta, vamos nos dar super bem.",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    ],
    distance: 8,
    verified: false,
    interests: ["Produção Musical", "Festivais", "Viagens", "Discos de Vinil"],
    compatibility: 78,
    isOnline: true,
    relationshipStatus: "Relacionamento Aberto",
    city: "Belo Horizonte, MG",
    intent: "Amizade",
    lifestyle: ["Gosta de Pets"],
    isNew: true,
  },
  {
    id: "u5",
    name: "Elena",
    age: 25,
    gender: 'feminino',
    bio: "Instrutora de Yoga & mãe de planta. Tentando encontrar equilíbrio num mundo caótico. Vamos tomar um matcha.",
    images: [
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&q=80&w=800",
    ],
    distance: 3,
    verified: true,
    interests: ["Yoga", "Veganismo", "Plantas", "Meditação"],
    compatibility: 85,
    isOnline: false,
    relationshipStatus: "Solteira",
    city: "Florianópolis, SC",
    intent: "Relacionamento Sério",
    lifestyle: ["Não Fuma", "Treina"],
  }
];

export interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'system' | 'superlike';
  user?: User;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    user: mockUsers[1],
    content: 'Você deu match com Marcus!',
    timestamp: '2 min atrás',
    isRead: false
  },
  {
    id: '2',
    type: 'message',
    user: mockUsers[2],
    content: 'Enviou uma nova mensagem: "Oi, tudo bem?"',
    timestamp: '15 min atrás',
    isRead: false
  },
  {
    id: '3',
    type: 'superlike',
    user: mockUsers[3],
    content: 'Elena te enviou um Super Like! 🔥',
    timestamp: '1 hora atrás',
    isRead: true
  },
  {
    id: '4',
    type: 'like',
    user: mockUsers[4],
    content: 'Alguém novo curtiu seu perfil.',
    timestamp: '3 horas atrás',
    isRead: true
  },
  {
    id: '5',
    type: 'system',
    content: 'Seu perfil está 90% completo. Adicione mais fotos para ganhar 2x mais visibilidade!',
    timestamp: 'Ontem',
    isRead: true
  },
  {
    id: '6',
    type: 'match',
    user: mockUsers[0],
    content: 'Novo Match! Você e Lucas agora estão conectados.',
    timestamp: 'Ontem',
    isRead: true
  },
  {
    id: '7',
    type: 'like',
    user: mockUsers[5] || mockUsers[0],
    content: 'Beatriz curtiu você.',
    timestamp: '2 dias atrás',
    isRead: true
  },
  {
    id: '8',
    type: 'message',
    user: mockUsers[1],
    content: 'Marcus: "Vamos marcar um café?"',
    timestamp: '2 dias atrás',
    isRead: true
  },
  {
    id: '9',
    type: 'system',
    content: 'Bem-vindo ao Match Deck! Comece a deslizar para encontrar pessoas.',
    timestamp: '3 dias atrás',
    isRead: true
  },
  {
    id: '10',
    type: 'match',
    user: mockUsers[2],
    content: 'Você e Elena deram match há uma semana. Que tal dizer oi?',
    timestamp: '1 semana atrás',
    isRead: true
  },
  {
    id: '11',
    type: 'like',
    content: '15 pessoas curtiram você enquanto você estava fora!',
    timestamp: '1 semana atrás',
    isRead: true
  },
  {
    id: '12',
    type: 'system',
    content: 'Dica: Perfis com bio completa recebem 3x mais matches.',
    timestamp: '2 semanas atrás',
    isRead: true
  },
  {
    id: '13',
    type: 'match',
    user: mockUsers[3],
    content: 'Elena enviou um aceno! 👋',
    timestamp: '3 semanas atrás',
    isRead: true
  },
  {
    id: '14',
    type: 'like',
    user: mockUsers[1],
    content: 'Marcus visualizou seu perfil.',
    timestamp: '1 mês atrás',
    isRead: true
  },
  {
    id: '15',
    type: 'system',
    content: 'Seu plano Gold expira em 3 dias. Renove agora para manter seus benefícios.',
    timestamp: '1 mês atrás',
    isRead: true
  },
  {
    id: '16',
    type: 'like',
    content: 'Alguém especial curtiu seu perfil! Revelar agora?',
    timestamp: '1 mês atrás',
    isRead: true
  },
  {
    id: '17',
    type: 'match',
    user: mockUsers[4],
    content: 'Você e Isabella deram match! Comece a conversa com um elogio.',
    timestamp: '2 meses atrás',
    isRead: true
  },
  {
    id: '18',
    type: 'system',
    content: 'Parabéns! Você completou 10 matches esta semana. 🔥',
    timestamp: '2 meses atrás',
    isRead: true
  },
  {
    id: '19',
    type: 'message',
    user: mockUsers[0],
    content: 'Lucas: "Opa, tudo certo?"',
    timestamp: '3 meses atrás',
    isRead: true
  },
  {
    id: '21',
    type: 'like',
    content: 'Seu perfil foi visto por 50 pessoas hoje! 🔥',
    timestamp: '5 meses atrás',
    isRead: true
  },
  {
    id: '22',
    type: 'system',
    content: 'Atualize suas preferências de busca para ver resultados mais precisos.',
    timestamp: '6 meses atrás',
    isRead: true
  },
  {
    id: '23',
    type: 'match',
    user: mockUsers[1],
    content: 'Você e Marcus combinaram há 6 meses. Relembre o momento!',
    timestamp: '6 meses atrás',
    isRead: true
  }
];

export const mockChats = [
  {
    id: "c1",
    userId: "u1",
    lastMessage: "Isso parece uma noite perfeita! ✨",
    time: "10:24",
    unread: 2,
    hasStory: true,
  },
  {
    id: "c2",
    userId: "u3",
    lastMessage: "Você está livre este fim de semana?",
    time: "Ontem",
    unread: 0,
    hasStory: false,
  }
];
