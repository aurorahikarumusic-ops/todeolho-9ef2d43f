
CREATE OR REPLACE FUNCTION public.join_family_by_code(invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  host_family_id uuid;
  host_name text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Find host profile by family_code (case-insensitive)
  SELECT family_id, display_name INTO host_family_id, host_name
  FROM public.profiles
  WHERE lower(family_code) = lower(invite_code)
  LIMIT 1;

  IF host_family_id IS NULL THEN
    RETURN json_build_object('error', 'Code not found');
  END IF;

  -- Update the current user's family_id
  UPDATE public.profiles
  SET family_id = host_family_id
  WHERE user_id = current_user_id;

  RETURN json_build_object('success', true, 'family_id', host_family_id, 'host_name', host_name);
END;
$$;
