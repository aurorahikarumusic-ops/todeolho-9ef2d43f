import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, UserPlus, LogIn, Sparkles, HeartCrack } from "lucide-react";

const RANDOM_PHRASES_LOGIN = [
  "A mãe já tinha desistido de você. Brincadeira. Mais ou menos.",
  "Esqueceu a senha? Normal, você esquece até de levar o lixo.",
  "Entra logo, o ranking não vai se atualizar sozinho.",
  "Cuidado: a patroa tá de olho no seu progresso.",
];

const RANDOM_PHRASES_SIGNUP = [
  "Crie uma conta antes que ela peça o divórcio (brincadeira).",
  "Bem-vindo ao clube dos pais que tentam. A barra é baixa, relaxa.",
  "Aqui você vira o herói da casa, ou pelo menos tenta.",
  "Seja o pai que ela sempre sonhou (e que o Google ensinou).",
];

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    const phrases = isSignUp ? RANDOM_PHRASES_SIGNUP : RANDOM_PHRASES_LOGIN;
    setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(form.email, form.password, form.name);
        toast.success("Conta criada! 🎉", {
          description: "Agora prova que você é um pai presente.",
        });
      } else {
        await signIn(form.email, form.password);
        toast.success("Voltou! 👀", {
          description: phrase,
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs for charm */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-md z-10">
        {/* Logo Section */}
        <div className="mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-2 mb-2 group">
            <div className="bg-primary/10 p-2 rounded-2xl group-hover:rotate-12 transition-transform">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight">
              Estou de <span className="text-primary italic">Olho</span>
            </h1>
          </div>
          <p className="font-body text-slate-500 font-medium">
            porque alguém tem que lembrar
          </p>
        </div>

        {/* 3D Illustration Area */}
        <div className="relative h-48 mb-[-40px] z-20 flex justify-center animate-in zoom-in duration-1000">
          <img 
            src="/assets/login-3d.png" 
            alt="Esposa cobrando marido" 
            className="h-full object-contain drop-shadow-2xl animate-float"
          />
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl rounded-[2rem] pt-10 overflow-hidden">
          <CardContent className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {isSignUp ? "Novo no pedaço?" : "Bem-vindo de volta, herói."}
              </h2>
              <p className="text-sm text-slate-500 italic px-4">
                "{phrase}"
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5 animate-in slide-in-from-left-4 duration-300">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Como a mãe te chama?
                  </label>
                  <Input
                    placeholder="Ex: Carlos, o Esquecido"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={isSignUp}
                    className="h-12 bg-slate-50/50 border-slate-200 focus:ring-primary rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-12 bg-slate-50/50 border-slate-200 focus:ring-primary rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="h-12 bg-slate-50/50 border-slate-200 focus:ring-primary rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all duration-300 active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Entrando...
                  </div>
                ) : isSignUp ? (
                  <span className="flex items-center gap-2 text-white">
                    <UserPlus className="w-5 h-5" /> Quero ser um pai herói
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-white">
                    <LogIn className="w-5 h-5" /> Entrar agora
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                  <span className="bg-white px-3">Ou use o atalho da preguiça</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-semibold border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"
                onClick={async () => {
                  const result = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (result.error) {
                    toast.error("Ops!", { description: "Erro ao entrar com Google. Tenta de novo, pai." });
                  }
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google (Rápido e rasteiro)
              </Button>
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-primary hover:underline transition-all underline-offset-4"
              >
                {isSignUp
                  ? "Já tem conta? Entra logo, seu herói."
                  : "Ainda não tem conta? Cria uma. É rápido, juro."}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-500">
          <div className="flex gap-6">
            <a href="/termos" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Termos</a>
            <a href="/privacidade" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Privacidade</a>
            <a href="/suporte" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Suporte</a>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            © 2026 ESTOU DE OLHO
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
