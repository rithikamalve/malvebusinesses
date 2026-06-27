
-- Create private schema not exposed by the API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Buildings policies
DROP POLICY IF EXISTS "Admins can insert buildings" ON public.buildings;
DROP POLICY IF EXISTS "Admins can update buildings" ON public.buildings;
DROP POLICY IF EXISTS "Admins can delete buildings" ON public.buildings;
CREATE POLICY "Admins can insert buildings" ON public.buildings
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update buildings" ON public.buildings
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete buildings" ON public.buildings
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Units policies
DROP POLICY IF EXISTS "Admins can insert units" ON public.units;
DROP POLICY IF EXISTS "Admins can update units" ON public.units;
DROP POLICY IF EXISTS "Admins can delete units" ON public.units;
CREATE POLICY "Admins can insert units" ON public.units
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update units" ON public.units
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete units" ON public.units
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- Storage policies
DROP POLICY IF EXISTS "Admins can upload to listings bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update listings bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from listings bucket" ON storage.objects;
CREATE POLICY "Admins can upload to listings bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listings' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update listings bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'listings' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'listings' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete from listings bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'listings' AND private.has_role(auth.uid(), 'admin'));

-- Drop the old public-schema SECURITY DEFINER functions
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.claim_admin_if_unclaimed();
