import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlanoAlimentar() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#444444]">Plano Alimentar</h2>
      <Tabs defaultValue="hoje">
        <TabsList className="bg-[#A3D9D3]/20">
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
        </TabsList>
        <TabsContent value="hoje" className="space-y-4">
          {["Café da Manhã", "Almoço", "Lanche", "Jantar"].map((meal) => (
            <Card key={meal} className="p-6 rounded-2xl flex justify-between items-center">
              <h3 className="font-bold text-lg">{meal}</h3>
              <p className="text-[#2A8C7E] font-medium">Ver Sugestão</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
