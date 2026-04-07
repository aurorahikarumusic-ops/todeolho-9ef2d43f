CREATE POLICY "Authenticated can view avo profiles for ranking"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'avo');