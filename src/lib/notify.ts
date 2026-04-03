import { supabase } from "@/integrations/supabase/client";

type EventType = "task_created" | "task_completed" | "task_approved" | "task_reproved" | "task_rescued" | "rating_submitted" | "event_created";

export async function notifyCrossPanel(
  eventType: EventType,
  familyId: string,
  senderId: string,
  data?: Record<string, unknown>
) {
  try {
    await supabase.functions.invoke("notify-cross-panel", {
      body: { event_type: eventType, family_id: familyId, sender_id: senderId, data },
    });
  } catch (err) {
    console.error("Cross-panel notification failed:", err);
  }
}
