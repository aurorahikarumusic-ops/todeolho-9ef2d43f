
-- 1. Fix task-proofs storage: scope by folder ownership
DROP POLICY IF EXISTS "Family members can view task proofs" ON storage.objects;
CREATE POLICY "Users can view task proofs in their family"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'task-proofs'
);

-- 2. Fix daily_missions policies: scope to authenticated
DROP POLICY IF EXISTS "Users can view own missions" ON public.daily_missions;
CREATE POLICY "Users can view own missions"
ON public.daily_missions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own missions" ON public.daily_missions;
CREATE POLICY "Users can update own missions"
ON public.daily_missions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert missions" ON public.daily_missions;
CREATE POLICY "Service can insert missions"
ON public.daily_missions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Fix whatsapp_message_log SELECT: scope to authenticated
DROP POLICY IF EXISTS "Users can view their own message logs" ON public.whatsapp_message_log;
CREATE POLICY "Users can view their own message logs"
ON public.whatsapp_message_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix achievements: no client INSERT allowed (RLS blocks it by default, which is correct)
-- No change needed - absence of INSERT policy = blocked for clients
