import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Heart, Brain, Zap, Moon, Smile } from "lucide-react";

export default function Rastreador() {
  const symptoms = [
    { id: "bloating", label: "Inchaço", icon: Heart },
    { id: "mood", label: "Humor", icon: Smile },
    { id: "energy", label: "Energia", icon: Zap },
    { id: "sleep", label: "Qualidade do Sono", icon: Moon },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-3xl font-bold text-[#444444]">Rastreador de Sintomas</h2>
      <div className="grid gap-4">
        {symptoms.map((s) => (
          <Card key={s.id} className="p-6 flex items-center justify-between rounded-2xl border-none shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#A3D9D3]/20 rounded-xl">
                <s.icon className="w-6 h-6 text-[#2A8C7E]" />
              </div>
              <span className="font-semibold text-lg">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ruim</span>
              <input type="range" className="accent-[#2A8C7E] w-32" />
              <span className="text-sm text-muted-foreground">Bom</span>
            </div>
          </Card>
        ))}
      </div>
      <Button className="w-full bg-[#2A8C7E] py-6 text-lg rounded-full">Salvar Registro</Button>
    </div>
  );
}
