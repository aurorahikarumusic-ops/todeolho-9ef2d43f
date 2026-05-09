import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Comunidade() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#444444]">Comunidade Flora</h2>
      <Card className="p-8 rounded-3xl text-center space-y-4">
        <h3 className="text-2xl font-bold">Conecte-se com outras mulheres</h3>
        <p className="text-muted-foreground">Compartilhe sua jornada e aprenda com quem vive o mesmo momento.</p>
        <Button className="rounded-full bg-[#2A8C7E]">Entrar no Grupo</Button>
      </Card>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div>
              <p className="font-bold">Usuária {i}</p>
              <p className="text-sm">"Alguém mais sentiu melhora no humor hoje?"</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
