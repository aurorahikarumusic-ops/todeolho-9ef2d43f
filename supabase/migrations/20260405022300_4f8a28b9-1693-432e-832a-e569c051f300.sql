
-- 1. Fix mom_ratings policies: scope to authenticated only
DROP POLICY IF EXISTS "Raters can insert ratings" ON public.mom_ratings;
CREATE POLICY "Raters can insert ratings"
ON public.mom_ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = rated_by);

DROP POLICY IF EXISTS "Raters can update their ratings" ON public.mom_ratings;
CREATE POLICY "Raters can update their ratings"
ON public.mom_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = rated_by);

DROP POLICY IF EXISTS "Users can view ratings about them" ON public.mom_ratings;
CREATE POLICY "Users can view ratings about them"
ON public.mom_ratings FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = rated_by);

-- 2. Fix children policies: scope to authenticated
DROP POLICY IF EXISTS "Users can view children in their family" ON public.children;
CREATE POLICY "Users can view children in their family"
ON public.children FOR SELECT
TO authenticated
USING (family_id = get_current_user_family_id());

DROP POLICY IF EXISTS "Users can insert children in their family" ON public.children;
CREATE POLICY "Users can insert children in their family"
ON public.children FOR INSERT
TO authenticated
WITH CHECK (family_id = get_current_user_family_id());

DROP POLICY IF EXISTS "Users can update children in their family" ON public.children;
CREATE POLICY "Users can update children in their family"
ON public.children FOR UPDATE
TO authenticated
USING (family_id = get_current_user_family_id());

DROP POLICY IF EXISTS "Family members can delete children" ON public.children;
CREATE POLICY "Family members can delete children"
ON public.children FOR DELETE
TO authenticated
USING (family_id = get_current_user_family_id());
