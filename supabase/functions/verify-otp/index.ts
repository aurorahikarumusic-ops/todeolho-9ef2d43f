import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting: 5 attempts per 5 minutes
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: user.id,
      p_function_name: "verify-otp",
      p_max_requests: 5,
      p_window_seconds: 300,
    });

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde 5 minutos." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { otp_code } = body;

    if (!otp_code || typeof otp_code !== "string" || otp_code.length !== 6) {
      return new Response(JSON.stringify({ error: "Invalid OTP code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the subscription server-side (user never sees the OTP)
    const { data: sub, error: subError } = await supabase
      .from("whatsapp_subscriptions")
      .select("id, otp_code, otp_expires_at")
      .eq("user_id", user.id)
      .single();

    if (subError || !sub) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate OTP
    if (!sub.otp_code || sub.otp_code !== otp_code) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (sub.otp_expires_at && new Date(sub.otp_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "OTP expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified, clear OTP
    const { error: updateError } = await supabase
      .from("whatsapp_subscriptions")
      .update({
        verified: true,
        otp_code: null,
        otp_expires_at: null,
      })
      .eq("id", sub.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to verify" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
