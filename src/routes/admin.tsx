import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Plus, Trash2, X, LogOut, ChevronDown, ChevronUp, Pencil, Database, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useBuildings, useInvalidateBuildings } from "@/lib/listings-store";
import type { Building, Unit, UnitStatus } from "@/data/listings";
import seedData from "@/data/listings.seed.json";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Malve Businesses" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
  ssr: false,
});

function AdminPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    setUserId(uid);
    if (uid) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    } else {
      setIsAdmin(false);
    }
    setReady(true);
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-secondary text-sm text-muted-foreground">
      Loading admin…
    </div>
  );
  if (!userId) return <AuthScreen onDone={refresh} />;
  if (!isAdmin) return <NeedsAdminScreen userId={userId} onLogout={async () => { await supabase.auth.signOut(); }} />;
  return <Dashboard onLogout={async () => { await supabase.auth.signOut(); }} />;
}

type AuthErr = { title: string; detail: string; hint?: string };

function explainAuthError(err: unknown, mode: "signin" | "signup"): AuthErr {
  const e = err as { message?: string; status?: number; code?: string } | null;
  const msg = (e?.message ?? "").toLowerCase();
  const code = e?.code ?? "";
  const status = e?.status ?? 0;

  if (msg.includes("invalid login credentials") || code === "invalid_credentials") {
    return {
      title: "Wrong email or password",
      detail: "We couldn't find an account matching those credentials.",
      hint: "Double-check the email. If this is your first time, switch to Sign up below to create the account.",
    };
  }
  if (msg.includes("email not confirmed") || code === "email_not_confirmed") {
    return {
      title: "Email not confirmed",
      detail: "Your account exists but the email hasn't been verified yet.",
      hint: "Check your inbox for the confirmation link, or ask the site owner to enable auto-confirm.",
    };
  }
  if (msg.includes("user already registered") || code === "user_already_exists") {
    return {
      title: "Account already exists",
      detail: "An account with this email is already registered.",
      hint: "Switch to Sign in and use your existing password (or reset it if forgotten).",
    };
  }
  if (msg.includes("password") && (msg.includes("short") || msg.includes("6"))) {
    return { title: "Password too short", detail: "Passwords must be at least 6 characters.", hint: "Pick a longer password." };
  }
  if (msg.includes("pwned") || code === "weak_password") {
    return {
      title: "Password is too weak / leaked",
      detail: "This password appears in known data breaches and is blocked for security.",
      hint: "Use a unique password you haven't used elsewhere — ideally 12+ characters with a mix of letters, numbers, and symbols.",
    };
  }
  if (msg.includes("rate") || status === 429) {
    return { title: "Too many attempts", detail: "Sign-in is temporarily rate-limited.", hint: "Wait ~30 seconds and try again." };
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return { title: "Invalid email format", detail: "That doesn't look like a valid email address.", hint: "Use the form name@example.com." };
  }
  if (msg.includes("signup") && msg.includes("disabled")) {
    return { title: "Sign-ups disabled", detail: "New account creation is currently turned off.", hint: "Ask the site owner to enable signups in auth settings." };
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return { title: "Network error", detail: "Could not reach the authentication server.", hint: "Check your internet connection and try again." };
  }
  return {
    title: mode === "signin" ? "Sign-in failed" : "Sign-up failed",
    detail: e?.message ?? "Unknown error.",
    hint: "If this keeps happening, copy the message above and contact support.",
  };
}

function AuthScreen({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<AuthErr | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You can now sign in.");
        setMode("signin");
      }
      onDone();
    } catch (error) {
      const parsed = explainAuthError(error, mode);
      setErr(parsed);
      toast.error(parsed.title);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-center font-serif text-2xl font-bold text-primary">{mode === "signin" ? "Admin Sign In" : "Create Admin Account"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Use the email + password you registered with." : "Pick any email and a password (min 6 chars)."}
        </p>

        {err && (
          <div role="alert" className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-left">
            <p className="text-sm font-semibold text-destructive">{err.title}</p>
            <p className="mt-1 text-xs text-destructive/90">{err.detail}</p>
            {err.hint && <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold">How to fix:</span> {err.hint}</p>}
          </div>
        )}

        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input type="password" required placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" minLength={6} />
        <button disabled={busy} type="submit" className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
        <button type="button" onClick={() => { setErr(null); setMode(mode === "signin" ? "signup" : "signin"); }} className="mt-3 w-full text-center text-xs text-muted-foreground underline">
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}


function NeedsAdminScreen({ userId, onLogout }: { userId: string; onLogout: () => void }) {
  const [busy, setBusy] = useState(false);
  async function claim() {
    setBusy(true);
    try {
      const { claimAdminIfUnclaimed } = await import("@/lib/admin.functions");
      const res = await claimAdminIfUnclaimed();
      if (res.claimed) {
        toast.success("You are now the admin. Reloading…");
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to claim admin");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <h1 className="font-serif text-2xl font-bold text-primary">Almost there</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account is signed in but not yet marked as admin.</p>
        <button disabled={busy} onClick={claim} className="mt-5 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-navy-deep disabled:opacity-60">
          {busy ? "Working…" : "Claim admin (first user only)"}
        </button>
        <p className="mt-4 break-all rounded-md bg-muted p-3 text-xs">Your user id: <code>{userId}</code></p>
        <button onClick={onLogout} className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

// ---------- helpers ----------

// Bucket is private; use long-lived signed URLs so images render anywhere.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${name}`;
  const { error } = await supabase.storage.from("listings").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("listings").createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data) throw signErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

// ---------- dashboard ----------

type BuildingModalState = { mode: "add" } | { mode: "edit"; slug: string };
type UnitModalState =
  | { mode: "add"; slug: string }
  | { mode: "edit"; slug: string; unitId: string };

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const buildings = useBuildings();
  const invalidate = useInvalidateBuildings();
  const [buildingModal, setBuildingModal] = useState<BuildingModalState | null>(null);
  const [unitModal, setUnitModal] = useState<UnitModalState | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string>("");

  async function toggleUnitStatus(slug: string, u: Unit) {
    const next = u.status === "available" ? "rented" : "available";
    const { error } = await supabase.from("units").update({ status: next }).eq("id", u.id);
    if (error) return toast.error(error.message);
    invalidate();
  }

  async function deleteUnit(unitId: string) {
    if (!confirm("Delete this unit?")) return;
    const { error } = await supabase.from("units").delete().eq("id", unitId);
    if (error) return toast.error(error.message);
    toast.success("Unit deleted");
    invalidate();
  }

  async function deleteBuilding(slug: string) {
    if (!confirm("Delete this entire building (and its units)?")) return;
    const { error } = await supabase.from("buildings").delete().eq("slug", slug);
    if (error) return toast.error(error.message);
    toast.success("Building deleted");
    invalidate();
  }

  async function runSeedMigration() {
    if (!confirm("Import legacy data? Buildings/units already present will be skipped (safe to re-run).")) return;
    setSeeding(true);
    setSeedStatus("Starting…");
    try {
      const seed = seedData as Building[];
      // Snapshot existing rows so we can skip them.
      const { data: existingB } = await supabase.from("buildings").select("slug");
      const { data: existingU } = await supabase.from("units").select("id");
      const haveB = new Set((existingB ?? []).map((r) => r.slug));
      const haveU = new Set((existingU ?? []).map((r) => r.id));

      let imageCount = 0;
      let bCount = 0;
      let uCount = 0;
      const errors: string[] = [];

      for (const b of seed) {
        try {
          setSeedStatus(`Building: ${b.name}`);
          if (!haveB.has(b.slug)) {
            let heroUrl: string | null = null;
            if (b.heroImage && b.heroImage.startsWith("/")) {
              heroUrl = await fetchAndUpload(b.heroImage, `${b.slug}/hero`);
              imageCount++;
            }
            const { error: bErr } = await supabase.from("buildings").upsert({
              slug: b.slug,
              name: b.name,
              location: b.location,
              metro: b.metro,
              contact_name: b.contact_name,
              contact_phone: b.contact_phone,
              general_contact_name: b.general_contact_name ?? null,
              general_contact_phone: b.general_contact_phone ?? null,
              maps: b.maps ?? null,
              hero_image: heroUrl,
              gallery: [],
            });
            if (bErr) throw bErr;
            bCount++;
          }

          for (const u of b.units) {
            if (haveU.has(u.id)) continue;
            setSeedStatus(`Unit: ${b.name} → ${u.name} (${(u.images ?? []).length} images)`);
            const newImages: string[] = [];
            for (const img of u.images ?? []) {
              if (img.startsWith("/")) {
                const url = await fetchAndUpload(img, `${b.slug}/${u.id}`);
                newImages.push(url);
                imageCount++;
              } else {
                newImages.push(img);
              }
            }
            let floorUrl: string | null = null;
            if (u.floorPlan && u.floorPlan.startsWith("/")) {
              floorUrl = await fetchAndUpload(u.floorPlan, `${b.slug}/${u.id}/floor`);
              imageCount++;
            } else if (u.floorPlan) {
              floorUrl = u.floorPlan;
            }
            const { error: uErr } = await supabase.from("units").upsert({
              id: u.id,
              building_slug: b.slug,
              name: u.name,
              area: u.area,
              seats: u.seats,
              rent: u.rent,
              bcm: u.bcm,
              status: u.status,
              specs: u.specs,
              images: newImages,
              floor_plan: floorUrl,
            });
            if (uErr) throw uErr;
            uCount++;
          }
        } catch (e) {
          const msg = `${b.name}: ${(e as Error).message}`;
          console.error(msg, e);
          errors.push(msg);
          toast.error(msg);
        }
      }
      setSeedStatus("");
      if (errors.length === 0) {
        toast.success(`Done. Added ${bCount} buildings, ${uCount} units, ${imageCount} images.`);
      } else {
        toast.error(`Finished with ${errors.length} error(s). ${bCount} buildings, ${uCount} units, ${imageCount} images imported.`);
      }
      invalidate();
    } catch (err) {
      console.error(err);
      toast.error("Import failed: " + (err as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  async function fetchAndUpload(srcPath: string, folder: string): Promise<string> {
    const res = await fetch(srcPath);
    if (!res.ok) throw new Error(`Could not fetch ${srcPath}`);
    const blob = await res.blob();
    const file = new File([blob], srcPath.split("/").pop() || "image.jpg", { type: blob.type || "image/jpeg" });
    return uploadFile(file, folder);
  }

  const editingBuilding = useMemo(
    () => (buildingModal?.mode === "edit" ? buildings.find((b) => b.slug === buildingModal.slug) : undefined),
    [buildingModal, buildings],
  );
  const editingUnit = useMemo(
    () => (unitModal?.mode === "edit" ? buildings.find((b) => b.slug === unitModal.slug)?.units.find((u) => u.id === unitModal.unitId) : undefined),
    [unitModal, buildings],
  );

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
            <button onClick={runSeedMigration} disabled={seeding} className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-card px-3 py-2 text-sm font-medium text-primary hover:bg-accent disabled:opacity-60">
              <Database className="h-4 w-4" /> {seeding ? "Importing…" : "Import legacy data"}
            </button>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
          All edits save to the Cloud database. Images upload to Cloud storage and are visible across every device.
        </div>
        {seeding && seedStatus && (
          <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            Importing… {seedStatus}
          </div>
        )}

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
                                onClick={() => toggleUnitStatus(b.slug, u)}
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
                                <button onClick={() => deleteUnit(u.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete">
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
          {buildings.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              <Database className="mx-auto h-10 w-10 opacity-40" />
              <p className="mt-3 text-sm">No buildings yet. Click <strong>Import legacy data</strong> to bring everything over from the JSON seed, or add buildings manually.</p>
            </div>
          )}
        </div>
      </div>

      {buildingModal && (
        <BuildingModal
          initial={editingBuilding}
          onClose={() => setBuildingModal(null)}
          onSaved={() => { setBuildingModal(null); invalidate(); }}
        />
      )}
      {unitModal && (
        <UnitModal
          buildingSlug={unitModal.slug}
          initial={editingUnit}
          onClose={() => setUnitModal(null)}
          onSaved={() => { setUnitModal(null); invalidate(); }}
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

function sanitizeSlug(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function BuildingModal({ initial, onClose, onSaved }: { initial?: Building; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    location: initial?.location ?? "",
    metro: initial?.metro ?? "",
    contact_name: initial?.contact_name ?? "",
    contact_phone: initial?.contact_phone ?? "",
    maps: initial?.maps ?? "",
  });
  const [heroImage, setHeroImage] = useState<string | undefined>(initial?.heroImage);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  async function handleHero(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const slug = initial?.slug || sanitizeSlug(form.slug || form.name);
    if (!slug) {
      toast.error("Enter a building name first, then upload the hero photo.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(f, `${slug}/hero`);
      setHeroImage(url);
      toast.success("Hero photo uploaded");
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const slug = initial?.slug || sanitizeSlug(form.slug || form.name);
    if (!slug) return toast.error("Name or slug is required");
    setSaving(true);
    const row = {
      slug,
      name: form.name,
      location: form.location,
      metro: form.metro,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      maps: form.maps.trim() || null,
      hero_image: heroImage ?? null,
    };
    const { error } = initial
      ? await supabase.from("buildings").update(row).eq("slug", initial.slug)
      : await supabase.from("buildings").insert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <Modal title={initial ? "Edit Building" : "Add Building"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug (short id, letters + dashes)"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", sanitizeSlug(e.target.value))} placeholder="auto from name" disabled={!!initial} /></Field>
        </div>
        <Field label="Location"><input required className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Metro Station"><input className={inputCls} value={form.metro} onChange={(e) => set("metro", e.target.value)} /></Field>
        <Field label="Google Maps URL (optional)"><input className={inputCls} value={form.maps} onChange={(e) => set("maps", e.target.value)} placeholder="https://maps.app.goo.gl/..." /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name"><input required className={inputCls} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
          <Field label="Contact Phone (digits)"><input required className={inputCls} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value.replace(/\D/g, ""))} /></Field>
        </div>

        <Field label="Hero Photo">
          <input type="file" accept="image/*" onChange={handleHero} className="text-sm" />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
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
          <button disabled={saving || uploading} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep disabled:opacity-60">{saving ? "Saving…" : initial ? "Save Changes" : "Save Building"}</button>
        </div>
      </form>
    </Modal>
  );
}

function UnitModal({ buildingSlug, initial, onClose, onSaved }: { buildingSlug: string; initial?: Unit; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id ?? "",
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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const folder = `${buildingSlug}/${sanitizeSlug(form.id) || "new"}`;

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadFile(f, folder));
      setImages([...images, ...urls]);
      toast.success(`Uploaded ${urls.length} photo${urls.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleFloor(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      setFloorPlan(await uploadFile(f, `${folder}/floor`));
      toast.success("Floor plan uploaded");
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const id = form.id || `${buildingSlug}-${Date.now().toString(36)}`;
    const specsObj: Record<string, string> = {};
    for (const s of specs) if (s.k.trim()) specsObj[s.k.trim()] = s.v;
    const row = {
      id,
      building_slug: buildingSlug,
      name: form.name,
      area: Number(form.area) || 0,
      seats: Number(form.seats) || 0,
      rent: Number(form.rent) || 0,
      bcm: Number(form.bcm) || 0,
      status,
      specs: specsObj,
      images,
      floor_plan: floorPlan ?? null,
    };
    const { error } = initial
      ? await supabase.from("units").update(row).eq("id", initial.id)
      : await supabase.from("units").insert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <Modal title={initial ? "Edit Unit" : "Add Unit"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unit ID"><input className={inputCls} value={form.id} onChange={(e) => set("id", e.target.value)} placeholder="auto" disabled={!!initial} /></Field>
          <Field label="Name"><input required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Area (sft)"><input required type="number" className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
          <Field label="Seats"><input required type="number" className={inputCls} value={form.seats} onChange={(e) => set("seats", e.target.value)} /></Field>
          <Field label="Rent (₹)"><input required type="number" className={inputCls} value={form.rent} onChange={(e) => set("rent", e.target.value)} /></Field>
          <Field label="BCM (₹)"><input type="number" className={inputCls} value={form.bcm} onChange={(e) => set("bcm", e.target.value)} /></Field>
        </div>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as UnitStatus)} className={inputCls}>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </Field>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Specifications</span>
          <div className="mt-1 space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder="Label" value={s.k} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, k: e.target.value } : x))} />
                <input className={inputCls} placeholder="Value" value={s.v} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, v: e.target.value } : x))} />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="rounded p-2 text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setSpecs([...specs, { k: "", v: "" }])} className="text-xs font-medium text-primary underline">+ Add spec</button>
          </div>
        </div>

        <Field label="Photos">
          <input type="file" accept="image/*" multiple onChange={handleImages} className="text-sm" />
          {uploading && <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} alt="" className="h-20 w-28 rounded object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Floor Plan (optional)">
          <input type="file" accept="image/*" onChange={handleFloor} className="text-sm" />
          {floorPlan && (
            <div className="relative mt-2 inline-block">
              <img src={floorPlan} alt="" className="h-28 rounded object-contain" />
              <button type="button" onClick={() => setFloorPlan(undefined)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X className="h-3 w-3" /></button>
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button disabled={saving || uploading} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-navy-deep disabled:opacity-60">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {saving ? "Saving…" : initial ? "Save Changes" : "Save Unit"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
