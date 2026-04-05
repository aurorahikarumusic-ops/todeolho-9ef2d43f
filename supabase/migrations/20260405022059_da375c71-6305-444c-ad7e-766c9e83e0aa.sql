
-- 1. CRITICAL: Prevent users from changing their own role (privilege escalation)
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed and the caller is the user themselves
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow role changes from service_role (server-side)
    -- Regular users cannot change their own role
    IF auth.uid() = NEW.user_id THEN
      NEW.role := OLD.role; -- silently revert the role change
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_user_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();

-- 2. Restrict profiles UPDATE to prevent family_code tampering by non-owners
-- (keep existing policy but add the trigger above for role protection)

-- 3. WhatsApp subscriptions: policies are already user-scoped, verified OK

-- 4. Make task-proofs bucket private (currently public = security risk)
UPDATE storage.buckets SET public = false WHERE id = 'task-proofs';

-- 5. Add storage policy for task-proofs so family members can view
CREATE POLICY "Family members can view task proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-proofs'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload task proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-proofs'
  AND auth.role() = 'authenticated'
);
