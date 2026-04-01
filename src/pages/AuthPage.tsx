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
            Tô de <span className="text-secondary">Olho</span>
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
        Ao criar uma conta, você concorda em ser um pai melhor. Ou pelo menos tentar. 👀
      </p>
    </div>
  );
}
