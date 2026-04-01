import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured. Please connect Twilio first.");

    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

    // Auth check
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    const { action, phone_number, message, user_id, message_type, otp_code } = await req.json();

    if (action === "send_otp") {
      // Generate OTP and send via WhatsApp
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Upsert subscription with OTP
      const { error: upsertError } = await supabase
        .from("whatsapp_subscriptions")
        .upsert({
          user_id,
          phone_number,
          otp_code: code,
          otp_expires_at: expiresAt,
          verified: false,
        }, { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      // Send OTP via WhatsApp
      const whatsappMsg = `👁️ *Tô de Olho — Verificação*\n\nSeu código: *${code}*\n\nVálido por 10 minutos.\nSe não foi você... bom, alguém quer te ajudar a ser um pai melhor.`;

      const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${phone_number}`,
          From: TWILIO_WHATSAPP_FROM,
          Body: whatsappMsg,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Twilio error [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify_otp") {
      const { data: sub, error } = await supabase
        .from("whatsapp_subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (error || !sub) throw new Error("Subscription not found");

      if (sub.otp_code !== otp_code) {
        return new Response(JSON.stringify({ success: false, error: "Código inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new Date(sub.otp_expires_at) < new Date()) {
        return new Response(JSON.stringify({ success: false, error: "Código expirado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark verified
      await supabase
        .from("whatsapp_subscriptions")
        .update({ verified: true, active: true, otp_code: null, otp_expires_at: null })
        .eq("user_id", user_id);

      // Send welcome message
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user_id)
        .single();

      const name = profile?.display_name?.split(" ")[0] || "Pai";

      const welcomeMsg = `👁️ *Tô de Olho — Bot Ativado*\nOlá, ${name}.\n\nA partir de agora eu vou te lembrar de tudo que você deveria lembrar sozinho.\n\nNão é assim que deveria funcionar, mas tudo bem.\nA gente se adapta.\n\nPara pausar notificações: responda *PAUSAR*\nPara reativar: responda *ATIVAR*\nPara ver sua agenda hoje: responda *AGENDA*\nPara ver seu ranking: responda *RANKING*\n\nBem-vindo ao clube dos pais que precisam de ajuda.\nSão muitos. Você não está sozinho.`;

      await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${sub.phone_number}`,
          From: TWILIO_WHATSAPP_FROM,
          Body: welcomeMsg,
        }),
      });

      return new Response(JSON.stringify({ success: true, verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_message") {
      // Generic send message
      if (!phone_number || !message) throw new Error("phone_number and message required");

      const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${phone_number}`,
          From: TWILIO_WHATSAPP_FROM,
          Body: message,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Twilio error [${response.status}]: ${JSON.stringify(data)}`);
      }

      // Log the message
      if (user_id) {
        await supabase.from("whatsapp_message_log").insert({
          user_id,
          message_type: message_type || "generic",
          message_content: message,
          status: "sent",
        });
      }

      return new Response(JSON.stringify({ success: true, sid: data.sid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "send_test") {
      const { data: sub } = await supabase
        .from("whatsapp_subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("verified", true)
        .single();

      if (!sub) throw new Error("WhatsApp não verificado");

      const testMsg = "🧪 *Teste do Bot — Funcionou!*\nAgora você não tem desculpa.\n\nSe recebeu essa mensagem, o bot tá funcionando.\nE você vai ser lembrado de tudo. De. Tudo. 👀";

      const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWILIO_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${sub.phone_number}`,
          From: TWILIO_WHATSAPP_FROM,
          Body: testMsg,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Twilio error: ${JSON.stringify(data)}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
