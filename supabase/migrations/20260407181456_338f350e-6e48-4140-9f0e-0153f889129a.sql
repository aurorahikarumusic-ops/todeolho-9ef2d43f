-- Fix: Replace broad ranking SELECT policy with one that doesn't expose sensitive fields
-- We can't restrict columns in RLS, so we create a secure view instead

-- Create a secure ranking view that only exposes necessary fields
CREATE OR REPLACE VIEW public.ranking_view AS
SELECT id, user_id, display_name, points, streak_days, avatar_url, role
FROM public.profiles
WHERE role = 'pai';

-- Grant access to the view
GRANT SELECT ON public.ranking_view TO authenticated;
GRANT SELECT ON public.ranking_view TO anon;

-- Fix grandma_suggestions UPDATE policy to scope by family
DROP POLICY IF EXISTS "Moms can adopt suggestions" ON public.grandma_suggestions;
CREATE POLICY "Moms can adopt suggestions"
ON public.grandma_suggestions
FOR UPDATE
USING (
  (auth.uid() = user_id)
  OR (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'mae'
    )
    AND (
      family_id IS NULL
      OR family_id = get_current_user_family_id()
      OR adopted_family_id = get_current_user_family_id()
    )
  )
);