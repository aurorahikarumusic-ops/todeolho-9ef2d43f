import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { getDadTitle } from "@/lib/constants";

interface ProfileHeaderProps {
  profile: any;
  isMom: boolean;
  stats: { icon: React.ReactNode; value: string; label: string; color?: string }[];
  onEditName: (name: string) => void;
  onAvatarUpload: (file: File) => void;
  rescues: number;
  lastActiveHours: number;
  tasksCreatedByMe: number;
}

export default function ProfileHeader({ profile, isMom, stats, onEditName, onAvatarUpload, rescues, lastActiveHours, tasksCreatedByMe }: ProfileHeaderProps) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const dadTitle = getDadTitle(profile.points);

  const handleSave = () => {
    if (editName.trim()) {
      onEditName(editName.trim());
      setEditMode(false);
    }
  };

  if (isMom) {
    return (
      <section className="relative rounded-2xl overflow-hidden border-2 border-mom-border bg-mom-bg">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="h-2 bg-mom" />
        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer relative group shrink-0">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && onAvatarUpload(e.target.files[0])} />
              <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-lg border-mom bg-mom/10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-bold text-mom-text">{(profile.display_name || "U")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-mom">
                <Edit2 className="w-3.5 h-3.5 text-white" />
              </div>
            </label>
            <div className="flex-1 min-w-0">
              {editMode ? (
                <div className="flex gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm bg-white" autoFocus />
                  <Button size="sm" className="h-8 text-xs text-white bg-mom hover:bg-mom/90" onClick={handleSave}>Salvar</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-foreground truncate">{profile.display_name}</h1>
                  <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
              )}
              <div className="mt-1">
                <Badge className="text-[10px] text-white border-0 bg-mom">👑 CEO da Família</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-body italic mt-1.5 leading-tight">
                {tasksCreatedByMe > 0 ? `${tasksCreatedByMe} tarefa(s) criadas esse mês` : "A família funciona porque você funciona."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {stats.slice(0, 3).map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-border">
                <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--dad-border) / 0.4)",
      boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}>
      <div className="h-2" style={{ background: "linear-gradient(90deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))" }} />
      <div className="relative p-5 pt-6">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer relative group shrink-0">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && onAvatarUpload(e.target.files[0])} />
            <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-lg" style={{
              borderColor: "hsl(var(--dad-accent) / 0.3)",
              background: "hsl(var(--dad-bg))",
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold" style={{ color: "hsl(var(--dad-text))" }}>{(profile.display_name || "U")[0].toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white" style={{
              background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
            }}>
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </div>
          </label>

          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="flex gap-2">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" autoFocus />
                <Button size="sm" className="h-8 text-xs text-white border-0" style={{ background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))" }} onClick={handleSave}>Salvar</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold truncate">{profile.display_name}</h1>
                <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
            )}
            <div className="mt-1">
              <Badge className="text-[10px] border-0 text-white" style={{
                background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
              }}>
                {dadTitle.emoji} {dadTitle.title}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-body italic mt-1.5 leading-tight">
              {rescues > 0
                ? `A mãe te salvou ${rescues}x esse mês`
                : lastActiveHours > 24 ? `Última ação: ${lastActiveHours}h atrás` : "Ativo hoje. Bom começo."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {(stats as any[]).slice(0, 3).map((s: any, i: number) => (
            <div key={i} className="rounded-xl p-2.5 text-center shadow-sm" style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--dad-border) / 0.3)",
            }}>
              <p className="font-display font-bold text-lg">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
