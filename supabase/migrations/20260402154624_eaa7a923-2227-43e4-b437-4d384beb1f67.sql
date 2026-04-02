
-- 1. Add DELETE policy for children
CREATE POLICY "Family members can delete children" ON public.children
  FOR DELETE USING (family_id = get_current_user_family_id());

-- 2. Add DELETE policy for whatsapp_subscriptions
CREATE POLICY "Users can delete own subscription" ON public.whatsapp_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Create separate table for push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscription" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscription" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscription" ON public.push_subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscription" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Migrate existing push_subscription data
INSERT INTO public.push_subscriptions (user_id, subscription)
SELECT user_id, push_subscription
FROM public.profiles
WHERE push_subscription IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
