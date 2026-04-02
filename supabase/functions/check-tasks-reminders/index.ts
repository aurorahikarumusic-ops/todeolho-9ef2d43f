import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

    if (!LOVABLE_API_KEY || !TWILIO_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API keys" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get active WhatsApp subscriptions with task_reminders enabled
    const { data: subs } = await supabase
      .from("whatsapp_subscriptions")
      .select("*")
      .eq("verified", true)
      .eq("active", true);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const sub of subs) {
      const prefs = sub.preferences as Record<string, boolean>;
      if (!prefs?.task_reminders) continue;
      if (sub.paused_until && new Date(sub.paused_until) > now) continue;

      // Get profile for name and family
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, family_id")
        .eq("user_id", sub.user_id)
        .single();

      if (!profile?.family_id) continue;
      const name = profile.display_name?.split(" ")[0] || "Pai";

      // 24h reminders
      const { data: tasks24h } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null)
        .gte("due_date", now.toISOString())
        .lte("due_date", in24h.toISOString());

      for (const task of tasks24h || []) {
        const dueDate = new Date(task.due_date).toLocaleString("pt-BR");
        const msg = `👁️ *Estou de Olho*\nEi, ${name}. Amanhã você tem uma tarefa:\n📌 *${task.title}*\nPrazo: ${dueDate}\n\nDessa vez não esquece, tá? A gente tá de olho. 👀`;

        await sendWhatsApp(sub.phone_number, msg, LOVABLE_API_KEY, TWILIO_API_KEY, TWILIO_WHATSAPP_FROM);

        await supabase.from("whatsapp_message_log").insert({
          user_id: sub.user_id,
          message_type: "task_reminder_24h",
          message_content: msg,
          status: "sent",
        });
        sent++;
      }

      // 2h reminders
      const in2hStart = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
      const { data: tasks2h } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null)
        .gte("due_date", in2hStart.toISOString())
        .lte("due_date", in2h.toISOString());

      for (const task of tasks2h || []) {
        const msg = `⏰ *Tô de Olho — URGENTE*\n${name}, faltam 2 horas.\n📌 *${task.title}*\n\nSe você não sabia disso até agora... bom. Agora sabe.`;

        await sendWhatsApp(sub.phone_number, msg, LOVABLE_API_KEY, TWILIO_API_KEY, TWILIO_WHATSAPP_FROM);

        await supabase.from("whatsapp_message_log").insert({
          user_id: sub.user_id,
          message_type: "task_reminder_2h",
          message_content: msg,
          status: "sent",
        });
        sent++;
      }

      // Missed tasks
      const { data: missedTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null)
        .lt("due_date", now.toISOString());

      for (const task of missedTasks || []) {
        const msg = `😬 *Tô de Olho*\n${name}. A tarefa *${task.title}* venceu.\nVocê não concluiu.\n\nSeus pontos agradeceriam se você tivesse feito.\nMas tudo bem. A mãe já resolveu. De novo.`;

        await sendWhatsApp(sub.phone_number, msg, LOVABLE_API_KEY, TWILIO_API_KEY, TWILIO_WHATSAPP_FROM);

        await supabase.from("whatsapp_message_log").insert({
          user_id: sub.user_id,
          message_type: "task_missed",
          message_content: msg,
          status: "sent",
        });
        sent++;
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendWhatsApp(phone: string, body: string, lovableKey: string, twilioKey: string, from: string) {
  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `whatsapp:${phone}`,
      From: from,
      Body: body,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Twilio error [${response.status}]: ${JSON.stringify(data)}`);
  return data;
}
