import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useIsMom, useFamilyPartner } from "@/hooks/useFamily";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  format, isSameDay, isBefore, isWithinInterval, addHours, subHours,
  startOfMonth, endOfMonth, isToday, isTomorrow, parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Camera, CalendarDays, Eye, Sparkles } from "lucide-react";

const EVENT_CATEGORIES = [
  { value: "escola", label: "🏫 Escola" },
  { value: "saude", label: "🏥 Saúde" },
  { value: "aniversario", label: "🎂 Aniversário" },
  { value: "casa", label: "🏠 Casa" },
  { value: "outro", label: "⭐ Outro" },
] as const;

function getEventDotColor(event: any, userId: string | undefined) {
  const eventDate = new Date(event.event_date);
  if (isBefore(eventDate, new Date()) && !isToday(eventDate)) return "bg-muted-foreground/40";
  if (event.event_type === "escola") return "bg-accent";
  if (event.created_by === userId) return "bg-primary";
  return "bg-secondary";
}

function getEventIronicComment(event: any, userId: string | undefined) {
  const eventDate = new Date(event.event_date);
  const isPast = isBefore(eventDate, new Date()) && !isToday(eventDate);
  const isDadEvent = event.created_by === userId;

  if (isToday(eventDate)) return "É HOJE. Não precisa de mais nada.";
  if (isPast && !event.checkin_done) return "Passou. Você foi? Não registrou nada. Típico.";
  if (isPast && event.checkin_done) return "Você foi. Temos foto como prova.";
  if (isDadEvent) return "Você mesmo adicionou. Histórico.";
  return "A mãe adicionou isso. Você não sabia.";
}

function isCheckinWindow(eventDate: string) {
  const d = new Date(eventDate);
  const now = new Date();
  return isWithinInterval(now, { start: subHours(d, 1), end: addHours(d, 1) });
}

export default function Agenda() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isMom = useIsMom();
  const { data: partner } = useFamilyPartner();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", event_date: "", event_time: "09:00",
    event_type: "outro", notify_partner: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkinEventId, setCheckinEventId] = useState<string | null>(null);
  const dadName = partner?.display_name || "o pai";

  const monthStart = startOfMonth(selectedDate || new Date()).toISOString();
  const monthEnd = endOfMonth(selectedDate || new Date()).toISOString();

  const { data: events = [] } = useQuery({
    queryKey: ["events", profile?.family_id, monthStart],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("event_date", monthStart)
        .lte("event_date", monthEnd)
        .order("event_date", { ascending: true });
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const momCount = events.filter(e => e.created_by !== user?.id).length;
  const dadCount = events.filter(e => e.created_by === user?.id).length;

  // Header subtitle
  const todayEvents = events.filter(e => isToday(new Date(e.event_date)));
  const overdueEvents = events.filter(e => {
    const d = new Date(e.event_date);
    return isBefore(d, new Date()) && !isToday(d);
  });

  let subtitle = "Dia livre. A mãe já preencheu o resto da semana.";
  if (todayEvents.length > 0) subtitle = `Você tem ${todayEvents.length} compromisso${todayEvents.length > 1 ? "s" : ""} hoje. Sabia disso?`;
  if (overdueEvents.length > 0) subtitle = "Tem coisa atrasada aqui. Vai olhar.";

  // Events for selected date or upcoming
  const filteredEvents = selectedDate
    ? events.filter(e => isSameDay(new Date(e.event_date), selectedDate))
    : events.filter(e => !isBefore(new Date(e.event_date), new Date()) || isToday(new Date(e.event_date)));

  const upcomingEvents = events
    .filter(e => !isBefore(new Date(e.event_date), new Date()) || isToday(new Date(e.event_date)))
    .slice(0, 10);

  // Dates with events for calendar dots
  const eventDates = events.map(e => new Date(e.event_date));

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.family_id || !user) throw new Error("Sem família");
      const dateTime = new Date(`${newEvent.event_date}T${newEvent.event_time}`);
      const { error } = await supabase.from("events").insert({
        title: newEvent.title,
        description: newEvent.description || null,
        event_date: dateTime.toISOString(),
        event_type: newEvent.event_type,
        family_id: profile.family_id,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowAddSheet(false);
      setNewEvent({ title: "", description: "", event_date: "", event_time: "09:00", event_type: "outro", notify_partner: true });
      toast.success(
        isMom
          ? `Evento adicionado! O ${dadName} já vai saber.\n(Mesmo que ele diga que não sabia.)`
          : "Evento salvo! Você adicionou sozinho. Isso vai pro seu histórico. ✨",
        { duration: 4000 }
      );
    },
    onError: () => toast.error("Erro ao salvar. Tenta de novo, pai."),
  });

  // "Eu já sabia" mutation
  const euJaSabiaMutation = useMutation({
    mutationFn: async (eventId: string) => {
      // Just award negative ironic points - we track via a simple approach
      toast("Claro, você sabia. A gente acredita. 🙄", { duration: 3000 });
    },
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async ({ eventId, caption }: { eventId: string; caption?: string }) => {
      if (!user) throw new Error("Não autenticado");
      // Award points
      const event = events.find(e => e.id === eventId);
      const isOwnEvent = event?.created_by === user.id;
      const pts = isOwnEvent ? 80 : 50;

      await supabase.from("profiles").update({
        points: (profile?.points || 0) + pts,
      }).eq("user_id", user.id);

      return pts;
    },
    onSuccess: (pts) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setCheckinEventId(null);
      toast.success(`Check-in confirmado! +${pts}pts 📸\nVocê foi. De verdade. Guardamos como prova histórica.`, { duration: 5000 });
    },
  });

  // Empty state
  const noEvents = events.length === 0;
  const noFilteredEvents = filteredEvents.length === 0 && upcomingEvents.length === 0;

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className={`w-6 h-6 ${isMom ? "text-mom" : "text-primary"}`} />
          <h1 className="font-display text-2xl font-bold">
            {isMom ? "Agenda da Família" : "O Que Você Ia Esquecer"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground font-body italic">
          {isMom ? "Só você adiciona. Ele não tem desculpa de não saber." : subtitle}
        </p>
      </div>

      {/* Month counter */}
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground font-body">
          Este mês: <span className="text-secondary font-semibold">{momCount} da mãe</span>,{" "}
          <span className="text-primary font-semibold">{dadCount} do pai</span>
          {dadCount === 0 && <span className="text-muted-foreground"> (ainda)</span>}
        </span>
      </div>

      {/* Calendar */}
      <Card className="overflow-hidden">
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="pointer-events-auto"
            modifiers={{
              hasEvent: eventDates,
            }}
            modifiersClassNames={{
              hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-secondary",
            }}
          />
        </CardContent>
      </Card>

      {/* Selected date label */}
      {selectedDate && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            {isToday(selectedDate)
              ? "Hoje"
              : isTomorrow(selectedDate)
                ? "Amanhã"
                : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h2>
          {filteredEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filteredEvents.length} evento{filteredEvents.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      {/* Event list */}
      {noEvents ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-display text-lg font-bold mb-1">Nada agendado</p>
            <p className="text-sm text-muted-foreground font-body italic">
              Mês livre? Improvável. Vai confirmar com a mãe.
            </p>
          </CardContent>
        </Card>
      ) : noFilteredEvents && selectedDate ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-3xl mb-2">🤷</p>
            <p className="text-sm text-muted-foreground font-body italic">
              Nada nesse dia. Ou a mãe ainda não atualizou. Ou você tá com sorte.
              <br />Provavelmente a mãe ainda não atualizou.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(filteredEvents.length > 0 ? filteredEvents : upcomingEvents).map((event) => {
            const eventDate = new Date(event.event_date);
            const isDadEvent = event.created_by === user?.id;
            const inCheckinWindow = isCheckinWindow(event.event_date);
            const category = EVENT_CATEGORIES.find(c => c.value === event.event_type);

            return (
              <Card key={event.id} className="relative overflow-hidden">
                {/* Check-in banner */}
                {inCheckinWindow && (
                  <div className="bg-secondary/10 px-4 py-2 flex items-center gap-2 border-b border-secondary/20">
                    <span className="text-sm">📍</span>
                    <span className="text-xs font-body font-semibold text-secondary">
                      Esse evento é agora. Faz o check-in!
                    </span>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getEventDotColor(event, user?.id)}`} />
                        <h3 className="font-display font-bold text-base truncate">{event.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{format(eventDate, "dd/MM · HH:mm")}</span>
                        {category && <span>{category.label}</span>}
                      </div>

                      <Badge
                        variant={isDadEvent ? "default" : "secondary"}
                        className="text-[10px] mb-2"
                      >
                        {isDadEvent ? (
                          <><Sparkles className="w-3 h-3 mr-1" /> Pai lembrou ✨</>
                        ) : (
                          "Mãe adicionou"
                        )}
                      </Badge>

                      <p className="text-xs font-body italic text-muted-foreground">
                        {getEventIronicComment(event, user?.id)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* "Eu já sabia" button - only for mom events */}
                      {!isDadEvent && !isBefore(eventDate, new Date()) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] h-7 border-secondary text-secondary hover:bg-secondary/10"
                          onClick={() => {
                            euJaSabiaMutation.mutate(event.id);
                          }}
                        >
                          👆 Eu já sabia!
                        </Button>
                      )}

                      {/* Check-in button */}
                      {inCheckinWindow && (
                        <Button
                          size="sm"
                          className="text-xs h-8 bg-primary"
                          onClick={() => checkinMutation.mutate({ eventId: event.id })}
                        >
                          <Camera className="w-3.5 h-3.5 mr-1" />
                          Check-in
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FAB - Add Event */}
      <button
        onClick={() => setShowAddSheet(true)}
        className={`fixed bottom-20 right-4 z-40 rounded-full shadow-lg flex items-center gap-2 transition-all active:scale-95 px-4 h-12 ${isMom ? "bg-mom text-white hover:bg-mom/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
        title="Adicionar novo evento"
      >
        <Plus className="w-5 h-5" />
        <span className="font-display text-sm">Novo evento</span>
      </button>

      {/* Add Event Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Novo Evento</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-body">Nome do evento</Label>
              <Input
                placeholder="Ex: Reunião na escola"
                value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs font-body">Data</Label>
                <Input
                  type="date"
                  value={newEvent.event_date}
                  onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="w-28">
                <Label className="text-xs font-body">Hora</Label>
                <Input
                  type="time"
                  value={newEvent.event_time}
                  onChange={e => setNewEvent(p => ({ ...p, event_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-body">Categoria</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={v => setNewEvent(p => ({ ...p, event_type: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-body">Notas (opcional)</Label>
              <Textarea
                placeholder="Detalhes, endereço, etc."
                value={newEvent.description}
                onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-body">Avisar a mãe também?</Label>
              <Switch
                checked={newEvent.notify_partner}
                onCheckedChange={v => setNewEvent(p => ({ ...p, notify_partner: v }))}
              />
            </div>

            <Button
              className="w-full bg-primary font-display"
              onClick={() => addEventMutation.mutate()}
              disabled={!newEvent.title || !newEvent.event_date || addEventMutation.isPending}
            >
              {addEventMutation.isPending ? "Salvando..." : "Salvar Evento"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
