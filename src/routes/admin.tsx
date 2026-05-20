import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Plus, Trash2, Upload, X, LogOut, RotateCcw, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Header } from "@/components/Header";
import { saveBuildings, resetToSeed, useBuildings } from "@/lib/listings-store";
import type { Building, Unit, UnitStatus } from "@/data/listings";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hyderabad Offices" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
  ssr: false,
});

const SESSION_KEY = "admin_authed";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    setChecking(false);
  }, []);

  if (checking) return null;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />;
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const expected = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pwd === expected) {
            sessionStorage.setItem(SESSION_KEY, "1");
            onSuccess();
          } else setErr("Incorrect password");
        }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-lg"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-center font-serif text-2xl font-bold text-primary">Admin Access</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Enter the admin password to continue</p>
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setErr(""); }}
          placeholder="Password"
          className="mt-6 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
        <button type="submit" className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep">
          Sign in
        </button>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Set VITE_ADMIN_PASSWORD in env to override the default.
        </p>
      </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

type BuildingModalState = { mode: "add" } | { mode: "edit"; slug: string };
type UnitModalState =
  | { mode: "add"; slug: string }
  | { mode: "edit"; slug: string; unitId: string };

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const buildings = useBuildings();
  const [buildingModal, setBuildingModal] = useState<BuildingModalState | null>(null);
  const [unitModal, setUnitModal] = useState<UnitModalState | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function persist(next: Building[]) { saveBuildings(next); }

  function toggleUnitStatus(slug: string, unitId: string) {
    const next = buildings.map((b) =>
      b.slug !== slug
        ? b
        : { ...b, units: b.units.map((u) => u.id === unitId ? { ...u, status: u.status === "available" ? "rented" as UnitStatus : "available" as UnitStatus } : u) }
    );
    persist(next);
  }

  function deleteUnit(slug: string, unitId: string) {
    if (!confirm("Delete this unit?")) return;
    persist(buildings.map((b) => b.slug !== slug ? b : { ...b, units: b.units.filter((u) => u.id !== unitId) }));
  }

  function deleteBuilding(slug: string) {
    if (!confirm("Delete this entire building?")) return;
    persist(buildings.filter((b) => b.slug !== slug));
  }

  function saveUnit(slug: string, unit: Unit, originalId?: string) {
    const target = originalId ?? unit.id;
    persist(buildings.map((b) => {
      if (b.slug !== slug) return b;
      const exists = b.units.some((u) => u.id === target);
      const units = exists
        ? b.units.map((u) => u.id === target ? unit : u)
        : [...b.units, unit];
      return { ...b, units };
    }));
    setUnitModal(null);
  }

  function saveBuilding(b: Building, originalSlug?: string) {
    const target = originalSlug ?? b.slug;
    const exists = buildings.some((x) => x.slug === target);
    if (exists) {
      persist(buildings.map((x) => x.slug === target ? { ...x, ...b, units: x.units } : x));
    } else {
      persist([...buildings, b]);
    }
    setBuildingModal(null);
  }

  const editingBuilding = buildingModal?.mode === "edit"
    ? buildings.find((b) => b.slug === buildingModal.slug)
    : undefined;
  const editingUnit = unitModal?.mode === "edit"
    ? buildings.find((b) => b.slug === unitModal.slug)?.units.find((u) => u.id === unitModal.unitId)
    : undefined;

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage buildings and unit listings</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBuildingModal({ mode: "add" })} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep">
              <Plus className="h-4 w-4" /> Add Building
            </button>
            <button onClick={() => { if (confirm("Reset to seed? All admin changes lost.")) resetToSeed(); }} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          Changes are saved in this browser only. To make changes permanent across all devices, update <code className="rounded bg-amber-100 px-1">src/data/listings.ts</code>.
        </div>

        <div className="mt-8 space-y-4">
          {buildings.map((b) => {
            const open = expanded[b.slug] ?? true;
            return (
              <div key={b.slug} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <button onClick={() => setExpanded({ ...expanded, [b.slug]: !open })} className="flex items-center gap-2 text-left">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <div>
                      <h2 className="font-serif text-lg font-bold text-primary">{b.name}</h2>
                      <p className="text-xs text-muted-foreground">{b.location} · {b.units.length} units</p>
                    </div>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setBuildingModal({ mode: "edit", slug: b.slug })} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" /> Edit Building
                    </button>
                    <button onClick={() => setUnitModal({ mode: "add", slug: b.slug })} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-navy-deep">
                      <Plus className="h-3.5 w-3.5" /> Add Unit
                    </button>
                    <button onClick={() => deleteBuilding(b.slug)} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Unit</th>
                          <th className="px-4 py-2 text-left">Area</th>
                          <th className="px-4 py-2 text-left">Seats</th>
                          <th className="px-4 py-2 text-left">Rent</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Photos</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.units.map((u) => (
                          <tr key={u.id} className="border-t border-border">
                            <td className="px-4 py-3 font-medium">{u.name}</td>
                            <td className="px-4 py-3">{u.area} sft</td>
                            <td className="px-4 py-3">{u.seats}</td>
                            <td className="px-4 py-3">₹{u.rent.toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleUnitStatus(b.slug, u.id)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${u.status === "available" ? "bg-whatsapp text-white" : "bg-muted text-muted-foreground"}`}
                              >
                                {u.status}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{u.images?.length ?? 0} img</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => setUnitModal({ mode: "edit", slug: b.slug, unitId: u.id })} className="rounded p-1.5 text-primary hover:bg-primary/10" title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => deleteUnit(b.slug, u.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {b.units.length === 0 && (
                          <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No units yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {buildingModal && (
        <BuildingModal
          initial={editingBuilding}
          onClose={() => setBuildingModal(null)}
          onSave={(b) => saveBuilding(b, buildingModal.mode === "edit" ? buildingModal.slug : undefined)}
        />
      )}
      {unitModal && (
        <UnitModal
          initial={editingUnit}
          onClose={() => setUnitModal(null)}
          onSave={(u) => saveUnit(unitModal.slug, u, unitModal.mode === "edit" ? unitModal.unitId : undefined)}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-serif text-lg font-bold text-primary">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function BuildingModal({ initial, onClose, onSave }: { initial?: Building; onClose: () => void; onSave: (b: Building) => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    location: initial?.location ?? "",
    metro: initial?.metro ?? "",
    contact_name: initial?.contact_name ?? "",
    contact_phone: initial?.contact_phone ?? "",
  });
  const [heroImage, setHeroImage] = useState<string | undefined>(initial?.heroImage);
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  async function handleHero(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setHeroImage(await fileToBase64(f));
  }

  return (
    <Modal title={initial ? "Edit Building" : "Add Building"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          onSave({ ...form, slug, units: initial?.units ?? [], heroImage });
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug (url)"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" /></Field>
        </div>
        <Field label="Location"><input required className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Metro Station"><input className={inputCls} value={form.metro} onChange={(e) => set("metro", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name"><input required className={inputCls} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
          <Field label="Contact Phone (digits, e.g. 91XXXXXXXXXX)"><input required className={inputCls} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value.replace(/\D/g, ""))} /></Field>
        </div>
        <Field label="Hero Photo">
          <input type="file" accept="image/*" onChange={handleHero} className="text-sm" />
          {heroImage && (
            <div className="relative mt-2 inline-block">
              <img src={heroImage} alt="" className="h-32 rounded-md object-cover" />
              <button type="button" onClick={() => setHeroImage(undefined)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep">{initial ? "Save Changes" : "Save Building"}</button>
        </div>
      </form>
    </Modal>
  );
}

function UnitModal({ initial, onClose, onSave }: { initial?: Unit; onClose: () => void; onSave: (u: Unit) => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    area: initial ? String(initial.area) : "",
    seats: initial ? String(initial.seats) : "",
    rent: initial ? String(initial.rent) : "",
    bcm: initial ? String(initial.bcm) : "",
  });
  const [status, setStatus] = useState<UnitStatus>(initial?.status ?? "available");
  const initialSpecs = initial ? Object.entries(initial.specs).map(([k, v]) => ({ k, v })) : [{ k: "", v: "" }];
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>(initialSpecs.length ? initialSpecs : [{ k: "", v: "" }]);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [floorPlan, setFloorPlan] = useState<string | undefined>(initial?.floorPlan);
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const b64 = await Promise.all(files.map(fileToBase64));
    setImages([...images, ...b64]);
    e.target.value = "";
  }

  async function handleFloorPlan(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFloorPlan(await fileToBase64(f));
  }

  return (
    <Modal title={initial ? "Edit Unit" : "Add Unit"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const specsObj: Record<string, string> = {};
          for (const { k, v } of specs) if (k.trim()) specsObj[k.trim()] = v;
          onSave({
            id: initial?.id ?? `unit-${Date.now()}`,
            name: form.name,
            area: Number(form.area) || 0,
            seats: Number(form.seats) || 0,
            rent: Number(form.rent) || 0,
            bcm: Number(form.bcm) || 0,
            specs: specsObj,
            status,
            images,
            floorPlan,
          });
        }}
        className="space-y-4"
      >
        <Field label="Unit Name"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Area (sft)"><input required type="number" className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
          <Field label="Seats"><input required type="number" className={inputCls} value={form.seats} onChange={(e) => set("seats", e.target.value)} /></Field>
          <Field label="Rent (₹)"><input required type="number" className={inputCls} value={form.rent} onChange={(e) => set("rent", e.target.value)} /></Field>
          <Field label="BCM (₹)"><input required type="number" className={inputCls} value={form.bcm} onChange={(e) => set("bcm", e.target.value)} /></Field>
        </div>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as UnitStatus)}>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </Field>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Specs</span>
          <div className="mt-2 space-y-2">
            {specs.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Key" className={inputCls} value={row.k} onChange={(e) => setSpecs(specs.map((r, j) => j === i ? { ...r, k: e.target.value } : r))} />
                <input placeholder="Value" className={inputCls} value={row.v} onChange={(e) => setSpecs(specs.map((r, j) => j === i ? { ...r, v: e.target.value } : r))} />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="rounded-md border border-border px-2 text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setSpecs([...specs, { k: "", v: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus className="h-3 w-3" /> Add spec
            </button>
          </div>
        </div>
        <Field label="Photos (multiple — carousel order = upload order)">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-muted/50 px-4 py-3 text-sm hover:bg-muted">
            <Upload className="h-4 w-4" /> Upload images
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
          </label>
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{i + 1}</span>
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
        <Field label="Floor Plan (single image)">
          <input type="file" accept="image/*" onChange={handleFloorPlan} className="text-sm" />
          {floorPlan && (
            <div className="relative mt-2 inline-block">
              <img src={floorPlan} alt="" className="h-32 rounded-md border border-border object-contain" />
              <button type="button" onClick={() => setFloorPlan(undefined)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep">{initial ? "Save Changes" : "Save Unit"}</button>
        </div>
      </form>
    </Modal>
  );
}
