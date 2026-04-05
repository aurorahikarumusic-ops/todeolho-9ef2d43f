CREATE POLICY "Senders can delete own letters"
ON public.love_letters
FOR DELETE
USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can delete received letters"
ON public.love_letters
FOR DELETE
USING (auth.uid() = recipient_id);