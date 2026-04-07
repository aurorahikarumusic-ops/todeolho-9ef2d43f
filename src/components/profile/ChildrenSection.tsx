import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Baby } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ChildrenSectionProps {
  children: any[];
  familyId: string | null;
  isMom: boolean;
}

function getChildCompletion(child: any) {
  let filled = 1;
  const total = 5;
  if (child.school) filled++;
  if (child.doctor_name) filled++;
  if (child.allergies) filled++;
  if (child.birth_date) filled++;
  return Math.round((filled / total) * 100);
}

export default function ChildrenSection({ children, familyId, isMom }: ChildrenSectionProps) {
  const [showChildSheet, setShowChildSheet] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", school: "", doctor_name: "", allergies: "", birth_date: "" });
  const queryClient = useQueryClient();

  const addChildMutation = useMutation({
    mutationFn: async () => {
      if (!familyId) throw new Error("Sem família");
      const { error } = await supabase.from("children").insert({
        family_id: familyId,
        name: newChild.name,
        school: newChild.school || null,
        doctor_name: newChild.doctor_name || null,
        allergies: newChild.allergies || null,
        birth_date: newChild.birth_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setShowChildSheet(false);
      setNewChild({ name: "", school: "", doctor_name: "", allergies: "", birth_date: "" });
      toast.success(isMom ? "Filho adicionado! 👑" : "Filho adicionado! Você sabe quantos tem agora? 😏");
    },
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base font-bold flex items-center gap-2">
          <Baby className="w-4 h-4" /> Filhos
        </h2>
        <Button size="sm" variant="outline" className={`h-7 text-xs ${isMom ? "border-mom text-mom" : ""}`} onClick={() => setShowChildSheet(true)}>
          Adicionar
        </Button>
      </div>

      {children.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body italic text-center py-4">
          {isMom ? "Nenhum filho cadastrado ainda." : "Nenhum filho cadastrado. Você tem filhos, né?"}
        </p>
      ) : (
        <div className="space-y-2">
          {children.map((child: any) => {
            const pct = getChildCompletion(child);
            return (
              <Card key={child.id} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-base">👶</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm">{child.name}</p>
                      {child.birth_date && <p className="text-[10px] text-muted-foreground">{format(new Date(child.birth_date), "dd/MM/yyyy")}</p>}
                    </div>
                    <span className="text-xs font-display font-bold" style={{ color: isMom ? undefined : "hsl(var(--dad-accent))" }}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1 mb-1.5" />
                  <div className="flex flex-wrap gap-1">
                    {child.school && <Badge variant="outline" className="text-[9px] h-5">🏫 {child.school}</Badge>}
                    {child.doctor_name && <Badge variant="outline" className="text-[9px] h-5">🏥 {child.doctor_name}</Badge>}
                    {!child.school && <span className="text-[9px] text-secondary italic">Falta: escola</span>}
                    {!child.doctor_name && <span className="text-[9px] text-secondary italic">Falta: pediatra</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={showChildSheet} onOpenChange={setShowChildSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Adicionar Filho</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-body">Nome</label>
              <Input value={newChild.name} onChange={e => setNewChild(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="Nome do filho" />
            </div>
            <div>
              <label className="text-xs font-body">Data de nascimento</label>
              <Input type="date" value={newChild.birth_date} onChange={e => setNewChild(p => ({ ...p, birth_date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-body">Escola</label>
              <Input value={newChild.school} onChange={e => setNewChild(p => ({ ...p, school: e.target.value }))} className="mt-1" placeholder="Nome da escola" />
            </div>
            <div>
              <label className="text-xs font-body">Pediatra</label>
              <Input value={newChild.doctor_name} onChange={e => setNewChild(p => ({ ...p, doctor_name: e.target.value }))} className="mt-1" placeholder="Nome do pediatra" />
            </div>
            <div>
              <label className="text-xs font-body">Alergias / Observações</label>
              <Input value={newChild.allergies} onChange={e => setNewChild(p => ({ ...p, allergies: e.target.value }))} className="mt-1" placeholder="Ex: Alergia a amendoim" />
            </div>
            <Button className={`w-full font-display ${isMom ? "bg-mom hover:bg-mom/90" : "bg-primary"}`}
              onClick={() => addChildMutation.mutate()}
              disabled={!newChild.name || addChildMutation.isPending}>
              {addChildMutation.isPending ? "Salvando..." : "Adicionar Filho"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
