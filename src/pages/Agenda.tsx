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
  startOfMonth, endOfMonth, isToday, isTomorrow, differenceInDays, addDays
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Camera, CalendarDays, Sparkles, Clock, MapPin, ChevronRight, AlertTriangle } from "lucide-react";
import { notifyCrossPanel } from "@/lib/notify";

const EVENT_CATEGORIES = [
  { value: "escola", label: "🏫 Escola", color: "#6366f1" },
  { value: "saude", label: "🏥 Saúde", color: "#ef4444" },
  { value: "aniversario", label: "🎂 Aniversário", color: "#f59e0b" },
  { value: "casa", label: "🏠 Casa", color: "#22c55e" },
  { value: "outro", label: "⭐ Outro", color: "#8b5cf6" },
] as const;

function getCategoryInfo(type: string) {
  return EVENT_CATEGORIES.find(c => c.value === type) || EVENT_CATEGORIES[4];
}

function getTimeLabel(eventDate: Date) {
  if (isToday(eventDate)) return "Hoje";
  if (isTomorrow(eventDate)) return "Amanhã";
  const diff = differenceInDays(eventDate, new Date());
  if (diff < 0) return `${Math.abs(diff)}d atrás`;
  if (diff <= 7) return `Em ${diff}d`;
  return format(eventDate, "dd/MM");
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
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", event_date: "", event_time: "09:00",
    event_type: "outro", notify_partner: true,
  });
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

  // Stats
  const todayEvents = events.filter(e => isToday(new Date(e.event_date)));
  const upcomingEvents = events.filter(e => {
    const d = new Date(e.event_date);
    return !isBefore(d, new Date()) || isToday(d);
  });
  const pastEvents = events.filter(e => {
    const d = new Date(e.event_date);
    return isBefore(d, new Date()) && !isToday(d);
  });
  const momCount = events.filter(e => e.created_by !== user?.id).length;
  const dadCount = events.filter(e => e.created_by === user?.id).length;

  const filteredEvents = selectedDate
    ? events.filter(e => isSameDay(new Date(e.event_date), selectedDate))
    : upcomingEvents;

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
          ? `Evento adicionado! O ${dadName} já vai saber.`
          : "Evento salvo! Você adicionou sozinho. ✨"
      );
      if (user && profile?.family_id) {
        notifyCrossPanel("event_created", profile.family_id, user.id, { title: newEvent.title });
      }
    },
    onError: () => toast.error("Erro ao salvar. Tenta de novo."),
  });

  const checkinMutation = useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      if (!user) throw new Error("Não autenticado");
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
      toast.success(`Check-in confirmado! +${pts}pts 📸`);
    },
  });

  // Next 3 days preview
  const next3Days = Array.from({ length: 3 }, (_, i) => {
    const day = addDays(new Date(), i);
    const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), day));
    return { day, events: dayEvents };
  });

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Hero Header */}
      <div
        className="relative rounded-3xl p-5 overflow-hidden"
        style={{
          background: isMom
169:             ? "linear-gradient(135deg, hsl(var(--mom-bg)), hsl(var(--mom-border)), hsl(var(--mom-cta)))"
            : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.95), hsl(220 25% 16%), hsl(var(--arena-dark)))",
          perspective: "800px",
        }}
      >
        {isMom ? (
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30"
            style={{ background: "hsl(var(--mom-accent))" }} />
        ) : (
          <>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30"
              style={{ background: "hsl(var(--arena-electric))" }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(var(--arena-neon))" }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "linear-gradient(hsl(var(--arena-electric)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--arena-electric)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }} />
            <div className="absolute top-0 left-6 right-6 h-px" style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--arena-electric) / 0.5), transparent)",
            }} />
          </>
        )}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {isMom ? (
              <CalendarDays className="w-6 h-6 text-mom" />
            ) : (
              <CalendarDays className="w-6 h-6" style={{ color: "hsl(var(--arena-electric))", filter: "drop-shadow(0 0 6px hsl(var(--arena-electric) / 0.5))" }} />
            )}
            <h1 className="font-display text-xl font-bold" style={!isMom ? {
              background: "linear-gradient(135deg, hsl(var(--arena-electric)), hsl(var(--arena-gold)), hsl(var(--arena-neon)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            } : undefined}>
              {isMom ? "Agenda da Família" : "⚔️ Compromissos"}
            </h1>
          </div>
          <p className={`text-xs font-body italic mb-4 ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(var(--arena-glow) / 0.7)" } : undefined}>
            {isMom
              ? "Organize tudo. Ele não tem desculpa."
              : todayEvents.length > 0
                ? `${todayEvents.length} compromisso${todayEvents.length > 1 ? "s" : ""} hoje. Sabia?`
                : "Nada hoje. Ou a mãe ainda não atualizou."
            }
          </p>

          {/* Quick stats */}
          <div className="flex gap-2">
            <div className="flex-1 backdrop-blur-sm rounded-2xl p-3 text-center"
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-electric) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-electric))", textShadow: "0 0 8px hsl(var(--arena-electric) / 0.4)" } : undefined}>{todayEvents.length}</p>
              <p className={`text-[9px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(220 15% 78%)" } : undefined}>Hoje</p>
            </div>
            <div className="flex-1 backdrop-blur-sm rounded-2xl p-3 text-center"
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-gold) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-gold))", textShadow: "0 0 8px hsl(var(--arena-gold) / 0.3)" } : undefined}>{upcomingEvents.length}</p>
              <p className={`text-[9px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(220 15% 78%)" } : undefined}>Próximos</p>
            </div>
            <div className="flex-1 backdrop-blur-sm rounded-2xl p-3 text-center"
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-neon) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-neon))", textShadow: "0 0 8px hsl(var(--arena-neon) / 0.3)" } : undefined}>{events.length}</p>
              <p className={`text-[9px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(220 15% 78%)" } : undefined}>Este mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next 3 days timeline */}
      <div className="space-y-1">
        <p className={`text-xs font-display font-bold uppercase tracking-wider px-1 ${isMom ? "text-muted-foreground" : ""}`}
          style={!isMom ? { color: "hsl(220 15% 75%)" } : undefined}>
          Próximos dias
        </p>
        <div className="flex gap-2">
          {next3Days.map(({ day, events: dayEvts }, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`flex-1 rounded-2xl p-3 transition-all duration-300 text-center ${
                  isMom
                    ? isSelected ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" : "bg-card hover:bg-muted/50"
                    : isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                style={!isMom ? {
                  background: isSelected
                    ? "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(220 25% 18%))"
                    : "hsl(var(--card))",
                  boxShadow: isSelected
                    ? "0 8px 24px rgba(0,0,0,0.2), 0 0 20px hsl(var(--arena-electric) / 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
                  border: isSelected ? "1px solid hsl(var(--arena-electric) / 0.3)" : "1px solid hsl(var(--border) / 0.5)",
                } : {
                  boxShadow: isSelected
                    ? "0 8px 20px hsl(var(--primary) / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <p className={`text-[9px] font-body uppercase tracking-wider`} style={!isMom ? {
                  color: isSelected ? "hsl(var(--arena-electric) / 0.7)" : "hsl(var(--muted-foreground))",
                } : {
                  color: isSelected ? "hsl(var(--primary-foreground) / 0.7)" : "hsl(var(--muted-foreground))",
                }}>
                  {isToday(day) ? "Hoje" : isTomorrow(day) ? "Amanhã" : format(day, "EEE", { locale: ptBR })}
                </p>
                <p className="font-display text-lg font-black" style={!isMom && isSelected ? {
                  color: "hsl(var(--arena-gold))",
                  textShadow: "0 0 8px hsl(var(--arena-gold) / 0.3)",
                } : undefined}>
                  {format(day, "dd")}
                </p>
                {dayEvts.length > 0 ? (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {dayEvts.slice(0, 3).map((e, j) => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: getCategoryInfo(e.event_type).color, boxShadow: !isMom && isSelected ? `0 0 4px ${getCategoryInfo(e.event_type).color}` : undefined }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[8px] mt-1" style={{
                    color: !isMom && isSelected ? "hsl(220 15% 70%)" : isSelected ? "hsl(var(--primary-foreground) / 0.5)" : "hsl(var(--muted-foreground) / 0.4)",
                  }}>—</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar with 3D card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: isMom ? "hsl(var(--card))" : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.85), hsl(220 25% 18%))",
          boxShadow: isMom
            ? "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.15)"
            : "0 8px 30px rgba(0,0,0,0.2), 0 0 20px hsl(var(--arena-gold) / 0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
          border: isMom ? undefined : "1px solid hsl(var(--arena-gold) / 0.1)",
        }}
      >
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className={`text-xs font-display font-bold uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`}
            style={!isMom ? { color: "hsl(var(--arena-gold) / 0.7)" } : undefined}>
            📅 Calendário
          </p>
          <div className="flex gap-2 text-[9px] font-body">
            <span className="flex items-center gap-1" style={!isMom ? { color: "hsl(220 15% 75%)" } : undefined}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: isMom ? "hsl(var(--secondary))" : "hsl(var(--arena-fire))" }} /> Mãe ({momCount})
            </span>
            <span className="flex items-center gap-1" style={!isMom ? { color: "hsl(220 15% 75%)" } : undefined}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: isMom ? "hsl(var(--primary))" : "hsl(var(--arena-neon))" }} /> Pai ({dadCount})
            </span>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          className={`pointer-events-auto px-2 pb-2 ${!isMom ? "dad-calendar-dark" : ""}`}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{
            hasEvent: "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-secondary",
          }}
        />
      </div>

      {/* Selected date header */}
      {selectedDate && (
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-base font-bold"
            style={!isMom ? { color: "hsl(220 15% 90%)" } : undefined}>
            {isToday(selectedDate) ? "📍 Hoje" : isTomorrow(selectedDate) ? "⏰ Amanhã" : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h2>
          <Badge variant="secondary" className="text-[10px] font-display"
            style={!isMom ? { background: "hsl(var(--arena-neon) / 0.12)", color: "hsl(var(--arena-neon))", border: "none" } : undefined}>
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Events list - 3D cards */}
      {events.length === 0 ? (
        <div
          className="rounded-3xl border-2 border-dashed p-10 text-center"
          style={{
            borderColor: isMom ? "hsl(var(--muted))" : "hsl(var(--arena-gold) / 0.2)",
            background: isMom ? undefined : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(220 25% 16%))",
            boxShadow: isMom ? "inset 0 2px 8px rgba(0,0,0,0.03)" : "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            border: isMom ? undefined : "1px solid hsl(var(--arena-gold) / 0.12)",
          }}
        >
          <p className="text-5xl mb-3">📅</p>
          <p className="font-display text-lg font-bold mb-1" style={!isMom ? { color: "hsl(0 0% 100%)" } : undefined}>Nada agendado</p>
          <p className="text-sm font-body italic" style={!isMom ? { color: "hsl(220 20% 85%)" } : undefined}>
            {isMom ? "Adicione o primeiro compromisso da família." : "Mês livre? Vai confirmar com a mãe."}
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl p-8 text-center"
          style={{
            background: isMom ? undefined : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(220 25% 16%))",
            boxShadow: isMom ? undefined : "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            border: isMom ? "2px dashed hsl(var(--muted))" : "1px solid hsl(var(--arena-gold) / 0.12)",
          }}>
          <p className="text-3xl mb-2">🤷</p>
          <p className="text-sm font-body italic" style={!isMom ? { color: "hsl(220 20% 85%)" } : undefined}>
            Nada nesse dia. Ou a mãe ainda não atualizou.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.event_date);
            const isDadEvent = event.created_by === user?.id;
            const inCheckinWindow = isCheckinWindow(event.event_date);
            const category = getCategoryInfo(event.event_type);
            const isPast = isBefore(eventDate, new Date()) && !isToday(eventDate);
            const isExpanded = expandedEvent === event.id;

            return (
              <div
                key={event.id}
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isExpanded ? "scale-[1.01]" : "hover:scale-[1.005]"
                } ${isPast ? "opacity-60" : ""}`}
                style={{
                  background: isMom ? "hsl(var(--card))" : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(220 25% 16%))",
                  boxShadow: isExpanded
                    ? isMom
                      ? `0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.15), -4px 0 0 ${category.color}`
                      : `0 12px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05), -4px 0 0 ${category.color}`
                    : isMom
                      ? `0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1), -4px 0 0 ${category.color}`
                      : `0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03), -4px 0 0 ${category.color}`,
                  border: isMom ? undefined : `1px solid hsl(220 30% 22%)`,
                }}
              >
                {/* Check-in banner */}
                {inCheckinWindow && (
                  <div
                    className="px-4 py-2 flex items-center gap-2"
                    style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.15), transparent)" }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[10px] font-display font-bold text-primary uppercase tracking-wider">
                      Acontecendo agora — Faça check-in!
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Time + category */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${category.color}, ${category.color}cc)`,
                            boxShadow: `0 3px 8px ${category.color}40`,
                          }}
                        >
                          {format(eventDate, "HH")}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm leading-tight" style={!isMom ? { color: "hsl(220 15% 90%)" } : undefined}>{event.title}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" style={!isMom ? { color: "hsl(220 15% 70%)" } : undefined} />
                            <span className={`text-[10px] font-body ${isMom ? "text-muted-foreground" : ""}`}
                              style={!isMom ? { color: "hsl(220 15% 75%)" } : undefined}>
                              {format(eventDate, "HH:mm")} · {category.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Who added it */}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={isDadEvent ? "default" : "secondary"}
                          className="text-[9px] h-5"
                        >
                          {isDadEvent ? (
                            <><Sparkles className="w-2.5 h-2.5 mr-1" /> Pai adicionou</>
                          ) : (
                            "Mãe adicionou"
                          )}
                        </Badge>
                        <span className="text-[9px] font-body" style={!isMom ? { color: "hsl(220 15% 60%)" } : { color: "hsl(var(--muted-foreground) / 0.5)" }}>
                          {getTimeLabel(eventDate)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 mt-2 ${isExpanded ? "rotate-90" : ""}`} style={!isMom ? { color: "hsl(220 15% 55%)" } : { color: "hsl(var(--muted-foreground) / 0.4)" }} />
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 space-y-3 animate-fade-in" style={{ borderTop: isMom ? "1px solid hsl(var(--muted) / 0.3)" : "1px solid hsl(220 30% 22%)" }}>
                      {event.description && (
                        <p className="text-xs font-body" style={!isMom ? { color: "hsl(220 15% 75%)" } : { color: "hsl(var(--muted-foreground))" }}>
                          📝 {event.description}
                        </p>
                      )}

                      <p className="text-[10px] font-body italic" style={!isMom ? { color: "hsl(220 15% 65%)" } : { color: "hsl(var(--muted-foreground) / 0.7)" }}>
                        {isDadEvent
                          ? "Você mesmo adicionou. Parabéns pela iniciativa."
                          : isPast
                            ? "Passou. Espero que você tenha ido."
                            : "A mãe adicionou. Sem surpresas, né?"
                        }
                      </p>

                      <div className="flex gap-2">
                        {inCheckinWindow && (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-primary flex-1"
                            onClick={(e) => { e.stopPropagation(); checkinMutation.mutate({ eventId: event.id }); }}
                          >
                            <Camera className="w-3.5 h-3.5 mr-1" />
                            Check-in 📸
                          </Button>
                        )}
                        {!isDadEvent && !isPast && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-8 border-secondary/50 text-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast("Claro, você sabia. A gente acredita. 🙄");
                            }}
                          >
                            👆 Eu já sabia!
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming section when no date selected or showing all */}
      {upcomingEvents.length > 0 && filteredEvents.length === 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider px-1">
            Próximos eventos
          </p>
          {upcomingEvents.slice(0, 5).map(event => {
            const eventDate = new Date(event.event_date);
            const category = getCategoryInfo(event.event_type);
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card"
                style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-2 h-8 rounded-full shrink-0"
                  style={{ background: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-bold truncate">{event.title}</p>
                  <p className="text-[9px] text-muted-foreground font-body">
                    {format(eventDate, "dd/MM · HH:mm")}
                  </p>
                </div>
                <span className="text-[9px] text-muted-foreground font-body shrink-0">
                  {getTimeLabel(eventDate)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-20 right-4 z-40 rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 px-5 h-12"
        style={{
          background: isMom
            ? "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(var(--mom-accent-hover)))"
            : "linear-gradient(135deg, hsl(var(--arena-electric)), hsl(var(--arena-neon)))",
          color: "white",
          boxShadow: isMom
            ? "0 6px 20px hsl(var(--mom-accent) / 0.4)"
            : "0 6px 20px hsl(var(--arena-electric) / 0.4), 0 0 30px hsl(var(--arena-neon) / 0.15)",
        }}
      >
        <Plus className="w-5 h-5" />
        <span className="font-display text-sm font-bold">Novo evento</span>
      </button>

      {/* Add Event Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">
              {isMom ? "📋 Novo Compromisso" : "✨ Novo Evento"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-display font-bold">Nome do evento</Label>
              <Input
                placeholder="Ex: Reunião na escola"
                value={newEvent.title}
                onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs font-display font-bold">Data</Label>
                <Input
                  type="date"
                  value={newEvent.event_date}
                  onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div className="w-28">
                <Label className="text-xs font-display font-bold">Hora</Label>
                <Input
                  type="time"
                  value={newEvent.event_time}
                  onChange={e => setNewEvent(p => ({ ...p, event_time: e.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-display font-bold">Categoria</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EVENT_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setNewEvent(p => ({ ...p, event_type: c.value }))}
                    className={`px-3 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                      newEvent.event_type === c.value
                        ? "scale-105 ring-2 ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      background: newEvent.event_type === c.value ? `${c.color}20` : "hsl(var(--muted))",
                      color: newEvent.event_type === c.value ? c.color : undefined,
                      ["--tw-ring-color" as any]: c.color,
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-display font-bold">Notas (opcional)</Label>
              <Textarea
                placeholder="Detalhes, endereço, etc."
                value={newEvent.description}
                onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                className="mt-1 min-h-[60px] rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
              <div>
                <Label className="text-xs font-display font-bold">
                  {isMom ? "Avisar o pai?" : "Avisar a mãe?"}
                </Label>
                <p className="text-[9px] text-muted-foreground font-body">
                  {isMom ? "Ele provavelmente não vai ler, mas tenta." : "Ela vai ver."}
                </p>
              </div>
              <Switch
                checked={newEvent.notify_partner}
                onCheckedChange={v => setNewEvent(p => ({ ...p, notify_partner: v }))}
              />
            </div>

            <Button
              className="w-full font-display font-bold h-12 rounded-xl text-sm"
              style={{
                background: isMom
                  ? "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(var(--mom-accent-hover)))"
                  : "linear-gradient(135deg, hsl(var(--arena-electric)), hsl(var(--arena-neon)))",
                boxShadow: isMom
                  ? "0 4px 16px hsl(var(--mom-accent) / 0.3)"
                  : "0 4px 16px hsl(var(--arena-electric) / 0.3)",
              }}
              onClick={() => addEventMutation.mutate()}
              disabled={!newEvent.title || !newEvent.event_date || addEventMutation.isPending}
            >
              {addEventMutation.isPending ? "Salvando..." : "✅ Salvar Evento"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
