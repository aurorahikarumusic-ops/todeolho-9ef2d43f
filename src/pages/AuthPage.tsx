import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, UserPlus, LogIn } from "lucide-react";

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(form.email, form.password, form.name);
        toast.success("Conta criada! 🎉", {
          description: "Bem-vindo ao clube dos pais que tentam. A barra é baixa, relaxa.",
        });
      } else {
        await signIn(form.email, form.password);
        toast.success("Voltou! 👀", {
          description: "A mãe já tinha desistido de você. Brincadeira. Mais ou menos.",
        });
      }
    } catch (err: any) {
      toast.error("Ops!", {
        description: err.message || "Algo deu errado. Como sempre.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center animate-bounce-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-10 h-10 text-primary" />
          <h1 className="font-display text-4xl font-bold text-foreground">
            Estou de <span className="text-secondary">Olho</span>
          </h1>
        </div>
        <p className="font-body text-muted-foreground text-lg">
          porque alguém tem que lembrar
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                  Seu nome (o que a mãe grita quando tá brava)
                </label>
                <Input
                  placeholder="Ex: Carlos, Pai do Pedro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required={isSignUp}
                  className="font-body"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="font-body"
              />
            </div>

            <div>
              <label className="text-sm font-body font-semibold text-foreground mb-1 block">
                Senha {isSignUp && "(forte, tipo a mãe quando tá brava)"}
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="font-body"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-display text-lg h-12"
              disabled={loading}
            >
              {loading ? (
                "Carregando..."
              ) : isSignUp ? (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Criar Conta
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
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-body">ou</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full font-body h-12 text-base"
              onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast.error("Ops!", { description: "Erro ao entrar com Google. Tenta de novo, pai." });
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
              className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp
                ? "Já tem conta? Entra logo, pai."
                : "Não tem conta? Cria uma. A mãe mandou."}
            </button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center font-body max-w-xs">
        Ao criar uma conta, você concorda com nossos{" "}
        <a href="/termos" className="underline hover:text-primary">Termos de Uso</a> e{" "}
        <a href="/privacidade" className="underline hover:text-primary">Política de Privacidade</a>. 👀
      </p>
    </div>
  );
}
