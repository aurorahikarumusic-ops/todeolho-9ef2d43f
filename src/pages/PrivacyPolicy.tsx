import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="space-y-6 text-sm font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg mb-2">1. Introdução</h2>
            <p>
              O <strong>Estou de Olho</strong> ("nós", "nosso" ou "app") é uma plataforma de organização familiar 
              e gamificação. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e 
              protegemos suas informações pessoais, em conformidade com a <strong>Lei Geral de Proteção de 
              Dados (LGPD — Lei nº 13.709/2018)</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">2. Dados que coletamos</h2>
            <p>Coletamos os seguintes dados:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, foto de perfil (quando fornecida via Google ou upload).</li>
              <li><strong>Dados familiares:</strong> nomes e informações dos filhos (escola, pediatra, alergias) — fornecidos voluntariamente pelo usuário.</li>
              <li><strong>Dados de uso:</strong> tarefas criadas, eventos, pontuações, streaks, conquistas e interações dentro do app.</li>
              <li><strong>Dados técnicos:</strong> identificadores de push notification, informações do dispositivo para envio de notificações.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer e personalizar os serviços do app (tarefas, ranking, gamificação).</li>
              <li>Enviar notificações sobre tarefas, eventos e atualizações do ranking.</li>
              <li>Conectar membros da mesma família dentro da plataforma.</li>
              <li>Melhorar a experiência do usuário e desenvolver novos recursos.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">4. Compartilhamento de dados</h2>
            <p>
              <strong>Não vendemos seus dados.</strong> Seus dados podem ser compartilhados apenas:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Com membros da sua família vinculados no app (dados de tarefas, eventos e ranking).</li>
              <li>Com provedores de serviço essenciais (autenticação, banco de dados, notificações) que operam sob contratos de proteção de dados.</li>
              <li>Quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">5. Armazenamento e segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL) 
              e em repouso. Utilizamos autenticação segura e políticas de acesso restrito (Row Level Security) 
              para garantir que cada usuário acesse apenas seus próprios dados.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">6. Seus direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Acesso:</strong> saber quais dados temos sobre você.</li>
              <li><strong>Correção:</strong> atualizar dados incorretos ou incompletos.</li>
              <li><strong>Exclusão:</strong> solicitar a remoção dos seus dados pessoais.</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado.</li>
              <li><strong>Revogação:</strong> retirar seu consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer direito, entre em contato pelo e-mail: <strong>contato@estoudeolho.app</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">7. Retenção de dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Após solicitar exclusão, 
              seus dados serão removidos em até 30 dias, exceto quando a retenção for necessária 
              por obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">8. Menores de idade</h2>
            <p>
              O app é destinado a pais e mães (maiores de 18 anos). Dados de crianças são inseridos 
              pelos responsáveis legais e usados exclusivamente para organização familiar dentro do app.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
              através do app. O uso continuado após alterações constitui aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">10. Contato</h2>
            <p>
              Para dúvidas sobre privacidade:<br />
              📧 <strong>contato@estoudeolho.app</strong><br />
              🌐 <strong>estoudeolho.lovable.app</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
