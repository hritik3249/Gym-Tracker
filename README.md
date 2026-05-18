# LiftLoop

A premium full-stack gym tracking app built with Next.js, React, Tailwind CSS, Supabase, Recharts, and TypeScript.

## 1. Architecture

LiftLoop uses the Next.js App Router as the full-stack boundary:

- Server-rendered pages guard authentication with Supabase sessions.
- API route handlers own workout, exercise, analytics, repeat, and export operations.
- Supabase stores user-owned exercises, workouts, set history, and profile records with row-level security.
- Client components provide the high-touch workout logging experience: editable sets, rest timer, auto-save, repeat previous workout, export, and offline queueing.
- Analytics are computed in TypeScript from normalized set history and rendered with Recharts.

## 2. Folder Structure

```txt
src/
  app/                 App Router pages and API routes
  components/          Reusable UI, dashboard, workout, history, analytics modules
  hooks/               Rest timer and offline sync hooks
  lib/                 Supabase clients, analytics, constants, utilities
  types/               Database and domain types
supabase/schema.sql    Database schema, RLS, views, seed data
public/sw.js           Offline cache service worker
```

## 3. Database Schema

Run `supabase/schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `exercises`
- `workouts`
- `workout_sets`
- `exercise_personal_records` view
- RLS policies scoped to `auth.uid()`

## 4. Authentication Setup

In Supabase Auth:

1. Enable Email provider.
2. Enable Google provider and add Google OAuth credentials.
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 5. Backend Setup

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Install and run:

```bash
npm install
npm run dev
```

## 6. Frontend Pages

- `/login` - email and Google auth
- `/` - dashboard
- `/workout` - active workout logger
- `/history` - searchable workout history and comparison
- `/exercises` - exercise CRUD
- `/analytics` - exercise-level progression and PRs
- `/settings` - export and sync status

## 7. Workout Logging System

Workout logging supports:

- Continuous Push, Pull, Legs, Arms cycle
- Editable set rows
- Notes per set
- Auto-save debounce
- Rest timer
- One-click repeat previous workout
- Offline queue with reconnect sync

## 8. Analytics System

Analytics include:

- Weekly consistency
- Total workouts
- Current workout streak
- Best lifts
- Volume by category
- Muscle-group frequency
- Exercise-level weight, volume, and reps progression

## 9. Deployment Guide

Deploy on Vercel:

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables from `.env.example`.
4. Set Supabase Auth production redirect URL to `https://your-domain.com/auth/callback`.
5. Run the schema in Supabase before first login.
6. Build command: `npm run build`.
7. Output: Next.js default.
