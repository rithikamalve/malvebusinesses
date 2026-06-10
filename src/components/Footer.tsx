export function Footer() {
  return (
    <footer id="contact" className="mt-20 bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Malve Businesses</h3>
            <p className="mt-3 text-sm text-white/70">
              Premium plug &amp; play office spaces across Hyderabad's prime business locations.
              Fully furnished, metro accessible, move-in ready.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">Contacts</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="text-white/60">Laxminarayana · </span>
                <a className="hover:underline" href="tel:+919398850260">+91 93988 50260</a>
              </li>
              <li>
                <span className="text-white/60">Ashok (Vandana Nivas) · </span>
                <a className="hover:underline" href="tel:+919704244959">+91 97042 44959</a>
              </li>
              <li>
                <span className="text-white/60">Arun (Begumpet) · </span>
                <a className="hover:underline" href="tel:+918179347109">+91 81793 47109</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">Locations</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>Vandana Nivas — West Marredpally</li>
              <li>Gowra Klassic — Begumpet</li>
              <li>Prakash Towers — Begumpet</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50 flex justify-between">
          <span>© {new Date().getFullYear()} Malve Businesses. All rights reserved.</span>
          <a href="/admin" className="hover:text-white/80">Admin</a>
        </div>
      </div>
    </footer>
  );
}
