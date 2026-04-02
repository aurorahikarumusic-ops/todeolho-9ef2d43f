CREATE POLICY "Family members can delete tasks"
ON public.tasks
FOR DELETE
USING (family_id IN (
  SELECT profiles.family_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));