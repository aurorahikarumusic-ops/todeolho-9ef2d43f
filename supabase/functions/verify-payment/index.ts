import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    // Authenticate user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header missing");
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await anonClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, status: session.payment_status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const letterId = session.metadata?.letter_id;
    const userId = session.metadata?.user_id;

    if (!letterId || userId !== user.id) {
      throw new Error("Invalid session metadata");
    }

    // Mark letter as paid using service role
    const { error: updateErr } = await supabaseClient
      .from("love_letters")
      .update({
        paid: true,
        stripe_payment_id: session.payment_intent as string,
      })
      .eq("id", letterId)
      .eq("sender_id", user.id);

    if (updateErr) throw updateErr;

    // Award points and badge
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("points")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      await supabaseClient
        .from("profiles")
        .update({ points: profile.points + 50 })
        .eq("user_id", user.id);
    }

    // Try to award badge (ignore duplicate)
    await supabaseClient.from("achievements").insert({
      user_id: user.id,
      badge_key: "redimido",
      badge_name: "Redimido",
      badge_emoji: "💌",
    });

    return new Response(
      JSON.stringify({ success: true, letterId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
