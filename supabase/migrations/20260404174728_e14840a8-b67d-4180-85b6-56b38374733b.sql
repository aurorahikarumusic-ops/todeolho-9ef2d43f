
-- Create grandma_suggestions table
CREATE TABLE public.grandma_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'palpite',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  response_by UUID,
  response_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grandma_suggestions ENABLE ROW LEVEL SECURITY;

-- Avós can view their own suggestions
CREATE POLICY "Avos can view own suggestions"
ON public.grandma_suggestions
FOR SELECT
USING (auth.uid() = user_id);

-- Family members can view suggestions for their family
CREATE POLICY "Family can view suggestions"
ON public.grandma_suggestions
FOR SELECT
USING (family_id = get_current_user_family_id());

-- Avós can create suggestions for their family
CREATE POLICY "Avos can create suggestions"
ON public.grandma_suggestions
FOR INSERT
WITH CHECK (auth.uid() = user_id AND family_id = get_current_user_family_id());

-- Family members can update suggestion status
CREATE POLICY "Family can update suggestions"
ON public.grandma_suggestions
FOR UPDATE
USING (family_id = get_current_user_family_id());

-- Trigger for updated_at
CREATE TRIGGER update_grandma_suggestions_updated_at
BEFORE UPDATE ON public.grandma_suggestions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.grandma_suggestions;
