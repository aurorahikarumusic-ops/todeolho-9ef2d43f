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
  "Consulta que só a mãe sabia",
  "Reunião que o pai esqueceu",
  "Resgate número 7 da mãe",
  "Pai presente de verdade",
];

const featureCards = [
  {
    bg: "#FFF0E6",
    icon: "📅",
    title: "Agenda que o pai vai ver",
    desc: "Calendário compartilhado com cores por quem adicionou: laranja pra mãe, verde pra quando o pai lembra sozinho (raro).",
    quote: "Este mês: 11 eventos da mãe, 1 do pai. Progresso de 8%. Não desiste.",
  },
  {
    bg: "#D8F3DC",
    icon: "🏆",
    title: "Ranking público de pais",
    desc: "Semanalmente, todos os pais são rankeados. Com descrições irônicas em cada posição. E um Hall da Vergonha mensal.",
    quote: "Último lugar. Mas pelo menos você aparece aqui.",
  },
  {
    bg: "#FFEAAE",
    icon: "📸",
    title: "Prova de presença",
    desc: "O pai pode tirar foto como prova de que fez a tarefa. A mãe aprova ou reprova. Sem aprovação, não conta.",
    quote: "A mãe reprovou sua conclusão. Motivo: 'Isso não é o remédio certo, amor.'",
  },
  {
    bg: "#EEF0FF",
    icon: "⭐",
    title: "Avaliação da mãe",
    desc: "Toda sexta, a mãe dá de 1 a 5 estrelas pro pai. Nota pública, aparece no ranking. Com comentário opcional.",
    quote: "Ana deu 2 estrelas pro João esta semana. Motivo: 'Foi bom, mas poderia ser melhor.'",
  },
];

const badges = [
  { emoji: "🔥", label: "Sequência de 7 dias", bg: "#D8F3DC", color: "#2D6A4F" },
  { emoji: "😬", label: "Pai Google Maps", bg: "#FFF0E6", color: "#c0502e" },
  { emoji: "⭐", label: "Herói do Lanche", bg: "#D8F3DC", color: "#2D6A4F" },
  { emoji: "💤", label: "Modo Hibernação", bg: "#FFE4E4", color: "#9B2C2C" },
  { emoji: "👑", label: "Pai do Mês", bg: "#FFEAAE", color: "#7B6B1A" },
  { emoji: "📊", label: "DNA do Pai", bg: "#EEF0FF", color: "#3B4C9B" },
  { emoji: "🛟", label: "Resgatado (5x)", bg: "#E4F0FF", color: "#2B5EA7" },
];

const rankingRows = [
  { pos: "🥇", initials: "RA", name: "Ricardo A.", city: "São Paulo", quote: "Fez tudo certo. Suspeito. Mas parabéns.", pts: 980, avatarBg: "#F4845F", highlight: false },
  { pos: "2", initials: "MF", name: "Marcos F.", city: "Fortaleza", quote: "Chegou no 2° por acidente. Mas chegou.", pts: 841, avatarBg: "#52B788", highlight: false },
  { pos: "3", initials: "LG", name: "Lucas G.", city: "Manaus", quote: "Tentou. Mais ou menos. Tá no pódio.", pts: 702, avatarBg: "#8B5CF6", highlight: false },
  { pos: "4", initials: "VC", name: "Você", city: "Aqui", quote: "Poderia ser o 3°. Mas esqueceu o lanche.", pts: 489, avatarBg: "#F4845F", highlight: true },
  { pos: "5", initials: "PS", name: "Paulo S.", city: "Recife", quote: "Perguntou o nome da professora. A filha tem 7 anos.", pts: 201, avatarBg: "#9CA3AF", highlight: false },
];

const testimonials = [
  {
    stars: 5,
    text: "Mandei o link pro meu marido com o comentário 'baixa aí'. Ele baixou. Na mesma hora. Pela primeira vez na história ele perguntou o nome da pediatra sem eu pedir.",
    name: "Ana Carolina",
    role: "Mãe de 2, São Paulo — A mãe que instalou",
    avatarBg: "#FFF0E6",
  },
  {
    stars: 5,
    text: "Meu marido ficou com raiva quando viu que tava em último no ranking. Aí começou a fazer as tarefas sozinho. Eu não disse nada. O app disse por mim.",
    name: "Mariana R.",
    role: "Mãe de 3, Fortaleza — A que deu 3 estrelas",
    avatarBg: "#D8F3DC",
  },
  {
    stars: 4,
    text: "Sou o pai. Eu estava em 4° lugar. O Carlos estava em 3°. O Carlos. Isso foi suficiente pra eu buscar as crianças na escola 5 vezes seguidas.",
    name: "João L.",
    role: "Pai convertido, Manaus — Ex-posição 4°",
    avatarBg: "#EEF0FF",
  },
];

const appScreenshots = [
  { src: screenshotDashboard, label: "Dashboard", desc: "Veja seu nível de pai em tempo real" },
  { src: screenshotTarefas, label: "Tarefas", desc: "Organize e comprove sua presença" },
  { src: screenshotRanking, label: "Ranking", desc: "Compare com outros pais do Brasil" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const revealRefs = useRef<HTMLElement[]>([]);

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

  const handleOpenApp = () => {
    const appPackage = "app.lovable.c98da6ca3b0a4e2a816155c857301dd2";
    const intentUrl = `intent://estoudeolho.lovable.app/app#Intent;scheme=https;package=${appPackage};end`;
    const timeout = setTimeout(() => { navigate("/app"); }, 1500);
    window.location.href = intentUrl;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(timeout);
    }, { once: true });
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#FFF8F1", color: "#1B2B23" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .revealed { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }

        .lp-card {
          border: 3px solid #1B2B23;
          border-radius: 20px;
          box-shadow: 6px 6px 0 #1B2B23;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .lp-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 10px 10px 0 #1B2B23;
        }

        @keyframes eye-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes eye-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-track {
          display: flex;
          animation: ticker-scroll 25s linear infinite;
          white-space: nowrap;
        }

        .pill-badge {
          border: 2px solid #1B2B23;
          border-radius: 50px;
          padding: 0.5rem 1.25rem;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          font-size: 0.9rem;
          transition: transform 0.2s;
          display: inline-block;
        }
        .pill-badge:hover {
          transform: rotate(-2deg) scale(1.05);
        }

        .stat-card {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: background 0.3s, transform 0.3s;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-4px);
        }

        .testimonial-card {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: background 0.3s, transform 0.3s;
        }
        .testimonial-card:hover {
          background: rgba(255,255,255,0.09);
          transform: translateY(-4px);
        }

        .store-btn {
          background: #1B2B23;
          color: white;
          border-radius: 14px;
          border: 3px solid #1B2B23;
          box-shadow: 4px 4px 0 #2D6A4F;
          padding: 1rem 1.5rem;
          min-width: 180px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Nunito', sans-serif;
          text-decoration: none;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .store-btn:hover {
          box-shadow: 6px 6px 0 #F4845F;
          transform: translate(-2px, -2px);
        }

        .screenshot-card {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          max-width: 280px;
        }
        .screenshot-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 80px rgba(0,0,0,0.2);
        }
        .screenshot-card img {
          width: 100%;
          height: auto;
          display: block;
        }

        .ranking-row {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          gap: 1rem;
          transition: background 0.2s;
        }
        .ranking-row:hover { background: #fafafa; }
        .ranking-row:last-child { border-bottom: none; }

        @media (max-width: 768px) {
          .ranking-row { padding: 0.75rem 1rem; font-size: 0.9rem; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,248,241,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45,106,79,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
      }}>
        <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "1.5rem", color: "#2D6A4F" }}>
          Estou de <span style={{ color: "#F4845F" }}>Olho</span> 👁️
        </span>
        <a href="#download" style={{
          background: "#2D6A4F", color: "white", padding: "0.6rem 1.5rem",
          borderRadius: "50px", fontFamily: "'Baloo 2', cursive", fontWeight: 700,
          textDecoration: "none", transition: "background 0.3s", fontSize: "0.95rem",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F4845F")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2D6A4F")}
        >
          Baixar grátis
        </a>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "6rem 1.5rem 4rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* Blurred blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-15%", width: "400px", height: "400px", background: "#D8F3DC", borderRadius: "50%", filter: "blur(60px)", opacity: 0.25, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "350px", height: "350px", background: "#FFF0E6", borderRadius: "50%", filter: "blur(60px)", opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "300px", height: "300px", background: "#FFEAAE", borderRadius: "50%", filter: "blur(60px)", opacity: 0.2, pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "800px" }}>
          <div style={{
            display: "inline-block", background: "#FFEAAE", border: "2px solid #1B2B23",
            borderRadius: "50px", padding: "0.5rem 1.25rem", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1.5rem",
          }}>
            🇧🇷 O app que o Brasil precisava (e os pais, mais ainda)
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(3rem, 8vw, 6rem)", color: "#2D6A4F", lineHeight: 1.1, margin: "0 0 0.5rem",
          }}>
            Estou de Olho{" "}
            <span style={{ display: "inline-block", animation: "eye-pulse 3s ease-in-out infinite" }}>👁️</span>
          </h1>

          <p style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontStyle: "italic",
            color: "#F4845F", fontSize: "clamp(1.2rem, 3vw, 1.75rem)", margin: "0 0 1.5rem",
          }}>
            porque alguém tem que lembrar
          </p>

          <p style={{ maxWidth: "560px", margin: "0 auto 2rem", fontSize: "1.1rem", lineHeight: 1.7, color: "#243B2F" }}>
            O app que <span style={{ color: "#F4845F", fontWeight: 700 }}>gamifica a paternidade</span> — com ironia, ranking público e notificações que batem direto no ego. Para pais que esquecem tudo e mães que lembram de tudo.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#download" style={{
              background: "#2D6A4F", color: "white", border: "3px solid #1B2B23",
              borderRadius: "50px", padding: "1rem 2rem", fontFamily: "'Baloo 2', cursive",
              fontWeight: 700, fontSize: "1.1rem", textDecoration: "none",
              boxShadow: "4px 4px 0 #1B2B23", transition: "background 0.3s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4845F")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2D6A4F")}
            >
              🤖 Baixar para Android
            </a>
            <a href="#como-funciona" style={{
              background: "white", color: "#2D6A4F", border: "3px solid #2D6A4F",
              borderRadius: "50px", padding: "1rem 2rem", fontFamily: "'Baloo 2', cursive",
              fontWeight: 700, fontSize: "1.1rem", textDecoration: "none",
            }}>
              👀 Como funciona
            </a>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{
        background: "#F4845F", borderTop: "2px solid #1B2B23", borderBottom: "2px solid #1B2B23",
        padding: "0.75rem 0", overflow: "hidden",
      }}>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ color: "white", fontWeight: 700, fontSize: "1rem", padding: "0 2rem", whiteSpace: "nowrap" }}>
              👁️ {item}
            </span>
          ))}
        </div>
      </div>

      {/* SECTION — APP SCREENSHOTS */}
      <section id="como-funciona" style={{ background: "#1B2B23", padding: "5rem 1.5rem" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.5rem", color: "white", lineHeight: 1.2, marginBottom: "0.75rem" }}>
              Veja o app <span style={{ color: "#F4845F" }}>por dentro</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto" }}>
              Screenshots reais do Estou de Olho. Sem enrolação, sem mockup inventado.
            </p>
          </div>

          {/* Screenshots grid */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap",
            alignItems: "flex-start",
          }}>
            {appScreenshots.map((screen, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="screenshot-card">
                  <img
                    src={screen.src}
                    alt={`Tela ${screen.label} do Estou de Olho`}
                    loading={i === 0 ? undefined : "lazy"}
                    width={540}
                    height={960}
                  />
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
                    {screen.label}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontStyle: "italic" }}>
                    {screen.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature list below screenshots */}
          <div style={{ marginTop: "3rem", maxWidth: "700px", marginLeft: "auto", marginRight: "auto" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {[
                "📅 Agenda familiar compartilhada em tempo real",
                "🏆 Ranking semanal de pais (público e sem piedade)",
                "✅ Tarefas com prazo, foto como prova e aprovação da mãe",
                "🔥 Streak de presença com mensagens irônicas",
                "📊 DNA do Pai — card mensal compartilhável",
                "👁️ Notificações que não deixam esquecer. Nunca.",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "white", fontSize: "1rem" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#F4845F", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION — FEATURE CARDS */}
      <section id="features" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.25rem", color: "#2D6A4F", marginBottom: "0.5rem" }}>
            O que o Estou de Olho faz
          </h2>
          <p style={{ fontStyle: "italic", color: "#666", marginBottom: "3rem" }}>
            (e o que nenhum app tinha coragem de fazer antes)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {featureCards.map((card, i) => (
              <div key={i} className="lp-card" style={{ background: card.bg, padding: "2rem", textAlign: "left" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: "1.25rem", color: "#1B2B23", marginBottom: "0.75rem" }}>{card.title}</h3>
                <p style={{ fontSize: "0.95rem", color: "#243B2F", lineHeight: 1.6, marginBottom: "1rem" }}>{card.desc}</p>
                <div style={{ borderLeft: "4px solid #F4845F", paddingLeft: "1rem", fontStyle: "italic", fontSize: "0.85rem", color: "#666" }}>
                  {card.quote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — BADGES */}
      <section style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2rem", color: "#2D6A4F", marginBottom: "2rem" }}>
            Conquistas (e recordes) que você pode ganhar
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            {badges.map((b, i) => (
              <span key={i} className="pill-badge" style={{ background: b.bg, color: b.color }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — STATS */}
      <section style={{
        background: "#2D6A4F", color: "white", padding: "5rem 1.5rem", textAlign: "center",
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(244,132,95,0.1) 0%, transparent 50%)",
      }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.5rem", marginBottom: "0.5rem" }}>
            A dor é real. O app é a solução.
          </h2>
          <p style={{ fontStyle: "italic", opacity: 0.8, marginBottom: "3rem" }}>
            Números que a mãe sabia. O pai vai saber agora.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {[
              { val: "35M", label: "Pais brasileiros com filhos", sub: "Quantos lembram da consulta? Menos." },
              { val: "172K", label: "Filhos sem pai no registro (2023)", sub: "A ausência começa antes do app." },
              { val: "88,9%", label: "Brasileiros com smartphone", sub: "Não tem desculpa tecnológica." },
              { val: "0", label: "Apps como este no Brasil", sub: "Até agora. Bem-vindo ao Estou de Olho." },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.5rem", marginBottom: "0.5rem" }}>{s.val}</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.5rem" }}>{s.label}</div>
                <div style={{ fontStyle: "italic", fontSize: "0.8rem", opacity: 0.7 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — RANKING */}
      <section id="ranking" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.25rem", color: "#2D6A4F", marginBottom: "0.5rem" }}>
            O Mural da Vergonha
          </h2>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Semanal. Público. Sem piedade. Você vai querer subir.
          </p>
          <div className="lp-card" style={{ overflow: "hidden", boxShadow: "8px 8px 0 #1B2B23", textAlign: "left" }}>
            <div style={{ background: "#1B2B23", color: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800 }}>🏆 Ranking Semanal — Brasil</span>
              <span style={{ background: "#F4845F", padding: "0.25rem 0.75rem", borderRadius: 50, fontSize: "0.75rem", fontWeight: 700 }}>Atualizado toda segunda</span>
            </div>
            {rankingRows.map((r, i) => (
              <div key={i} className="ranking-row" style={{
                background: r.highlight ? "#FFF0E6" : "white",
                borderLeft: r.highlight ? "4px solid #F4845F" : "none",
              }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", width: 30, textAlign: "center" }}>{r.pos}</span>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: r.avatarBg, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>{r.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{r.name} — <span style={{ color: "#999" }}>{r.city}</span></div>
                  <div style={{ fontStyle: "italic", fontSize: "0.85rem", color: "#888" }}>{r.quote}</div>
                </div>
                <span style={{ fontWeight: 700, color: "#2D6A4F", whiteSpace: "nowrap" }}>{r.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — TESTIMONIALS */}
      <section style={{ background: "#1B2B23", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "2.25rem", color: "white", marginBottom: "0.5rem" }}>
            O que as <span style={{ color: "#F4845F" }}>mães</span> estão dizendo
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "3rem" }}>
            (os pais estão com vergonha de falar, mas os pontos falam por eles)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ marginBottom: "1rem", color: "#F9C74F", fontSize: "1.1rem" }}>
                  {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", background: t.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "#1B2B23" }}>
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{t.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION — DOWNLOAD CTA */}
      <section id="download" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <div ref={addRevealRef} className="reveal" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", animation: "eye-bounce 2s infinite", marginBottom: "1.5rem" }}>👁️</div>
          <h2 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 900,
            fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#2D6A4F", lineHeight: 1.1, marginBottom: "1.5rem",
          }}>
            Seu filho não vai<br />esperar <span style={{ color: "#F4845F" }}>forever</span>.
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#243B2F", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            Baixa agora. É grátis. E o ranking já tá contando o tempo que você levou pra decidir instalar.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <a href={APK_URL} className="store-btn" target="_blank" rel="noopener noreferrer">
              <span style={{ fontSize: "1.75rem" }}>🤖</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Disponível para</div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Android</div>
              </div>
            </a>
          </div>

          {/* APK Notice */}
          <div style={{
            background: "#FFF0E6", border: "2px solid #F4845F", borderRadius: "16px",
            padding: "1.25rem 1.5rem", marginBottom: "1.5rem", textAlign: "left",
          }}>
            <p style={{ fontSize: "0.95rem", color: "#1B2B23", lineHeight: 1.7, margin: 0 }}>
              <strong>⚠️ Atenção:</strong> O aplicativo é um arquivo <strong>.APK</strong> (instalação direta no Android).
              Seu celular pode pedir permissão para instalar apps de fontes desconhecidas — <strong>é normal e seguro</strong>, basta autorizar.
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.7, margin: "0.75rem 0 0" }}>
              Se não se sentir confortável para baixar o APK, mande um <strong>direct no Instagram</strong>{" "}
              <a
                href="https://instagram.com/estoudeolho.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#F4845F", fontWeight: 700, textDecoration: "underline" }}
              >
                @estoudeolho.app
              </a>{" "}
              e enviaremos o link da <strong>versão web</strong> para você acessar pelo navegador. 📲
            </p>
          </div>

          <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#999" }}>
            Ou acesse direto no navegador em <strong>estoudeolho.lovable.app</strong> — sem precisar instalar nada.<br />
            Gratuito para sempre no plano básico. Seu filho não tem preço.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1B2B23", color: "white", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 900, fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Estou de <span style={{ color: "#F4845F" }}>Olho</span> 👁️
          </div>
          <p style={{ fontStyle: "italic", opacity: 0.6, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            porque alguém tem que lembrar
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {[
              { label: "Sobre", href: "#" },
              { label: "Privacidade", href: "/privacidade" },
              { label: "Termos", href: "/termos" },
              { label: "Suporte", href: "/suporte" },
              { label: "Exclusão de Dados", href: "/exclusao-dados" },
            ].map((l, i) => (
              <a key={i} href={l.href} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F4845F")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {l.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: "0.85rem", opacity: 0.5, marginBottom: "1rem" }}>
            © {new Date().getFullYear()} Estou de Olho. Feito com amor (e ironia) no Brasil 🇧🇷
          </p>
          <p style={{ fontSize: "0.75rem", opacity: 0.35 }}>
            Nenhum pai foi ferido durante a produção deste app. Mas alguns ficaram com vergonha.
          </p>
        </div>
      </footer>
    </div>
  );
}
