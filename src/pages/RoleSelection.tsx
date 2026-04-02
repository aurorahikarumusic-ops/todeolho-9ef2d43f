import { useState } from "react";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { toast } from "sonner";

export default function RoleSelection() {
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<"pai" | "mae" | null>(null);

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      await updateProfile.mutateAsync({ role: selected });
      toast.success(
        selected === "pai"
          ? "Bem-vindo, pai! Prepare-se. A barra é baixa, mas existe. 💪"
          : "Bem-vinda, mãe! Agora você pode cobrar oficialmente. 😏"
      );
    } catch {
      toast.error("Deu ruim. Tenta de novo.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-bold">
            Estou de <span className="text-secondary">Olho</span>
          </h1>
        </div>
        <p className="font-display text-xl text-foreground mt-4">
          Você é o pai ou a mãe?
        </p>
        <p className="font-body text-muted-foreground text-sm mt-1">
          Isso define se você vai ser cobrado ou se vai cobrar. 😏
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <Card
          className={`cursor-pointer transition-all hover:scale-105 border-2 ${
            selected === "pai"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border hover:border-primary/30"
          }`}
          onClick={() => setSelected("pai")}
        >
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-3">👨</div>
            <h3 className="font-display text-lg font-bold">Sou o Pai</h3>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Prepare o ego
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-105 border-2 ${
            selected === "mae"
              ? "border-secondary bg-secondary/5 shadow-lg"
              : "border-border hover:border-secondary/30"
          }`}
          onClick={() => setSelected("mae")}
        >
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-3">👩</div>
            <h3 className="font-display text-lg font-bold">Sou a Mãe</h3>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Hora da vingança
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleConfirm}
        disabled={!selected || updateProfile.isPending}
        className="mt-6 w-full max-w-sm font-display text-lg h-12"
      >
        {updateProfile.isPending ? "Salvando..." : "Confirmar"}
      </Button>
    </div>
  );
}
