
-- Criar security definer function para ranking seguro
-- Isso permite que o ranking global funcione sem expor dados sensíveis
CREATE OR REPLACE FUNCTION public.get_ranking_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  points integer,
  streak_days integer,
  avatar_url text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, display_name, points, streak_days, avatar_url, role
  FROM public.profiles
  WHERE role = 'pai'
  ORDER BY points DESC
  LIMIT 100;
$$;
