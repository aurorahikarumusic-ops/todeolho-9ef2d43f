
-- 1. Fix ranking_group_members: restrict SELECT to only members of groups you belong to
DROP POLICY IF EXISTS "Members can view group members" ON public.ranking_group_members;
CREATE POLICY "Members can view group members" ON public.ranking_group_members
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT rgm.group_id FROM public.ranking_group_members rgm WHERE rgm.user_id = auth.uid()
    )
  );

-- 2. Fix ranking_groups: restrict SELECT to groups you're a member of or created
DROP POLICY IF EXISTS "Authenticated users can view groups" ON public.ranking_groups;
CREATE POLICY "Authenticated users can view groups" ON public.ranking_groups
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT rgm.group_id FROM public.ranking_group_members rgm WHERE rgm.user_id = auth.uid()
    )
  );

-- 3. Remove duplicate policies on whatsapp_subscriptions
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.whatsapp_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.whatsapp_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.whatsapp_subscriptions;

-- 4. Remove duplicate policies on whatsapp_message_log
DROP POLICY IF EXISTS "Users can insert message log" ON public.whatsapp_message_log;
DROP POLICY IF EXISTS "Users can view own message log" ON public.whatsapp_message_log;

-- 5. Remove duplicate policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 6. Remove duplicate policies on achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;

-- 7. Remove duplicate policies on children
DROP POLICY IF EXISTS "Family members can manage their children" ON public.children;
DROP POLICY IF EXISTS "Family members can update their children" ON public.children;
DROP POLICY IF EXISTS "Family members can view their children" ON public.children;

-- 8. Remove duplicate policies on events
DROP POLICY IF EXISTS "Family members can create events" ON public.events;
DROP POLICY IF EXISTS "Family members can update events" ON public.events;
DROP POLICY IF EXISTS "Family members can view events" ON public.events;

-- 9. Remove duplicate policies on tasks
DROP POLICY IF EXISTS "Family members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Family members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Family members can view tasks" ON public.tasks;

-- 10. Add INSERT policy on daily_missions for the edge function (service role handles it, but add for safety)
CREATE POLICY "Service can insert missions" ON public.daily_missions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
