
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'provider');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'wrench'
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Seed categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Plumber', 'plumber', 'droplets'),
  ('Electrician', 'electrician', 'zap'),
  ('AC Technician', 'ac-technician', 'wind'),
  ('Drainage', 'drainage', 'pipette'),
  ('Stove Repair', 'stove-repair', 'flame'),
  ('Wood Worker', 'wood-worker', 'tree-pine'),
  ('Metal Worker', 'metal-worker', 'wrench'),
  ('Telecom', 'telecom', 'radio');

-- Provider details table
CREATE TABLE public.provider_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  experience_years INT DEFAULT 0,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  service_radius_km INT DEFAULT 10,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_details ENABLE ROW LEVEL SECURITY;

-- Provider categories (many-to-many)
CREATE TABLE public.provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, category_id)
);
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, provider_id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Helper functions (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id
    AND (customer_id = _user_id OR provider_id = _user_id)
  );
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER provider_details_updated_at BEFORE UPDATE ON public.provider_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );
  
  -- If provider, also create provider_details
  IF COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer') = 'provider' THEN
    INSERT INTO public.provider_details (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update conversation updated_at when new message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- RLS POLICIES

-- Profiles: anyone authenticated can read, own user can update
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Categories: public read
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- Provider details: anyone authenticated can read, own provider can update
CREATE POLICY "Anyone can view provider details" ON public.provider_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Providers can insert own details" ON public.provider_details FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update own details" ON public.provider_details FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Provider categories: anyone authenticated can read, own provider can manage
CREATE POLICY "Anyone can view provider categories" ON public.provider_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Providers can insert own categories" ON public.provider_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can delete own categories" ON public.provider_categories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Conversations: participants only
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT TO authenticated USING (customer_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "Customers can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (customer_id = auth.uid() OR provider_id = auth.uid());

-- Messages: participants only
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_conversation_participant(auth.uid(), conversation_id) AND sender_id = auth.uid());
