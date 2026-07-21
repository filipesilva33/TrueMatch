export interface GifItem {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
}

export interface StickerItem {
  id: string;
  url: string;
  title: string;
  category: string;
  tags: string[];
}

export const curatedGifs: GifItem[] = [
  // Reactions / Funny
  {
    id: "g_funny_cat",
    url: "https://i.giphy.com/33OrjzUFwkwEg.gif",
    title: "Gato Dançando",
    category: "Reações",
    tags: ["gato", "cat", "dance", "dança", "funny", "engraçado", "animais", "pet"]
  },
  {
    id: "g_minion_cheer",
    url: "https://i.giphy.com/11sBLVxNs7v6WA.gif",
    title: "Minions Celebrando",
    category: "Celebração",
    tags: ["minion", "celebrar", "festa", "feliz", "happy", "comemoração", "conquista"]
  },
  {
    id: "g_leonardo_toast",
    url: "https://i.giphy.com/g9582DNuQppazNmUF3.gif",
    title: "Brinde do Gatsby",
    category: "Reações",
    tags: ["brinde", "leonardo dicaprio", "gatsby", "concordo", "respeito", "chique"]
  },
  {
    id: "g_dog_wave",
    url: "https://i.giphy.com/3og0IPxMM0xqCCXg1a.gif",
    title: "Cachorrinho dando oi",
    category: "Saudações",
    tags: ["oi", "hello", "tchau", "wave", "cachorro", "dog", "fofo", "cute"]
  },
  {
    id: "g_laugh_office",
    url: "https://i.giphy.com/BY8ORoRcljXHO.gif",
    title: "Michael Scott rindo",
    category: "Riso",
    tags: ["rir", "laugh", "the office", "michael scott", "engraçado", "deboche"]
  },
  {
    id: "g_friends_joy",
    url: "https://i.giphy.com/31lPv5LmdCD1m.gif",
    title: "Joey e Chandler pulando",
    category: "Celebração",
    tags: ["friends", "joey", "chandler", "pulo", "feliz", "comemorando", "alegre"]
  },
  {
    id: "g_cat_typing",
    url: "https://i.giphy.com/JIX9t2j0ZTN9S.gif",
    title: "Gato digitando rápido",
    category: "Trabalho",
    tags: ["gato", "digitando", "escrevendo", "pressa", "foco", "pc", "computador"]
  },
  {
    id: "g_mr_bean_wave",
    url: "https://i.giphy.com/mCbUi0FyYhHHhutr8C.gif",
    title: "Mr. Bean dando oi",
    category: "Saudações",
    tags: ["mr bean", "oi", "hello", "tchau", "acenando", "engraçado"]
  },
  {
    id: "g_drake_yes",
    url: "https://i.giphy.com/l46Csb69gVog9gY12.gif",
    title: "Drake aprovando",
    category: "Reações",
    tags: ["drake", "sim", "gostei", "aprovado", "meme", "engraçado"]
  },
  {
    id: "g_sad_hamster",
    url: "https://i.giphy.com/v7asg9Z3I6XfO.gif",
    title: "Hamster triste",
    category: "Tristeza",
    tags: ["hamster", "triste", "sad", "olhar", "fofo", "meme", "violin"]
  },
  {
    id: "g_cat_vibing",
    url: "https://i.giphy.com/GeimqsH0TLDt4tScGw.gif",
    title: "Gatinho curtindo o som",
    category: "Música",
    tags: ["gato", "cat", "vibing", "música", "feliz", "ritmo", "meme"]
  },
  // Added Popular & Funny GIFs
  {
    id: "g_baby_yoda",
    url: "https://i.giphy.com/9f3iqY7uztELD.gif",
    title: "Baby Yoda bebendo sopa",
    category: "Fofo",
    tags: ["baby yoda", "star wars", "soup", "sopa", "fofo", "preguiça", "assistindo"]
  },
  {
    id: "g_homer_bush",
    url: "https://i.giphy.com/jUwpNzg9IcyrK.gif",
    title: "Homer sumindo na moita",
    category: "Memes",
    tags: ["homer simpson", "moita", "bush", "sumiu", "disfarçar", "vergonha", "meme"]
  },
  {
    id: "g_confused_travolta",
    url: "https://i.giphy.com/20O2uHE8S0036.gif",
    title: "John Travolta confuso",
    category: "Memes",
    tags: ["confuso", "travolta", "perdido", "onde", "que", "como assim", "meme"]
  },
  {
    id: "g_spongebob_magic",
    url: "https://i.giphy.com/BQiitYp4S6Y00.gif",
    title: "Bob Esponja Imaginação",
    category: "Memes",
    tags: ["bob esponja", "imaginação", "arco-iris", "magia", "uau", "lindo", "meme"]
  },
  {
    id: "g_kermit_tea",
    url: "https://i.giphy.com/3o85xGocUH8TC0XgWk.gif",
    title: "Kermit tomando chá",
    category: "Memes",
    tags: ["kermit", "sapo", "chá", "fofoca", "não é problema meu", "meme", "debochado"]
  },
  {
    id: "g_surprised_pikachu",
    url: "https://i.giphy.com/3kzJvclETdwAn8j.gif",
    title: "Pikachu Surpreso",
    category: "Memes",
    tags: ["pikachu", "surpreso", "chocado", "uau", "pokemon", "engraçado", "meme"]
  },
  {
    id: "g_this_is_fine",
    url: "https://i.giphy.com/NTur7X5LdmCY.gif",
    title: "Está tudo bem (Cachorro no fogo)",
    category: "Memes",
    tags: ["tudo bem", "fine", "fire", "fogo", "caos", "desespero", "rindo de nervoso", "meme"]
  },
  // Love / Romance / Flirting
  {
    id: "g_love_stitch",
    url: "https://i.giphy.com/l0GRobGyHV6s6vUIU.gif",
    title: "Stitch Apaixonado",
    category: "Amor",
    tags: ["amor", "love", "stitch", "fofo", "cute", "apaixonado", "carinho", "corações"]
  },
  {
    id: "g_bear_hug",
    url: "https://i.giphy.com/KeD8Nn7R6uNlS.gif",
    title: "Urso Abraço",
    category: "Amor",
    tags: ["abraço", "hug", "carinho", "amor", "love", "ursinho", "fofo", "cute"]
  },
  {
    id: "g_puppy_eyes",
    url: "https://i.giphy.com/qUIm5wu6LgXms.gif",
    title: "Olhar de cachorrinho",
    category: "Fofo",
    tags: ["por favor", "fofo", "cute", "dog", "olhar", "triste", "carência"]
  },
  {
    id: "g_shrek_wink",
    url: "https://i.giphy.com/10UUe8ZsLnaqwo.gif",
    title: "Shrek Piscando",
    category: "Flerte",
    tags: ["shrek", "piscar", "wink", "flerte", "charme", "engraçado"]
  },
  {
    id: "g_cat_heart_eyes",
    url: "https://i.giphy.com/yFQ0ywscgobJK.gif",
    title: "Gatinho Olhar Apaixonado",
    category: "Amor",
    tags: ["gato", "cat", "love", "amor", "olhar", "fofo", "coração"]
  },
  {
    id: "g_blow_kiss",
    url: "https://i.giphy.com/l41JWI85TCaCc7504.gif",
    title: "Marilyn Monroe mandando beijo",
    category: "Flerte",
    tags: ["beijo", "kiss", "marilyn monroe", "flerte", "linda", "amor"]
  },
  // Memes / Trends
  {
    id: "g_mind_blown",
    url: "https://i.giphy.com/2rqEdFksL5CWC.gif",
    title: "Explosão de mente",
    category: "Memes",
    tags: ["uau", "wow", "mind blown", "surpreso", "chocado", "incrível", "meme"]
  },
  {
    id: "g_dancing_baby",
    url: "https://i.giphy.com/13CoXDiaCcC9cY.gif",
    title: "Bebê Dançando",
    category: "Funny",
    tags: ["bebe", "dança", "engraçado", "funny", "classic", "meme"]
  },
  {
    id: "g_wait_what",
    url: "https://i.giphy.com/Wgb2F9FHxdSIo.gif",
    title: "Olhar desconfiado",
    category: "Memes",
    tags: ["espera", "que", "como assim", "desconfiado", "meme", "engraçado"]
  },
  {
    id: "g_smart_think",
    url: "https://i.giphy.com/d3mlE7uhX8KFgEmY.gif",
    title: "Pensamento esperto",
    category: "Memes",
    tags: ["esperto", "ideia", "pensar", "mente", "sabedoria", "meme"]
  },
  {
    id: "g_applause_clapping",
    url: "https://i.giphy.com/1236TCtX5dsGEo.gif",
    title: "Palmas / Aplausos",
    category: "Celebração",
    tags: ["palmas", "aplausos", "clapping", "parabens", "sucesso", "concordo"]
  }
];

export const curatedStickers: StickerItem[] = [
  // Cute transparent background stickers (high quality transparent stickers)
  {
    id: "s_heart_balloon",
    url: "https://i.giphy.com/j6glB3sO10467X1I2F.gif",
    title: "Balão de Coração",
    category: "Amor",
    tags: ["coração", "balloon", "heart", "amor", "love", "sticker", "transparente"]
  },
  {
    id: "s_peach_cat_heart",
    url: "https://i.giphy.com/WfM6eXvSk80g0.gif",
    title: "Gatinho com Coração",
    category: "Amor",
    tags: ["gatinho", "cat", "sticker", "amor", "love", "fofo", "cute"]
  },
  {
    id: "s_cute_panda",
    url: "https://i.giphy.com/6pS39g7360T8A.gif",
    title: "Panda dando Tchau",
    category: "Fofo",
    tags: ["panda", "tchau", "oi", "hello", "wave", "sticker", "fofo", "cute"]
  },
  {
    id: "s_happy_dog",
    url: "https://i.giphy.com/3oz8xAFtqo0Xiw6w80.gif",
    title: "Cachorrinho Feliz",
    category: "Alegre",
    tags: ["dog", "cachorrinho", "feliz", "happy", "sticker", "cute", "fofo"]
  },
  {
    id: "s_love_letter",
    url: "https://i.giphy.com/R3S0Y8oYLaA6s.gif",
    title: "Carta de Amor",
    category: "Amor",
    tags: ["carta", "love", "amor", "sticker", "envelope", "beijo", "kiss"]
  },
  {
    id: "s_cat_wink",
    url: "https://i.giphy.com/V9Xm98cEEDZJK.gif",
    title: "Piscadela de Gato",
    category: "Fofo",
    tags: ["gato", "cat", "piscar", "wink", "sticker", "cute", "fofo"]
  },
  {
    id: "s_golden_star",
    url: "https://i.giphy.com/26hpKz765v9wS1N84.gif",
    title: "Estrela Brilhante",
    category: "Alegre",
    tags: ["estrela", "star", "brilho", "feliz", "sticker", "celebrar"]
  },
  {
    id: "s_heart_hands",
    url: "https://i.giphy.com/3o7TKoWXm3okO1kg9y.gif",
    title: "Mãos de Coração",
    category: "Amor",
    tags: ["mao", "coração", "heart", "love", "amor", "sticker", "carinho"]
  },
  {
    id: "s_cute_ghost",
    url: "https://i.giphy.com/3orif6fVpU776HlCne.gif",
    title: "Fantasma Fofo",
    category: "Fofo",
    tags: ["fantasma", "ghost", "halloween", "sticker", "fofo", "cute"]
  },
  {
    id: "s_thumbs_up",
    url: "https://i.giphy.com/3o7abKhOpu0NXS3HBC.gif",
    title: "Joinha Pikachu",
    category: "Aprovado",
    tags: ["pikachu", "joinha", "thumbs up", "ok", "sticker", "legal"]
  },
  {
    id: "s_rose_gift",
    url: "https://i.giphy.com/l0GRobGyHV6s6vUIU.gif",
    title: "Rosa Vermelha",
    category: "Amor",
    tags: ["rosa", "flor", "romance", "amor", "gift", "sticker", "presente"]
  },
  {
    id: "s_cute_bunny",
    url: "https://i.giphy.com/L8b0F4f7Z5V04.gif",
    title: "Coelhinho Pulando",
    category: "Fofo",
    tags: ["coelho", "bunny", "fofo", "cute", "sticker", "transparente"]
  },
  {
    id: "s_boba_tea",
    url: "https://i.giphy.com/L3cl4RovshK0BAsF3Z.gif",
    title: "Chá de Boba Fofo",
    category: "Comida",
    tags: ["boba", "cha", "tea", "drink", "sticker", "cute", "fofo"]
  },
  {
    id: "s_heart_fire",
    url: "https://i.giphy.com/Kzb1z56Mpxp9nkW9vU.gif",
    title: "Coração pegando fogo",
    category: "Amor",
    tags: ["coração", "fogo", "fire", "love", "amor", "sticker", "quente"]
  },
  // Added Popular & Beautiful transparent stickers
  {
    id: "s_cute_cat_dance",
    url: "https://i.giphy.com/Zco8AEXv7S7RscR00k.gif",
    title: "Gatinho Dançando",
    category: "Fofo",
    tags: ["gato", "cat", "sticker", "dança", "dance", "fofo", "cute"]
  },
  {
    id: "s_pusheen_wave",
    url: "https://i.giphy.com/26gscSgI6mX7V.gif",
    title: "Pusheen dando Tchau",
    category: "Fofo",
    tags: ["pusheen", "cat", "oi", "hello", "tchau", "sticker", "cute", "fofo"]
  },
  {
    id: "s_sparkles_gold",
    url: "https://i.giphy.com/3o7bu3XilJFe5S6U8M.gif",
    title: "Brilhos Dourados",
    category: "Alegre",
    tags: ["brilhos", "sparkles", "gold", "ouro", "sticker", "festa", "magia"]
  },
  {
    id: "s_fire_emoji",
    url: "https://i.giphy.com/3o7TKn67R7PfZp97lq.gif",
    title: "Foguinho Estiloso",
    category: "Alegre",
    tags: ["fogo", "fire", "quente", "top", "massa", "sticker"]
  }
];
