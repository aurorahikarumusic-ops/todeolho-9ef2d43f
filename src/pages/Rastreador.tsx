import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, Brain, Zap, Moon, Smile, Droplets, Utensils, 
  TrendingUp, Sparkles, Footprints, Info, CheckCircle2,
  Calendar, ChevronRight, Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, LineChart, Line, CartesianGrid 
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BRISTOL_SCALE = [
  { type: 1, desc: "Caroços duros e separados" },
  { type: 2, desc: "Formato de salsicha, mas encaroçado" },
  { type: 3, desc: "Formato de salsicha, com rachaduras" },
  { type: 4, desc: "Formato de salsicha, lisa e macia" },
  { type: 5, desc: "Pedaços moles com bordas nítidas" },
  { type: 6, desc: "Pedaços fofos, bordas irregulares" },
  { type: 7, desc: "Aquosa, sem pedaços sólidos" },
];

const WEEKLY_DATA = [
  { name: 'Seg', score: 65, bloating: 7 },
  { name: 'Ter', score: 70, bloating: 6 },
  { name: 'Qua', score: 80, bloating: 4 },
  { name: 'Qui', score: 75, bloating: 5 },
  { name: 'Sex', score: 85, bloating: 3 },
  { name: 'Sáb', score: 90, bloating: 2 },
  { name: 'Dom', score: 82, bloating: 4 },
];

export default function Rastreador() {
  const [gutScore, setGutScore] = useState(75);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("sintomas");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("flora_onboarding_done");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    fetchAiInsight();
  }, []);

  const fetchAiInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const { data, error } = await supabase.functions.invoke("flora-ai", {
        body: { 
          prompt: "Gere um insight para Maria, uma mulher de 52 anos que registrou inchaço leve ontem, mas completou 2L de água.", 
          type: "insight" 
        },
      });
      if (error) throw error;
      setAiInsight(data.content);
    } catch (error) {
      console.error("Erro ao buscar insight:", error);
      setAiInsight("Mantenha o foco na hidratação! Sua dedicação hoje é o equilíbrio de amanhã.");
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem("flora_onboarding_done", "true");
    setShowOnboarding(false);
    toast.success("Tudo pronto! Vamos começar seu registro diário.");
  };

  const handleSave = () => {
    toast.success("Registro salvo com sucesso!", {
      description: "Seu score de saúde intestinal foi atualizado.",
    });
    fetchAiInsight();
  };

  const habits = [
    { id: "water", label: "2L de Água", icon: Droplets },
    { id: "fiber", label: "30g de Fibras", icon: Utensils },
    { id: "move", label: "Caminhada (30min)", icon: Footprints },
    { id: "stress", label: "Meditação/Respiração", icon: Brain },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <div className="w-20 h-20 bg-[#A3D9D3]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-[#2A8C7E]" />
            </div>
            <DialogTitle className="text-2xl text-center font-bold text-[#2A8C7E]">Bem-vinda ao seu Rastreador, Flora!</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              Aqui vamos transformar seus sintomas em insights para sua saúde intestinal e equilíbrio na menopausa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#2A8C7E] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
              <p className="text-gray-600">Registre sintomas, evacuação e hábitos diariamente.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#2A8C7E] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
              <p className="text-gray-600">Acompanhe seu Gut Score (0-100).</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#2A8C7E] rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
              <p className="text-gray-600">Receba recomendações personalizadas da nossa IA.</p>
            </div>
          </div>
          <Button onClick={finishOnboarding} className="w-full bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 rounded-full py-6 text-lg font-bold">
            Entendido! Vamos lá
          </Button>
        </DialogContent>
      </Dialog>

      <header className="flex justify-between items-start gap-4 p-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rastreador Flora</h2>
          <div className="flex items-center gap-2 text-[#2A8C7E] font-medium">
            <Calendar className="w-4 h-4" />
            <span>Hoje, 9 de Maio</span>
          </div>
        </div>
        <Card className="p-4 bg-gradient-to-br from-[#2A8C7E] to-[#1F6B60] text-white rounded-[2rem] text-center shadow-xl shadow-[#2A8C7E]/20 min-w-[100px]">
          <div className="text-xs opacity-80 font-medium">Gut Score</div>
          <div className="text-4xl font-black">{gutScore}</div>
        </Card>
      </header>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full bg-[#FDF8F3] p-1 h-14 rounded-full border border-[#A3D9D3]/20 mb-8 overflow-x-auto no-scrollbar">
          <TabsTrigger value="sintomas" className="flex-1 rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all text-sm sm:text-base font-medium">Sintomas</TabsTrigger>
          <TabsTrigger value="intestino" className="flex-1 rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all text-sm sm:text-base font-medium">Intestino</TabsTrigger>
          <TabsTrigger value="refeicoes" className="flex-1 rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all text-sm sm:text-base font-medium">Diário</TabsTrigger>
          <TabsTrigger value="habitos" className="flex-1 rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all text-sm sm:text-base font-medium">Hábitos</TabsTrigger>
        </TabsList>

        <TabsContent value="sintomas" className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Inchaço Abdominal", icon: Heart },
              { name: "Gases/Flatulência", icon: Zap },
              { name: "Humor/Ansiedade", icon: Smile },
              { name: "Nível de Energia", icon: Zap },
              { name: "Qualidade do Sono", icon: Moon },
              { name: "Ondas de Calor", icon: Sparkles }
            ].map((s) => (
              <Card key={s.name} className="p-5 rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#A3D9D3]/10 rounded-xl group-hover:bg-[#A3D9D3]/20 transition-colors">
                    <s.icon className="w-5 h-5 text-[#2A8C7E]" />
                  </div>
                  <Label className="text-base font-semibold text-gray-800">{s.name}</Label>
                </div>
                <Slider defaultValue={[0]} max={10} step={1} className="py-2" />
                <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                  <span>Nenhum</span>
                  <span>Intenso</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intestino" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-xl font-bold text-gray-900">Tipo de Fezes</Label>
              <Button variant="ghost" size="sm" className="text-[#2A8C7E] h-auto p-0 flex items-center gap-1 font-semibold">
                <Info className="w-4 h-4" />
                Escala de Bristol
              </Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {BRISTOL_SCALE.map((item) => (
                <div key={item.type} className="flex flex-col items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="h-14 w-14 rounded-2xl text-lg font-bold hover:bg-[#A3D9D3]/20 hover:text-[#2A8C7E] transition-all border-[#A3D9D3]/20"
                  >
                    {item.type}
                  </Button>
                  <span className="text-[10px] text-center text-gray-500 leading-tight h-8 px-1">{item.type === 4 ? "Ideal" : ""}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
            <Label className="text-lg font-bold text-gray-900">Detalhes da Evacuação</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Cor</Label>
                <div className="flex gap-2">
                  {["#8B4513", "#CD853F", "#DAA520"].map(c => (
                    <div key={c} className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-[#2A8C7E]" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Esforço</Label>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-full">Leve</Button>
                   <Button variant="outline" size="sm" className="rounded-full">Forte</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="refeicoes" className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
             <div className="flex items-center gap-3">
                <Utensils className="w-6 h-6 text-[#2A8C7E]" />
                <Label className="text-xl font-bold text-gray-900">O que você comeu hoje?</Label>
             </div>
             <Textarea 
               placeholder="Ex: Almoço com brócolis, feijão e frango. Senti um pouco de gases depois." 
               className="rounded-2xl min-h-[120px] bg-[#FDF8F3] border-none focus-visible:ring-1 focus-visible:ring-[#2A8C7E]" 
             />
             <div className="flex flex-wrap gap-2 pt-2">
                <p className="text-sm text-gray-500 w-full mb-1">Gatilhos comuns:</p>
                {["Lactose", "Glúten", "Açúcar", "Café", "Álcool"].map(t => (
                  <Button key={t} variant="secondary" size="sm" className="rounded-full bg-[#A3D9D3]/10 text-[#2A8C7E] hover:bg-[#A3D9D3]/20 border-none">
                    + {t}
                  </Button>
                ))}
             </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="habitos" className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="p-6 rounded-3xl border-none shadow-sm">
            <Label className="text-xl font-bold text-gray-900 mb-6 block">Checklist de Hábitos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habits.map(h => (
                <div key={h.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FDF8F3] hover:bg-[#A3D9D3]/10 transition-colors group cursor-pointer">
                   <Checkbox id={h.id} className="h-6 w-6 rounded-lg border-[#2A8C7E] data-[state=checked]:bg-[#2A8C7E]" />
                   <div className="p-2 bg-white rounded-xl shadow-sm">
                     <h.icon className="w-5 h-5 text-[#2A8C7E]" />
                   </div>
                   <Label htmlFor={h.id} className="text-base font-semibold text-gray-700 cursor-pointer">{h.label}</Label>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights Section */}
      <Card className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#FDF8F3] to-[#FBCFE8]/20 border-none shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles className="w-24 h-24 text-[#2A8C7E]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-2xl shadow-sm">
              <Brain className="w-6 h-6 text-[#2A8C7E]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Insight da Flora IA</h3>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            "Olá Flora! Notei que sua **energia** está 30% maior nos dias em que você completa o hábito de **Caminhada**. Além disso, seu inchaço diminuiu desde que você reduziu laticínios no jantar. Continue assim!"
          </p>
          <Button variant="link" className="text-[#2A8C7E] p-0 mt-4 font-bold flex items-center gap-1 group">
            Ver relatório detalhado <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>

      {/* Monthly Report / Trends */}
      <Card className="p-6 rounded-[2.5rem] border-none shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A3D9D3]/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-[#2A8C7E]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sua Jornada</h3>
          </div>
          <Tabs defaultValue="week" className="w-auto">
            <TabsList className="bg-[#FDF8F3] rounded-full h-9">
              <TabsTrigger value="week" className="rounded-full text-xs">Semana</TabsTrigger>
              <TabsTrigger value="month" className="rounded-full text-xs">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
             <p className="text-sm font-semibold text-gray-500">Score de Saúde Intestinal</p>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={WEEKLY_DATA}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                   <YAxis hide />
                   <Tooltip 
                     cursor={{fill: '#F1F5F9'}} 
                     contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                   />
                   <Bar dataKey="score" fill="#2A8C7E" radius={[10, 10, 10, 10]} barSize={35} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="space-y-2">
             <p className="text-sm font-semibold text-gray-500">Tendência de Inchaço (Escala 1-10)</p>
             <div className="h-[150px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={WEEKLY_DATA}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                   <Tooltip contentStyle={{borderRadius: '16px'}} />
                   <Line type="monotone" dataKey="bloating" stroke="#FBCFE8" strokeWidth={4} dot={{fill: '#FBCFE8', r: 6}} activeDot={{r: 8}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </Card>

      {/* Floating Action Button for Saving */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center">
        <Button 
          onClick={handleSave}
          className="w-full max-w-md bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 py-8 text-xl font-black rounded-full shadow-2xl shadow-[#2A8C7E]/40 active:scale-[0.98] transition-all"
        >
          Finalizar Registro do Dia
        </Button>
      </div>
    </div>
  );
}
