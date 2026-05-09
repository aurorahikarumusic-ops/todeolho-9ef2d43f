import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Activity, 
  Utensils, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Plus, 
  Heart, 
  MessageCircle, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FloraDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [checkedHabits, setCheckedHabits] = useState<string[]>([]);

  const toggleHabit = (id: string) => {
    setCheckedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
    if (!checkedHabits.includes(id)) {
      toast.success("Hábito concluído! ✨");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab toggleHabit={toggleHabit} checkedHabits={checkedHabits} />;
      case 'stats': return <StatsTab />;
      case 'plan': return <DietPlanTab />;
      case 'recipes': return <RecipesTab />;
      case 'community': return <CommunityTab />;
      default: return <HomeTab toggleHabit={toggleHabit} checkedHabits={checkedHabits} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2A2A] text-white font-['Inter'] relative overflow-hidden pb-24">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A3D9D3]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E8C7C8]/10 rounded-full blur-[120px]" />
      </div>

      <header className="px-6 pt-8 pb-4 relative z-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-['Playfair_Display'] font-bold text-white tracking-tight">Flora 40+</h1>
          <p className="text-white/60 text-sm font-medium">Equilíbrio & Vitalidade</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
          <span className="text-[#A3D9D3] font-bold text-lg">C</span>
        </div>
      </header>

      <main className="relative z-10 px-6 pt-4 animate-in fade-in duration-700">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center justify-around px-4 z-50 shadow-2xl">
        <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={Activity} label="Status" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        <NavButton icon={Utensils} label="Plano" active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
        <NavButton icon={BookOpen} label="Pratos" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
        <NavButton icon={Users} label="Nós" active={activeTab === 'community'} onClick={() => setActiveTab('community')} />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
    >
      <div className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-[#A3D9D3]/20 text-[#A3D9D3]' : 'text-white'}`}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </div>
    </button>
  );
}

function HomeTab({ toggleHabit, checkedHabits }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-['Playfair_Display'] text-white">Boa tarde, Claudia</h2>
        <Badge className="w-fit bg-white/10 border-white/10 text-[#A3D9D3] hover:bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
          <Calendar size={12} className="mr-1.5" /> 9 de Maio, 2026
        </Badge>
      </div>

      {/* Gut Health Score */}
      <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex flex-col items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform">
          <Sparkles size={40} className="text-[#A3D9D3]" />
        </div>
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Gut Health Score</h3>
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
            <circle 
              cx="80" cy="80" r="70" stroke="#A3D9D3" strokeWidth="12" fill="none" 
              strokeDasharray={`${78 * 4.4} 440`} strokeLinecap="round" 
              className="drop-shadow-[0_0_8px_rgba(163,217,211,0.5)]"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-white">78</span>
            <span className="text-[10px] text-[#A3D9D3] font-bold uppercase tracking-widest">Ótimo</span>
          </div>
        </div>
        <p className="text-white/80 text-center text-sm font-medium italic">"Sua microbiota está florescendo hoje."</p>
      </Card>

      {/* Quick Checklist */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest pl-2">Metas do Dia</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'water', label: '2L de Água', icon: Droplets, color: 'text-blue-400' },
            { id: 'fiber', label: '30g de Fibras', icon: Utensils, color: 'text-green-400' },
            { id: 'move', label: '30min de Movimento', icon: Activity, color: 'text-orange-400' }
          ].map(habit => (
            <div 
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-between transition-all cursor-pointer ${checkedHabits.includes(habit.id) ? 'opacity-50' : 'hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-white/5 ${habit.color}`}>
                  <habit.icon size={20} />
                </div>
                <span className="font-semibold text-white/90">{habit.label}</span>
              </div>
              <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${checkedHabits.includes(habit.id) ? 'bg-[#A3D9D3] border-[#A3D9D3]' : 'border-white/10'}`}>
                {checkedHabits.includes(habit.id) && <CheckCircle2 size={16} className="text-[#0F2A2A]" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destaque Refeição */}
      <Card className="p-6 bg-[#E8C7C8]/10 backdrop-blur-xl border border-[#E8C7C8]/20 rounded-[2rem] flex gap-5 items-center">
        <div className="w-20 h-20 rounded-3xl bg-[#E8C7C8]/20 flex items-center justify-center overflow-hidden border border-white/10">
          <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop" alt="Recipe" className="object-cover w-full h-full" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-[#E8C7C8] uppercase tracking-widest mb-1">Destaque de hoje</p>
          <h4 className="text-lg font-bold text-white tracking-tight">Bowl Mediterrâneo</h4>
          <p className="text-xs text-white/40 flex items-center gap-2 mt-1">
            <Sparkles size={10} className="text-[#A3D9D3]" /> Anti-inflamatório
          </p>
        </div>
        <ChevronRight size={20} className="text-white/20" />
      </Card>
    </div>
  );
}

function StatsTab() {
  const data = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Gut Score',
        data: [65, 78, 72, 85, 80, 88, 78],
        fill: true,
        borderColor: '#A3D9D3',
        backgroundColor: 'rgba(163, 217, 211, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#A3D9D3',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 42, 42, 0.9)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        cornerRadius: 16,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)' } },
      y: { display: false }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-['Playfair_Display']">Minha Jornada</h2>
      
      <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] h-64">
        <Line data={data} options={options} />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard label="Inchaço" value="Leve" trend="desc" color="text-green-400" />
        <StatsCard label="Energia" value="Alta" trend="asc" color="text-orange-400" />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full h-16 rounded-full bg-[#A3D9D3] text-[#0F2A2A] font-bold text-lg shadow-xl shadow-[#A3D9D3]/20">
            <Plus size={20} className="mr-2" /> Registrar Sintomas
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0F2A2A] border-white/20 text-white rounded-[2.5rem] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-['Playfair_Display'] text-white">Como você está?</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/60">Escala de Inchaço</label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-[#A3D9D3] hover:text-[#0F2A2A] transition-all">{n}</button>
                ))}
              </div>
            </div>
            <Button className="w-full bg-[#A3D9D3] text-[#0F2A2A] rounded-full py-6 font-bold" onClick={() => toast.success("Registro salvo!")}>Salvar Check-in</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ label, value, trend, color }: any) {
  return (
    <Card className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-1">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xl font-bold text-white">{value}</span>
        <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>
          {trend === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        </div>
      </div>
    </Card>
  );
}

function DietPlanTab() {
  const [day, setDay] = useState('Seg');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-['Playfair_Display']">Plano Alimentar</h2>
        <Badge className="bg-white/10 border-white/10 text-[#E8C7C8]">Fase: Menopausa</Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
          <button 
            key={d}
            onClick={() => setDay(d)}
            className={`px-5 py-3 rounded-2xl transition-all font-bold text-sm ${day === d ? 'bg-[#A3D9D3] text-[#0F2A2A] shadow-lg shadow-[#A3D9D3]/20' : 'bg-white/5 text-white/40'}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <MealItem time="08:00" type="Café da Manhã" title="Smoothie de Kefir e Frutas Vermelhas" benefit="Probiótico & Antioxidante" />
        <MealItem time="10:30" type="Lanche" title="Mix de Castanhas e Sementes" benefit="Gorduras boas & Energia" />
        <MealItem time="13:00" type="Almoço" title="Salmão ao Forno com Aspargos" benefit="Ômega 3 & Anti-inflamatório" />
        <MealItem time="16:00" type="Lanche" title="Iogurte de Coco com Chia" benefit="Saciedade & Fibras" />
        <MealItem time="19:30" type="Jantar" title="Sopa de Lentilha e Espinafre" benefit="Leve & Nutritivo" />
      </div>
    </div>
  );
}

function MealItem({ time, type, title, benefit }: any) {
  return (
    <div className="p-6 glass rounded-[2rem] border border-white/10 flex gap-5 items-center group active:scale-[0.98] transition-all">
      <div className="text-center min-w-[50px]">
        <span className="text-xs font-black text-[#A3D9D3] block">{time}</span>
        <div className="w-1 h-4 bg-white/10 rounded-full mx-auto my-1" />
      </div>
      <div className="flex-1 space-y-1">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">{type}</span>
        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        <span className="text-[10px] text-[#E8C7C8] font-bold flex items-center gap-1.5 uppercase tracking-wider italic">
          <Heart size={10} className="fill-[#E8C7C8]/20" /> {benefit}
        </span>
      </div>
    </div>
  );
}

function RecipesTab() {
  const recipes = [
    { title: "Smoothie Detox", tag: "Fibras", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=300&fit=crop" },
    { title: "Salada de Grão", tag: "Hormônios", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop" },
    { title: "Peixe Grelhado", tag: "Ômega 3", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop" },
    { title: "Kefir Caseiro", tag: "Probiótico", img: "https://images.unsplash.com/photo-1623910543621-e37463f27471?w=300&h=300&fit=crop" }
  ];

  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-2xl font-['Playfair_Display']">Banco de Receitas</h2>
      <div className="flex gap-2 mb-4">
        {["Todos", "Café", "Almoço", "Snacks"].map((f, i) => (
          <Badge key={f} className={`px-4 py-2 rounded-full border-white/10 ${i === 0 ? 'bg-[#A3D9D3] text-[#0F2A2A]' : 'bg-white/5 text-white/60'}`}>{f}</Badge>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {recipes.map(r => (
          <Card key={r.title} className="p-4 bg-white/5 border border-white/10 rounded-[2rem] space-y-3 active:scale-[0.98] transition-all overflow-hidden group">
            <div className="w-full aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/10">
              <img src={r.img} alt={r.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#A3D9D3] uppercase tracking-widest">{r.tag}</span>
              <h4 className="text-sm font-bold text-white tracking-tight">{r.title}</h4>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CommunityTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-['Playfair_Display']">Nossa Comunidade</h2>
      
      <Card className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
        <textarea 
          placeholder="Como você está florescendo hoje?" 
          className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 resize-none h-20 font-medium"
        />
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" className="text-white/40"><Plus size={18} className="mr-2" /> Foto</Button>
          <Button className="bg-[#A3D9D3] text-[#0F2A2A] rounded-full px-6 font-bold shadow-lg shadow-[#A3D9D3]/10">Postar</Button>
        </div>
      </Card>

      <div className="space-y-6">
        <Post user="Maria Luíza" time="2h" text="Finalmente consegui bater minha meta de água por 5 dias seguidos! Sinto meu inchaço muito menor. 🎉" likes={12} />
        <Post user="Regina S." time="5h" text="Alguém mais sentindo ondas de calor mais intensas com o café? Mudei para chá verde e ajudou muito." likes={8} comments={3} />
      </div>
    </div>
  );
}

function Post({ user, time, text, likes, comments = 0 }: any) {
  const [liked, setLiked] = useState(false);
  return (
    <Card className="p-6 glass rounded-[2rem] border border-white/10 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#E8C7C8]">{user[0]}</div>
        <div>
          <h4 className="text-sm font-bold text-white">{user}</h4>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Há {time}</span>
        </div>
      </div>
      <p className="text-sm text-white/80 leading-relaxed font-medium">{text}</p>
      <div className="flex gap-6 pt-2">
        <button 
          onClick={() => setLiked(!liked)} 
          className={`flex items-center gap-2 text-xs font-bold transition-all ${liked ? 'text-[#E8C7C8]' : 'text-white/30'}`}
        >
          <Heart size={18} fill={liked ? '#E8C7C8' : 'none'} /> {liked ? likes + 1 : likes}
        </button>
        <button className="flex items-center gap-2 text-xs font-bold text-white/30">
          <MessageCircle size={18} /> {comments}
        </button>
      </div>
    </Card>
  );
}

// Icons placeholders for habits
function Droplets(props: any) { return <span {...props}>💧</span>; }
function TrendingUp(props: any) { return <span {...props}>↗️</span>; }
function TrendingDown(props: any) { return <span {...props}>↘️</span>; }
