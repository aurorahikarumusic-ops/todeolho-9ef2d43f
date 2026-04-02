-- Add new columns to tasks table
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS proof_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mom_approved boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rescued_by_mom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mom_reprove_comment text DEFAULT NULL;

-- Daily missions table
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mission_text text NOT NULL,
  mission_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamptz DEFAULT NULL,
  points_awarded integer NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_date)
);

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions"
  ON public.daily_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON public.daily_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON public.daily_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);