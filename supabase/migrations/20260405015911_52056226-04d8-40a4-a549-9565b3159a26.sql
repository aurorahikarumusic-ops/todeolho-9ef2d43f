
-- Fix permissive UPDATE policy
DROP POLICY IF EXISTS "Moms can adopt suggestions" ON public.grandma_suggestions;

CREATE POLICY "Moms can adopt suggestions"
ON public.grandma_suggestions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'mae'
  )
  OR auth.uid() = user_id
);
