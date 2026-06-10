import { useEffect, useState, useSyncExternalStore } from "react";
import { SEED_BUILDINGS, type Building } from "@/data/listings";
import { writeListingsToDisk } from "./listings.functions";


const KEY = "listings_data";

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function read(): Building[] {
  if (typeof window === "undefined") return SEED_BUILDINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED_BUILDINGS;
    const parsed = JSON.parse(raw) as Building[];
    // Merge: localStorage takes precedence; include seed buildings/units not present
    const map = new Map<string, Building>();
    for (const b of SEED_BUILDINGS) map.set(b.slug, b);
    for (const b of parsed) {
      const existing = map.get(b.slug);
      if (existing) {
        const unitMap = new Map(existing.units.map((u) => [u.id, u]));
        for (const u of b.units) unitMap.set(u.id, u);
        map.set(b.slug, { ...existing, ...b, units: Array.from(unitMap.values()) });
      } else {
        map.set(b.slug, b);
      }
    }
    return Array.from(map.values());
  } catch {
    return SEED_BUILDINGS;
  }
}

export function getBuildings(): Building[] {
  return read();
}

export function saveBuildings(buildings: Building[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(buildings));
  emit();
}

export function resetToSeed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useBuildings(): Building[] {
  // SSR-safe: returns SEED on server, swaps to merged after hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const data = useSyncExternalStore(
    subscribe,
    () => read(),
    () => SEED_BUILDINGS,
  );
  return hydrated ? data : SEED_BUILDINGS;
}

export function useBuilding(slug: string) {
  return useBuildings().find((b) => b.slug === slug);
}
