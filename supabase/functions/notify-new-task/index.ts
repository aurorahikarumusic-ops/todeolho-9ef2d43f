import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error("Missing OneSignal keys");
      return new Response(JSON.stringify({ error: "Missing OneSignal configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type, record } = body;

    // Supported notification types
    if (type === "INSERT" && record) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      // Get the task creator's profile to know the family
      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("display_name, family_id")
        .eq("user_id", record.created_by)
        .single();

      if (!creatorProfile?.family_id) {
        return new Response(JSON.stringify({ error: "No family found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get all family members EXCEPT the creator (they don't need to be notified)
      const { data: familyMembers } = await supabase
        .from("profiles")
        .select("user_id, display_name, role")
        .eq("family_id", creatorProfile.family_id)
        .neq("user_id", record.created_by);

      if (!familyMembers || familyMembers.length === 0) {
        return new Response(JSON.stringify({ message: "No family members to notify" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Build notification messages based on who created it
      const creatorName = creatorProfile.display_name?.split(" ")[0] || "Alguém";
      const isFromMom = familyMembers.some(m => m.role === "pai"); // If family members include "pai", creator is likely mom

      const ironicMessages = [
        `📌 ${creatorName} adicionou: "${record.title}". Você sabia disso? Não? Típico.`,
        `🚨 Nova tarefa: "${record.title}". ${creatorName} tá de olho. Literalmente.`,
        `👁️ "${record.title}" — adicionada por ${creatorName}. Não finge que não viu.`,
        `📋 Tarefa nova: "${record.title}". A desculpa "não sabia" acabou de expirar.`,
        `⚡ ${creatorName} criou "${record.title}". O relógio já tá contando.`,
      ];

      const randomMessage = ironicMessages[Math.floor(Math.random() * ironicMessages.length)];

      // Get external_user_ids for OneSignal targeting
      const targetUserIds = familyMembers.map(m => m.user_id);

      // Send via OneSignal REST API
      const notificationPayload: Record<string, unknown> = {
        app_id: ONESIGNAL_APP_ID,
        include_aliases: {
          external_id: targetUserIds,
        },
        target_channel: "push",
        headings: { en: "Estou de Olho 👁️" },
        contents: { en: randomMessage },
        // Custom sound for Android
        android_channel_id: undefined, // Will use default or custom channel
        android_sound: "task_alert",
        // iOS sound
        ios_sound: "task_alert.wav",
        // Additional data
        data: {
          type: "new_task",
          task_id: record.id,
          task_title: record.title,
        },
        // Priority
        priority: 10,
        // TTL: 24 hours
        ttl: 86400,
      };

      console.log("Sending OneSignal notification to:", targetUserIds);

      const onesignalResponse = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify(notificationPayload),
      });

      const onesignalResult = await onesignalResponse.json();
      console.log("OneSignal response:", JSON.stringify(onesignalResult));

      if (!onesignalResponse.ok) {
        console.error("OneSignal error:", onesignalResult);
        return new Response(JSON.stringify({ error: "OneSignal send failed", details: onesignalResult }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, recipients: targetUserIds.length, onesignal: onesignalResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Manual trigger endpoint
    if (body.task_id && body.family_id) {
      // Manual notification trigger from frontend
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", body.task_id)
        .single();

      if (task) {
        // Recursively call with INSERT format
        const insertBody = { type: "INSERT", record: task };
        // Process inline
        return Deno.serve.prototype === undefined
          ? new Response(JSON.stringify({ message: "Use webhook trigger" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            })
          : new Response(JSON.stringify({ message: "Use webhook trigger" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
      }
    }

    return new Response(JSON.stringify({ message: "No action taken" }), {
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
