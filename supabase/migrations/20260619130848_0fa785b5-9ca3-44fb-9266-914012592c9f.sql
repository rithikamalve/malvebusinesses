
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Buildings
CREATE TABLE public.buildings (
  slug text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  metro text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  general_contact_name text,
  general_contact_phone text,
  maps text,
  hero_image text,
  gallery text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.buildings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT ALL ON public.buildings TO service_role;

ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read buildings"
  ON public.buildings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert buildings"
  ON public.buildings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update buildings"
  ON public.buildings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete buildings"
  ON public.buildings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Units
CREATE TABLE public.units (
  id text PRIMARY KEY,
  building_slug text NOT NULL REFERENCES public.buildings(slug) ON DELETE CASCADE,
  name text NOT NULL,
  area int NOT NULL DEFAULT 0,
  seats int NOT NULL DEFAULT 0,
  rent int NOT NULL DEFAULT 0,
  bcm int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','rented')),
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  floor_plan text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.units TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT ALL ON public.units TO service_role;

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read units"
  ON public.units FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert units"
  ON public.units FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update units"
  ON public.units FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete units"
  ON public.units FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER buildings_touch BEFORE UPDATE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER units_touch BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket policies (bucket itself is created via the storage tool)
CREATE POLICY "Public can read listings bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "Admins can upload to listings bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listings' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update listings bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listings' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete from listings bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listings' AND public.has_role(auth.uid(), 'admin'));
