import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye, CheckCircle2, Trophy, Calendar, ListTodo,
  Star, ArrowRight, Smartphone, Shield, Users
} from "lucide-react";

const features = [
  {
    icon: <ListTodo className="w-7 h-7 text-primary" />,
    title: "Tarefas Gamificadas",
    desc: "Cada fralda trocada, cada lição acompanhada — tudo vira ponto. Porque pai que faz merece crédito.",
  },
  {
    icon: <Trophy className="w-7 h-7 text-secondary" />,
    title: "Ranking de Pais",
    desc: "Compare-se com outros pais. Spoiler: a barra é baixa, mas existe.",
  },
  {
    icon: <Calendar className="w-7 h-7 text-primary" />,
    title: "Agenda Familiar",
    desc: "Consulta do pediatra, reunião na escola — tudo num lugar só. Sem desculpa de 'eu não sabia'.",
  },
  {
    icon: <Star className="w-7 h-7 text-accent-foreground" />,
    title: "Nota da Mãe",
    desc: "A mãe avalia sua semana com estrelas. Sim, é assustador. Sim, é justo.",
  },
  {
    icon: <Users className="w-7 h-7 text-primary" />,
    title: "Grupos de Amigos",
    desc: "Crie grupos e veja quem é o pior pai da turma. Competição saudável (mais ou menos).",
  },
  {
    icon: <Shield className="w-7 h-7 text-secondary" />,
    title: "Missões Diárias",
    desc: "Todo dia uma nova missão aparece. Tipo um RPG, só que o boss é a rotina.",
  },
];

const testimonials = [
  { name: "Carlos", text: "Minha esposa parou de reclamar. Quer dizer, reclamou menos. Já é uma vitória.", stars: 5 },
  { name: "Roberto", text: "Agora eu lembro da consulta do pediatra ANTES de ela me ligar brava.", stars: 4 },
  { name: "André", text: "O ranking me motivou. Não posso ser o pior pai do grupo. Tem o Marcos pra isso.", stars: 5 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showCta, setShowCta] = useState(false);

  const handleOpenApp = () => {
    // Try deep link for Android (WebIntoApp TWA or installed PWA)
    const appPackage = "app.lovable.c98da6ca3b0a4e2a816155c857301dd2";
    const intentUrl = `intent://estoudeolho.lovable.app/#Intent;scheme=https;package=${appPackage};end`;

    // Try the intent URL first, fallback to direct navigation
    const timeout = setTimeout(() => {
      // If intent didn't work, navigate to app route
      navigate("/");
    }, 1500);

    window.location.href = intentUrl;

    // Clear timeout if page is hidden (app opened successfully)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(timeout);
    }, { once: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="w-12 h-12 text-primary animate-bounce" />
            <h1 className="font-display text-5xl font-bold text-foreground">
              Estou de <span className="text-secondary">Olho</span>
            </h1>
          </div>

          <p className="font-body text-lg text-muted-foreground mt-4 leading-relaxed">
            O app que <span className="font-semibold text-foreground">gamifica a paternidade</span>.
            Porque trocar fralda sem crédito é trabalho voluntário.
          </p>

          <p className="font-body text-base italic text-secondary mt-2">
            "Alguém tem que lembrar. E esse alguém agora tem pontuação." 👀
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Button
              size="lg"
              className="font-display text-lg h-14 px-8 shadow-lg"
              onClick={() => navigate("/auth")}
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Criar Conta Grátis
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-display text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              <LogInIcon className="w-5 h-5 mr-2" />
              Já Tenho Conta
            </Button>
          </div>

          <p className="text-xs text-muted-foreground font-body mt-3">
            100% gratuito. Sem cartão. Sem pegadinha.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-6 text-muted-foreground font-body text-sm">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> +500 pais
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-primary" /> +3.000 tarefas
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent-foreground" /> 4.8 estrelas
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold text-center text-foreground mb-2">
            O Que Esse App Faz Por Você
          </h2>
          <p className="font-body text-sm text-muted-foreground text-center mb-8">
            (Além de salvar seu casamento)
          </p>

          <div className="grid gap-4">
            {features.map((f, i) => (
              <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="shrink-0 mt-0.5 p-2 rounded-xl bg-muted">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">{f.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12 bg-muted/30">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold text-center text-foreground mb-8">
            Como Funciona
          </h2>

          <div className="space-y-6">
            {[
              { step: "1", title: "Crie sua conta", desc: "Leva 30 segundos. Menos que trocar uma fralda." },
              { step: "2", title: "Escolha seu papel", desc: "Pai ou Mãe. Quem vai ser cobrado e quem vai cobrar." },
              { step: "3", title: "Adicione os filhos", desc: "Nome, escola, pediatra — tudo organizado." },
              { step: "4", title: "Complete tarefas e suba no ranking", desc: "Cada ação vale pontos. Cada esquecimento, vergonha." },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-lg">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{s.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-12">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold text-center text-foreground mb-8">
            O Que Os Pais Dizem
          </h2>

          <div className="grid gap-4">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent-foreground" />
                    ))}
                  </div>
                  <p className="font-body text-sm text-foreground italic">"{t.text}"</p>
                  <p className="font-display text-sm font-bold text-muted-foreground mt-2">— {t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 text-center bg-gradient-to-t from-primary/5 to-transparent">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground mb-3">
            Bora Ser Um Pai Melhor? 💪
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Ou pelo menos um pai que lembra das coisas. Já é um começo.
          </p>

          <Button
            size="lg"
            className="font-display text-lg h-14 px-10 shadow-lg mb-4"
            onClick={() => navigate("/auth")}
          >
            Começar Agora — É Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Deep link button to open the installed app */}
          <div className="mt-6">
            <Button
              variant="secondary"
              size="lg"
              className="font-display text-base h-12 px-8"
              onClick={handleOpenApp}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Abrir no Aplicativo
            </Button>
            <p className="font-body text-xs text-muted-foreground mt-2">
              Já instalou o app? Toque aqui para abrir direto.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Estou de Olho</span>
          </div>
          <div className="flex justify-center gap-4 text-sm font-body">
            <a href="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
            <a href="/termos" className="text-muted-foreground hover:text-primary transition-colors">Termos</a>
            <a href="/suporte" className="text-muted-foreground hover:text-primary transition-colors">Suporte</a>
            <a href="/exclusao-dados" className="text-muted-foreground hover:text-primary transition-colors">Exclusão de Dados</a>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Estou de Olho. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function LogInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}
