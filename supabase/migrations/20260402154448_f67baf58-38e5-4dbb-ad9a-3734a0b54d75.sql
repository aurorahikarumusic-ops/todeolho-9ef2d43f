
-- 1. Add INSERT policy for achievements (only own user)
CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Add UPDATE/DELETE for ranking_groups (only creator)
CREATE POLICY "Creators can update their groups" ON public.ranking_groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Creators can delete their groups" ON public.ranking_groups
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- 3. Add DELETE for ranking_group_members (users can leave)
CREATE POLICY "Users can leave groups" ON public.ranking_group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 4. Rewrite get_current_user_family_id to use auth.uid() internally
CREATE OR REPLACE FUNCTION public.get_current_user_family_id(_user_id uuid)
  RETURNS uuid
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;
