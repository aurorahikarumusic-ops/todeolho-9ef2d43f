
DROP POLICY "System can insert message logs" ON public.whatsapp_message_log;

CREATE POLICY "Authenticated users can insert their own message logs"
  ON public.whatsapp_message_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
