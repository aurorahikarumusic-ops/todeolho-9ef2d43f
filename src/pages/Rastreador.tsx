import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Brain, Zap, Moon, Smile, Droplets, Utensils, TrendingUp, Sparkles, Footprints } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const BRISTOL_SCALE = [1, 2, 3, 4, 5, 6, 7];

export default function Rastreador() {
  const [gutScore, setGutScore] = useState(75);
  
  const habits = [
    { id: "water", label: "2L de Água", icon: Droplets },
    { id: "fiber", label: "Fibras", icon: Utensils },
    { id: "move", label: "Movimento 30min", icon: Footprints },
  ];

  const data = [
    { name: 'Seg', score: 65 },
    { name: 'Ter', score: 70 },
    { name: 'Qua', score: 80 },
    { name: 'Qui', score: 75 },
    { name: 'Sex', score: 85 },
    { name: 'Sáb', score: 90 },
    { name: 'Dom', score: 82 },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meu Rastreador</h2>
          <p className="text-gray-500">Como você se sente hoje, Flora?</p>
        </div>
        <Card className="p-4 bg-[#2A8C7E] text-white rounded-3xl text-center w-24">
          <div className="text-sm">Score</div>
          <div className="text-3xl font-bold">{gutScore}</div>
        </Card>
      </header>

      <Tabs defaultValue="sintomas" className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-transparent p-0 h-auto">
          <TabsTrigger value="sintomas" className="data-[state=active]:bg-[#A3D9D3]/30 rounded-full">Sintomas</TabsTrigger>
          <TabsTrigger value="intestino" className="data-[state=active]:bg-[#A3D9D3]/30 rounded-full">Intestino</TabsTrigger>
          <TabsTrigger value="refeicoes" className="data-[state=active]:bg-[#A3D9D3]/30 rounded-full">Refeições</TabsTrigger>
          <TabsTrigger value="habitos" className="data-[state=active]:bg-[#A3D9D3]/30 rounded-full">Hábitos</TabsTrigger>
        </TabsList>

        <TabsContent value="sintomas" className="space-y-4 pt-4">
          {["Inchaço", "Humor", "Energia", "Sono", "Ondas de Calor"].map((s) => (
            <Card key={s} className="p-4 rounded-2xl border-none shadow-sm">
              <Label className="text-lg font-medium mb-4 block">{s}</Label>
              <Slider defaultValue={[5]} max={10} step={1} className="py-2" />
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="intestino" className="space-y-4 pt-4">
          <Card className="p-6 rounded-2xl border-none shadow-sm">
            <Label className="text-lg font-medium mb-6 block">Qual o tipo das suas fezes? (Escala de Bristol)</Label>
            <div className="flex justify-between gap-2">
              {BRISTOL_SCALE.map(n => (
                <Button key={n} variant="outline" className="h-12 w-12 rounded-full">{n}</Button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="refeicoes" className="space-y-4 pt-4">
          <Card className="p-6 rounded-2xl border-none shadow-sm">
             <Label className="text-lg font-medium mb-4 block">O que comeu de diferente?</Label>
             <Textarea placeholder="Descreva sua refeição ou possíveis gatilhos..." className="rounded-xl" />
          </Card>
        </TabsContent>
        
        <TabsContent value="habitos" className="space-y-4 pt-4">
          <Card className="p-6 rounded-2xl border-none shadow-sm space-y-4">
            {habits.map(h => (
              <div key={h.id} className="flex items-center gap-4 p-2">
                 <Checkbox id={h.id} className="h-6 w-6 rounded-md" />
                 <h.icon className="text-[#2A8C7E]" />
                 <Label htmlFor={h.id} className="text-lg">{h.label}</Label>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 rounded-3xl bg-[#FDF8F3] border-none shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-[#2A8C7E]">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">Insight Flora IA</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Notamos que seu inchaço aumenta cerca de 40% em dias que você consome laticínios após as 18h. Que tal testar um jantar sem lactose hoje?
        </p>
      </Card>

      <Card className="p-6 rounded-3xl border-none shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-[#2A8C7E]" />
          <h3 className="text-xl font-bold">Tendência Semanal</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#2A8C7E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Button className="w-full bg-[#2A8C7E] hover:bg-[#2A8C7E]/90 py-8 text-xl font-bold rounded-full shadow-lg shadow-[#2A8C7E]/20 active:scale-[0.98] transition-transform">
        Salvar Registro do Dia
      </Button>
    </div>
  );
}
