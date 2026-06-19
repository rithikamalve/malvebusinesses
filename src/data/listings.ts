// Shared types for buildings and units. Data now lives in the Cloud database;
// this file is only the type contract used by components and the admin UI.

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
  images?: string[];
  floorPlan?: string;
}

export interface Building {
  slug: string;
  name: string;
  location: string;
  metro: string;
  contact_name: string;
  contact_phone: string;
  general_contact_name?: string;
  general_contact_phone?: string;
  maps?: string;
  heroImage?: string;
  gallery?: string[];
  units: Unit[];
}
