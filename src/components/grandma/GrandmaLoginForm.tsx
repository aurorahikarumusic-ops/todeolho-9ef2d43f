import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, LogIn, UserPlus, Link, Eye, EyeOff } from "lucide-react";

function translateAuthError(msg: string): string {
  if (!msg) return "Algo deu errado. Tenta de novo, vovó.";
  const lower = msg.toLowerCase();
  if (lower.includes("password") && (lower.includes("breach") || lower.includes("pwned") || lower.includes("leak")))
    return "Essa senha já vazou na internet. Escolhe outra, vovó!";
  if (lower.includes("password") && lower.includes("short"))
    return "Senha muito curta. Mínimo 6 caracteres.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "Esse e-mail já tem conta. Tenta fazer login.";
  if (lower.includes("invalid") && lower.includes("email"))
    return "E-mail inválido. Pede ajuda pra neta.";
  if (lower.includes("invalid") && (lower.includes("credentials") || lower.includes("login")))
    return "E-mail ou senha errados. Tenta de novo.";
  return msg;
}

const GRANDMA_PHRASES = [
  "Na minha época a gente criava filho sem app...",
  "Eu criei 5 filhos e nenhum precisou de tutorial",
  "Deixa a vovó dar uma olhadinha...",
  "Vocês não sabem de nada, coitados",
  "Esse app é igual genro: nunca tá bom",
  "Na minha época bastava um chinelo",
  "Filho de hoje em dia é tudo mimado",
  "Eu já avisei, mas ninguém me ouve",
];

const GRANDMA_SIGNUP_TIPS = [
  "A neta ensinou a vovó a mexer no celular 📱",
  "A vovó vai fiscalizar tudo agora 👓",
  "Cuidado, a avó sabe mais do que parece 🧶",
  "Palpite é o superpoder de toda avó 💪",
];

export default function GrandmaLoginForm({ onBack }: { onBack: () => void }) {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: "" });

  const randomPhrase = GRANDMA_PHRASES[Math.floor(Math.random() * GRANDMA_PHRASES.length)];
  const randomTip = GRANDMA_SIGNUP_TIPS[Math.floor(Math.random() * GRANDMA_SIGNUP_TIPS.length)];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(form.email, form.password, form.name, "avo");
        if (form.inviteCode.trim()) {
          const { data } = await supabase.rpc("join_family_by_code", {
            invite_code: form.inviteCode.trim(),
          });
          const result = data as any;
          if (result?.success) {
            toast.success("Conta criada e família conectada, vovó! 👵🧶", {
              description: `Conectada com ${result.host_name}. Agora pode dar todos os palpites!`,
              duration: 5000,
            });
            return;
          }
        }
        toast.success("Conta criada, vovó! 👵🧶", {
          description: "Agora você pode dar todos os palpites que quiser. A família que se prepare.",
        });
      } else {
        await signIn(form.email, form.password);
        toast.success("A vovó chegou! 👵", {
          description: "Preparem-se, ela tem opinião sobre TUDO. E vai compartilhar.",
        });
      }
    } catch (err: any) {
      toast.error("Eita, deu ruim!", {
        description: translateAuthError(err.message),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
      {/* Decorative header */}
      <div className="bg-gradient-to-r from-avo to-avo-glow p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-7xl opacity-10 -rotate-12 translate-x-4 -translate-y-2">🧶</div>
        <div className="absolute bottom-0 left-0 text-5xl opacity-10 rotate-12 -translate-x-2 translate-y-2">👓</div>
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-body text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">👵</span>
            <div>
              <h2 className="font-display text-lg font-bold text-white leading-tight">Área da Vovó</h2>
              <p className="text-[10px] text-white/70 font-body">{randomTip}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="pt-5 bg-gradient-to-b from-avo-bg to-white">
        {/* Sarcastic quote */}
        <div className="bg-avo/5 border border-avo-border rounded-xl p-3 mb-4 text-center">
          <p className="text-xs font-body italic text-avo-text">
            "{randomPhrase}"
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">— Toda avó, sempre</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                  Como os netos te chamam? 👵
                </label>
                <Input
                  placeholder="Ex: Vó Lourdes, Dona Maria, Vovó do Bolo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required={isSignUp}
                  className="font-body border-avo-border focus-visible:ring-avo"
                />
              </div>

              <div>
                <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                  <Link className="w-3.5 h-3.5 inline mr-1" />
                  Código de convite <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  placeholder="Ex: A1B2C3D4"
                  value={form.inviteCode}
                  onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })}
                  maxLength={8}
                  className="font-body border-avo-border focus-visible:ring-avo text-center tracking-[0.15em]"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tem o código da família? Cola aqui pra já se conectar.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-body font-semibold text-foreground mb-1 block">
              E-mail {isSignUp && "(o que a neta criou pra você)"}
            </label>
            <Input
              type="email"
              placeholder="vovo@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="font-body border-avo-border focus-visible:ring-avo"
            />
          </div>

          <div>
            <label className="text-sm font-body font-semibold text-foreground mb-1 block">
              Senha {isSignUp && "(não é 123456, vovó!)"}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="font-body border-avo-border focus-visible:ring-avo"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-display text-lg h-12 bg-avo hover:bg-avo/80 text-white shadow-lg"
            disabled={loading}
            style={{ boxShadow: "0 6px 20px -4px hsl(270 60% 55% / 0.4)" }}
          >
            {loading ? (
              "A vovó tá pensando..."
            ) : isSignUp ? (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Criar Conta de Vovó
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" /> Entrar como Vovó
              </span>
            )}
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-avo-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-avo-bg px-2 text-muted-foreground font-body">ou</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full font-body h-12 text-base border-avo-border hover:bg-avo-bg"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result.error) {
                toast.error("Ops!", { description: "Erro ao entrar com Google. Pede ajuda pra neta." });
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </Button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-body text-muted-foreground hover:text-avo transition-colors"
          >
            {isSignUp
              ? "Já tem conta? Entra, vovó. A família espera."
              : "Primeira vez? Cria sua conta. Os netos precisam de palpite."}
          </button>
        </div>

      </CardContent>
    </Card>
  );
}
