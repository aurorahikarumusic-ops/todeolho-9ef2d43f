
-- Monthly challenges table
CREATE TABLE public.monthly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  success_criteria TEXT,
  deadline DATE NOT NULL,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  badge_emoji TEXT DEFAULT '🏅',
  badge_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view challenges"
ON public.monthly_challenges FOR SELECT
USING (family_id = get_current_user_family_id());

CREATE POLICY "Mom can create challenges"
ON public.monthly_challenges FOR INSERT
WITH CHECK (
  family_id = get_current_user_family_id()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'mae'
  )
);

CREATE POLICY "Mom can update challenges"
ON public.monthly_challenges FOR UPDATE
USING (
  family_id = get_current_user_family_id()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'mae'
  )
);

CREATE POLICY "Mom can delete challenges"
ON public.monthly_challenges FOR DELETE
USING (
  family_id = get_current_user_family_id()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'mae'
  )
);

-- Add urgency column to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'normal';

-- Drop old permissive task policies and create role-based ones
DROP POLICY IF EXISTS "Users can insert tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Family members can delete tasks" ON public.tasks;

-- Mom can do everything with tasks
CREATE POLICY "Mom can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  family_id = get_current_user_family_id()
  AND (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'mae')
    OR created_by = auth.uid()
  )
);

CREATE POLICY "Family can update tasks"
ON public.tasks FOR UPDATE
USING (family_id = get_current_user_family_id());

CREATE POLICY "Mom can delete tasks"
ON public.tasks FOR DELETE
USING (
  family_id = get_current_user_family_id()
  AND (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'mae')
    OR created_by = auth.uid()
  )
);

-- Drop old event policies and create role-based ones  
DROP POLICY IF EXISTS "Users can insert events in their family" ON public.events;
DROP POLICY IF EXISTS "Users can update events in their family" ON public.events;

CREATE POLICY "Mom can create events"
ON public.events FOR INSERT
WITH CHECK (
  family_id = get_current_user_family_id()
  AND (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'mae')
    OR created_by = auth.uid()
  )
);

CREATE POLICY "Family can update events"
ON public.events FOR UPDATE
USING (family_id = get_current_user_family_id());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mom_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monthly_challenges;

-- Trigger for updated_at on monthly_challenges
CREATE TRIGGER update_monthly_challenges_updated_at
BEFORE UPDATE ON public.monthly_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
