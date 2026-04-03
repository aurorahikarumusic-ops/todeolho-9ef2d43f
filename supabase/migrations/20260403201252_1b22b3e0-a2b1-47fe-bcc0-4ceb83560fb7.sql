
CREATE TABLE public.confessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own confessions"
ON public.confessions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR family_id = get_current_user_family_id());

CREATE POLICY "Users can create own confessions"
ON public.confessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND family_id = get_current_user_family_id());

CREATE POLICY "Users can delete own confessions"
ON public.confessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
