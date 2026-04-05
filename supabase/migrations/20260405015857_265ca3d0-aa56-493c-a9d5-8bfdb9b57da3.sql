
-- Make family_id nullable so grandmas can post without family
ALTER TABLE public.grandma_suggestions ALTER COLUMN family_id DROP NOT NULL;

-- Add adoption fields
ALTER TABLE public.grandma_suggestions ADD COLUMN adopted_by uuid;
ALTER TABLE public.grandma_suggestions ADD COLUMN adopted_family_id uuid;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Avos can create suggestions" ON public.grandma_suggestions;
DROP POLICY IF EXISTS "Avos can view own suggestions" ON public.grandma_suggestions;
DROP POLICY IF EXISTS "Family can update suggestions" ON public.grandma_suggestions;
DROP POLICY IF EXISTS "Family can view suggestions" ON public.grandma_suggestions;

-- New policies: public mural
CREATE POLICY "Anyone authenticated can view suggestions"
ON public.grandma_suggestions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Avos can create public suggestions"
ON public.grandma_suggestions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moms can adopt suggestions"
ON public.grandma_suggestions FOR UPDATE
TO authenticated
USING (true);
