import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, ArrowRight, ArrowLeft, CheckCircle2,
  Baby, Users, Trophy, Rocket, Share2, Copy
} from "lucide-react";

type Step = "welcome" | "role" | "child" | "invite" | "join" | "done";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<"pai" | "mae" | null>(
    (profile?.role === "mae" || profile?.role === "pai") ? profile.role : null
  );
  const [childName, setChildName] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ role });
      if (role === "mae") {
        setStep("child");
      } else {
        setStep("join");
      }
    } catch {
      toast.error("Erro ao salvar. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim() || !user) {
      setStep(role === "mae" ? "invite" : "done");
      return;
    }
    setSaving(true);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("user_id", user.id)
        .single();

      if (prof?.family_id) {
        await supabase.from("children").insert({
          name: childName.trim(),
          family_id: prof.family_id,
        });
        toast.success(`${childName} adicionado! 🎉`);
      }
      setStep(role === "mae" ? "invite" : "done");
    } catch {
      toast.error("Erro ao adicionar filho.");
    } finally {
      setSaving(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!familyCode.trim() || !user) {
      setStep("done");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("join_family_by_code", {
        invite_code: familyCode.trim(),
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === "Code not found") {
          toast.error("Código não encontrado. Confere com a mãe.");
        } else {
          toast.error(data.error);
        }
        setSaving(false);
        return;
      }

      toast.success(
        `Conectado com ${data.host_name}! Ela já está de olho. Literalmente. 👁️`,
        { duration: 5000 }
      );
      setStep("done");
    } catch {
      toast.error("Erro ao conectar.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const code = profile?.family_code?.toUpperCase() || "";
    const msg = `Baixa o Estou de Olho (${window.location.origin}) e usa o código ${code}.\nAgora eu tenho provas de tudo. 👁️`;
    if (navigator.share) {
      navigator.share({ title: "Estou de Olho", text: msg }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }
  };

  const handleFinish = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {["welcome", "role", role === "mae" ? "child" : "join", role === "mae" ? "invite" : "child", "done"].map((s, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              ["welcome", "role", "child", "invite", "join", "done"].indexOf(step) >= i
                ? `w-8 ${role === "mae" ? "bg-mom" : "bg-primary"}`
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
          <Button size="lg" className="mt-8 font-display text-lg h-14 w-full" onClick={() => {
            if (role) {
              // Role already set from signup form, skip role selection
              setStep(role === "mae" ? "child" : "join");
            } else {
              setStep("role");
            }
          }}>
            Bora Começar <ArrowRight className="w-5 h-5 ml-2" />
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
                role === "pai" ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/30"
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
                role === "mae" ? "border-mom bg-mom/5 shadow-lg" : "border-border hover:border-mom/30"
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
              className={`flex-1 font-display text-lg h-12 ${role === "mae" ? "bg-mom hover:bg-mom/90" : ""}`}
              disabled={!role || saving}
              onClick={handleRoleSelect}
            >
              {saving ? "Salvando..." : "Confirmar"} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Join Family (Dad) */}
      {step === "join" && (
        <div className="text-center max-w-sm animate-fade-in">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Conectar com a mãe
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Peça o código de 6 dígitos pra ela. Ela tem. Sempre tem.
          </p>
          <Input
            placeholder="Código da família"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
            className="text-center font-display text-xl tracking-[0.2em] mb-4 h-14"
            maxLength={8}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep("role")} className="font-body">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button
              className="flex-1 font-display text-lg h-12"
              disabled={saving}
              onClick={handleJoinFamily}
            >
              {saving ? "Conectando..." : familyCode.trim() ? "Conectar" : "Pular"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Add Child */}
      {step === "child" && (
        <div className="text-center max-w-sm animate-fade-in">
          <Baby className={`w-12 h-12 mx-auto mb-4 ${role === "mae" ? "text-mom" : "text-secondary"}`} />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Adicione seu primeiro filho
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {role === "mae"
              ? "Você sabe todos os detalhes. O pai... veremos."
              : "Pode pular se quiser. Mas a mãe vai julgar. 👀"}
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
              className={`flex-1 font-display text-lg h-12 ${role === "mae" ? "bg-mom hover:bg-mom/90" : ""}`}
              disabled={saving}
              onClick={handleAddChild}
            >
              {saving ? "Salvando..." : childName.trim() ? "Adicionar" : "Pular"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Invite Dad (Mom only) */}
      {step === "invite" && (
        <div className="text-center max-w-sm animate-fade-in">
          <Share2 className="w-12 h-12 text-mom mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Convide o pai
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Compartilhe o código abaixo. Ele vai precisar pra se conectar.
          </p>

          <div className="bg-mom-bg rounded-xl py-4 px-6 mb-4 border-2 border-mom-border">
            <p className="font-display text-3xl font-bold tracking-[0.3em] text-mom-text">
              {profile?.family_code?.toUpperCase() || "..."}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              className="flex-1 border-mom text-mom hover:bg-mom/10"
              onClick={() => {
                navigator.clipboard.writeText(profile?.family_code?.toUpperCase() || "");
                toast.success("Código copiado!");
              }}
            >
              <Copy className="w-4 h-4 mr-1" /> Copiar
            </Button>
            <Button className="flex-1 bg-mom hover:bg-mom/90" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" /> WhatsApp
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full font-body"
            onClick={() => setStep("done")}
          >
            Continuar sem convidar agora <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
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
            {role === "mae"
              ? "Seu painel está configurado. Bem-vinda ao comando."
              : "Seu perfil está configurado. Agora é hora de provar que você é um bom pai."}
          </p>
          <p className="font-body text-sm italic text-secondary mb-8">
            {role === "mae"
              ? "A partir de agora, tudo fica registrado. 👁️"
              : "Spoiler: a mãe já está de olho. 👁️"}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="font-body text-sm text-foreground">Conta criada ✓</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${role === "mae" ? "text-mom" : "text-primary"}`} />
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
            className={`mt-8 font-display text-lg h-14 w-full shadow-lg ${role === "mae" ? "bg-mom hover:bg-mom/90" : ""}`}
            onClick={handleFinish}
          >
            <Rocket className="w-5 h-5 mr-2" />
            {role === "mae" ? "Ir Para o Painel" : "Ir Para o App"}
          </Button>
        </div>
      )}
    </div>
  );
}
