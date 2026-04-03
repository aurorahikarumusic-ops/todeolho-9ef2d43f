
-- Mural de Pérolas posts
CREATE TABLE public.pearl_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pearl_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts"
ON public.pearl_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Moms can create posts"
ON public.pearl_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own posts"
ON public.pearl_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Reactions on posts
CREATE TABLE public.pearl_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.pearl_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL DEFAULT '😂',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

ALTER TABLE public.pearl_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reactions"
ON public.pearl_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can add reactions"
ON public.pearl_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
ON public.pearl_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pearl_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pearl_reactions;
