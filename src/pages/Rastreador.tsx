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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    if (score >= 80) return "text-[#A3D9D3]";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-[400px] mx-auto min-h-screen pb-24 relative overflow-hidden">
      {/* Animated background blobs for Glassmorphism depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[15%] right-[-10%] w-[300px] h-[300px] bg-[#A3D9D3]/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] left-[-15%] w-[250px] h-[250px] bg-[#E8C7C8]/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[50%] left-[20%] w-[150px] h-[150px] bg-white/5 rounded-full blur-[60px]" />
      </div>

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
        <DialogContent className="rounded-[2.5rem] max-w-[90vw] glass-morphism border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#A3D9D3]">
              <AlertCircle className="w-5 h-5" /> Nota Importante
            </DialogTitle>
            <DialogDescription className="text-white/80 pt-4 text-base leading-relaxed">
              Este rastreador baseia-se em escalas clínicas (Bristol e MenoScale) validadas internacionalmente. 
              Os dados coletados são informativos e não substituem o diagnóstico médico.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowMedicalDisclaimer(false)} className="w-full glass-button py-6 text-lg font-bold">
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
          <h1 className="text-3xl font-display font-black text-white tracking-tight">Olá, Maria</h1>
          <p className="text-white/80 font-semibold flex items-center gap-1.5 text-sm bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 fill-white/20" /> Equilíbrio Interior
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onShowDisclaimer} className="glass-morphism rounded-2xl border-white/30 hover:bg-white/20 transition-all">
          <Info className="w-6 h-6 text-white" />
        </Button>
      </header>

      {/* Gut Health Score - Glassmorphism Design */}
      <Card className="p-8 rounded-[2.5rem] border-none bg-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden group border border-white/20">
        <div className="absolute top-0 right-0 p-6">
           <Stethoscope className="w-10 h-10 text-white opacity-10 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        
        <div className="space-y-1 text-center">
          <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Microbiome Index</h2>
          <div className="h-1 w-8 bg-white/30 rounded-full mx-auto" />
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-4 bg-white/5 rounded-full blur-xl" />
            
            <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle cx="96" cy="96" r="82" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="82" 
                  stroke="url(#gradientScore)" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeDasharray={`${gutScore * 5.15} 515`} 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_15px_rgba(163,217,211,0.5)]"
                />
                <defs>
                  <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A3D9D3" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                </defs>
            </svg>
            <div className="absolute z-20 flex flex-col items-center glass-morphism rounded-full w-32 h-32 justify-center shadow-2xl border-white/30">
               <span className="text-6xl font-black text-white tracking-tighter">{gutScore}</span>
               <span className="text-[11px] text-[#A3D9D3] font-black uppercase tracking-wider">Ótimo</span>
            </div>
        </div>
        
        <div className="text-center space-y-1.5 px-4 relative z-10">
          <p className="font-display font-black text-xl tracking-tight text-white italic">
             "Sua flora está vibrante!"
          </p>
          <p className="text-xs text-white/60 leading-relaxed max-w-[200px] mx-auto">
            Seu metabolismo respondeu bem ao café da manhã proteico de ontem.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Button onClick={() => setView("registro_rapido")} className="h-44 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 text-white flex flex-col gap-4 shadow-2xl hover:bg-white/20 active:scale-[0.98] transition-all group">
            <div className="p-4 bg-white/20 rounded-[1.5rem] group-hover:rotate-6 transition-transform shadow-inner">
              <Plus className="w-10 h-10" />
            </div>
            <span className="font-display font-black text-xl leading-tight">Check-in<br/>Diário</span>
        </Button>
        <div className="flex flex-col gap-5">
            <Button variant="outline" onClick={() => setView("historico")} className="flex-1 rounded-[2rem] border-white/10 bg-white/5 backdrop-blur-lg flex flex-col items-center justify-center gap-2 p-5 shadow-lg hover:bg-white/10 transition-colors group">
               <div className="p-2.5 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <BarChart3 className="w-7 h-7 text-white" />
               </div>
               <span className="text-xs font-black text-white/60 uppercase tracking-widest">Padrões</span>
            </Button>
            <Button variant="outline" onClick={() => setView("insights")} className="flex-1 rounded-[2rem] border-white/10 bg-white/5 backdrop-blur-lg flex flex-col items-center justify-center gap-2 p-5 shadow-lg hover:bg-white/10 transition-colors group">
               <div className="p-2.5 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <Sparkles className="w-7 h-7 text-white" />
               </div>
               <span className="text-xs font-black text-white/60 uppercase tracking-widest">Insights</span>
            </Button>
        </div>
      </div>

      {/* Gatilhos - Minimalist Glassmorphism */}
      <Card className="p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.15em]">Gatilhos Ativos</h3>
          <Info className="w-3.5 h-3.5 text-white/20" />
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
           {["Glúten", "Café", "Lactose", "Açúcar"].map((trigger, i) => (
             <motion.div 
               key={trigger}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="px-5 py-2.5 glass-morphism rounded-2xl text-[11px] font-black text-[#A3D9D3] border border-white/10 shadow-lg whitespace-nowrap active:bg-white/20"
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
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="p-6 space-y-8 relative z-10">
       <header className="flex items-center justify-between">
          <button onClick={() => setView("dashboard")} className="text-white/60 hover:text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-1.5 transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#A3D9D3] shadow-[0_0_8px_rgba(163,217,211,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
       </header>

       {step === 1 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-black leading-tight tracking-tight">Saúde Digestiva</h2>
              <p className="text-[#A3D9D3] font-bold text-sm bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">Escala de Bristol</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {BRISTOL_SCALE.map((item, i) => (
                 <motion.button 
                  key={item.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setBristol(item.type)}
                  className={`p-5 rounded-[2rem] border transition-all flex justify-between items-center group ${bristol === item.type ? 'border-white/40 bg-white/20 shadow-2xl scale-[1.02]' : 'border-white/10 bg-white/5 backdrop-blur-lg'}`}
                 >
                   <div className="flex flex-col gap-0.5 text-left">
                      <span className={`font-black text-[10px] uppercase tracking-wider transition-colors ${bristol === item.type ? 'text-[#A3D9D3]' : 'text-white/40'}`}>Tipo {item.type}</span>
                      <span className={`font-bold text-base tracking-tight ${bristol === item.type ? 'text-white' : 'text-white/70'}`}>{item.desc}</span>
                   </div>
                   <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${bristol === item.type ? 'bg-[#A3D9D3] border-[#A3D9D3] shadow-[0_0_10px_rgba(163,217,211,0.4)]' : 'border-white/20 group-hover:border-white/40'}`}>
                      {bristol === item.type && <CheckCircle2 className="w-4 h-4 text-[#1E5A5A]" />}
                   </div>
                 </motion.button>
               ))}
            </div>
            <Button onClick={() => setStep(2)} className="w-full h-20 rounded-full glass-button font-black text-xl shadow-2xl border-white/30 text-white hover:scale-[1.02]">Próximo</Button>
         </motion.div>
       )}

       {step === 2 && (
         <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-black leading-tight tracking-tight">Equilíbrio Hormonal</h2>
              <p className="text-[#E8C7C8] font-bold text-sm bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10 tracking-tight uppercase">Intensidade dos Sintomas</p>
            </div>

            <div className="space-y-10 py-4">
               {MENOPAUSE_SYMPTOMS.map((s, i) => (
                 <motion.div 
                   key={s.id} 
                   className="space-y-4"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                 >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-white/10"><s.icon className="w-5 h-5 text-[#A3D9D3]" /></div>
                          <Label className="font-display font-black text-white tracking-tight text-xl">{s.label}</Label>
                       </div>
                    </div>
                    <div className="px-1">
                      <Slider defaultValue={[0]} max={10} step={1} className="py-2" />
                      <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                         <span>Leve</span>
                         <span>Intenso</span>
                      </div>
                    </div>
                 </motion.div>
               ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="w-24 h-20 rounded-full border-white/10 bg-white/5 font-black text-white/40 hover:bg-white/10">Voltar</Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-20 rounded-full glass-button font-black text-xl shadow-lg border-white/30 text-white">Próximo</Button>
            </div>
         </motion.div>
       )}

       {step === 3 && (
         <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-black leading-tight tracking-tight">Hábitos & Estilo</h2>
              <p className="text-[#A3D9D3] font-bold text-sm bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider">Metas Diárias</p>
            </div>

            <div className="space-y-5">
               <Card className="p-6 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><Utensils className="w-6 h-6 text-[#A3D9D3]" /></div>
                        <div className="flex flex-col">
                           <span className="text-base font-black text-white tracking-tight">Fibras (30g)</span>
                           <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Estroboloma</span>
                        </div>
                     </div>
                     <Checkbox className="h-7 w-7 rounded-xl border-2 border-white/10 data-[state=checked]:bg-[#A3D9D3] data-[state=checked]:border-[#A3D9D3] transition-all" />
                  </div>
                  
                  <div className="h-px bg-white/5 w-full" />

                  <div className="flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10"><Droplets className="w-6 h-6 text-[#A3D9D3]" /></div>
                        <div className="flex flex-col">
                           <span className="text-base font-black text-white tracking-tight">Hidratação (2L)</span>
                           <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Anti-inchaço</span>
                        </div>
                     </div>
                     <Checkbox className="h-7 w-7 rounded-xl border-2 border-white/10 data-[state=checked]:bg-[#A3D9D3] data-[state=checked]:border-[#A3D9D3] transition-all" />
                  </div>
               </Card>
               <Textarea placeholder="Algo mais sobre seu dia?" className="rounded-[2.5rem] p-8 min-h-[160px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl focus-visible:ring-1 focus-visible:ring-[#A3D9D3] text-white font-medium placeholder:text-white/20" />
            </div>
            <Button onClick={() => toast.success("Registro Clínico Salvo!") || setView("dashboard")} className="w-full h-20 rounded-full glass-button font-black text-xl shadow-2xl border-white/30 text-white">Finalizar</Button>
         </motion.div>
       )}
    </motion.div>
  );
}

function HistoryView({ setView }: any) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 relative z-10 text-white">
           <header className="flex items-center gap-4">
             <button onClick={() => setView("dashboard")} className="p-3 glass-morphism rounded-2xl border-white/10 text-white">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-display font-black tracking-tight">Sua Jornada</h2>
           </header>
           
           <Card className="p-8 rounded-[2.5rem] glass-morphism border-white/10 shadow-2xl space-y-6">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-white/10 rounded-xl"><Activity className="w-5 h-5 text-[#A3D9D3]" /></div>
                 <h3 className="font-black text-white/80 uppercase tracking-wider text-xs">Eixo Intestino-Hormônio</h3>
               </div>
               <div className="text-[10px] font-black text-[#A3D9D3] bg-white/10 px-2 py-1 rounded-md uppercase">7 DIAS</div>
             </div>

             <div className="h-48 flex items-end justify-between gap-1.5 px-2">
                {[45, 75, 50, 95, 60, 85, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${h}%` }} 
                      transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
                      className={`w-full max-w-[12px] rounded-full transition-all duration-300 ${i === 3 ? 'bg-[#A3D9D3] shadow-[0_0_10px_rgba(163,217,211,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}`} 
                    />
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">{['S','T','Q','Q','S','S','D'][i]}</span>
                  </div>
                ))}
             </div>
             
             <p className="text-[11px] text-white/60 font-bold leading-relaxed text-center px-4 italic">
               Houve um aumento de <span className="text-[#A3D9D3]">12% na estabilidade hormonal</span> esta semana.
             </p>
           </Card>

           <div className="space-y-4">
             <Button className="w-full h-20 rounded-full glass-button font-black text-xl shadow-lg flex gap-3 items-center justify-center group">
                <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> 
                Baixar Relatório Médico
             </Button>
           </div>
        </motion.div>
    );
}

function InsightsView({ setView }: any) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-8 relative z-10 text-white">
           <header className="flex items-center gap-4">
             <button onClick={() => setView("dashboard")} className="p-3 glass-morphism rounded-2xl border-white/10 text-white">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-2xl font-display font-black tracking-tight">Análise da Flora</h2>
           </header>

           <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#A3D9D3]/20 to-white/5 backdrop-blur-xl border border-white/20 relative overflow-hidden shadow-2xl">
              <Sparkles className="w-32 h-32 text-white/10 absolute -top-8 -right-8" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2 text-[#A3D9D3] font-black uppercase text-[10px] tracking-widest">
                  <Brain className="w-4 h-4 fill-[#A3D9D3]/20" /> Insight Personalizado
                </div>
                <p className="text-white leading-relaxed font-bold text-xl tracking-tight italic">
                  "Sua digestão está 2x mais eficiente após as 18h quando você inclui sementes de abóbora no jantar."
                </p>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
                   <span>Baseado em 14 registros</span>
                   <div className="flex items-center gap-1">Protocolo Ativo <CheckCircle2 className="w-3 h-3" /></div>
                </div>
              </div>
           </Card>

           <div className="grid grid-cols-1 gap-4">
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2">Recomendação do Dia</h3>
             <Card className="p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-sm flex items-center gap-5 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="w-16 h-16 glass-morphism rounded-[1.5rem] flex items-center justify-center shadow-inner border border-white/10">
                  <Coffee className="w-8 h-8 text-[#A3D9D3] group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-0.5">
                   <p className="font-display font-black text-white text-lg tracking-tight">Shot Matinal</p>
                   <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Metabolismo & Fibras</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 ml-auto" />
             </Card>
           </div>
        </motion.div>
    );
}
