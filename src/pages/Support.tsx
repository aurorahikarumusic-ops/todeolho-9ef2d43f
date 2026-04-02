import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <h1 className="font-display text-2xl font-bold mb-2">Suporte & Contato</h1>
        <p className="text-sm text-muted-foreground font-body italic mb-6">
          Precisa de ajuda? A mãe não pode resolver tudo.
        </p>

        <div className="space-y-4">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <a href="mailto:contato@estoudeolho.app" className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">E-mail</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">contato@estoudeolho.app</p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Respondemos em até 48 horas. Mais rápido que você responde a mãe.
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <a href="https://estoudeolho.lovable.app" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Site</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">estoudeolho.lovable.app</p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Todas as informações sobre o app.
                  </p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">FAQ</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-bold">Como excluo minha conta?</p>
                      <p className="text-xs text-muted-foreground">
                        Vá em Perfil → Exclusão de Dados, ou envie e-mail para contato@estoudeolho.app.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Como conecto minha parceira?</p>
                      <p className="text-xs text-muted-foreground">
                        Compartilhe seu código da família (no Perfil) para ela entrar com o papel de "mãe".
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Posso usar sem internet?</p>
                      <p className="text-xs text-muted-foreground">
                        O app funciona parcialmente offline, mas precisa de internet para sincronizar dados.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Como ganho pontos?</p>
                      <p className="text-xs text-muted-foreground">
                        Completando tarefas, missões diárias e mantendo seu streak. Fotos dão pontos extras.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-body">
            Estou de Olho 👁️ — porque alguém tem que lembrar
          </p>
        </div>
      </div>
    </div>
  );
}
