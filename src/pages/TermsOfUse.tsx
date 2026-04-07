import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function TermsOfUse() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Termos de Uso — Estou de Olho";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: 01/04/2026</p>

        <div className="space-y-6 text-sm font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg mb-2">1. O combinado</h2>
            <p>
              Ao usar o <strong>Estou de Olho</strong>, você aceita estes termos. 
              Se não curtiu, não usa. Simples assim.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">2. O que o app faz</h2>
            <p>
              O Estou de Olho organiza a rotina familiar com tarefas, agenda, ranking e 
              missões diárias. Tudo com humor — porque sem humor ninguém aguenta criar filho.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">3. Sua conta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Precisa ter 18 anos ou mais.</li>
              <li>Use informações reais. Inventar nome não vai te salvar do ranking.</li>
              <li>Cuide da sua senha. A mãe já cuida de tudo, não peça isso pra ela também.</li>
              <li>Uma conta por pessoa.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">4. O que não pode</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Usar o app pra algo ilegal.</li>
              <li>Tentar ver dados de outros usuários.</li>
              <li>Fraudar o sistema de pontos (a gente descobre, a mãe sempre descobre).</li>
              <li>Mandar conteúdo ofensivo ou abusivo.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">5. Seu conteúdo</h2>
            <p>
              Fotos e textos que você enviar continuam sendo seus. 
              A gente só precisa armazenar e mostrar dentro do app pra ele funcionar.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">6. Sobre o tom do app</h2>
            <p>
              O Estou de Olho usa humor e ironia pra engajar. As piadas são sobre a experiência de ser pai, 
              nunca pra ofender. Se algo incomodar, fala com a gente.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">7. Disponibilidade</h2>
            <p>
              Tentamos manter o app no ar o tempo todo, mas às vezes ele precisa de manutenção. 
              Tipo pai no domingo: presente, mas nem sempre 100%.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">8. Responsabilidade</h2>
            <p>
              O app é oferecido "como está". Não somos responsáveis por decisões 
              que você tome com base no que viu aqui, nem por quedas temporárias do serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">9. Encerrar conta</h2>
            <p>
              Você pode sair quando quiser, direto pelo app ou por e-mail. 
              Se violar os termos, podemos suspender sua conta.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">10. Compras e Pagamentos</h2>
            <p>
              O Estou de Olho oferece funcionalidades pagas opcionais, como o envio de cartas 
              no <strong>Modo Redenção</strong> (a partir de R$ 2,99 por carta). A primeira carta é gratuita.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Os pagamentos são processados de forma segura por plataforma terceirizada (Stripe).</li>
              <li>Não armazenamos dados de cartão de crédito em nossos servidores.</li>
              <li>Os métodos aceitos incluem cartão de crédito, Apple Pay, Google Pay e Link.</li>
            </ul>
            <p className="mt-2">
              <strong>Direito de arrependimento:</strong> Conforme o Art. 49 do Código de Defesa do Consumidor, 
              você pode solicitar reembolso em até <strong>7 dias corridos</strong> após a compra, desde que 
              a carta não tenha sido aberta pela destinatária. Solicite pelo e-mail{" "}
              <strong>estoudeolho.contato@gmail.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">11. Registros de acesso</h2>
            <p>
              Conforme o Art. 15 do Marco Civil da Internet (Lei nº 12.965/2014), mantemos 
              registros de acesso ao aplicativo pelo prazo de <strong>6 meses</strong>, 
              sob sigilo e em ambiente controlado.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">12. Legislação</h2>
            <p>
              Vale a lei brasileira. Qualquer problema vai pro foro da sua cidade.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">13. Contato</h2>
            <p>
              📧 <strong>estoudeolho.contato@gmail.com</strong><br />
              🌐 <strong>estoudeolho.lovable.app</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}