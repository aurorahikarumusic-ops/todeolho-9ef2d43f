
-- FIX 1: Remover políticas permissivas de profiles
DROP POLICY IF EXISTS "Authenticated can view avo profiles for ranking" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view pai profiles for ranking" ON public.profiles;

-- Adicionar política de família (a de próprio usuário já existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Family members can view each other profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Family members can view each other profiles"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        family_id IS NOT NULL 
        AND family_id = (SELECT p.family_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1)
      )
    $policy$;
  END IF;
END $$;

-- FIX 2: Grandma Suggestions
DROP POLICY IF EXISTS "Moms can adopt suggestions" ON public.grandma_suggestions;

CREATE POLICY "Moms can adopt suggestions"
ON public.grandma_suggestions
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (
    family_id = (SELECT p.family_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    OR family_id IS NULL
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    adopted_family_id = (SELECT p.family_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    OR family_id = (SELECT p.family_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1)
    OR family_id IS NULL
  )
);
