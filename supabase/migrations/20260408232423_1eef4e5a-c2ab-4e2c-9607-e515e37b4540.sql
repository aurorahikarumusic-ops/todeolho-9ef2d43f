
-- Remove a política que causa recursão
DROP POLICY IF EXISTS "Family members can view each other profiles" ON public.profiles;

-- Criar função security definer para pegar family_id sem recursão
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Recriar política usando a função segura
CREATE POLICY "Family members can view each other profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  family_id IS NOT NULL 
  AND family_id = public.get_user_family_id(auth.uid())
);
