import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MISSIONS = [
  "Manda uma mensagem de voz pro seu filho antes do almoço.",
  "Pergunta pra sua esposa como ela tá. De verdade. Sem celular na mão.",
  "Anota uma coisa que seu filho gosta que você sempre esquece.",
  "Verifica a agenda. Tem algo essa semana que você não sabia.",
  "Manda uma foto sua com seu filho pro álbum do app.",
  "Descobre o nome do melhor amigo do seu filho.",
  "Lembra o nome da professora sem perguntar pra mãe.",
  "Chega em casa hoje sem olhar o celular nos primeiros 10 minutos.",
  "Conta uma história pro seu filho antes de dormir.",
  "Pergunta o que aconteceu na escola hoje. E escuta a resposta.",
];

function getDailyMission(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return MISSIONS[seed % MISSIONS.length];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Validate user via getClaims
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub as string;
    const today = new Date().toISOString().split("T")[0];

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if mission already exists
    const { data: existing } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", userId)
      .eq("mission_date", today)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify(existing), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create new mission
    const { data: created, error } = await supabase
      .from("daily_missions")
      .insert({
        user_id: userId,
        mission_text: getDailyMission(),
        mission_date: today,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(created), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
