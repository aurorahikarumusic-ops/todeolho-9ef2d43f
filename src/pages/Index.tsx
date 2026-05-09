import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Apple, ChevronRight, MessageCircle, Star, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#E8C7C8]/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#444444] mb-2">
            Olá, Maria! ✨
          </h1>
          <p className="text-lg text-muted-foreground">
            Hoje é um ótimo dia para cuidar do seu bem-estar. Como você se sente?
          </p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 text-white rounded-full px-8 py-6 h-auto text-lg">
            Registrar Sintomas
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Tracker */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gut Health Score */}
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-[#A3D9D3] to-[#A3D9D3]/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#2A8C7E]">Gut Health Score</h2>
                <p className="text-[#444444]/70">Baseado nos seus últimos 7 dias</p>
              </div>
              <div className="bg-white/50 p-2 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-[#2A8C7E]" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-white/30"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * 85) / 100}
                    className="text-[#2A8C7E] transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-[#444444]">85</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-white/40 p-4 rounded-2xl">
                  <p className="font-semibold text-[#2A8C7E]">Melhora de 12% desde a semana passada!</p>
                  <p className="text-sm text-[#444444]/70">Você está no caminho certo para o equilíbrio intestinal.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Rapid Symptom Tracker */}
          <section>
            <h3 className="text-xl font-bold text-[#444444] mb-4 px-2">Rastreador Rápido</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Inchaço', 'Energia', 'Sono', 'Humor'].map((item) => (
                <Card key={item} className="p-6 rounded-2xl hover:border-[#A3D9D3] transition-all cursor-pointer group hover:shadow-md border-transparent shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-3">{item}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl">😊</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Meal Plan Highlight */}
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#E8C7C8]/20 rounded-bl-full -mr-8 -mt-8" />
            <div className="flex items-start gap-6 relative">
              <div className="w-24 h-24 rounded-2xl bg-[#A3D9D3]/20 flex items-center justify-center flex-shrink-0">
                <Apple className="w-10 h-10 text-[#2A8C7E]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#E8C7C8]/30 text-[#444444] text-xs font-bold rounded-full uppercase tracking-wider">
                    Sugestão de Hoje
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#444444] mb-2">Bowl de Quinoa com Vegetais Tostados</h3>
                <p className="text-muted-foreground mb-4">Rico em fibras e magnésio, ideal para manter a energia estável à tarde.</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-full border-[#A3D9D3] text-[#2A8C7E]">Ver Receita</Button>
                  <Button variant="ghost" className="rounded-full text-[#444444]">Trocar Prato</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Daily Checklist & Community */}
        <div className="space-y-8">
          {/* Daily Checklist */}
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
            <h3 className="text-xl font-bold text-[#444444] mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2A8C7E]" />
              Checklist Diário
            </h3>
            <div className="space-y-6">
              {[
                { label: "Hidratação (2L)", done: true },
                { label: "Probiótico matinal", done: true },
                { label: "15 min de caminhada", done: false },
                { label: "Leitura relaxante", done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-[#2A8C7E] border-[#2A8C7E]' : 'border-[#E8C7C8] group-hover:border-[#2A8C7E]'}`}>
                    {task.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-lg transition-all ${task.done ? 'text-muted-foreground line-through' : 'text-[#444444]'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-[#F8F5F1]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso do dia</span>
                <span className="font-bold text-[#2A8C7E]">50%</span>
              </div>
              <Progress value={50} className="h-2 bg-[#F8F5F1]" />
            </div>
          </Card>

          {/* Tip of the Day */}
          <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-[#E8C7C8]/10">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-[#E8C7C8]" fill="currentColor" />
              <h3 className="font-bold text-[#444444]">Dica do Dia</h3>
            </div>
            <p className="text-[#444444]/80 italic leading-relaxed">
              "Tente respirar profundamente 3 vezes antes de começar sua refeição. Isso sinaliza ao seu corpo que é hora de digerir com calma."
            </p>
          </Card>

          {/* Community Feed Preview */}
          <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white">
            <h3 className="text-xl font-bold text-[#444444] mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#2A8C7E]" />
              Comunidade
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="User" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#444444]">Ana Lucia</p>
                  <p className="text-xs text-muted-foreground mb-1">há 2 horas</p>
                  <p className="text-sm text-[#444444] line-clamp-2">"Meninas, alguém mais notou melhora no sono após retirar o café da tarde?"</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-full text-[#2A8C7E] hover:bg-[#A3D9D3]/10">
                Ver Discussões
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
