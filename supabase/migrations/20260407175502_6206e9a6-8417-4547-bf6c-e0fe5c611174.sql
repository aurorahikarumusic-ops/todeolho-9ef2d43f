CREATE POLICY "Authenticated can view pai profiles for ranking"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'pai');