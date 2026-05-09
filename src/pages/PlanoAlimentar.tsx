import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  ChevronRight, 
  Apple, 
  Coffee, 
  Utensils, 
  Clock, 
  Sparkles, 
  Info,
  CheckCircle2,
  RefreshCw,
  ArrowRightLeft
} from "lucide-react";
import { toast } from "sonner";

interface Meal {
  type: string;
  title: string;
  ingredients: string[];
  fiber: string;
  tip?: string;
}

interface DayPlan {
  day: string;
  focus: string;
  meals: Meal[];
  nutriTip: string;
}

const WEEKLY_PLAN: DayPlan[] = [
  {
    day: "Segunda",
    focus: "Desinflamação e Fibras",
    nutriTip: "Comece o dia com água morna e limão para despertar sua digestão.",
    meals: [
      { 
        type: "Café da Manhã", 
        title: "Mingau de Aveia com Chia e Frutas Vermelhas", 
        ingredients: ["3 col. sopa aveia", "1 col. sobremesa chia", "1/2 xícara frutas vermelhas", "Leite vegetal ou kefir"], 
        fiber: "8g",
        tip: "A chia ajuda no trânsito intestinal logo cedo."
      },
      { 
        type: "Almoço", 
        title: "Filé de Frango com Purê de Inhame e Brócolis", 
        ingredients: ["120g frango grelhado", "2 inhames médios", "1 xícara brócolis no vapor", "Salada verde à vontade"], 
        fiber: "10g",
        tip: "O inhame é um excelente aliado hormonal para mulheres 40+."
      },
      { 
        type: "Jantar", 
        title: "Sopa de Abóbora com Gengibre e Sementes", 
        ingredients: ["2 conchas de sopa de abóbora", "Gengibre ralado", "1 col. sopa semente de abóbora"], 
        fiber: "7g",
        tip: "O gengibre reduz gases e inchaço abdominal antes de dormir."
      }
    ]
  },
  {
    day: "Terça",
    focus: "Controle de Inchaço",
    nutriTip: "Mastigar bem cada garfada reduz a entrada de ar e melhora a absorção de nutrientes.",
    meals: [
      { 
        type: "Café da Manhã", 
        title: "Iogurte Natural (ou Kefir) com Farelo de Aveia", 
        ingredients: ["200ml kefir", "2 col. farelo de aveia", "1/2 banana nanica", "Canela"], 
        fiber: "6g"
      },
      { 
        type: "Almoço", 
        title: "Peixe Grelhado com Arroz Integral e Lentilha", 
        ingredients: ["150g peixe branco", "3 col. arroz integral", "2 col. lentilha", "Cenoura ralada"], 
        fiber: "12g",
        tip: "A lentilha é rica em ferro e fibras pré-bióticas."
      },
      { 
        type: "Jantar", 
        title: "Omelete de Espinafre com Queijo Branco", 
        ingredients: ["2 ovos", "1 punhado de espinafre", "1 fatia queijo minas frescal", "Tomates cereja"], 
        fiber: "4g"
      }
    ]
  },
  // Adding more days would be similar...
];

const SHOPPING_LIST = [
  { category: "Hortifruti", items: ["Inhame", "Abóbora", "Espinafre", "Brócolis", "Banana", "Frutas vermelhas", "Gengibre"] },
  { category: "Proteínas", items: ["Frango", "Peixe branco", "Ovos", "Queijo Minas"] },
  { category: "Grãos e Sementes", items: ["Aveia em flocos", "Farelo de aveia", "Chia", "Lentilha", "Semente de abóbora", "Arroz integral"] },
  { category: "Laticínios/Probióticos", items: ["Kefir ou Iogurte Natural", "Leite vegetal (coco ou amêndoas)"] },
];

export default function PlanoAlimentar() {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleRenewPlan = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: 'Gerando novo plano personalizado...',
      success: 'Plano semanal renovado com sucesso!',
      error: 'Erro ao gerar plano.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Plano Alimentar</h2>
          <p className="text-gray-500">Nutrição focada no seu equilíbrio, Flora.</p>
        </div>
        <Button 
          onClick={handleRenewPlan}
          variant="outline" 
          className="rounded-full border-[#2A8C7E] text-[#2A8C7E] hover:bg-[#A3D9D3]/10 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Renovar Plano Semanal
        </Button>
      </header>

      <Tabs defaultValue="plano" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-[#FDF8F3] p-1 h-12 rounded-full border border-[#A3D9D3]/20 mb-8">
          <TabsTrigger value="plano" className="rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all font-medium">Cardápio</TabsTrigger>
          <TabsTrigger value="compras" className="rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all font-medium">Lista de Compras</TabsTrigger>
          <TabsTrigger value="subst" className="rounded-full data-[state=active]:bg-[#2A8C7E] data-[state=active]:text-white transition-all font-medium">Substituições</TabsTrigger>
        </TabsList>

        <TabsContent value="plano" className="space-y-6 animate-in slide-in-from-bottom-2">
          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDay(idx % WEEKLY_PLAN.length)}
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  selectedDay === (idx % WEEKLY_PLAN.length)
                    ? "bg-[#2A8C7E] text-white shadow-lg shadow-[#2A8C7E]/20"
                    : "bg-white text-gray-400 hover:bg-[#A3D9D3]/10"
                }`}
              >
                <span className="text-[10px] uppercase font-bold">{day}</span>
                <span className="text-lg font-black">{idx + 1}</span>
              </button>
            ))}
          </div>

          <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-[#2A8C7E] to-[#1F6B60] text-white border-none shadow-xl">
             <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-[#FBCFE8]" />
                <h3 className="text-xl font-bold">Foco do Dia: {WEEKLY_PLAN[selectedDay].focus}</h3>
             </div>
             <p className="opacity-90 leading-relaxed italic">
               "{WEEKLY_PLAN[selectedDay].nutriTip}"
             </p>
          </Card>

          <div className="space-y-4">
            {WEEKLY_PLAN[selectedDay].meals.map((meal, idx) => (
              <Card key={idx} className="p-0 rounded-[2rem] border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  <div className="p-6 sm:w-1/3 bg-[#FDF8F3] flex flex-col justify-center items-center text-center">
                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-2">
                       {meal.type === "Café da Manhã" ? <Coffee className="text-[#2A8C7E]" /> : <Utensils className="text-[#2A8C7E]" />}
                    </div>
                    <Badge variant="outline" className="border-[#2A8C7E]/30 text-[#2A8C7E] mb-1">{meal.type}</Badge>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold">
                       <Clock className="w-3 h-3" /> 20-30 min
                    </div>
                  </div>
                  <div className="p-6 flex-1 bg-white space-y-3">
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#2A8C7E] transition-colors">{meal.title}</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1 h-1 bg-[#A3D9D3] rounded-full" /> {ing}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                       <span className="text-xs font-bold text-gray-400">Total Fibras: <span className="text-[#2A8C7E]">{meal.fiber}</span></span>
                       {meal.tip && (
                         <div className="flex items-center gap-1 text-[11px] text-[#2A8C7E] bg-[#A3D9D3]/10 px-3 py-1 rounded-full font-medium">
                           <Info className="w-3 h-3" />
                           {meal.tip}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 rounded-[2rem] border-dashed border-2 border-[#A3D9D3] bg-transparent flex items-center justify-between group cursor-pointer hover:border-[#2A8C7E] transition-all">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#FDF8F3] rounded-2xl group-hover:bg-[#A3D9D3]/20 transition-colors">
                <Apple className="w-6 h-6 text-[#2A8C7E]" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">Precisa de Lanches?</h4>
                <p className="text-sm text-gray-500">Veja sugestões de lanches práticos e rápidos.</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-[#2A8C7E] transition-colors" />
          </Card>
        </TabsContent>

        <TabsContent value="compras" className="space-y-6 animate-in slide-in-from-bottom-2">
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                 <ShoppingBag className="text-[#2A8C7E]" />
                 Lista de Compras da Semana
               </h3>
               <Button size="sm" variant="ghost" className="text-[#2A8C7E] font-bold">Exportar PDF</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SHOPPING_LIST.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-black text-[#2A8C7E] uppercase text-xs tracking-widest">{cat.category}</h4>
                  <div className="space-y-2">
                    {cat.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#FDF8F3] hover:bg-white transition-colors cursor-pointer group">
                        <div className="w-5 h-5 rounded-md border-2 border-[#A3D9D3] group-hover:border-[#2A8C7E] flex items-center justify-center">
                           <CheckCircle2 className="w-3 h-3 text-[#2A8C7E] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subst" className="animate-in slide-in-from-bottom-2">
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRightLeft className="w-6 h-6 text-[#2A8C7E]" />
              <h3 className="text-2xl font-bold text-gray-900">Guia de Substituições</h3>
            </div>
            <div className="space-y-4">
              {[
                { original: "Kefir", sub: "Iogurte natural integral (sem açúcar) ou coalhada seca." },
                { original: "Inhame", sub: "Mandioquinha (batata baroa), batata doce ou cará." },
                { original: "Chia/Linhaça", sub: "Semente de girassol ou gergelim." },
                { original: "Frango", sub: "Tofu grelhado, ovos cozidos ou grão-de-bico." },
                { original: "Aveia", sub: "Quinoa em flocos ou amaranto." },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100">
                  <span className="font-bold text-[#2A8C7E] min-w-[100px]">{item.original}</span>
                  <div className="hidden sm:block h-4 w-[1px] bg-gray-200" />
                  <span className="text-gray-600 text-sm">{item.sub}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="p-8 rounded-[2.5rem] bg-[#FBCFE8]/10 border-none shadow-sm space-y-4 text-center">
         <h3 className="text-xl font-bold text-gray-900">Por que este plano funciona?</h3>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div className="space-y-1">
             <div className="text-[#2A8C7E] font-black text-2xl">30g+</div>
             <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fibras Diárias</p>
           </div>
           <div className="space-y-1">
             <div className="text-[#2A8C7E] font-black text-2xl">Natural</div>
             <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Probióticos Vivos</p>
           </div>
           <div className="space-y-1">
             <div className="text-[#2A8C7E] font-black text-2xl">Baixo</div>
             <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Índice Glicêmico</p>
           </div>
         </div>
      </section>

      <div className="text-center p-6 space-y-2">
        <p className="text-gray-400 text-sm italic">"Comer bem é uma forma de respeitar o seu novo ciclo."</p>
        <p className="text-[#2A8C7E] font-bold">- Nutri Flora IA</p>
      </div>
    </div>
  );
}
