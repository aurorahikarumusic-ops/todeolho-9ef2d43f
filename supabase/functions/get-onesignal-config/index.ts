const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  if (!appId) {
    return new Response(JSON.stringify({ error: "OneSignal not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ appId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
