# PlateToFit

A private weekly meal-photo log and fitness goal tracker for two users. Built as an
installable PWA (Next.js + Supabase), meant to be added to the iPhone Home Screen.

- Log meals with a photo (compressed client-side), an optional label, and a note.
- Set a personal fitness goal for the week (record-keeping only — no generated plans).
- Export any week as a downloadable PDF report with meals grouped by day and images
  embedded.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel's free tier
- Supabase (Postgres + Auth + Storage), free tier
- Tailwind CSS
- `pdf-lib` for report export
- `browser-image-compression` for client-side image compression
- Manual PWA setup (manifest + service worker, no external PWA library)

## Project structure

- `src/app` — routes: `/login`, `/week/[start]`, `/week/[start]/day/[date]`,
  `/api/export/[start]`
- `src/lib` — Supabase clients, week/date helpers, server actions
- `src/components` — UI building blocks
- `supabase/migrations` — SQL schema, RLS policies, storage bucket policy
- `scripts/seed-users.mjs` — one-time admin script to create the two user accounts

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and
   anon key (Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

3. Apply the schema in `supabase/migrations/0001_init.sql` to your Supabase project
   (via the SQL editor, the Supabase CLI, or the Supabase MCP server). It creates the
   `weeks` and `meals` tables, enables RLS with owner-only policies, and creates the
   private `meal-images` storage bucket with matching storage policies.

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Seeding the two user accounts

This app has no public sign-up — only two accounts should ever exist. After the schema
is applied:

1. **Disable public sign-up** in the Supabase dashboard: Authentication → Sign In / Up →
   turn off "Allow new users to sign up". (This isn't available as a SQL migration or
   API call in this project's tooling, so it's a one-time manual step.)
2. Get your project's **service role key** from Project Settings → API (keep this
   secret — never commit it or expose it to the client).
3. Run the seed script once per account:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
   npm run seed:users -- you@example.com "your-password" partner@example.com "their-password"
   ```

   This creates both accounts directly via the Supabase Admin API with confirmed
   emails, ready to sign in immediately.

## Deploying

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com/new).
2. Add the environment variables from `.env.local` to the Vercel project
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Vercel auto-deploys on
   every push to `main`.
3. On iPhone, open the deployed URL in Safari, tap Share → **Add to Home Screen**. The
   app launches standalone with its own icon and splash, no browser chrome.

## Data model & security

- `weeks` (one row per user per week, keyed by Monday's date) holds the week's goal
  (`goal_preset` + free-text `goal_note`).
- `meals` (one row per photographed meal) references its week and stores
  `day_of_week` (0 = Monday … 6 = Sunday), optional `label`/`note`, and the Storage
  object path.
- Every table has Row Level Security enabled with `auth.uid() = user_id` policies for
  select/insert/update/delete — each user only ever sees their own rows.
- Images live in the private `meal-images` bucket, keyed
  `{user_id}/{week_id}/{meal_id}.jpg`, with storage policies restricting access to each
  user's own folder. The UI reads images via short-lived signed URLs.

## Non-goals (v1)

No calorie/macro tracking, no AI features (no photo analysis, no generated workout
plans — goals are recorded for reference only), no native app, no payments, no
sharing between the two accounts.
