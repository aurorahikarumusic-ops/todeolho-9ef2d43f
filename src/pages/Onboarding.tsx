import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, ArrowRight, ArrowLeft, CheckCircle2,
  Baby, Users, Trophy, Rocket
} from "lucide-react";

type Step = "welcome" | "role" | "child" | "done";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<"pai" | "mae" | null>(null);
  const [childName, setChildName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ role });
      setStep("child");
    } catch {
      toast.error("Erro ao salvar. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim() || !user) {
      setStep("done");
      return;
    }
    setSaving(true);
    try {
      // Get user's family_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.family_id) {
        await supabase.from("children").insert({
          name: childName.trim(),
          family_id: profile.family_id,
        });
        toast.success(`${childName} adicionado! 🎉`);
      }
      setStep("done");
    } catch {
      toast.error("Erro ao adicionar filho.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {["welcome", "role", "child", "done"].map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              ["welcome", "role", "child", "done"].indexOf(step) >= i
                ? "w-8 bg-primary"
                : "w-8 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step: Welcome */}
      {step === "welcome" && (
        <div className="text-center max-w-sm animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Eye className="w-10 h-10 text-primary" />
            <h1 className="font-display text-3xl font-bold">
              Estou de <span className="text-secondary">Olho</span>
            </h1>
          </div>

          <div className="text-6xl mb-6">🎉</div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Conta criada com sucesso!
          </h2>
          <p className="font-body text-muted-foreground mb-2">
            Agora vamos configurar tudo em <span className="font-semibold text-foreground">3 passos rápidos</span>.
          </p>
          <p className="font-body text-sm italic text-secondary">
            Mais rápido que trocar uma fralda. Prometemos.
          </p>

          <Button
            size="lg"
            className="mt-8 font-display text-lg h-14 w-full"
            onClick={() => setStep("role")}
          >
            Bora Começar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Step: Role Selection */}
      {step === "role" && (
        <div className="text-center max-w-sm animate-fade-in">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Você é o pai ou a mãe?
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Isso define se você vai ser cobrado ou se vai cobrar. 😏
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card
              className={`cursor-pointer transition-all hover:scale-105 border-2 ${
                role === "pai"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/30"
              }`}
              onClick={() => setRole("pai")}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-3">👨</div>
                <h3 className="font-display text-lg font-bold">Sou o Pai</h3>
                <p className="text-xs text-muted-foreground font-body mt-1">Prepare o ego</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:scale-105 border-2 ${
                role === "mae"
                  ? "border-secondary bg-secondary/5 shadow-lg"
                  : "border-border hover:border-secondary/30"
              }`}
              onClick={() => setRole("mae")}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-3">👩</div>
                <h3 className="font-display text-lg font-bold">Sou a Mãe</h3>
                <p className="text-xs text-muted-foreground font-body mt-1">Hora da vingança</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep("welcome")} className="font-body">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button
              className="flex-1 font-display text-lg h-12"
              disabled={!role || saving}
              onClick={handleRoleSelect}
            >
              {saving ? "Salvando..." : "Confirmar"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Add Child */}
      {step === "child" && (
        <div className="text-center max-w-sm animate-fade-in">
          <Baby className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Adicione seu primeiro filho
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Pode pular se quiser. Mas a mãe vai julgar. 👀
          </p>

          <Input
            placeholder="Nome do filho(a)"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="font-body text-base h-12 mb-6"
          />

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep("role")} className="font-body">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button
              className="flex-1 font-display text-lg h-12"
              disabled={saving}
              onClick={handleAddChild}
            >
              {saving ? "Salvando..." : childName.trim() ? "Adicionar" : "Pular"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="text-center max-w-sm animate-fade-in">
          <div className="text-7xl mb-6">🚀</div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Tudo Pronto!
          </h2>
          <p className="font-body text-muted-foreground mb-2">
            Seu perfil está configurado. Agora é hora de provar que você é um bom pai.
          </p>
          <p className="font-body text-sm italic text-secondary mb-8">
            Spoiler: a mãe já está de olho. 👁️
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="font-body text-sm text-foreground">Conta criada ✓</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="font-body text-sm text-foreground">
                Papel definido: {role === "pai" ? "Pai 👨" : "Mãe 👩"} ✓
              </span>
            </div>
            {childName.trim() && (
              <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="font-body text-sm text-foreground">Filho adicionado: {childName} ✓</span>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="mt-8 font-display text-lg h-14 w-full shadow-lg"
            onClick={handleFinish}
          >
            <Rocket className="w-5 h-5 mr-2" />
            Ir Para o App
          </Button>
        </div>
      )}
    </div>
  );
}
