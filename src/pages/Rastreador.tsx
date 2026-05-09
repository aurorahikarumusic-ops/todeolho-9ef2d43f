import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Brain, Zap, Moon, Smile, Droplets, Utensils, 
  TrendingUp, Sparkles, Footprints, Info, CheckCircle2,
  Calendar, ChevronRight, Loader2, ArrowLeft, BarChart3, ChevronDown, Plus,
  Stethoscope, Coffee, Wind, AlertCircle
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
    <div className="max-w-[400px] mx-auto min-h-screen pb-24 bg-[#F8F5F1]">
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, Maria!</h1>
          <p className="text-[#2A8C7E] font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Ciência e bem-estar hoje
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onShowDisclaimer} className="text-[#A3D9D3]">
          <Info className="w-6 h-6" />
        </Button>
      </header>

      {/* Gut Health Score - Baseado em padrões da Mayo Clinic */}
      <Card className="p-8 rounded-[2rem] border-none bg-white shadow-lg flex flex-col items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <Stethoscope className="w-6 h-6 text-[#A3D9D3] opacity-20" />
        </div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Microbiome Balance Index</h2>
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="#2A8C7E" strokeWidth="12" fill="none" strokeDasharray={`${gutScore * 4.4} 440`} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
               <span className="text-5xl font-black text-gray-900">{gutScore}</span>
               <span className="text-[10px] text-gray-400 font-bold uppercase">Optimal</span>
            </div>
        </div>
        <p className={`font-bold text-lg text-center ${getScoreColor(gutScore)}`}>
           {gutScore >= 80 ? "Sua flora está em simbiose clínica!" : "Sinais de disbiose leve detectados."}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => setView("registro_rapido")} className="h-40 rounded-[2rem] bg-[#2A8C7E] text-white flex flex-col gap-3 shadow-xl shadow-[#2A8C7E]/20 group">
            <div className="p-3 bg-white/20 rounded-2xl group-active:scale-95 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg">Check-in<br/>Diário</span>
        </Button>
        <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={() => setView("historico")} className="flex-1 rounded-[1.5rem] border-[#A3D9D3] bg-white flex flex-col gap-1 p-4 shadow-sm">
               <BarChart3 className="w-6 h-6 text-[#2A8C7E]" />
               <span className="text-xs font-bold text-gray-600">Padrões</span>
            </Button>
            <Button variant="outline" onClick={() => setView("insights")} className="flex-1 rounded-[1.5rem] border-[#A3D9D3] bg-white flex flex-col gap-1 p-4 shadow-sm">
               <Sparkles className="w-6 h-6 text-[#2A8C7E]" />
               <span className="text-xs font-bold text-gray-600">Insights</span>
            </Button>
        </div>
      </div>

      {/* Tendências Rápidas - Baseado no Midday/LUCI (Menopause Apps EUA) */}
      <Card className="p-5 rounded-3xl border-none bg-[#FDF8F3]">
        <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase">Gatilhos Recentes (FODMAPs)</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
           {["Glúten", "Lactose", "Café"].map(trigger => (
             <div key={trigger} className="px-4 py-2 bg-white rounded-full text-xs font-bold text-[#2A8C7E] border border-[#A3D9D3] whitespace-nowrap">
               {trigger}
             </div>
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
