import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="space-y-6 text-sm font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao usar o <strong>Estou de Olho</strong>, você concorda com estes Termos de Uso. 
              Se não concordar, não utilize o app. O uso continuado constitui aceitação.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">2. Descrição do Serviço</h2>
            <p>
              O Estou de Olho é uma plataforma de organização familiar com gamificação, 
              projetada para ajudar pais a serem mais presentes e organizados. O app inclui:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Gerenciamento de tarefas familiares</li>
              <li>Agenda de eventos e compromissos</li>
              <li>Sistema de pontuação e ranking</li>
              <li>Missões diárias e conquistas</li>
              <li>Perfis de filhos e gestão familiar</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">3. Cadastro e Conta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Você deve ter 18 anos ou mais para criar uma conta.</li>
              <li>As informações fornecidas devem ser verdadeiras e atualizadas.</li>
              <li>Você é responsável pela segurança da sua conta e senha.</li>
              <li>Cada pessoa deve ter apenas uma conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">4. Uso Aceitável</h2>
            <p>Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Usar o app para fins ilegais ou não autorizados.</li>
              <li>Tentar acessar dados de outros usuários sem autorização.</li>
              <li>Manipular o sistema de pontuação de forma fraudulenta.</li>
              <li>Enviar conteúdo ofensivo, abusivo ou ilegal.</li>
              <li>Interferir no funcionamento do app ou seus servidores.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">5. Conteúdo do Usuário</h2>
            <p>
              Fotos, textos e dados que você enviar permanecem seus. Ao enviá-los, você nos concede 
              licença limitada para armazená-los e exibi-los dentro do app, conforme necessário 
              para o funcionamento do serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">6. Tom Irônico do App</h2>
            <p>
              O Estou de Olho utiliza humor e ironia como ferramenta de engajamento. 
              As mensagens irônicas são parte da experiência e não têm intenção de ofender. 
              O tom é sempre família-friendly e respeitoso.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">7. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o app disponível 24/7, mas não garantimos 
              funcionamento ininterrupto. Podemos realizar manutenções programadas 
              ou enfrentar indisponibilidades temporárias.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">8. Limitação de Responsabilidade</h2>
            <p>
              O app é fornecido "como está". Não nos responsabilizamos por decisões 
              tomadas com base nas informações do app, nem por perdas decorrentes 
              de indisponibilidade ou erros no serviço.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">9. Encerramento</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento pelo app ou por e-mail. 
              Reservamo-nos o direito de suspender contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">10. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil. 
              Qualquer disputa será resolvida no foro da comarca do usuário consumidor.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">11. Contato</h2>
            <p>
              📧 <strong>contato@estoudeolho.app</strong><br />
              🌐 <strong>estoudeolho.lovable.app</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
