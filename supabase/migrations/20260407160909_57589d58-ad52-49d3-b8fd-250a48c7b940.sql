-- Fix love_letters DELETE policies: change from public to authenticated
DROP POLICY IF EXISTS "Recipients can delete received letters" ON public.love_letters;
CREATE POLICY "Recipients can delete received letters"
  ON public.love_letters FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Senders can delete own letters" ON public.love_letters;
CREATE POLICY "Senders can delete own letters"
  ON public.love_letters FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Fix monthly_challenges policies: change from public to authenticated
DROP POLICY IF EXISTS "Family members can view challenges" ON public.monthly_challenges;
CREATE POLICY "Family members can view challenges"
  ON public.monthly_challenges FOR SELECT
  TO authenticated
  USING (family_id = get_current_user_family_id());

DROP POLICY IF EXISTS "Mom can create challenges" ON public.monthly_challenges;
CREATE POLICY "Mom can create challenges"
  ON public.monthly_challenges FOR INSERT
  TO authenticated
  WITH CHECK (family_id = get_current_user_family_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'mae'
  ));

DROP POLICY IF EXISTS "Mom can delete challenges" ON public.monthly_challenges;
CREATE POLICY "Mom can delete challenges"
  ON public.monthly_challenges FOR DELETE
  TO authenticated
  USING (family_id = get_current_user_family_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'mae'
  ));

DROP POLICY IF EXISTS "Mom can update challenges" ON public.monthly_challenges;
CREATE POLICY "Mom can update challenges"
  ON public.monthly_challenges FOR UPDATE
  TO authenticated
  USING (family_id = get_current_user_family_id() AND EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'mae'
  ));