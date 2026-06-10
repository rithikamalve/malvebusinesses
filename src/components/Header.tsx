import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            HO
          </div>
          <div className="leading-tight">
            <div className="font-serif text-base font-bold text-primary">Malve Businesses</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Premium Plug &amp; Play</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Home</Link>
          <a href="/#locations" className="hover:text-primary">Locations</a>
          <a href="/#contact" className="hover:text-primary">Contact</a>
        </nav>
        <a
          href="https://wa.me/919398850260?text=Hi%2C%20I%27m%20interested%20in%20your%20office%20spaces."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-whatsapp-hover sm:px-4"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sm:hidden">Chat</span>
        </a>
      </div>
    </header>
  );
}
