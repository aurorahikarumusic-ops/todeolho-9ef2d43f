-- Mom ratings table
CREATE TABLE IF NOT EXISTS public.mom_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rated_by uuid NOT NULL,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment text DEFAULT NULL,
  week_start date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, rated_by, week_start)
);

ALTER TABLE public.mom_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings about them"
  ON public.mom_ratings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = rated_by);

CREATE POLICY "Raters can insert ratings"
  ON public.mom_ratings FOR INSERT
  WITH CHECK (auth.uid() = rated_by);

CREATE POLICY "Raters can update their ratings"
  ON public.mom_ratings FOR UPDATE
  USING (auth.uid() = rated_by);

-- Ranking groups
CREATE TABLE IF NOT EXISTS public.ranking_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL DEFAULT encode(extensions.gen_random_bytes(4), 'hex'),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(invite_code)
);

ALTER TABLE public.ranking_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view groups"
  ON public.ranking_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.ranking_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Group members
CREATE TABLE IF NOT EXISTS public.ranking_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.ranking_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.ranking_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group members"
  ON public.ranking_group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.ranking_group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);