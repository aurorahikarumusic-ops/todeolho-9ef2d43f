import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DataDeletion() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDeletion = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Clear user data from app tables
      await supabase.from("achievements").delete().eq("user_id", user.id);
      await supabase.from("daily_missions").delete().eq("user_id", user.id);
      await supabase.from("profiles").update({
        display_name: "Usuário removido",
        avatar_url: null,
        push_subscription: null,
        points: 0,
        streak_days: 0,
      }).eq("user_id", user.id);

      await signOut();
      toast.success("Seus dados foram removidos. Até mais, pai. 👋");
      navigate("/");
    } catch {
      toast.error("Erro ao excluir dados. Tente novamente ou entre em contato.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    document.title = "Exclusão de Dados — Estou de Olho";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Exclusão de Dados</h1>

        <div className="space-y-6 text-sm font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg mb-2">Quer apagar tudo?</h2>
            <p>
              A LGPD (Lei nº 13.709/2018) e o Google Play garantem seu direito 
              de apagar seus dados. Sem burocracia, sem pegadinha.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">O que será excluído</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Seu perfil e informações pessoais</li>
              <li>Histórico de tarefas e eventos</li>
              <li>Pontuação, ranking e conquistas</li>
              <li>Dados de notificação push</li>
              <li>Fotos enviadas como prova de tarefas</li>
              <li>Dados dos perfis de filhos cadastrados</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">Prazo</h2>
            <p>
              No app, é imediato. Backups levam até 30 dias pra serem removidos dos servidores.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2">Alternativas</h2>
            <p>
              Se preferir, você também pode solicitar a exclusão por e-mail:<br />
              <strong>Responsável:</strong> Tonylton Silveira Motoki<br />
              📧 <strong>estoudeolho.contato@gmail.com</strong>
            </p>
            <p className="mt-2 text-muted-foreground italic">
              Inclua o e-mail da sua conta para agilizar o processo.
            </p>
          </section>

          {user && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display font-bold text-sm">Excluir meus dados agora</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta ação é <strong>irreversível</strong>. Todos os seus dados, pontos, ranking 
                      e histórico serão permanentemente removidos.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs mb-2">Digite <strong>EXCLUIR</strong> para confirmar:</p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="EXCLUIR"
                    className="text-sm"
                  />
                </div>

                <Button
                  variant="destructive"
                  className="w-full font-display"
                  disabled={confirmText !== "EXCLUIR" || deleting}
                  onClick={() => setShowDialog(true)}
                >
                  {deleting ? "Excluindo..." : "Excluir todos os meus dados"}
                </Button>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Faça login para excluir seus dados pelo app, ou envie um e-mail para{" "}
                  <strong>estoudeolho.contato@gmail.com</strong>.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Última chance, pai.</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Tem certeza? Todos os seus pontos, ranking, conquistas e histórico serão 
              apagados para sempre. A mãe vai ficar sabendo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestDeletion}
              className="bg-destructive font-display"
            >
              Excluir tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
