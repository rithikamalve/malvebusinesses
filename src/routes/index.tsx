import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, ShieldCheck, Train, Zap, Receipt, Sofa, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BuildingCard } from "@/components/BuildingCard";
import { useBuildings } from "@/lib/listings-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Premium Plug & Play Office Spaces in Hyderabad" },
      { name: "description", content: "Fully furnished, metro accessible, move-in ready office spaces in Begumpet & Secunderabad. Ready-to-occupy workspaces with DG power, parking, GST with ITC." },
      { property: "og:title", content: "Premium Plug & Play Office Spaces in Hyderabad" },
      { property: "og:description", content: "Fully furnished · Metro Accessible · Move-In Ready" },
    ],
  }),
  component: HomePage,
  ssr: false,
});

const trust = [
  { icon: Sofa, label: "Fully Furnished" },
  { icon: Train, label: "Metro Accessible" },
  { icon: Zap, label: "DG Power Backup" },
  { icon: Receipt, label: "GST with ITC" },
  { icon: ShieldCheck, label: "24x7 Security" },
];

function HomePage() {
  const buildings = useBuildings();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep via-primary to-primary/80" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-3xl text-white fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">For Lease · Hyderabad</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Premium Plug &amp; Play Office Spaces in Hyderabad
            </h1>
            <p className="mt-5 text-lg text-white/85 sm:text-xl">
              Fully Furnished · Metro Accessible · Move-In Ready
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#locations"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
              >
                Explore Spaces <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919398850260?text=Hi%2C%20I%27m%20interested%20in%20your%20office%20spaces."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-whatsapp-hover"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 md:grid-cols-5">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Our Locations</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">
            Three premium buildings. One trusted operator.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Hand-picked properties in Hyderabad's most connected business corridors.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <BuildingCard key={b.slug} building={b} />
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="font-serif text-2xl font-bold sm:text-3xl">Ready to schedule a visit?</h3>
              <p className="mt-2 text-white/80">Talk to our team. We'll arrange a walkthrough at a time that suits you.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+918179347107" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-white/90">
                <Phone className="h-4 w-4" /> Call Arun
              </a>
              <a
                href="https://wa.me/918179347107?text=Hi%2C%20I%27d%20like%20to%20schedule%20a%20visit."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-3 text-sm font-semibold text-white hover:bg-whatsapp-hover"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
