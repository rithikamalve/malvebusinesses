import { Link } from "@tanstack/react-router";
import { MapPin, Train, ArrowRight, Building2 } from "lucide-react";
import type { Building } from "@/data/listings";

export function BuildingCard({ building }: { building: Building }) {
  const available = building.units.filter((u) => u.status === "available").length;
  return (
    <Link
      to="/buildings/$slug"
      params={{ slug: building.slug }}
      className="fade-up group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {building.heroImage ? (
          <img src={building.heroImage} alt={building.name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-navy-deep text-white">
            <Building2 className="h-16 w-16 opacity-40" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow">
          {available} {available === 1 ? "unit" : "units"} available
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-primary">{building.name}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {building.location}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Train className="h-3.5 w-3.5 shrink-0" /> {building.metro}
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition group-hover:gap-2">
          View Units <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
