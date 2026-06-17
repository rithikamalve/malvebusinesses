import { useState } from "react";
import { Phone, MessageCircle, MapPin, ChevronLeft, ChevronRight, ImageOff, Expand } from "lucide-react";
import type { Building, Unit } from "@/data/listings";
import { Lightbox } from "./Lightbox";

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function waLink(phone: string, unitName: string, buildingName: string) {
  const text = `Hi, I'm interested in ${unitName} at ${buildingName}. Please share more details.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function UnitCard({ unit, building }: { unit: Unit; building: Building }) {
  const photos = unit.images ?? [];
  const allImages = unit.floorPlan ? [...photos, unit.floorPlan] : photos;
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const len = allImages.length;
  const next = () => setIdx((p) => (p + 1) % Math.max(len, 1));
  const prev = () => setIdx((p) => (p - 1 + Math.max(len, 1)) % Math.max(len, 1));

  const isRented = unit.status === "rented";
  const isFloorPlan = unit.floorPlan && idx === allImages.length - 1;

  return (
    <article className="fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="grid md:grid-cols-2">
        {/* Image carousel */}
        <div
          className="relative bg-muted cursor-zoom-in aspect-[4/3] md:aspect-auto md:min-h-[420px]"
          onClick={() => setLightboxOpen(true)}
        >
          {len > 0 ? (
            <>
              <img
                src={allImages[idx]}
                alt={unit.name}
                className="absolute inset-0 h-full w-full object-contain p-2"
              />
              {len > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-2 py-1">
                    {allImages.map((_, i) => (
                      <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
                    ))}
                  </div>
                  <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                    {idx + 1} / {len}
                  </div>
                </>
              )}
              <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white">
                <Expand className="h-3.5 w-3.5" />
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
          <span
            className={`pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              isRented ? "bg-muted text-muted-foreground" : "bg-whatsapp text-white"
            }`}
          >
            {isRented ? "Rented" : "Available"}
          </span>
          {isFloorPlan && (
            <span className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">
              Floor Plan
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary">{unit.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {building.location}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatINR(unit.rent)}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">/ month</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Area</div>
              <div className="font-semibold">{unit.area} sft</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Seats</div>
              <div className="font-semibold">{unit.seats}</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">BCM</div>
              <div className="font-semibold">₹{unit.bcm.toLocaleString("en-IN")}</div>
            </div>
          </div>

          {unit.floorPlan && (
            <button
              onClick={() => setIdx(allImages.length - 1)}
              className="mt-3 self-start rounded-md border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View floor plan →
            </button>
          )}

          <dl className="mt-4 grid grid-cols-1 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-2">
            {Object.entries(unit.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-dashed border-border py-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pt-5 grid grid-cols-2 gap-2">
            <a
              href={`tel:+${building.contact_phone}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              Call {building.contact_name}
            </a>
            <a
              href={waLink(building.contact_phone, unit.name, building.name)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-whatsapp px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-hover"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={allImages}
          index={idx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </article>
  );
}
