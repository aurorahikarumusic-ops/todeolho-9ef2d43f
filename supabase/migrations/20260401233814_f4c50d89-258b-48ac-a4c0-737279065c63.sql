
-- Table for WhatsApp subscriptions
CREATE TABLE public.whatsapp_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  otp_code TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB NOT NULL DEFAULT '{
    "task_reminders": true,
    "event_alerts": true,
    "weekly_summary": true,
    "ranking_alerts": true,
    "absent_mode": true,
    "daily_mission": true
  }'::jsonb,
  preferred_time TIME NOT NULL DEFAULT '08:00:00',
  paused_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_whatsapp_subscriptions_user_id ON public.whatsapp_subscriptions(user_id);

CREATE POLICY "Users can view their own subscription"
  ON public.whatsapp_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.whatsapp_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.whatsapp_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_subscriptions_updated_at
  BEFORE UPDATE ON public.whatsapp_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table for message logs
CREATE TABLE public.whatsapp_message_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent'
);

ALTER TABLE public.whatsapp_message_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_whatsapp_message_log_user_id ON public.whatsapp_message_log(user_id);

CREATE POLICY "Users can view their own message logs"
  ON public.whatsapp_message_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert message logs"
  ON public.whatsapp_message_log FOR INSERT
  WITH CHECK (true);
