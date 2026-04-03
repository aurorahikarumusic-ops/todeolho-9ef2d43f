import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface NotifyRequest {
  event_type: "task_created" | "task_completed" | "task_approved" | "task_reproved" | "task_rescued" | "rating_submitted" | "event_created";
  family_id: string;
  sender_id: string;
  data?: Record<string, unknown>;
}

const MESSAGES: Record<string, (name: string, data?: Record<string, unknown>) => { heading: string; content: string }> = {
  task_created: (name, data) => ({
    heading: "📋 Nova tarefa!",
    content: [
      `${name} criou: "${data?.title}". Você sabia disso? Não? Típico.`,
      `"${data?.title}" — adicionada por ${name}. Não finge que não viu.`,
      `Nova tarefa: "${data?.title}". ${name} tá de olho. Literalmente.`,
      `${name} criou "${data?.title}". O relógio já tá contando.`,
      `"${data?.title}" — a desculpa "não sabia" acabou de expirar.`,
    ][Math.floor(Math.random() * 5)],
  }),
  task_completed: (name, data) => ({
    heading: "✅ Tarefa concluída!",
    content: [
      `${name} concluiu "${data?.title}". Vai lá conferir.`,
      `"${data?.title}" feita pelo ${name}. Foto enviada? Vai ver.`,
      `${name} marcou "${data?.title}" como feita. Será? Confere lá.`,
    ][Math.floor(Math.random() * 3)],
  }),
  task_approved: (name, data) => ({
    heading: "🎉 Tarefa aprovada!",
    content: `${name} aprovou! +${data?.points || 50} pontos. Você fez mesmo.`,
  }),
  task_reproved: (name, data) => ({
    heading: "❌ Tarefa reprovada",
    content: `${name} reprovou "${data?.title}". ${data?.comment ? `Motivo: "${data.comment}"` : "Tenta de novo."}`,
  }),
  task_rescued: (name, data) => ({
    heading: "🛟 Resgate!",
    content: `${name} resolveu "${data?.title}" por você. Resgate registrado. -30 pontos.`,
  }),
  rating_submitted: (name, data) => ({
    heading: "⭐ Avaliação semanal",
    content: `${name} te avaliou: ${data?.stars}★. ${data?.comment ? `"${data.comment}"` : "Vai ver no ranking."}`,
  }),
  event_created: (name, data) => ({
    heading: "🗓️ Novo evento!",
    content: `${name} adicionou: "${data?.title}". Mesmo que diga que não sabia, agora sabe.`,
  }),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OneSignal config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: NotifyRequest = await req.json();
    const { event_type, family_id, sender_id, data } = body;

    if (!event_type || !family_id || !sender_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get sender name
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", sender_id)
      .single();

    const senderName = senderProfile?.display_name?.split(" ")[0] || "Alguém";

    // Get all family members except sender
    const { data: targets } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("family_id", family_id)
      .neq("user_id", sender_id);

    if (!targets || targets.length === 0) {
      return new Response(JSON.stringify({ message: "No targets" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const msgFn = MESSAGES[event_type];
    if (!msgFn) {
      return new Response(JSON.stringify({ error: "Unknown event_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const msg = msgFn(senderName, data);
    const targetIds = targets.map((t) => t.user_id);

    // Determine sound based on urgency
    let androidSound = "task_alert";
    let iosSound = "task_alert.wav";
    if (data?.urgency === "critico") {
      androidSound = "urgent_alert";
      iosSound = "urgent_alert.wav";
    } else if (data?.urgency === "urgente") {
      androidSound = "warning_alert";
      iosSound = "warning_alert.wav";
    }

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: targetIds },
      target_channel: "push",
      headings: { en: msg.heading },
      contents: { en: msg.content },
      android_sound: androidSound,
      ios_sound: iosSound,
      data: { type: event_type, ...data },
      priority: event_type === "task_created" && data?.urgency === "critico" ? 10 : 5,
      ttl: 86400,
    };

    console.log("Sending cross-panel notification:", event_type, "to:", targetIds);

    const onesignalRes = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await onesignalRes.json();
    console.log("OneSignal response:", JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, recipients: targetIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
