import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";

const GRANDMA_PHRASES = [
  "Na minha época a gente criava filho sem app...",
  "Eu criei 5 filhos e nenhum precisou de tutorial",
  "Deixa a vovó dar uma olhadinha...",
  "Vocês não sabem de nada, coitados",
];

export default function GrandmaLoginForm({ onBack }: { onBack: () => void }) {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const randomPhrase = GRANDMA_PHRASES[Math.floor(Math.random() * GRANDMA_PHRASES.length)];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(form.email, form.password, form.name, "avo");
        toast.success("Conta criada, vovó! 👵", {
          description: "Agora você pode dar todos os palpites que quiser. Finalmente.",
        });
      } else {
        await signIn(form.email, form.password);
        toast.success("A vovó chegou! 👵", {
          description: "Preparem-se, ela tem opinião sobre TUDO.",
        });
      }
    } catch (err: any) {
      toast.error("Ops!", {
        description: err.message || "Algo deu errado. Mas na época da vovó isso não acontecia.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-[hsl(270,80%,97%)] to-[hsl(270,60%,92%)]">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-avo transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <span className="text-2xl">👵</span>
        </div>

        <p className="text-xs font-body italic text-avo-text mb-4 text-center">
          "{randomPhrase}"
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                Como os netos te chamam? 👵
              </label>
              <Input
                placeholder="Ex: Dona Maria, Vó Lourdes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required={isSignUp}
                className="font-body border-avo-border focus-visible:ring-avo"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-body font-semibold text-foreground mb-1 block">
              E-mail
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
              Senha {isSignUp && "(não conta pra ninguém, viu?)"}
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
            className="w-full font-display text-lg h-12 bg-avo hover:bg-avo/80 text-white"
            disabled={loading}
          >
            {loading ? (
              "Carregando..."
            ) : isSignUp ? (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Criar Minha Conta
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-5 h-5" /> Entrar
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
              <span className="bg-[hsl(270,80%,95%)] px-2 text-muted-foreground font-body">ou</span>
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
                toast.error("Ops!", { description: "Erro ao entrar com Google." });
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

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-body text-muted-foreground hover:text-avo transition-colors"
          >
            {isSignUp
              ? "Já tem conta? Entra, vovó."
              : "Primeira vez? Cria sua conta. Os netos agradecem."}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
