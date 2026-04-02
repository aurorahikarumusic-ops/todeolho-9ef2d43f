
-- 1. FIX ACHIEVEMENTS: Remove client-side INSERT policies
DROP POLICY IF EXISTS "System can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

-- Only service_role can insert achievements (no public INSERT policy)
-- Keep SELECT policies intact

-- 2. FIX DAILY_MISSIONS: Remove client-side INSERT policy, keep server-only
DROP POLICY IF EXISTS "Users can insert own missions" ON public.daily_missions;

-- 3. ACTIVATE handle_new_user TRIGGER on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('task-proofs', 'task-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for task-proofs
CREATE POLICY "Task proof images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-proofs');

CREATE POLICY "Users can upload task proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update task proofs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete task proofs"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
