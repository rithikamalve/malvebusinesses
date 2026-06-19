# Migrate to Lovable Cloud

Move listings out of `listings.seed.json` + `localStorage` into a real database, photos out of `/public/listings/` into Cloud storage, and replace the shared password gate with proper email/password admin login. Single admin account.

## Database schema (one migration)

- `app_role` enum: `admin`, `user`.
- `user_roles(user_id, role)` + `has_role(uid, role)` security-definer function. (No roles on profile tables.)
- `buildings`:
  - `slug` text PK
  - `name`, `location`, `metro`, `contact_name`, `contact_phone`, `hero_image_url`
  - `sort_order` int, `created_at` timestamptz
- `units`:
  - `id` uuid PK
  - `building_slug` fk → buildings(slug) on delete cascade
  - `name`, `area` int, `seats` int, `rent` int, `bcm` int
  - `specs` jsonb, `status` text ('available'|'rented')
  - `images` text[] (ordered URLs), `floor_plan_url` text
  - `sort_order` int, `created_at` timestamptz

RLS:
- Buildings/units: `SELECT TO anon, authenticated` (public site reads). INSERT/UPDATE/DELETE only when `has_role(auth.uid(), 'admin')`.
- `user_roles`: SELECT to authenticated for own row; all writes service-role only.
- GRANTs on every public table.

## Storage

- Bucket `listings` (public). Path convention: `{building-slug}/{unit-id}/{filename}` and `{building-slug}/hero.jpg`.
- RLS on `storage.objects`: anyone can read from `listings`; only admins can insert/update/delete.

## Auth

- Email/password only (no Google for a single admin).
- Replace the password modal in `src/routes/admin.tsx` with a Supabase signin form.
- Admin gating: server functions use `requireSupabaseAuth` + `has_role()` check; UI hides admin controls unless the current user is admin.
- The user creates their admin account by signing up once; I'll tell them to insert their `user_roles` row via the Cloud users panel (or I'll seed it once they share their user id).

## Data + image seeding

A one-time admin server function `seedFromLegacy`:
1. Reads `src/data/listings.seed.json` on the server.
2. For each unit, fetches each `/listings/...jpg` from disk, uploads to the `listings` bucket, replaces paths with public storage URLs.
3. Upserts buildings + units rows.
4. Marks a `meta` row so it doesn't run twice.

The legacy JSON and `/public/listings/` stay in the repo until the user confirms the migration looks right; then we can delete them.

## Code changes

- New: `src/lib/listings.queries.ts` (public read server fn → returns buildings with units, via publishable server client + anon SELECT policy).
- New: `src/lib/listings.admin.functions.ts` (auth-gated upsert/delete + signed upload URL helpers).
- Rewrite `src/lib/listings-store.ts` → react-query around the new server fns; drop localStorage path.
- `src/routes/index.tsx` + `src/routes/buildings/$slug.tsx`: load via TanStack Query (`ensureQueryData` in loader, `useSuspenseQuery` in component).
- `src/routes/admin.tsx`:
  - Login = Supabase email/password (replaces hardcoded password).
  - Image uploads go directly to storage via the client; URLs returned saved on the unit.
  - "Reset to seed" button removed (DB is the source of truth).

## Files removed afterwards (separate cleanup step)

- `src/data/listings.seed.json`
- `src/lib/listings.functions.ts` (old disk-writer)
- `public/listings/*` (once images are confirmed migrated)

## Order of operations in this turn

1. Run schema migration + create storage bucket.
2. Write new server functions and queries.
3. Update admin route (auth + uploads).
4. Update public routes to read from DB.
5. Run the `seedFromLegacy` function once after I've created my admin user.

## What you'll need to do after I'm done

1. Open `/admin`, click **Sign up**, create your account with your email + password.
2. Tell me you've signed up (or paste your email) so I can grant the `admin` role on your user.
3. Click **Run migration** in the admin panel — that uploads existing photos to Cloud storage and populates the database.
4. After verifying everything looks right, I'll delete the old JSON + image files from the repo.

Sound good? I'll proceed once you approve.
