// Types + seed loader. The seed lives in listings.seed.json so the admin
// panel can rewrite it on disk via a server function. Admin localStorage
// edits still override this at runtime.

import seedJson from "./listings.seed.json";

export type UnitStatus = "available" | "rented";

export interface Unit {
  id: string;
  name: string;
  area: number;
  seats: number;
  rent: number;
  bcm: number;
  specs: Record<string, string>;
  status: UnitStatus;
  images?: string[]; // urls or base64
  floorPlan?: string;
}

export interface Building {
  slug: string;
  name: string;
  location: string;
  metro: string;
  contact_name: string;
  contact_phone: string; // digits only, no +
  general_contact_name?: string;
  general_contact_phone?: string;
  maps?: string;
  heroImage?: string;
  gallery?: string[];
  units: Unit[];
}

export const SEED_BUILDINGS: Building[] = seedJson as Building[];
