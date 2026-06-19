// React-Query backed store reading from the Cloud database.
// All writes go through @/lib/listings-mutations which use the same supabase
// client; RLS restricts non-admin users to read-only.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Building, Unit, UnitStatus } from "@/data/listings";

export const BUILDINGS_KEY = ["buildings"] as const;

interface BuildingRow {
  slug: string;
  name: string;
  location: string;
  metro: string;
  contact_name: string;
  contact_phone: string;
  general_contact_name: string | null;
  general_contact_phone: string | null;
  maps: string | null;
  hero_image: string | null;
  gallery: string[] | null;
  sort_order: number;
}

interface UnitRow {
  id: string;
  building_slug: string;
  name: string;
  area: number;
  seats: number;
  rent: number;
  bcm: number;
  status: string;
  specs: Record<string, string> | null;
  images: string[] | null;
  floor_plan: string | null;
  sort_order: number;
}

function toBuilding(b: BuildingRow, units: UnitRow[]): Building {
  return {
    slug: b.slug,
    name: b.name,
    location: b.location,
    metro: b.metro,
    contact_name: b.contact_name,
    contact_phone: b.contact_phone,
    general_contact_name: b.general_contact_name ?? undefined,
    general_contact_phone: b.general_contact_phone ?? undefined,
    maps: b.maps ?? undefined,
    heroImage: b.hero_image ?? undefined,
    gallery: b.gallery ?? [],
    units: units.map(toUnit),
  };
}

function toUnit(u: UnitRow): Unit {
  return {
    id: u.id,
    name: u.name,
    area: u.area,
    seats: u.seats,
    rent: u.rent,
    bcm: u.bcm,
    status: (u.status as UnitStatus) ?? "available",
    specs: u.specs ?? {},
    images: u.images ?? [],
    floorPlan: u.floor_plan ?? undefined,
  };
}

export async function fetchBuildings(): Promise<Building[]> {
  const [{ data: bRows, error: bErr }, { data: uRows, error: uErr }] = await Promise.all([
    supabase.from("buildings").select("*").order("sort_order").order("created_at"),
    supabase.from("units").select("*").order("sort_order").order("created_at"),
  ]);
  if (bErr) throw bErr;
  if (uErr) throw uErr;
  const groups = new Map<string, UnitRow[]>();
  for (const u of (uRows ?? []) as UnitRow[]) {
    const arr = groups.get(u.building_slug) ?? [];
    arr.push(u);
    groups.set(u.building_slug, arr);
  }
  return ((bRows ?? []) as BuildingRow[]).map((b) => toBuilding(b, groups.get(b.slug) ?? []));
}

export function useBuildings() {
  const q = useQuery({ queryKey: BUILDINGS_KEY, queryFn: fetchBuildings, staleTime: 30_000 });
  return q.data ?? [];
}

export function useBuilding(slug: string) {
  return useBuildings().find((b) => b.slug === slug);
}

export function useInvalidateBuildings() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: BUILDINGS_KEY });
}
