import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Brain, Zap, Moon, Smile, Droplets, Utensils, 
  TrendingUp, Sparkles, Footprints, Info, CheckCircle2,
  Calendar, ChevronRight, Loader2, ArrowLeft, BarChart3, ChevronDown, Plus,
  Stethoscope, Coffee, Wind, AlertCircle, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock Data e Escalas Validadas (Padrão EUA/Clínico)
const BRISTOL_SCALE = [
  { type: 1, desc: "Caroços duros (Prisão de ventre severa)" },
  { type: 2, desc: "Salsicha encaroçada (Prisão de ventre leve)" },
  { type: 3, desc: "Salsicha com rachaduras (Normal/Ideal)" },
  { type: 4, desc: "Salsicha lisa e macia (Ideal)" },
  { type: 5, desc: "Pedaços moles (Falta de fibras)" },
  { type: 6, desc: "Pedaços fofos/irregulares (Inflamação leve)" },
  { type: 7, desc: "Aquosa (Diarreia/Urgência)" },
];

const MENOPAUSE_SYMPTOMS = [
  { id: "hot_flashes", label: "Ondas de Calor", icon: Zap },
  { id: "night_sweats", label: "Suor Noturno", icon: Moon },
  { id: "brain_fog", label: "Névoa Mental", icon: Brain },
  { id: "joint_pain", label: "Dores Articulares", icon: Activity },
  { id: "bloating", label: "Inchaço Abdominal", icon: Wind },
];

export default function Rastreador() {
  const [view, setView] = useState<"dashboard" | "registro_rapido" | "registro_detalhado" | "historico" | "insights">("dashboard");
  const [gutScore] = useState(78);
  const [showMedicalDisclaimer, setShowMedicalDisclaimer] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#2A8C7E]";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="max-w-[400px] mx-auto min-h-screen pb-24 bg-[#FDFBF9]">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#A3D9D3]/20 to-transparent pointer-events-none" />
      <AnimatePresence mode="wait">
        {view === "dashboard" && (
          <DashboardView 
            key="dashboard" 
            gutScore={gutScore} 
            setView={setView} 
            getScoreColor={getScoreColor} 
            onShowDisclaimer={() => setShowMedicalDisclaimer(true)}
          />
        )}
        {view === "registro_rapido" && <QuickRegisterView key="registro" setView={setView} />}
        {view === "historico" && <HistoryView key="historico" setView={setView} />}
        {view === "insights" && <InsightsView key="insights" setView={setView} />}
      </AnimatePresence>

      <Dialog open={showMedicalDisclaimer} onOpenChange={setShowMedicalDisclaimer}>
        <DialogContent className="rounded-3xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2A8C7E]">
              <AlertCircle className="w-5 h-5" /> Nota Importante
            </DialogTitle>
            <DialogDescription className="text-gray-700 pt-4 text-base leading-relaxed">
              Este rastreador baseia-se em escalas clínicas (Bristol e MenoScale) validadas internacionalmente. 
              Os dados coletados são informativos e não substituem o diagnóstico médico. 
              Sempre compartilhe seu relatório com seu ginecologista ou nutricionista.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowMedicalDisclaimer(false)} className="w-full bg-[#2A8C7E] rounded-full py-6 text-lg font-bold">
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardView({ gutScore, setView, getScoreColor, onShowDisclaimer }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 space-y-8 relative z-10">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Olá, Maria</h1>
          <p className="text-[#2A8C7E] font-semibold flex items-center gap-1.5 text-sm bg-[#A3D9D3]/10 w-fit px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 fill-[#2A8C7E]/20" /> Seu corpo em equilíbrio
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onShowDisclaimer} className="bg-white/80 backdrop-blur shadow-sm rounded-2xl border border-gray-100 hover:bg-white transition-all">
          <Info className="w-6 h-6 text-[#2A8C7E]" />
        </Button>
      </header>

      {/* Gut Health Score - Design Premium */}
      <Card className="p-8 rounded-[2.5rem] border-none bg-white shadow-[0_20px_50px_rgba(42,140,126,0.12)] flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6">
           <Stethoscope className="w-10 h-10 text-[#A3D9D3] opacity-10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        
        <div className="space-y-1 text-center">
          <h2 className="text-[10px] font-black text-[#2A8C7E]/40 uppercase tracking-[0.2em]">Microbiome Index</h2>
          <div className="h-1 w-8 bg-[#A3D9D3] rounded-full mx-auto" />
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-[#A3D9D3]/20 rounded-full blur-2xl group-hover:bg-[#A3D9D3]/30 transition-colors" />
            
            <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle cx="96" cy="96" r="82" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="82" 
                  stroke="url(#gradientScore)" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeDasharray={`${gutScore * 5.15} 515`} 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_8px_rgba(42,140,126,0.4)]"
                />
                <defs>
                  <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A3D9D3" />
                    <stop offset="100%" stopColor="#2A8C7E" />
                  </linearGradient>
                </defs>
            </svg>
            <div className="absolute z-20 flex flex-col items-center bg-white rounded-full w-32 h-32 justify-center shadow-inner">
               <span className="text-6xl font-black text-gray-900 tracking-tighter">{gutScore}</span>
               <span className="text-[11px] text-[#2A8C7E] font-black uppercase tracking-wider">Ótimo</span>
            </div>
        </div>
        
        <div className="text-center space-y-1.5 px-4 relative z-10">
          <p className={`font-black text-xl tracking-tight ${getScoreColor(gutScore)}`}>
             Sua flora está vibrante!
          </p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mx-auto">
            Seu metabolismo respondeu bem ao café da manhã proteico de ontem.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Button onClick={() => setView("registro_rapido")} className="h-44 rounded-[2.5rem] bg-[#2A8C7E] text-white flex flex-col gap-4 shadow-[0_20px_40px_rgba(42,140,126,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border-none group">
            <div className="p-4 bg-white/20 rounded-[1.5rem] group-hover:rotate-6 transition-transform">
              <Plus className="w-10 h-10" />
            </div>
            <span className="font-black text-xl leading-tight">Check-in<br/>Diário</span>
        </Button>
        <div className="flex flex-col gap-5">
            <Button variant="outline" onClick={() => setView("historico")} className="flex-1 rounded-[2rem] border-gray-100 bg-white flex flex-col items-center justify-center gap-2 p-5 shadow-sm hover:border-[#A3D9D3] transition-colors group">
               <div className="p-2.5 bg-[#A3D9D3]/10 rounded-2xl group-hover:bg-[#A3D9D3]/20 transition-colors">
                  <BarChart3 className="w-7 h-7 text-[#2A8C7E]" />
               </div>
               <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Padrões</span>
            </Button>
            <Button variant="outline" onClick={() => setView("insights")} className="flex-1 rounded-[2rem] border-gray-100 bg-white flex flex-col items-center justify-center gap-2 p-5 shadow-sm hover:border-[#A3D9D3] transition-colors group">
               <div className="p-2.5 bg-[#A3D9D3]/10 rounded-2xl group-hover:bg-[#A3D9D3]/20 transition-colors">
                  <Sparkles className="w-7 h-7 text-[#2A8C7E]" />
               </div>
               <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Insights</span>
            </Button>
        </div>
      </div>

      {/* Gatilhos - Design Minimalista */}
      <Card className="p-6 rounded-[2rem] border-none bg-white/50 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">Gatilhos Ativos</h3>
          <Info className="w-3.5 h-3.5 text-gray-300" />
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
           {["Glúten", "Café", "Lactose", "Açúcar"].map((trigger, i) => (
             <motion.div 
               key={trigger}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="px-5 py-2.5 bg-white rounded-2xl text-[11px] font-black text-[#2A8C7E] border border-gray-100 shadow-sm whitespace-nowrap active:bg-[#A3D9D3]/10"
             >
               {trigger}
             </motion.div>
           ))}
        </div>
      </Card>
    </motion.div>
  );
}

function QuickRegisterView({ setView }: any) {
  const [step, setStep] = useState(1);
  const [bristol, setBristol] = useState(4);

  return (
    <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
       <header className="flex items-center justify-between">
          <button onClick={() => setView("dashboard")} className="text-[#2A8C7E] font-bold flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" /> Sair
          </button>
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-8 rounded-full ${step >= s ? 'bg-[#2A8C7E]' : 'bg-gray-200'}`} />
            ))}
          </div>
       </header>

       {step === 1 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Como foi sua evacuação?<br/><span className="text-[#2A8C7E] text-lg font-medium">Escala de Bristol</span></h2>
            <div className="grid grid-cols-1 gap-3">
               {BRISTOL_SCALE.map(item => (
                 <button 
                  key={item.type}
                  onClick={() => setBristol(item.type)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${bristol === item.type ? 'border-[#2A8C7E] bg-[#A3D9D3]/10 shadow-md' : 'border-gray-100 bg-white'}`}
                 >
                   <div className="flex flex-col">
                      <span className="font-bold text-gray-900">Tipo {item.type}</span>
                      <span className="text-xs text-gray-500">{item.desc}</span>
                   </div>
                   {bristol === item.type && <CheckCircle2 className="w-5 h-5 text-[#2A8C7E]" />}
                 </button>
               ))}
            </div>
            <Button onClick={() => setStep(2)} className="w-full h-16 rounded-full bg-[#2A8C7E] font-bold text-lg shadow-lg">Próximo</Button>
         </motion.div>
       )}

       {step === 2 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Sintomas da Menopausa<br/><span className="text-[#E8C7C8] text-lg font-medium">Frequência/Intensidade</span></h2>
            <div className="space-y-6">
               {MENOPAUSE_SYMPTOMS.map(s => (
                 <div key={s.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-[#F8F5F1] rounded-xl"><s.icon className="w-5 h-5 text-[#2A8C7E]" /></div>
                       <Label className="font-bold text-gray-800">{s.label}</Label>
                    </div>
                    <Slider defaultValue={[0]} max={10} step={1} className="py-2" />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                       <span>Leve</span>
                       <span>Moderado</span>
                       <span>Severo</span>
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="w-20 h-16 rounded-full border-[#A3D9D3]">Voltar</Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-16 rounded-full bg-[#2A8C7E] font-bold text-lg shadow-lg">Próximo</Button>
            </div>
         </motion.div>
       )}

       {step === 3 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">Gatilhos e Hábitos<br/><span className="text-[#2A8C7E] text-lg font-medium">Últimas 24 horas</span></h2>
            <div className="space-y-4">
               <Card className="p-5 rounded-3xl border-none bg-white">
                  <Label className="font-bold text-gray-800 mb-4 block">Ingestão de Fibras & Água</Label>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2"><Utensils className="w-5 h-5 text-[#2A8C7E]" /> <span className="text-sm font-medium">Meta 30g Fibras</span></div>
                       <Checkbox className="h-6 w-6 rounded-lg border-[#2A8C7E]" />
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2"><Droplets className="w-5 h-5 text-[#2A8C7E]" /> <span className="text-sm font-medium">Meta 2L Água</span></div>
                       <Checkbox className="h-6 w-6 rounded-lg border-[#2A8C7E]" />
                    </div>
                  </div>
               </Card>
               <Textarea placeholder="Observações extras (ex: tomei café tarde, estresse no trabalho...)" className="rounded-3xl min-h-[120px] bg-white border-none focus-visible:ring-[#2A8C7E]" />
            </div>
            <Button onClick={() => toast.success("Registro Clínico Salvo!") || setView("dashboard")} className="w-full h-16 rounded-full bg-[#2A8C7E] font-bold text-lg shadow-lg">Finalizar Registro</Button>
         </motion.div>
       )}
    </motion.div>
  );
}

function HistoryView({ setView }: any) {
    return (
        <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
           <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-[#2A8C7E] font-bold">
             <ArrowLeft className="w-5 h-5" /> Voltar
           </button>
           <h2 className="text-2xl font-black text-gray-900">Sua Jornada Clínica</h2>
           
           {/* Tendências de Microambiente - Inspirado no ZOE PREDICT */}
           <Card className="p-6 rounded-3xl bg-white border-none shadow-sm space-y-4">
             <div className="flex items-center gap-2 text-[#2A8C7E]">
               <Activity className="w-5 h-5" />
               <h3 className="font-bold">Correlação Intestino-Hormônio</h3>
             </div>
             <div className="h-48 bg-[#FDF8F3] rounded-2xl flex flex-col items-center justify-center p-4">
                <div className="w-full flex justify-around items-end h-24 mb-4">
                   {[40, 70, 45, 90, 65, 80, 75].map((h, i) => (
                     <div key={i} className="w-3 bg-[#A3D9D3] rounded-t-full transition-all hover:bg-[#2A8C7E]" style={{ height: `${h}%` }} />
                   ))}
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">
                   Eixo HPA: Estabilidade hormonal vs. Saúde Intestinal
                </p>
             </div>
           </Card>

           <Button variant="outline" className="w-full h-16 rounded-full border-2 border-[#2A8C7E] text-[#2A8C7E] font-bold flex gap-2 items-center justify-center">
              <ChevronDown className="w-5 h-5" /> Baixar Relatório para Médico (PDF)
           </Button>
        </motion.div>
    );
}

function InsightsView({ setView }: any) {
    return (
        <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="p-6 space-y-6">
           <button onClick={() => setView("dashboard")} className="flex items-center gap-2 text-[#2A8C7E] font-bold">
             <ArrowLeft className="w-5 h-5" /> Voltar
           </button>
           <h2 className="text-2xl font-black text-gray-900">Análise de Dados IA</h2>
           <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-[#E8C7C8]/20 to-[#A3D9D3]/20 border-none relative overflow-hidden">
              <Sparkles className="w-12 h-12 text-[#2A8C7E] absolute -top-2 -right-2 opacity-20" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-[#2A8C7E] font-bold uppercase text-xs tracking-widest">
                  <Brain className="w-4 h-4" /> Insight Baseado em Evidências
                </div>
                <p className="text-gray-800 leading-relaxed font-semibold text-lg">
                  "Seu padrão de 'Névoa Mental' costuma aparecer 24h após registros de Tipo 2 (Prisão de Ventre). A ciência mostra que a reciclagem de estrogênio no intestino lento pode afetar o foco. Tente aumentar o magnésio hoje."
                </p>
                <div className="pt-4 border-t border-white/40 flex items-center justify-between text-[10px] font-bold text-gray-500">
                   <span>Fonte: Harvard Health & ZOE Study</span>
                   <CheckCircle2 className="w-4 h-4 text-[#2A8C7E]" />
                </div>
              </div>
           </Card>

           <Card className="p-5 rounded-3xl border-none bg-white shadow-sm">
              <h4 className="font-bold text-gray-400 text-xs mb-3 uppercase">Recomendação do Protocolo</h4>
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-[#FDF8F3] rounded-2xl flex items-center justify-center"><Coffee className="w-6 h-6 text-[#2A8C7E]" /></div>
                 <div>
                    <p className="font-bold text-gray-800">Shot Matinal Anti-inflamatório</p>
                    <p className="text-xs text-gray-500">Ajuda no peristaltismo e fogachos.</p>
                 </div>
              </div>
           </Card>
        </motion.div>
    );
}
