import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import screenshotDashboard from "@/assets/screenshot-dashboard.jpg";
import screenshotTarefas from "@/assets/screenshot-tarefas.jpg";
import screenshotRanking from "@/assets/screenshot-ranking.jpg";
import tutorialStep1 from "@/assets/tutorial-step1.jpg";
import tutorialStep2 from "@/assets/tutorial-step2.jpg";
import tutorialStep3 from "@/assets/tutorial-step3.jpg";
import tutorialStep4 from "@/assets/tutorial-step4.jpg";

const APK_URL = "https://github.com/aurorahikarumusic-ops/todeolho-9ef2d43f/releases/download/v1.0.0/estoudeolho.apk";

const tickerItems = [
  "Pai que esquece lanche",
  "Mãe que organiza tudo",
  "Ranking dos pais",
  "Sogra que deu palpite",
  "Avó interferiu (de novo)",
  "Palpite adotado pela mãe",
  "Reunião que o pai esqueceu",
  "Resgate número 7 da mãe",
  "Avó mandou sugestão às 6h",
  "Nota 2 estrelas essa semana",
  "Sogra no ranking de palpites",
  "Quem buscou na escola? A mãe.",
];

const featureCards = [
  {
    bg: "#FFEAAE",
    border: "#D4A10A",
    shadow: "#B8890A",
    icon: "📅",
    title: "Agenda que o pai vai ver",
    desc: "Calendário compartilhado com cores por quem adicionou. Verde = pai (raro). Laranja = mãe (sempre).",
    quote: "Este mês: 11 eventos da mãe, 1 do pai.",
  },
  {
    bg: "#D8F3DC",
    border: "#2D6A4F",
    shadow: "#1B4332",
    icon: "🏆",
    title: "Ranking público de pais",
    desc: "Semanalmente, todos os pais são rankeados. Com descrições irônicas. E um Hall da Vergonha mensal.",
    quote: "Último lugar. Mas pelo menos você aparece.",
  },
  {
    bg: "#FFD6D6",
    border: "#C0392B",
    shadow: "#922B21",
    icon: "📸",
    title: "Prova de presença",
    desc: "O pai tira foto como prova. A mãe aprova ou reprova. Sem aprovação, não conta.",
    quote: "Reprovou: 'Isso não é o remédio certo, amor.'",
  },
  {
    bg: "#E8DAFF",
    border: "#7B2FF2",
    shadow: "#5B1FBF",
    icon: "👵",
    title: "Modo Avó (Sogra)",
    desc: "A avó dá palpites. A mãe adota os melhores e manda pro pai. Com ranking de quem palpita mais.",
    quote: "'Na minha época...' — Dona Maria, 3° lugar no ranking.",
  },
  {
    bg: "#FFF0E6",
    border: "#F4845F",
    shadow: "#D4734F",
    icon: "⭐",
    title: "Avaliação da mãe",
    desc: "Toda sexta, a mãe dá de 1 a 5 estrelas. Nota pública, aparece no ranking.",
    quote: "Ana deu 2 estrelas pro João. Motivo: 'Poderia melhorar.'",
  },
  {
    bg: "#D6EAFF",
    border: "#2B7ACA",
    shadow: "#1A4B7B",
    icon: "🔥",
    title: "Check-in diário",
    desc: "Streak de presença com mensagens irônicas. Abriu o app? Parabéns, é o mínimo. Não abriu? A mãe sabe.",
    quote: "5 dias seguidos! Quem é você e o que fez com o pai?",
  },
];

const badges = [
  { emoji: "🔥", label: "7 dias seguidos", bg: "#D8F3DC", color: "#1B4332", border: "#2D6A4F" },
  { emoji: "👵", label: "Sogra Approved", bg: "#E8DAFF", color: "#5B1FBF", border: "#7B2FF2" },
  { emoji: "😬", label: "Pai Google Maps", bg: "#FFF0E6", color: "#922B21", border: "#F4845F" },
  { emoji: "⭐", label: "Herói do Lanche", bg: "#FFEAAE", color: "#7B6B1A", border: "#D4A10A" },
  { emoji: "💤", label: "Modo Hibernação", bg: "#FFD6D6", color: "#922B21", border: "#C0392B" },
  { emoji: "👑", label: "Pai do Mês", bg: "#E8DAFF", color: "#5B1FBF", border: "#7B2FF2" },
  { emoji: "📊", label: "DNA do Pai", bg: "#D6EAFF", color: "#1A4B7B", border: "#2B7ACA" },
  { emoji: "🛟", label: "Resgatado 5x", bg: "#FFE8CC", color: "#8B5E00", border: "#D4A10A" },
  { emoji: "🗣️", label: "Avó Palpiteira", bg: "#F3E8FF", color: "#6B21A8", border: "#9333EA" },
];

const rankingRows = [
  { pos: "🥇", initials: "RA", name: "Ricardo A.", city: "São Paulo", quote: "Fez tudo certo. Suspeito.", pts: 980, avatarBg: "#F4845F" },
  { pos: "🥈", initials: "MF", name: "Marcos F.", city: "Fortaleza", quote: "Chegou no 2° por acidente.", pts: 841, avatarBg: "#52B788" },
  { pos: "🥉", initials: "LG", name: "Lucas G.", city: "Manaus", quote: "Tentou. Mais ou menos.", pts: 702, avatarBg: "#8B5CF6" },
  { pos: "4", initials: "VC", name: "Você", city: "Aqui", quote: "Poderia ser o 3°. Esqueceu o lanche.", pts: 489, avatarBg: "#F4845F", highlight: true },
  { pos: "5", initials: "PS", name: "Paulo S.", city: "Recife", quote: "Perguntou o nome da professora.", pts: 201, avatarBg: "#9CA3AF" },
];

const testimonials = [
  {
    stars: 5,
    text: "Mandei o link pro meu marido com 'baixa aí'. Pela primeira vez ele perguntou o nome da pediatra sem eu pedir.",
    name: "Ana Carolina",
    role: "Mãe de 2 — São Paulo",
    avatarBg: "#FFD6D6",
    avatarEmoji: "👩‍👧‍👦",
  },
  {
    stars: 5,
    text: "Minha sogra descobriu o app. Agora manda palpite todo dia. Meu marido tá com medo das duas. Melhor coisa que aconteceu.",
    name: "Fernanda M.",
    role: "Mãe de 1 — Curitiba",
    avatarBg: "#E8DAFF",
    avatarEmoji: "👵",
  },
  {
    stars: 5,
    text: "Meu marido ficou com raiva quando viu que tava em último. Aí começou a fazer as tarefas sozinho. O app disse por mim.",
    name: "Mariana R.",
    role: "Mãe de 3 — Fortaleza",
    avatarBg: "#D8F3DC",
    avatarEmoji: "💪",
  },
  {
    stars: 4,
    text: "Sou o pai. Eu estava em 4°. O Carlos em 3°. Isso foi suficiente pra eu buscar as crianças 5 vezes seguidas.",
    name: "João L.",
    role: "Pai convertido — Manaus",
    avatarBg: "#FFEAAE",
    avatarEmoji: "🏃‍♂️",
  },
];

const appScreenshots = [
  { src: screenshotDashboard, label: "Dashboard", desc: "Seu nível de pai em tempo real" },
  { src: screenshotTarefas, label: "Tarefas", desc: "Organize e comprove presença" },
  { src: screenshotRanking, label: "Ranking", desc: "Compare com outros pais" },
];

const tutorialSteps = [
  {
    img: tutorialStep1,
    step: "1",
    title: "Mãe cria a conta",
    desc: "Abra o app e clique em \"Sou a Chefe\" 👑. Crie sua conta. Você é a CEO da família.",
    color: "#FF6B9D",
    rotate: "-4deg",
  },
  {
    img: tutorialStep2,
    step: "2",
    title: "Gere o código",
    desc: "No perfil, clique em \"Convidar Parceiro\". Um código único será gerado. Envie pelo WhatsApp.",
    color: "#2D6A4F",
    rotate: "3deg",
  },
  {
    img: tutorialStep3,
    step: "3",
    title: "Pai entra",
    desc: "O pai cria a conta dele e cola o código no campo \"Código de Convite\" na tela inicial.",
    color: "#F4845F",
    rotate: "-2deg",
  },
  {
    img: tutorialStep4,
    step: "4",
    title: "Conectados! 🎉",
    desc: "Pronto! A mãe cria tarefas, o pai executa, e o ranking começa. Sem escapatória.",
    color: "#7B2FF2",
    rotate: "4deg",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const revealRefs = useRef<HTMLElement[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#FFF8F1", color: "#1B2B23", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap');
        
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .revealed { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.15s; }
        .reveal-d2 { transition-delay: 0.3s; }
        .reveal-d3 { transition-delay: 0.45s; }

        .neo-card {
          border: 4px solid #1B2B23;
          border-radius: 24px;
          box-shadow: 8px 8px 0 #1B2B23;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
        }
        .neo-card:hover {
          transform: translate(-6px, -6px) rotate(-0.5deg);
          box-shadow: 14px 14px 0 #1B2B23;
        }

        @keyframes eye-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.15) rotate(5deg); }
          50% { transform: scale(1.05) rotate(0deg); }
          75% { transform: scale(1.15) rotate(-5deg); }
        }
        @keyframes float-hero {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-4px) rotate(-1deg); }
          30% { transform: translateX(4px) rotate(1deg); }
          50% { transform: translateX(-4px) rotate(-0.5deg); }
          70% { transform: translateX(4px) rotate(0.5deg); }
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }

        .ticker-track {
          display: flex;
          animation: ticker-scroll 20s linear infinite;
          white-space: nowrap;
        }

        .neo-badge {
          border: 3px solid #1B2B23;
          border-radius: 50px;
          padding: 0.65rem 1.5rem;
          font-weight: 800;
          font-family: 'Baloo 2', cursive;
          font-size: 1rem;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 4px 4px 0 #1B2B23;
          cursor: default;
        }
        .neo-badge:hover {
          transform: rotate(-3deg) scale(1.08) translateY(-4px);
          box-shadow: 6px 6px 0 #1B2B23;
        }

        .stat-neo {
          border: 4px solid rgba(255,255,255,0.3);
          border-radius: 24px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
        }
        .stat-neo:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: #F4845F;
        }

        .testimonial-neo {
          border: 3px solid rgba(255,255,255,0.15);
          border-radius: 24px;
          padding: 2.5rem;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, box-shadow 0.3s;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(8px);
        }
        .testimonial-neo:hover {
          transform: translateY(-8px) rotate(-0.5deg);
          border-color: #F4845F;
          box-shadow: 0 20px 60px rgba(244,132,95,0.15);
        }

        .cta-btn {
          background: #2D6A4F;
          color: white;
          border: 4px solid #1B2B23;
          border-radius: 50px;
          padding: 1.1rem 2.5rem;
          font-family: 'Baloo 2', cursive;
          font-weight: 800;
          font-size: 1.2rem;
          text-decoration: none;
          box-shadow: 6px 6px 0 #1B2B23;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .cta-btn:hover {
          background: #F4845F;
          transform: translate(-4px, -4px);
          box-shadow: 10px 10px 0 #1B2B23;
        }

        .cta-btn-outline {
          background: white;
          color: #2D6A4F;
          border: 4px solid #2D6A4F;
          border-radius: 50px;
          padding: 1.1rem 2.5rem;
          font-family: 'Baloo 2', cursive;
          font-weight: 800;
          font-size: 1.2rem;
          text-decoration: none;
          box-shadow: 6px 6px 0 #2D6A4F;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .cta-btn-outline:hover {
          background: #FFEAAE;
          transform: translate(-4px, -4px);
          box-shadow: 10px 10px 0 #2D6A4F;
        }

        .screenshot-neo {
          border: 4px solid #1B2B23;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 12px 12px 0 rgba(244,132,95,0.4);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s;
          max-width: 280px;
        }
        .screenshot-neo:hover {
          transform: translateY(-12px) rotate(-2deg) scale(1.03);
          box-shadow: 16px 16px 0 rgba(244,132,95,0.5);
        }
        .screenshot-neo img {
          width: 100%;
          height: auto;
          display: block;
        }

        .ranking-row-neo {
          display: flex;
          align-items: center;
          padding: 1.1rem 1.5rem;
          border-bottom: 3px solid #F0EDE8;
          gap: 1rem;
          transition: background 0.2s, transform 0.2s;
        }
        .ranking-row-neo:hover { 
          background: #FFF8F1; 
          transform: translateX(4px);
        }
        .ranking-row-neo:last-child { border-bottom: none; }

        .store-btn-neo {
          background: #1B2B23;
          color: white;
          border-radius: 20px;
          border: 4px solid #1B2B23;
          box-shadow: 8px 8px 0 #2D6A4F;
          padding: 1.25rem 2rem;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: 'Nunito', sans-serif;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .store-btn-neo:hover {
          box-shadow: 12px 12px 0 #F4845F;
          transform: translate(-4px, -4px);
        }

        @media (max-width: 768px) {
          .ranking-row-neo { padding: 0.85rem 1rem; font-size: 0.9rem; }
          .neo-card { box-shadow: 6px 6px 0 #1B2B23; }
          .neo-card:hover { box-shadow: 10px 10px 0 #1B2B23; transform: translate(-4px, -4px); }
        }
      `}</style>

      {/* ═══════════════ NAV ═══════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,248,241,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "3px solid #1B2B23",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
      }}>
        <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "1.75rem", color: "#2D6A4F" }}>
          Estou de <span style={{ color: "#F4845F" }}>Olho</span>{" "}
          <span style={{ display: "inline-block", animation: "eye-pulse 3s ease-in-out infinite" }}>👁️</span>
        </span>
        <a href="#download" className="cta-btn" style={{ padding: "0.6rem 1.5rem", fontSize: "1rem", boxShadow: "4px 4px 0 #1B2B23" }}>
          Baixar grátis
        </a>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "7rem 1.5rem 5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* Giant decorative shapes */}
        <div style={{ position: "absolute", top: "-5%", left: "-10%", width: "500px", height: "500px", background: "#D8F3DC", borderRadius: "50%", filter: "blur(80px)", opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "450px", height: "450px", background: "#FFEAAE", borderRadius: "50%", filter: "blur(80px)", opacity: 0.35, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "60%", width: "300px", height: "300px", background: "#FFD6D6", borderRadius: "50%", filter: "blur(80px)", opacity: 0.2, pointerEvents: "none" }} />
        
        {/* Geometric decorations */}
        <div style={{ position: "absolute", top: "15%", right: "8%", width: "80px", height: "80px", border: "4px solid #2D6A4F", borderRadius: "20px", transform: "rotate(15deg)", opacity: 0.15, animation: "float-hero 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: "60px", height: "60px", background: "#F4845F", borderRadius: "50%", opacity: 0.12, animation: "float-hero 8s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", top: "60%", right: "15%", width: "40px", height: "40px", background: "#FFEAAE", borderRadius: "8px", transform: "rotate(45deg)", opacity: 0.2, animation: "float-hero 5s ease-in-out infinite 0.5s" }} />

        <div style={{ position: "relative", maxWidth: "900px" }}>
          {/* Tag */}
          <div style={{
            display: "inline-block", background: "#FFEAAE", border: "3px solid #1B2B23",
            borderRadius: "50px", padding: "0.6rem 1.5rem", fontSize: "1rem", fontWeight: 800, marginBottom: "2rem",
            boxShadow: "4px 4px 0 #1B2B23", fontFamily: "'Baloo 2', cursive",
          }}>
            🇧🇷 O app que o Brasil precisava (e os pais, mais ainda)
          </div>

          {/* Main Title — GIANT */}
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(3.5rem, 10vw, 8rem)", color: "#1B2B23", lineHeight: 0.95,
            margin: "0 0 0.5rem", letterSpacing: "-0.02em",
          }}>
            <span style={{ color: "#2D6A4F" }}>Estou de</span>
            <br />
            <span style={{
              color: "#F4845F",
              textShadow: "6px 6px 0 #1B2B23",
              WebkitTextStroke: "2px #1B2B23",
              paintOrder: "stroke fill",
            }}>
              Olho
            </span>{" "}
            <span style={{ display: "inline-block", animation: "eye-pulse 2.5s ease-in-out infinite", fontSize: "0.8em" }}>👁️</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontStyle: "italic",
            color: "#F4845F", fontSize: "clamp(1.3rem, 3.5vw, 2rem)", margin: "0.5rem 0 2rem",
            background: "#FFF0E6", display: "inline-block", padding: "0.3rem 1.5rem",
            border: "3px solid #F4845F", borderRadius: "12px", boxShadow: "4px 4px 0 #F4845F",
          }}>
            porque alguém tem que lembrar
          </p>

          {/* Description */}
          <p style={{
            maxWidth: "620px", margin: "0 auto 2.5rem", fontSize: "1.2rem", lineHeight: 1.75,
            color: "#243B2F", fontWeight: 600,
          }}>
            O app que <span style={{ background: "#FFEAAE", padding: "0.1rem 0.5rem", borderRadius: "8px", fontWeight: 800 }}>gamifica a paternidade</span> — com ironia, ranking público e notificações que batem direto no ego. Para pais que <span style={{ textDecoration: "line-through", opacity: 0.5 }}>esquecem tudo</span> tentam melhorar.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#download" className="cta-btn">
              🤖 Baixar para Android
            </a>
            <a href="#como-funciona" className="cta-btn-outline">
              👀 Como funciona
            </a>
          </div>

          {/* Social proof mini */}
          <div style={{
            marginTop: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex" }}>
              {["#F4845F", "#52B788", "#8B5CF6", "#D4A10A"].map((c, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: "50%", background: c,
                  border: "3px solid #FFF8F1", marginLeft: i > 0 ? "-10px" : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", color: "white", fontWeight: 800, zIndex: 4 - i,
                }}>
                  {["PA", "MF", "LG", "RA"][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize: "0.95rem", color: "#666", fontWeight: 600 }}>
              Pais já competindo pelo 1° lugar
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════ TICKER ═══════════════ */}
      <div style={{
        background: "#F4845F", borderTop: "4px solid #1B2B23", borderBottom: "4px solid #1B2B23",
        padding: "0.85rem 0", overflow: "hidden",
      }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{
              color: "white", fontWeight: 800, fontSize: "1.1rem", padding: "0 2.5rem",
              whiteSpace: "nowrap", fontFamily: "'Baloo 2', cursive",
              textShadow: "2px 2px 0 rgba(0,0,0,0.15)",
            }}>
              👁️ {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════ SCREENSHOTS ═══════════════ */}
      <section id="como-funciona" style={{ background: "#1B2B23", padding: "6rem 1.5rem", position: "relative" }}>
        {/* Decorative dots pattern */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px", pointerEvents: "none",
        }} />
        
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{
              display: "inline-block", background: "#F4845F", color: "white",
              border: "3px solid white", borderRadius: "50px", padding: "0.5rem 1.5rem",
              fontSize: "1rem", fontWeight: 800, marginBottom: "1.25rem",
              boxShadow: "4px 4px 0 rgba(255,255,255,0.3)", fontFamily: "'Baloo 2', cursive",
            }}>
              📱 Screenshots Reais
            </div>
            <h2 style={{
              fontFamily: "'Baloo 2', cursive", fontWeight: 900,
              fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.1, marginBottom: "0.75rem",
            }}>
              Veja o app <span style={{ color: "#F4845F", textShadow: "4px 4px 0 rgba(0,0,0,0.3)" }}>por dentro</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto", fontWeight: 600 }}>
              Sem mockup inventado. Isso aqui é real.
            </p>
          </div>

          <div style={{
            display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap",
            alignItems: "flex-start",
          }}>
            {appScreenshots.map((screen, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="screenshot-neo">
                  <img
                    src={screen.src}
                    alt={`Tela ${screen.label} do Estou de Olho`}
                    loading={i === 0 ? undefined : "lazy"}
                    width={540}
                    height={960}
                  />
                </div>
                <div style={{ marginTop: "1.25rem" }}>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: "white", fontSize: "1.2rem",
                    background: "rgba(244,132,95,0.2)", display: "inline-block", padding: "0.2rem 1rem",
                    borderRadius: "8px",
                  }}>
                    {screen.label}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", fontStyle: "italic", marginTop: "0.5rem" }}>
                    {screen.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ marginTop: "4rem", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
              {[
                "📅 Agenda familiar compartilhada em tempo real",
                "🏆 Ranking semanal de pais (público e sem piedade)",
                "✅ Tarefas com prazo, foto como prova e aprovação da mãe",
                "🔥 Streak de presença com mensagens irônicas",
                "👵 Modo Avó — palpites, ranking e interferência garantida",
                "📊 DNA do Pai — card mensal compartilhável",
                "🗣️ Mural de palpites da sogra (público e sem filtro)",
                "👁️ Notificações que não deixam esquecer. Nunca.",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  color: "white", fontSize: "1.05rem", fontWeight: 600,
                  background: "rgba(255,255,255,0.05)", padding: "0.75rem 1rem",
                  borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURE CARDS ═══════════════ */}
      <section id="features" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#1B2B23", marginBottom: "0.5rem",
          }}>
            O que o app <span style={{ color: "#F4845F" }}>faz</span>
          </h2>
          <p style={{
            fontStyle: "italic", color: "#666", marginBottom: "3.5rem", fontSize: "1.1rem", fontWeight: 600,
          }}>
            (o que nenhum app tinha coragem de fazer antes)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem" }}>
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="neo-card"
                style={{
                  background: card.bg, padding: "2.25rem", textAlign: "left",
                  borderColor: card.border,
                  boxShadow: hoveredFeature === i
                    ? `14px 14px 0 ${card.shadow}`
                    : `8px 8px 0 ${card.shadow}`,
                  transform: hoveredFeature === i ? "translate(-6px, -6px) rotate(-1deg)" : "none",
                }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{
                  fontSize: "3.5rem", marginBottom: "1rem",
                  filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.1))",
                }}>{card.icon}</div>
                <h3 style={{
                  fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                  fontSize: "1.4rem", color: "#1B2B23", marginBottom: "0.75rem",
                }}>{card.title}</h3>
                <p style={{ fontSize: "1rem", color: "#243B2F", lineHeight: 1.7, marginBottom: "1.25rem", fontWeight: 600 }}>
                  {card.desc}
                </p>
                <div style={{
                  borderLeft: `5px solid ${card.border}`, paddingLeft: "1rem",
                  fontStyle: "italic", fontSize: "0.9rem", color: "#555", fontWeight: 600,
                }}>
                  {card.quote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BADGES ═══════════════ */}
      <section style={{
        padding: "4rem 1.5rem", textAlign: "center",
        background: "linear-gradient(135deg, #FFF8F1 0%, #FFF0E6 50%, #FFEAAE20 100%)",
      }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "#1B2B23", marginBottom: "0.5rem",
          }}>
            Conquistas <span style={{ color: "#F4845F" }}>(e vergonhas)</span>
          </h2>
          <p style={{ color: "#666", marginBottom: "2.5rem", fontWeight: 600 }}>
            Selos que você ganha. Ou que ganham você.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            {badges.map((b, i) => (
              <span
                key={i}
                className="neo-badge"
                style={{
                  background: b.bg, color: b.color, borderColor: b.border,
                  boxShadow: `4px 4px 0 ${b.border}`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{b.emoji}</span> {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section style={{
        background: "#2D6A4F", color: "white", padding: "6rem 1.5rem", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />
        
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.5rem",
          }}>
            A dor é <span style={{ color: "#FFEAAE" }}>real</span>.
          </h2>
          <p style={{
            fontStyle: "italic", opacity: 0.8, marginBottom: "3.5rem", fontSize: "1.1rem", fontWeight: 600,
          }}>
            Números que a mãe sabia. O pai vai saber agora.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {[
              { val: "35M", label: "Pais brasileiros com filhos", sub: "Quantos lembram da consulta?" },
              { val: "172K", label: "Filhos sem pai no registro", sub: "A ausência começa cedo." },
              { val: "88,9%", label: "Brasileiros com smartphone", sub: "Sem desculpa tecnológica." },
              { val: "0", label: "Apps como este no Brasil", sub: "Até agora." },
            ].map((s, i) => (
              <div key={i} className="stat-neo">
                <div style={{
                  fontFamily: "'Baloo 2', cursive", fontWeight: 900,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.5rem",
                  textShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                }}>{s.val}</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>{s.label}</div>
                <div style={{ fontStyle: "italic", fontSize: "0.85rem", opacity: 0.7 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ RANKING ═══════════════ */}
      <section id="ranking" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "750px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "#FFD6D6", border: "3px solid #C0392B",
            borderRadius: "50px", padding: "0.5rem 1.5rem", fontSize: "1rem", fontWeight: 800,
            marginBottom: "1.25rem", boxShadow: "4px 4px 0 #922B21", fontFamily: "'Baloo 2', cursive",
            color: "#922B21",
          }}>
            🚨 Exposição Pública
          </div>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3rem)", color: "#1B2B23", marginBottom: "0.5rem",
          }}>
            O Mural da <span style={{ color: "#F4845F", textShadow: "3px 3px 0 rgba(244,132,95,0.2)" }}>Vergonha</span>
          </h2>
          <p style={{ color: "#666", marginBottom: "2.5rem", fontWeight: 600, fontSize: "1.05rem" }}>
            Semanal. Público. Sem piedade. Você vai querer subir.
          </p>
          <div className="neo-card" style={{
            overflow: "hidden", textAlign: "left", background: "white",
          }}>
            <div style={{
              background: "#1B2B23", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "0.5rem",
            }}>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "1.15rem" }}>
                🏆 Ranking Semanal — Brasil
              </span>
              <span style={{
                background: "#F4845F", padding: "0.3rem 1rem", borderRadius: 50,
                fontSize: "0.8rem", fontWeight: 800, border: "2px solid white",
              }}>
                Atualizado toda segunda
              </span>
            </div>
            {rankingRows.map((r, i) => (
              <div key={i} className="ranking-row-neo" style={{
                background: r.highlight ? "#FFF0E6" : "white",
                borderLeft: r.highlight ? "5px solid #F4845F" : "none",
              }}>
                <span style={{ fontWeight: 900, fontSize: "1.3rem", width: 36, textAlign: "center", fontFamily: "'Baloo 2', cursive" }}>
                  {r.pos}
                </span>
                <span style={{
                  width: 42, height: 42, borderRadius: "50%", background: r.avatarBg, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "0.85rem", flexShrink: 0,
                  border: "3px solid #1B2B23", boxShadow: "2px 2px 0 #1B2B23",
                }}>
                  {r.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {r.name} <span style={{ color: "#999", fontSize: "0.85rem" }}>— {r.city}</span>
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: "0.85rem", color: "#888" }}>{r.quote}</div>
                </div>
                <span style={{
                  fontWeight: 900, color: "#2D6A4F", whiteSpace: "nowrap",
                  fontFamily: "'Baloo 2', cursive", fontSize: "1.1rem",
                }}>
                  {r.pts}<span style={{ fontSize: "0.75rem" }}>pts</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section style={{
        background: "#1B2B23", padding: "6rem 1.5rem", textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px", pointerEvents: "none",
        }} />
        
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "0.5rem",
          }}>
            O que as <span style={{ color: "#F4845F" }}>mães</span> dizem
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "3.5rem", fontWeight: 600, fontSize: "1.05rem" }}>
            (os pais estão com vergonha de falar, mas os pontos falam por eles)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem" }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-neo">
                <div style={{ marginBottom: "1.25rem", fontSize: "1.5rem" }}>
                  {"⭐".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
                </div>
                <p style={{
                  color: "rgba(255,255,255,0.9)", lineHeight: 1.75, fontSize: "1rem",
                  marginBottom: "1.75rem", fontWeight: 600,
                }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{
                    width: 48, height: 48, borderRadius: "50%", background: t.avatarBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem", border: "3px solid rgba(255,255,255,0.2)",
                  }}>
                    {t.avatarEmoji}
                  </span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}>{t.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DOWNLOAD CTA ═══════════════ */}
      <section id="download" style={{
        padding: "6rem 1.5rem", textAlign: "center",
        background: "linear-gradient(180deg, #FFF8F1 0%, #FFEAAE30 100%)",
      }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "650px", margin: "0 auto" }}>
          <div style={{
            fontSize: "5rem", animation: "eye-pulse 2.5s infinite", marginBottom: "1.5rem",
            filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.1))",
          }}>👁️</div>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#1B2B23", lineHeight: 1,
            marginBottom: "1.5rem",
          }}>
            Seu filho não vai
            <br />
            esperar <span style={{
              color: "#F4845F", textShadow: "4px 4px 0 rgba(244,132,95,0.2)",
            }}>forever</span>.
          </h2>
          <p style={{
            fontSize: "1.15rem", color: "#243B2F", lineHeight: 1.75, marginBottom: "2.5rem", fontWeight: 600,
          }}>
            Baixa agora. É grátis. E o ranking já tá contando o tempo que você levou pra decidir.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <a href={APK_URL} className="store-btn-neo" target="_blank" rel="noopener noreferrer">
              <span style={{ fontSize: "2rem" }}>🤖</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, fontWeight: 600 }}>Disponível para</div>
                <div style={{ fontWeight: 800, fontSize: "1.25rem", fontFamily: "'Baloo 2', cursive" }}>Android</div>
              </div>
            </a>
          </div>

          {/* APK Notice */}
          <div className="neo-card" style={{
            background: "#FFF0E6", borderColor: "#F4845F",
            boxShadow: "6px 6px 0 #F4845F",
            padding: "1.5rem 1.75rem", marginBottom: "1.5rem", textAlign: "left",
          }}>
            <p style={{ fontSize: "1rem", color: "#1B2B23", lineHeight: 1.75, margin: 0, fontWeight: 600 }}>
              <strong>⚠️ Atenção:</strong> O aplicativo é um arquivo <strong>.APK</strong> (instalação direta no Android).
              Seu celular pode pedir permissão para instalar de fontes desconhecidas — <strong>é normal e seguro</strong>, basta autorizar.
            </p>
            <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.75, margin: "0.75rem 0 0", fontWeight: 600 }}>
              Não se sentiu confortável? Mande um <strong>direct no Instagram</strong>{" "}
              <a
                href="https://instagram.com/estoudeolho.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#F4845F", fontWeight: 800, textDecoration: "underline" }}
              >
                @estoudeolho.app
              </a>{" "}
              e enviaremos o link da <strong>versão web</strong>. 📲
            </p>
          </div>

          <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "#999", fontWeight: 600 }}>
            Ou acesse direto em <strong>estoudeolho.lovable.app</strong> — sem instalar nada.<br />
            Gratuito para sempre. Seu filho não tem preço.
          </p>
        </div>
      </section>

      {/* ═══════════════ TUTORIAL ═══════════════ */}
      <section id="tutorial" style={{
        background: "#1B2B23", padding: "6rem 1.5rem", overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "25px 25px", pointerEvents: "none",
        }} />
        
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{
              display: "inline-block", background: "#F4845F", color: "white",
              borderRadius: "50px", padding: "0.5rem 1.5rem", fontSize: "1rem", fontWeight: 800,
              marginBottom: "1.25rem", fontFamily: "'Baloo 2', cursive",
              border: "3px solid white", boxShadow: "4px 4px 0 rgba(255,255,255,0.2)",
            }}>
              📖 Passo a passo
            </div>
            <h2 style={{
              fontFamily: "'Baloo 2', cursive", fontWeight: 900,
              fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", lineHeight: 1.15, marginBottom: "0.75rem",
            }}>
              Como adicionar o <span style={{ color: "#F4845F" }}>marido</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", maxWidth: "550px", margin: "0 auto", fontWeight: 600 }}>
              Em 4 passos simples. Até ele consegue. (provavelmente.)
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2rem", perspective: "1200px",
          }}>
            {tutorialSteps.map((item, i) => (
              <div
                key={i}
                style={{
                  transform: `rotateY(${item.rotate}) rotateX(1deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.5s ease, box-shadow 0.5s ease",
                  borderRadius: "24px", overflow: "hidden", background: "#fff",
                  boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
                  border: "4px solid #1B2B23",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) translateY(-12px) scale(1.03)";
                  e.currentTarget.style.boxShadow = `0 30px 80px rgba(0,0,0,0.4), 0 0 30px ${item.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotateY(${item.rotate}) rotateX(1deg)`;
                  e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)`;
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={item.img} alt={`Passo ${item.step}: ${item.title}`}
                    loading="lazy" width={640} height={960}
                    style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", top: "12px", left: "12px",
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: item.color, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "1.4rem",
                    boxShadow: "3px 3px 0 rgba(0,0,0,0.3)", border: "3px solid white",
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
                    background: "linear-gradient(to top, white, transparent)",
                  }} />
                </div>
                <div style={{ padding: "1.25rem 1.5rem 1.75rem" }}>
                  <h3 style={{
                    fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                    fontSize: "1.2rem", color: "#1B2B23", marginBottom: "0.5rem",
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.65, margin: 0, fontWeight: 600 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tip */}
          <div style={{
            textAlign: "center", marginTop: "3rem",
            background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "20px", padding: "1.5rem 2rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto",
          }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", lineHeight: 1.75, margin: 0, fontWeight: 600 }}>
              💡 <strong>Dica:</strong> Se o pai "esqueceu" de entrar com o código, a mãe pode reenviar quantas vezes quiser.
              O código não expira. <span style={{ color: "#F4845F", fontStyle: "italic" }}>A paciência da mãe, talvez.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{
        background: "#1B2B23", color: "white", padding: "3.5rem 1.5rem", textAlign: "center",
        borderTop: "4px solid #F4845F",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2rem", marginBottom: "0.5rem",
          }}>
            Estou de <span style={{ color: "#F4845F" }}>Olho</span> 👁️
          </div>
          <p style={{ fontStyle: "italic", opacity: 0.6, marginBottom: "2rem", fontSize: "1rem", fontWeight: 600 }}>
            porque alguém tem que lembrar
          </p>
          <div style={{
            display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap",
            marginBottom: "2rem", fontSize: "0.95rem",
          }}>
            {[
              { label: "Sobre", href: "#" },
              { label: "Privacidade", href: "/privacidade" },
              { label: "Termos", href: "/termos" },
              { label: "Suporte", href: "/suporte" },
              { label: "Exclusão de Dados", href: "/exclusao-dados" },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{
                color: "rgba(255,255,255,0.5)", textDecoration: "none",
                transition: "color 0.2s", fontWeight: 600,
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F4845F")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {l.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: "0.9rem", opacity: 0.5, marginBottom: "1rem", fontWeight: 600 }}>
            © {new Date().getFullYear()} Estou de Olho. Feito com amor (e ironia) no Brasil 🇧🇷
          </p>
          <p style={{ fontSize: "0.8rem", opacity: 0.35 }}>
            Nenhum pai foi ferido durante a produção deste app. Mas alguns ficaram com vergonha.
          </p>
        </div>
      </footer>
    </div>
  );
}
