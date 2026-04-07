import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import InvitePartner from "@/components/family/InvitePartner";
import JoinFamily from "@/components/family/JoinFamily";

interface FamilyConnectionProps {
  profile: any;
  isMom: boolean;
  allMembers: any[];
}

export default function FamilyConnection({ profile, isMom, allMembers }: FamilyConnectionProps) {
  return (
    <section>
      <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
        <User className="w-4 h-4" /> Conexão Familiar
      </h2>
      {!profile.family_id ? (
        isMom ? <InvitePartner /> : <JoinFamily />
      ) : allMembers.length === 0 ? (
        <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--muted) / 0.3)" }}>
          <p className="font-body text-xs text-muted-foreground">Conectado à família ✓</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allMembers.map((member: any) => {
            const roleEmoji = member.role === "mae" ? "👩" : member.role === "avo" ? "👵" : "👨";
            const roleLabel = member.role === "mae" ? "A mãe" : member.role === "avo" ? "A avó" : "O pai";
            return (
              <Card key={member.id} className="border-0 shadow-sm bg-primary/5">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      roleEmoji
                    )}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold">{member.display_name}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{roleLabel} • {member.points} pts</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
