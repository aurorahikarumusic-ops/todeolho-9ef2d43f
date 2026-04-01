
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'pai' CHECK (role IN ('pai', 'mae')),
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  family_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  family_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their family" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR 
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, family_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    gen_random_uuid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE,
  school TEXT,
  doctor_name TEXT,
  allergies TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view their children" ON public.children
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can manage their children" ON public.children
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can update their children" ON public.children
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'home' CHECK (category IN ('school', 'health', 'home', 'finances', 'fun')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  photo_proof_url TEXT,
  points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view tasks" ON public.tasks
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can update tasks" ON public.tasks
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'other' CHECK (event_type IN ('school', 'health', 'birthday', 'pickup', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view events" ON public.events
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can create events" ON public.events
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Family members can update events" ON public.events
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL DEFAULT '🏅',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
