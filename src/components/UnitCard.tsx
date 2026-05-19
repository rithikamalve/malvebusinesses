import { useState } from "react";
import { Phone, MessageCircle, MapPin, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
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
  const images = unit.images ?? [];
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tab, setTab] = useState<"specs" | "floor">("specs");

  const next = () => setIdx((p) => (p + 1) % Math.max(images.length, 1));
  const prev = () => setIdx((p) => (p - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));

  const isRented = unit.status === "rented";

  return (
    <article className="fade-up overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {images.length > 0 ? (
          <>
            <img
              src={images[idx]}
              alt={unit.name}
              onClick={() => setLightboxOpen(true)}
              className="h-full w-full cursor-zoom-in object-cover"
            />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            isRented ? "bg-muted text-muted-foreground" : "bg-whatsapp text-white"
          }`}
        >
          {isRented ? "Rented" : "Available"}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary">{unit.name}</h3>
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

        <div className="mt-4 flex gap-2 border-b border-border text-sm">
          <button
            onClick={() => setTab("specs")}
            className={`px-3 py-2 -mb-px border-b-2 transition ${tab === "specs" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"}`}
          >
            Specs
          </button>
          {unit.floorPlan && (
            <button
              onClick={() => setTab("floor")}
              className={`px-3 py-2 -mb-px border-b-2 transition ${tab === "floor" ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"}`}
            >
              Floor Plan
            </button>
          )}
        </div>

        {tab === "specs" ? (
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {Object.entries(unit.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-dashed border-border py-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          unit.floorPlan && (
            <img
              src={unit.floorPlan}
              alt="Floor plan"
              onClick={() => { setLightboxOpen(true); }}
              className="mt-3 w-full cursor-zoom-in rounded-md border border-border"
            />
          )
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
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

      {lightboxOpen && (
        <Lightbox
          images={tab === "floor" && unit.floorPlan ? [unit.floorPlan] : images}
          index={tab === "floor" ? 0 : idx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </article>
  );
}
