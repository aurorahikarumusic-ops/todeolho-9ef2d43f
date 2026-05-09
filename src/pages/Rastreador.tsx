import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Brain, Zap, Moon, Smile, Droplets, Utensils, 
  TrendingUp, Sparkles, Footprints, Info, CheckCircle2,
  Calendar, ChevronRight, Loader2, ArrowLeft, BarChart3, ChevronDown, Plus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Mock Data
const BRISTOL_SCALE = [
  { type: 1, desc: "Caroços duros e separados" },
  { type: 2, desc: "Formato de salsicha, mas encaroçado" },
  { type: 3, desc: "Formato de salsicha, com rachaduras" },
  { type: 4, desc: "Formato de salsicha, lisa e macia" },
  { type: 5, desc: "Pedaços moles com bordas nítidas" },
  { type: 6, desc: "Pedaços fofos, bordas irregulares" },
  { type: 7, desc: "Aquosa, sem pedaços sólidos" },
];

export default function Rastreador() {
  const [view, setView] = useState<"dashboard" | "registro_rapido" | "registro_detalhado" | "historico" | "insights">("dashboard");
  const [gutScore] = useState(78);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#2A8C7E]";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="max-w-[400px] mx-auto min-h-screen pb-24 bg-[#F8F5F1]">
      <AnimatePresence mode="wait">
        {view === "dashboard" && <DashboardView key="dashboard" gutScore={gutScore} setView={setView} getScoreColor={getScoreColor} />}
        {view === "registro_rapido" && <QuickRegisterView key="registro" setView={setView} />}
        {view === "historico" && <HistoryView key="historico" setView={setView} />}
        {view === "insights" && <InsightsView key="insights" setView={setView} />}
      </AnimatePresence>
    </div>
  );
}

function DashboardView({ gutScore, setView, getScoreColor }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, Maria!</h1>
          <p className="text-[#2A8C7E] font-medium">Como está sua flora hoje?</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#A3D9D3]">
            <span className="text-xl font-bold text-[#2A8C7E]">🔥</span>
        </div>
      </header>

      <Card className="p-8 rounded-[2rem] border-none bg-white shadow-lg flex flex-col items-center gap-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Gut Health Score</h2>
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="#2A8C7E" strokeWidth="12" fill="none" strokeDasharray={`${gutScore * 4.4} 440`} strokeLinecap="round" />
            </svg>
            <div className="absolute text-5xl font-black text-gray-900">{gutScore}</div>
        </div>
        <p className={`font-bold text-lg ${getScoreColor(gutScore)}`}>
           {gutScore >= 80 ? "Equilíbrio excelente!" : gutScore >= 60 ? "Quase lá, mantenha o foco!" : "Vamos cuidar da sua flora."}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => setView("registro_rapido")} className="h-32 rounded-[2rem] bg-[#2A8C7E] text-white flex flex-col gap-2 shadow-xl shadow-[#2A8C7E]/20">
            <Plus className="w-8 h-8" />
            <span className="font-bold">Registrar Agora</span>
        </Button>
        <div className="space-y-4">
            <Button variant="outline" onClick={() => setView("historico")} className="w-full h-14 rounded-2xl border-[#A3D9D3]">Gráficos</Button>
            <Button variant="outline" onClick={() => setView("insights")} className="w-full h-14 rounded-2xl border-[#A3D9D3]">Insights</Button>
        </div>
      </div>
    </motion.div>
  );
}

function QuickRegisterView({ setView }: any) {
  const symptoms = ["Inchaço", "Gases", "Energia", "Humor", "Sono"];
  return (
    <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
       <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-[#2A8C7E] font-bold">
         <ArrowLeft className="w-5 h-5" /> Voltar
       </button>
       <h2 className="text-2xl font-bold">Registro Rápido</h2>
       {symptoms.map(s => (
          <div key={s} className="space-y-2">
            <div className="flex justify-between text-sm font-semibold text-gray-700">
               <span>{s}</span>
               <span>Médio</span>
            </div>
            <Slider defaultValue={[5]} max={10} step={1} />
          </div>
       ))}
       <Button onClick={() => toast.success("Salvo!") || setView("dashboard")} className="w-full h-16 rounded-full bg-[#2A8C7E] font-bold text-lg mt-8">
         Salvar Registro
       </Button>
    </motion.div>
  );
}

function HistoryView({ setView }: any) {
    return (
        <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
           <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-[#2A8C7E] font-bold">
             <ArrowLeft className="w-5 h-5" /> Voltar
           </button>
           <h2 className="text-2xl font-bold">Sua Jornada</h2>
           <Card className="p-6 rounded-3xl">
             <h3 className="font-bold mb-4">Gut Score Semanal</h3>
             <div className="h-40 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 italic text-sm">
                [Gráfico de barras renderizado aqui]
             </div>
           </Card>
           <Button variant="outline" className="w-full h-14 rounded-full border-[#2A8C7E] text-[#2A8C7E]">Baixar Relatório PDF</Button>
        </motion.div>
    );
}

function InsightsView({ setView }: any) {
    return (
        <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
           <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-[#2A8C7E] font-bold">
             <ArrowLeft className="w-5 h-5" /> Voltar
           </button>
           <h2 className="text-2xl font-bold">Insights IA</h2>
           <Card className="p-6 rounded-3xl bg-[#E8C7C8]/10 border-none">
              <Sparkles className="w-10 h-10 text-[#2A8C7E] mb-4" />
              <p className="text-gray-800 leading-relaxed font-medium">
                "Notei que quando você ingere mais de 25g de fibras, seu inchaço reduz drasticamente no dia seguinte. Continue focando na aveia e abacate no café da manhã!"
              </p>
           </Card>
        </motion.div>
    );
}
