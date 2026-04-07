-- Fix security definer view - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.ranking_view;
CREATE VIEW public.ranking_view WITH (security_invoker = true) AS
SELECT id, user_id, display_name, points, streak_days, avatar_url, role
FROM public.profiles
WHERE role = 'pai';

GRANT SELECT ON public.ranking_view TO authenticated;
GRANT SELECT ON public.ranking_view TO anon;