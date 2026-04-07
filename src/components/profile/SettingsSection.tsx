import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, LogOut, Share2, Bell } from "lucide-react";
import { getDadTitle } from "@/lib/constants";
import { sendLocalNotification, getNotificationPermission, requestPushSubscription } from "@/lib/pushNotifications";

interface SettingsSectionProps {
  profile: any;
  isMom: boolean;
  rankPos: number | null | undefined;
  monthPct: number;
  rescues: number;
}

export default function SettingsSection({ profile, isMom, rankPos, monthPct, rescues }: SettingsSectionProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const dadTitle = getDadTitle(profile.points);
  const accent = isMom ? "text-mom" : "text-primary";
  const accentBorder = isMom ? "border-mom" : "border-primary";

  const handleLogout = async () => {
    await signOut();
    toast(isMom ? "Saiu. A família sente sua falta. 👑" : "Saiu. Seu ranking continua correndo sem você. 👋");
  };

  return (
    <section className="space-y-2">
      <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4" /> Configurações
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground font-body mb-1">Código família</p>
            <p className="text-xs font-mono font-bold">{profile.family_code || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground font-body mb-1">Membro desde</p>
            <p className="text-xs font-bold">{format(new Date(profile.created_at), "dd/MM/yy")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 pt-2">
        {isMom ? (
          <Button
            variant="outline"
            className={`flex-1 text-xs h-9 font-display ${accentBorder} ${accent}`}
            onClick={async () => {
              const perm = await getNotificationPermission();
              if (perm !== "granted" && user) await requestPushSubscription(user.id);
              sendLocalNotification("Estou de Olho 👁️", "Teste de notificação. Tudo ok, chefe. 👑");
            }}
          >
            <Bell className="w-3.5 h-3.5" /> Testar notificação
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1 text-xs h-9 font-display"
              onClick={async () => {
                const perm = await getNotificationPermission();
                if (perm !== "granted" && user) await requestPushSubscription(user.id);
                sendLocalNotification("Estou de Olho 👁️", "Você esqueceu algo. Não sabemos o quê. Mas você sabe.");
              }}
            >
              <Bell className="w-3.5 h-3.5" /> Testar notificação
            </Button>
            <Button variant="outline" className="flex-1 text-xs h-9 font-display" onClick={() => {
              const text = `DNA do Pai — ${format(new Date(), "MMMM yyyy", { locale: ptBR })} 👁️\n${profile.display_name}\n${dadTitle.emoji} ${dadTitle.title}\n${monthPct}% tarefas • ${profile.streak_days} dias seguidos • ${rescues} resgates\nEstou de Olho — porque alguém tem que lembrar`;
              if (navigator.share) navigator.share({ text });
              else { navigator.clipboard.writeText(text); toast("DNA copiado!"); }
            }}>
              <Share2 className="w-3.5 h-3.5" /> Compartilhar DNA
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-2">
        {[
          { path: "/privacidade", label: "Privacidade", icon: "📄" },
          { path: "/termos", label: "Termos", icon: "📋" },
          { path: "/exclusao-dados", label: "Exclusão de Dados", icon: "🗑️" },
          { path: "/suporte", label: "Suporte", icon: "💬" },
        ].map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            className="text-left text-xs font-body transition-colors py-2 px-3 rounded-lg flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <span>{link.icon}</span> {link.label}
          </button>
        ))}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full font-display text-sm mt-2 text-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Sair do app
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Tem certeza que quer sair?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              {isMom
                ? "Sem você, a família vira um caos."
                : `Seu ranking continua correndo sem você.${rankPos && rankPos > 1 ? " O 1° lugar agradece." : ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-display">Fica</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive font-display">
              {isMom ? "Sair" : "Sai (e perde pontos)"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
