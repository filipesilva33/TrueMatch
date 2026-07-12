import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { mockUsers } from '../data/mock';
import { cn } from '../lib/utils';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const jobOptions = [
  'Tecnologia / TI',
  'Saúde / Medicina / Enfermagem',
  'Educação / Professor(a)',
  'Artes / Design / Cinema',
  'Vendas / Marketing',
  'Administração / Gestão',
  'Finanças / Bancário(a)',
  'Engenharia / Arquitetura',
  'Direito / Advocacia',
  'Comunicação / Jornalismo',
  'Estudante',
  'Empreendedor(a) / Autônomo(a)',
  'Outra / Personalizada'
];

const educationOptions = [
  'Ensino Médio',
  'Ensino Técnico',
  'Graduação',
  'Especialização',
  'Mestrado',
  'Doutorado'
];

const intentOptions = [
  'Relacionamento Sério',
  'Algo Casual',
  'Amizade'
];

const interestOptions = [
  'Café', 'Música', 'Cinema', 'Viajar', 'Gamer', 'Leitura', 'Cozinhar', 'Esportes',
  'Academia / Fitness', 'Fotografia', 'Balada / Festas', 'Séries / Filmes', 'Natureza / Trilha',
  'Animais / Pets', 'Tecnologia / Geek', 'Arte / Pintura', 'Dança', 'Vinho / Cerveja',
  'Praia', 'Culinária Vegana', 'Teatro', 'Meditação / Yoga', 'Desenho / Design', 'Música ao Vivo'
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [me, setMe] = useState(() => {
    const stored = localStorage.getItem('truematch_profile_me');
    if (stored) {
      try {
        return { ...mockUsers[0], ...JSON.parse(stored) };
      } catch (e) {
        // Fallback
      }
    }
    return mockUsers[0];
  });

  const [editForm, setEditForm] = useState({
    name: me.name,
    age: me.age,
    city: me.city || '',
    relationshipStatus: me.relationshipStatus || '',
    bio: me.bio || '',
    jobTitle: me.jobTitle || '',
    education: me.education || '',
    intent: me.intent || '',
    lifestyle: me.lifestyle || [],
    gender: me.gender || '',
    sexuality: me.sexuality || '',
    smoking: me.smoking || '',
    drinking: me.drinking || '',
    pets: me.pets || '',
    zodiac: me.zodiac || '',
    children: me.children || '',
    religion: me.religion || '',
    personality: me.personality || '',
  });

  const [selectedJobOption, setSelectedJobOption] = useState(() => {
    if (!me.jobTitle) return '';
    const exists = jobOptions.includes(me.jobTitle);
    return exists ? me.jobTitle : 'Outra / Personalizada';
  });
  
  const [customJobTitle, setCustomJobTitle] = useState(() => {
    const exists = jobOptions.includes(me.jobTitle || '');
    return exists ? '' : (me.jobTitle || '');
  });

  const handleJobSelectChange = (val: string) => {
    setSelectedJobOption(val);
    if (val !== 'Outra / Personalizada') {
      setEditForm(prev => ({ ...prev, jobTitle: val }));
    } else {
      setEditForm(prev => ({ ...prev, jobTitle: customJobTitle }));
    }
  };

  const handleCustomJobChange = (val: string) => {
    setCustomJobTitle(val);
    setEditForm(prev => ({ ...prev, jobTitle: val }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const updatedMe = {
      ...me,
      name: editForm.name,
      age: Number(editForm.age),
      city: editForm.city,
      relationshipStatus: editForm.relationshipStatus,
      bio: editForm.bio,
      jobTitle: editForm.jobTitle,
      education: editForm.education,
      intent: editForm.intent,
      lifestyle: editForm.lifestyle,
      gender: editForm.gender,
      sexuality: editForm.sexuality,
      smoking: editForm.smoking,
      drinking: editForm.drinking,
      pets: editForm.pets,
      zodiac: editForm.zodiac,
      children: editForm.children,
      religion: editForm.religion,
      personality: editForm.personality,
      interests: editForm.lifestyle,
    };

    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), updatedMe);
      }
      localStorage.setItem('truematch_profile_me', JSON.stringify(updatedMe));
      setIsSaving(false);
      navigate('/profile');
    } catch (err) {
      setIsSaving(false);
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid || 'unknown'}`);
    }
  };

  return (
    <div className={cn(
      "flex-1 h-full overflow-y-auto pb-32 hide-scrollbar relative transition-colors duration-300",
      "bg-zinc-950 text-white"
    )}>
      <div className={cn("sticky top-0 z-50 flex items-center p-6 border-b backdrop-blur-xl transition-colors duration-300", "border-white/5 bg-zinc-950/80")}>
        <button 
          onClick={() => navigate('/profile')}
          className="mr-4 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h2 className={cn("text-2xl font-bold transition-colors duration-300", "text-white")}>Editar Perfil</h2>
          <p className="text-xs text-zinc-500 mt-1">Altere suas informações públicas do perfil</p>
        </div>
      </div>
      
      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Nome */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Nome</label>
          <input 
            type="text" 
            value={editForm.name} 
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )} 
            placeholder="Seu nome"
          />
        </div>
        
        {/* Idade */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Idade</label>
          <input 
            type="number" 
            value={editForm.age} 
            onChange={(e) => setEditForm(prev => ({ ...prev, age: Number(e.target.value) }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )} 
            placeholder="Sua idade"
          />
        </div>

        {/* Cidade */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Cidade</label>
          <input 
            type="text" 
            value={editForm.city} 
            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )} 
            placeholder="Sua cidade"
          />
        </div>

        {/* Status Relacionamento */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Status de Relacionamento</label>
          <select 
            value={editForm.relationshipStatus}
            onChange={(e) => setEditForm(prev => ({ ...prev, relationshipStatus: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Em um relacionamento">Em um relacionamento</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
            <option value="Complicado">É complicado</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Bio</label>
          <textarea 
            value={editForm.bio} 
            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors min-h-[120px] resize-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )} 
            placeholder="Fale um pouco sobre você..."
          />
        </div>

        {/* Profissão */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Profissão</label>
          <select 
            value={selectedJobOption}
            onChange={(e) => handleJobSelectChange(e.target.value)}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {jobOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {selectedJobOption === 'Outra / Personalizada' && (
            <input 
              type="text" 
              value={customJobTitle} 
              onChange={(e) => handleCustomJobChange(e.target.value)}
              className={cn(
                "w-full mt-3 border rounded-2xl p-4 outline-none transition-colors",
                "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
              )} 
              placeholder="Digite sua profissão personalizada"
            />
          )}
        </div>

        {/* Educação */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Educação</label>
          <select 
            value={editForm.education}
            onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {educationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        
        {/* Gênero */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Gênero</label>
          <select 
            value={editForm.gender}
            onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Mulheres">Feminino</option>
            <option value="Homens">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Orientação / Sexualidade */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Orientação / Sexualidade</label>
          <select 
            value={editForm.sexuality}
            onChange={(e) => setEditForm(prev => ({ ...prev, sexuality: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Hetero">Hetero</option>
            <option value="Gay">Gay</option>
            <option value="Lésbica">Lésbica</option>
            <option value="Bissexual">Bissexual</option>
          </select>
        </div>

        {/* Sobre Cigarro */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Sobre Cigarro</label>
          <select 
            value={editForm.smoking}
            onChange={(e) => setEditForm(prev => ({ ...prev, smoking: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Fumante">Fumante</option>
            <option value="Não fumante">Não fumante</option>
            <option value="Socialmente">Socialmente</option>
          </select>
        </div>

        {/* Sobre Bebida */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Sobre Bebida</label>
          <select 
            value={editForm.drinking}
            onChange={(e) => setEditForm(prev => ({ ...prev, drinking: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Bebo socialmente">Bebo socialmente</option>
            <option value="Bebo com frequência">Bebo com frequência</option>
            <option value="Não bebo">Não bebo</option>
          </select>
        </div>

        {/* Animais de Estimação */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Animais de Estimação</label>
          <select 
            value={editForm.pets}
            onChange={(e) => setEditForm(prev => ({ ...prev, pets: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            <option value="Cachorro">Cachorro</option>
            <option value="Gato">Gato</option>
            <option value="Outros">Outros</option>
            <option value="Nenhum">Nenhum</option>
          </select>
        </div>

        
        {/* Signo do Zodíaco */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Signo do Zodíaco</label>
          <select 
            value={editForm.zodiac}
            onChange={(e) => setEditForm(prev => ({ ...prev, zodiac: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Sobre Filhos */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Sobre Filhos</label>
          <select 
            value={editForm.children}
            onChange={(e) => setEditForm(prev => ({ ...prev, children: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {['Tenho e quero mais', 'Tenho e não quero mais', 'Não tenho e quero', 'Não quero'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Crença / Religião */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Crença / Religião</label>
          <select 
            value={editForm.religion}
            onChange={(e) => setEditForm(prev => ({ ...prev, religion: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {['Ateu', 'Agnóstico', 'Cristão', 'Católico', 'Evangélico', 'Espírita', 'Outras'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Vibe de Personalidade */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Vibe de Personalidade</label>
          <select 
            value={editForm.personality}
            onChange={(e) => setEditForm(prev => ({ ...prev, personality: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {['Extrovertido', 'Introvertido', 'Ambivertido', 'Espirituoso(a)', 'Calmo(a)', 'Aventureiro(a)', 'Espontâneo(a)', 'Criativo(a)', 'Intelectual', 'Engraçado(a)', 'Carismático(a)', 'Empático(a)'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* O que procuro */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>O que você procura?</label>
          <select 
            value={editForm.intent}
            onChange={(e) => setEditForm(prev => ({ ...prev, intent: e.target.value }))}
            className={cn(
              "w-full border rounded-2xl p-4 outline-none transition-colors appearance-none",
              "bg-zinc-900 border border-white/10 text-white focus:border-pink-500"
            )}
          >
            <option value="">Selecione...</option>
            {intentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Interesses */}
        <div>
          <label className={cn("block text-sm font-bold mb-2 transition-colors duration-300", "text-zinc-400")}>Seus Interesses / Estilo de Vida</label>
          <p className="text-xs text-zinc-500 mb-3">Selecione as opções abaixo para adicionar ao seu perfil:</p>
          
          <div className="flex flex-wrap gap-2 mb-4 max-h-[220px] overflow-y-auto p-2 bg-zinc-900/50 rounded-2xl border border-white/5 hide-scrollbar">
            {interestOptions.map((tag) => {
              const isSelected = editForm.lifestyle.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setEditForm(prev => {
                      const current = prev.lifestyle || [];
                      const next = current.includes(tag)
                        ? current.filter(t => t !== tag)
                        : [...current, tag];
                      return { ...prev, lifestyle: next };
                    });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all duration-200 active:scale-95",
                    isSelected 
                      ? "border-pink-500 bg-pink-500/20 text-pink-300" 
                      : "border-white/5 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Selected interests preview */}
          <div className="mt-5">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Interesses Selecionados ({editForm.lifestyle.length})</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {editForm.lifestyle.length > 0 ? (
                editForm.lifestyle.map((tag, idx) => (
                  <span key={idx} className={cn(
                    "px-3 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-300",
                    "border-purple-500/30 bg-purple-500/10 text-purple-300"
                  )}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm(prev => ({
                          ...prev,
                          lifestyle: prev.lifestyle.filter(t => t !== tag)
                        }));
                      }}
                      className="text-purple-400 hover:text-white font-bold ml-0.5 text-xs focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic block mt-1">Nenhum interesse selecionado</span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <span>Salvar Alterações</span>
          )}
        </button>
      </div>
    </div>
  );
}
