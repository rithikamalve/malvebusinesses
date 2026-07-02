-- Do it in one statement using CTE with UPDATE ... RETURNING would still hit the FK.
-- Simplest fix: drop and re-add the FK with ON UPDATE CASCADE, then update.
ALTER TABLE public.units DROP CONSTRAINT units_building_slug_fkey;
ALTER TABLE public.units
  ADD CONSTRAINT units_building_slug_fkey
  FOREIGN KEY (building_slug) REFERENCES public.buildings(slug)
  ON UPDATE CASCADE ON DELETE CASCADE;

UPDATE public.buildings
SET maps = slug,
    slug = 'uma-plaza'
WHERE name = 'Uma Plaza'
  AND slug LIKE 'http%';