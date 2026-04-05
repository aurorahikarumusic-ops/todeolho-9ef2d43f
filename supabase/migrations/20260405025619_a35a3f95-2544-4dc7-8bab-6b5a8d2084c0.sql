
-- Create love_letters table
CREATE TABLE public.love_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  tone TEXT NOT NULL DEFAULT 'coracao',
  content TEXT NOT NULL,
  date_label TEXT,
  sender_name TEXT,
  recipient_name TEXT,
  include_signature BOOLEAN NOT NULL DEFAULT false,
  paid BOOLEAN NOT NULL DEFAULT false,
  stripe_payment_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  saved_by_recipient BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.love_letters ENABLE ROW LEVEL SECURITY;

-- Sender can view their own letters
CREATE POLICY "Senders can view own letters"
ON public.love_letters FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

-- Recipient can view letters sent to them
CREATE POLICY "Recipients can view received letters"
ON public.love_letters FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

-- Authenticated users can create letters
CREATE POLICY "Users can create letters"
ON public.love_letters FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Recipients can update (mark opened/saved)
CREATE POLICY "Recipients can update letters"
ON public.love_letters FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- Create redemption_events table
CREATE TABLE public.redemption_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  letter_id UUID REFERENCES public.love_letters(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.redemption_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemption events"
ON public.redemption_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemption events"
ON public.redemption_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own redemption events"
ON public.redemption_events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at on love_letters
CREATE TRIGGER update_love_letters_updated_at
BEFORE UPDATE ON public.love_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
