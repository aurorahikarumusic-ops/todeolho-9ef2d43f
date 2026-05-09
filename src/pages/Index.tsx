import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Apple, ChevronRight, MessageCircle, Star, TrendingUp, Sparkles, Droplets, Utensils, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-6 pb-4 animate-in fade-in duration-700">
      {/* Welcome Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2A8C7E] to-[#1F6B60] rounded-[2.5rem] p-6 text-white shadow-xl shadow-[#2A8C7E]/20">
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1">Bom dia, Maria! ✨</h1>
          <p className="text-white/80 text-sm font-medium mb-6">Como está seu equilíbrio hoje?</p>
          
          <Link to="/app/rastreador">
            <Button className="w-full bg-white text-[#2A8C7E] hover:bg-white/90 rounded-2xl py-6 h-auto text-lg font-bold shadow-lg">
              Registrar Agora
            </Button>
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <Sparkles className="w-40 h-40" />
        </div>
      </section>

      {/* Gut Health Score - Compact Mobile */}
      <Card className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white flex items-center gap-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#A3D9D3]/20" />
            <circle
              cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={220} strokeDashoffset={220 - (220 * 85) / 100}
              className="text-[#2A8C7E] transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-xl font-black text-[#333333]">85</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#2A8C7E]">Gut Score</h2>
          <p className="text-xs text-gray-400 font-medium">Ótimo progresso esta semana!</p>
          <div className="flex items-center gap-1 mt-1 text-[#2A8C7E] text-xs font-bold">
            <TrendingUp className="w-3 h-3" /> +12%
          </div>
        </div>
      </Card>

      {/* Daily Checklist - Mobile Vertical Layout */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black text-[#333333]">Para você hoje</h3>
           <span className="text-xs font-bold text-[#2A8C7E] uppercase tracking-wider">50% Completo</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Hidratação (2L)", icon: Droplets, done: true, color: "bg-blue-50 text-blue-500" },
            { label: "Probiótico matinal", icon: Heart, done: true, color: "bg-red-50 text-red-500" },
            { label: "15 min de caminhada", icon: Activity, done: false, color: "bg-green-50 text-green-500" },
            { label: "Refeição Flora", icon: Utensils, done: false, color: "bg-orange-50 text-orange-500" },
          ].map((task, i) => (
            <Card key={i} className="p-4 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${task.color} transition-all`}>
                  <task.icon className="w-5 h-5" />
                </div>
                <span className={`font-bold text-base transition-all ${task.done ? 'text-gray-300 line-through' : 'text-[#333333]'}`}>
                  {task.label}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-[#2A8C7E] border-[#2A8C7E]' : 'border-[#E8C7C8] group-hover:border-[#2A8C7E]'}`}>
                {task.done && <span className="text-white text-xs">✓</span>}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Meal Highlight - Mobile Friendly Card */}
      <Link to="/app/plano-alimentar">
        <Card className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#A3D9D3]/20 flex items-center justify-center flex-shrink-0">
              <Apple className="w-8 h-8 text-[#2A8C7E]" />
            </div>
            <div className="flex-1">
              <Badge className="bg-[#E8C7C8]/40 text-[#333333] text-[10px] font-bold rounded-full mb-1 border-none">Próxima Refeição</Badge>
              <h4 className="text-lg font-black text-[#333333] leading-tight">Bowl de Quinoa</h4>
            </div>
            <ChevronRight className="text-[#A3D9D3] group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </Link>

      {/* Community / Social - Simple Feed Preview */}
      <Card className="p-6 rounded-[2.5rem] border-none shadow-sm bg-[#FDF8F3] border-l-4 border-l-[#2A8C7E]">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-[#2A8C7E]" />
          <h3 className="text-lg font-bold text-[#333333]">Papo na Comunidade</h3>
        </div>
        <p className="text-sm text-gray-600 italic leading-relaxed mb-4">
          "Meninas, alguém mais notou melhora no sono após retirar o café da tarde?"
        </p>
        <Link to="/app/comunidade">
          <Button variant="link" className="text-[#2A8C7E] p-0 font-bold flex items-center gap-1">
            Ver todas as conversas <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

export default Index;
