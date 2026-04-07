import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Política de Privacidade — Estou de Olho";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: 01/04/2026</p>

        <div className="space-y-6 text-sm font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg mb-2">1. O que é o Estou de Olho</h2>
            <p>
              O <strong>Estou de Olho</strong> é um app que ajuda pais a se organizarem melhor 
              na rotina familiar — com tarefas, agenda e um ranking que ninguém pediu mas todo mundo precisa.
              Aqui explicamos o que fazemos com seus dados. Sem juridiquês desnecessário.
            </p>
            <p className="mt-2">
              Seguimos a <strong>LGPD (Lei nº 13.709/2018)</strong>.
            </p>
            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <p><strong>Controlador dos dados:</strong> Estou de Olho Tecnologia</p>
              <p><strong>CNPJ:</strong> [Inserir CNPJ quando disponível]</p>
              <p><strong>E-mail do controlador:</strong> estoudeolho.contato@gmail.com</p>
              <p><strong>Encarregado (DPO):</strong> Dispensado nos termos da Resolução CD/ANPD nº 2/2022 
              (agente de tratamento de pequeno porte). Para exercer seus direitos, entre em contato 
              pelo e-mail acima.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">2. O que coletamos</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Cadastro:</strong> nome, e-mail e foto (se você enviar ou usar o Google).</li>
              <li><strong>Família:</strong> nomes dos filhos, escola, pediatra, alergias — só o que você escolher preencher.</li>
              <li><strong>Uso do app:</strong> tarefas, eventos, pontos, streaks e conquistas.</li>
              <li><strong>Notificações:</strong> token do dispositivo para enviar lembretes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">3. Pra que usamos e base legal</h2>
            <p>Basicamente: pra fazer o app funcionar. Mais especificamente:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Mostrar suas tarefas, ranking e agenda.</li>
              <li>Mandar lembretes quando você esquece das coisas (acontece muito).</li>
              <li>Conectar você aos outros membros da família no app.</li>
            </ul>
            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
              <p className="font-bold mb-1">Base legal (Art. 7, LGPD):</p>
              <p>• <strong>Dados de cadastro</strong> (nome, e-mail): execução de contrato (Art. 7, V)</p>
              <p>• <strong>Dados de uso do app</strong> (tarefas, pontos, ranking): legítimo interesse (Art. 7, IX)</p>
              <p>• <strong>Notificações push</strong>: consentimento (Art. 7, I)</p>
              <p>• <strong>Dados de filhos</strong>: consentimento do responsável legal (Art. 14)</p>
              <p>• <strong>Pagamentos</strong>: execução de contrato e obrigação legal (Art. 7, V e II)</p>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">4. Compartilhamento</h2>
            <p>
              <strong>Não vendemos seus dados.</strong> Ponto.
            </p>
            <p className="mt-2">Compartilhamos dados apenas:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Com sua família dentro do app (tarefas e ranking são visíveis entre vocês).</li>
              <li>Com serviços técnicos que fazem o app funcionar (autenticação, banco de dados, notificações).</li>
              <li>Se a lei mandar. Mas até agora ninguém mandou.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">5. Segurança</h2>
            <p>
              Seus dados ficam em servidores com criptografia (TLS em trânsito, criptografia em repouso). 
              Cada usuário só acessa os próprios dados. Não é perfeito — nada é — mas levamos isso a sério.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">6. Seus direitos</h2>
            <p>A LGPD garante que você pode:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Saber quais dados temos sobre você.</li>
              <li>Corrigir dados errados.</li>
              <li>Pedir pra apagar tudo (tem uma página só pra isso no app).</li>
              <li>Pedir seus dados em formato exportável.</li>
              <li>Cancelar o consentimento quando quiser.</li>
            </ul>
            <p className="mt-2">
              Pra qualquer uma dessas coisas: <strong>estoudeolho.contato@gmail.com</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">7. Por quanto tempo guardamos</h2>
            <p>
              Enquanto sua conta existir. Se você pedir exclusão, apagamos em até 30 dias. 
              Só mantemos o que a lei obrigar.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">8. Dados de crianças</h2>
            <p>
              O app é pra adultos (18+). Dados de filhos são cadastrados pelos pais 
              e usados só dentro do app pra organização familiar.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">9. Cookies e tecnologias</h2>
            <p>
              O Estou de Olho utiliza <strong>cookies essenciais</strong> para manter sua sessão 
              ativa e garantir o funcionamento do app. Não utilizamos cookies de rastreamento 
              publicitário ou de terceiros para fins de marketing.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Cookies de sessão:</strong> necessários para manter você logado (base legal: execução de contrato).</li>
              <li><strong>Armazenamento local:</strong> preferências do app e dados offline (base legal: legítimo interesse).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">10. Registros de acesso</h2>
            <p>
              Conforme o Art. 15 do Marco Civil da Internet (Lei nº 12.965/2014), mantemos 
              registros de acesso ao aplicativo pelo prazo de <strong>6 meses</strong>, 
              sob sigilo e em ambiente controlado de segurança.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">11. Mudanças</h2>
            <p>
              Se mudarmos algo importante aqui, avisamos pelo app. 
              Continuar usando depois da mudança significa que você concorda.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">12. Fale com a gente</h2>
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