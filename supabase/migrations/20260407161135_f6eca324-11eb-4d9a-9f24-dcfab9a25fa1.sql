-- Re-apply the SELECT policy fix (previous migration rolled back)
DROP POLICY IF EXISTS "Users can view task proofs in their family" ON storage.objects;

CREATE POLICY "Users can view task proofs in their family"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'task-proofs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id::text = (storage.foldername(name))[1]
          AND p.family_id = public.get_current_user_family_id()
      )
    )
  );

-- Remove unnecessary tables from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.mom_ratings;
ALTER PUBLICATION supabase_realtime DROP TABLE public.monthly_challenges;
ALTER PUBLICATION supabase_realtime DROP TABLE public.pearl_posts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.pearl_reactions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.grandma_suggestions;