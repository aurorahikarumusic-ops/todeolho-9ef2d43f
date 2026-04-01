
-- Create a security definer function to get user's family_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_current_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Drop existing recursive policies on profiles
DROP POLICY IF EXISTS "Users can view profiles in their family" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate non-recursive policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view family profiles" ON public.profiles
  FOR SELECT USING (
    family_id IS NOT NULL AND family_id = public.get_current_user_family_id(auth.uid())
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix children table policies
DROP POLICY IF EXISTS "Users can view children in their family" ON public.children;
DROP POLICY IF EXISTS "Users can insert children in their family" ON public.children;
DROP POLICY IF EXISTS "Users can update children in their family" ON public.children;

CREATE POLICY "Users can view children in their family" ON public.children
  FOR SELECT USING (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can insert children in their family" ON public.children
  FOR INSERT WITH CHECK (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can update children in their family" ON public.children
  FOR UPDATE USING (family_id = public.get_current_user_family_id(auth.uid()));

-- Fix tasks table policies
DROP POLICY IF EXISTS "Users can view tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their family" ON public.tasks;

CREATE POLICY "Users can view tasks in their family" ON public.tasks
  FOR SELECT USING (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can insert tasks in their family" ON public.tasks
  FOR INSERT WITH CHECK (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can update tasks in their family" ON public.tasks
  FOR UPDATE USING (family_id = public.get_current_user_family_id(auth.uid()));

-- Fix events table policies
DROP POLICY IF EXISTS "Users can view events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can insert events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can update events in their family" ON public.events;

CREATE POLICY "Users can view events in their family" ON public.events
  FOR SELECT USING (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can insert events in their family" ON public.events
  FOR INSERT WITH CHECK (family_id = public.get_current_user_family_id(auth.uid()));

CREATE POLICY "Users can update events in their family" ON public.events
  FOR UPDATE USING (family_id = public.get_current_user_family_id(auth.uid()));

-- Fix achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix whatsapp_subscriptions policies
DROP POLICY IF EXISTS "Users can manage own whatsapp subscription" ON public.whatsapp_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.whatsapp_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.whatsapp_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.whatsapp_subscriptions;

CREATE POLICY "Users can view own subscription" ON public.whatsapp_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.whatsapp_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.whatsapp_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix whatsapp_message_log policies
DROP POLICY IF EXISTS "Users can view own message log" ON public.whatsapp_message_log;
DROP POLICY IF EXISTS "Users can insert message log" ON public.whatsapp_message_log;

CREATE POLICY "Users can view own message log" ON public.whatsapp_message_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert message log" ON public.whatsapp_message_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
