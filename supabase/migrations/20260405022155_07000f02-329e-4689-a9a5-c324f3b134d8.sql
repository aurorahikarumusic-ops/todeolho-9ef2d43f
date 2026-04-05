
-- 1. Fix whatsapp_subscriptions SELECT: change from public to authenticated
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.whatsapp_subscriptions;
CREATE POLICY "Users can view their own subscription"
ON public.whatsapp_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Also fix INSERT/UPDATE/DELETE to authenticated
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.whatsapp_subscriptions;
CREATE POLICY "Users can insert their own subscription"
ON public.whatsapp_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.whatsapp_subscriptions;
CREATE POLICY "Users can update their own subscription"
ON public.whatsapp_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subscription" ON public.whatsapp_subscriptions;
CREATE POLICY "Users can delete own subscription"
ON public.whatsapp_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Remove old public storage policy for task-proofs
DROP POLICY IF EXISTS "Task proof images are publicly accessible" ON storage.objects;

-- 3. Remove overly broad upload policy, keep only folder-scoped one
DROP POLICY IF EXISTS "Authenticated users can upload task proofs" ON storage.objects;

-- 4. Fix grandma_suggestions SELECT: restrict to own or same family
DROP POLICY IF EXISTS "Anyone authenticated can view suggestions" ON public.grandma_suggestions;
CREATE POLICY "Users can view relevant suggestions"
ON public.grandma_suggestions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR family_id = get_current_user_family_id()
  OR adopted_family_id = get_current_user_family_id()
  OR (family_id IS NULL AND status = 'pendente')
);

-- 5. Restrict achievements INSERT to service role only (no client insert)
-- RLS already blocks INSERT (no policy exists), which is correct for server-only inserts
