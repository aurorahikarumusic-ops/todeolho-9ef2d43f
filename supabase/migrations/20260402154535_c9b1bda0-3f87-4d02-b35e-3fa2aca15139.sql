
-- 1. Remove direct INSERT policy on achievements - only service role should grant badges
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

-- 2. Drop and recreate function without the misleading parameter
-- First update RLS policies that reference the old function signature
DROP POLICY IF EXISTS "Users can insert tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert children in their family" ON public.children;
DROP POLICY IF EXISTS "Users can update children in their family" ON public.children;
DROP POLICY IF EXISTS "Users can view children in their family" ON public.children;
DROP POLICY IF EXISTS "Users can insert events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can update events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can view events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can view family profiles" ON public.profiles;

-- Drop and recreate the function without parameter
DROP FUNCTION IF EXISTS public.get_current_user_family_id(uuid);

CREATE OR REPLACE FUNCTION public.get_current_user_family_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Recreate all policies using the new function (no parameter)
CREATE POLICY "Users can view tasks in their family" ON public.tasks
  FOR SELECT USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can insert tasks in their family" ON public.tasks
  FOR INSERT WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Users can update tasks in their family" ON public.tasks
  FOR UPDATE USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can view children in their family" ON public.children
  FOR SELECT USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can insert children in their family" ON public.children
  FOR INSERT WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Users can update children in their family" ON public.children
  FOR UPDATE USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can view events in their family" ON public.events
  FOR SELECT USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can insert events in their family" ON public.events
  FOR INSERT WITH CHECK (family_id = get_current_user_family_id());

CREATE POLICY "Users can update events in their family" ON public.events
  FOR UPDATE USING (family_id = get_current_user_family_id());

CREATE POLICY "Users can view family profiles" ON public.profiles
  FOR SELECT USING (
    (family_id IS NOT NULL) AND (family_id = get_current_user_family_id())
  );
