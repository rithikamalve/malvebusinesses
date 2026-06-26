import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Train, Phone, MessageCircle, ExternalLink, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UnitCard } from "@/components/UnitCard";
import { Lightbox } from "@/components/Lightbox";
import { useBuilding, useBuildings } from "@/lib/listings-store";

export const Route = createFileRoute("/buildings/$slug")({
  head: ({ params }) => {
    const title = `Office Space · ${params.slug.replace(/-/g, " ")}`;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
      ],
    };
  },
  component: BuildingPage,
  ssr: false,
});

function BuildingPage() {
  const { slug } = Route.useParams();
  const all = useBuildings();
  const building = useBuilding(slug);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  if (all.length === 0) {
    return <div className="min-h-screen bg-background"><Header /><div className="mx-auto max-w-7xl px-4 py-20 text-muted-foreground">Loading…</div></div>;
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary">Building not found</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-primary underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const gallery = building.gallery ?? [];
  const heroSrc = building.heroImage;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative isolate overflow-hidden bg-primary text-white">
        {heroSrc ? (
          <>
            <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-navy-deep" />
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All locations
          </Link>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{building.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {building.location}</span>
            <span className="inline-flex items-center gap-1.5"><Train className="h-4 w-4" /> {building.metro}</span>
            {building.maps && (
              <a href={building.maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
                View on Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <p className="mt-3 text-white/70">{building.units.length} {building.units.length === 1 ? "unit" : "units"} · {building.units.filter(u => u.status === "available").length} available</p>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox({ open: true, index: i })}
                className="aspect-[4/3] overflow-hidden rounded-lg bg-muted"
              >
                <img src={src} alt="" className="h-full w-full cursor-zoom-in object-cover transition hover:scale-105" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 font-serif text-2xl font-bold text-primary sm:text-3xl">Available Units</h2>
        {building.units.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 opacity-40" />
            <p className="mt-3">No units listed yet.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {building.units.map((u) => (
              <UnitCard key={u.id} unit={u} building={building} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Schedule a Visit</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-primary sm:text-3xl">Speak with {building.contact_name}</h3>
              <p className="mt-2 text-muted-foreground">Property in-charge for {building.name}. Available for site visits.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <a
                href={`tel:+${building.contact_phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-deep"
              >
                <Phone className="h-4 w-4" /> Call {building.contact_name}
              </a>
              <a
                href={`https://wa.me/${building.contact_phone}?text=${encodeURIComponent(`Hi ${building.contact_name}, I'd like to schedule a visit to ${building.name}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-semibold text-white hover:bg-whatsapp-hover"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {lightbox.open && <Lightbox images={gallery} index={lightbox.index} onClose={() => setLightbox({ open: false, index: 0 })} />}

      <Footer />
    </div>
  );
}
