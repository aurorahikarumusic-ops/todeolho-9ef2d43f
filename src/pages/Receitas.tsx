import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Receitas() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#444444]">Biblioteca de Receitas</h2>
      <Input placeholder="Buscar por ingrediente..." className="rounded-full py-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-3xl overflow-hidden border-none shadow-sm">
            <div className="h-40 bg-gradient-to-r from-[#A3D9D3] to-[#E8C7C8]" />
            <div className="p-6">
              <h3 className="font-bold text-lg">Receita Saudável {i}</h3>
              <p className="text-sm text-muted-foreground mt-2">Perfeita para o equilíbrio intestinal.</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
