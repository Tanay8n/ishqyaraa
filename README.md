# IshqYara

A modern **Next.js 16** dating app experience powered by **Supabase Auth, Postgres, Realtime, and private Storage**.

IshqYara includes branded sign-in, profile onboarding/editing, discovery, likes/passes/rewind, matches, messaging, reports/blocks, photo uploads, and account removal flows. **Groups** and the **Puja planner** are not part of this migration.

## Table of contents

- [Project overview](#project-overview)
- [Feature highlights](#feature-highlights)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Local installation](#local-installation)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Google OAuth setup](#google-oauth-setup)
- [Database migration](#database-migration)
- [Development commands](#development-commands)
- [Verification](#verification)
- [Privacy and security notes](#privacy-and-security-notes)
- [Known limitations](#known-limitations)
- [Legacy backend](#legacy-backend)

## Project overview

This repository contains the Next.js app for IshqYara. The app is now Supabase-backed for authentication, database access, Storage, and Realtime behavior.

## Feature highlights

- Google sign-in via Supabase Auth
- Profile onboarding and editing
- Discovery, likes, passes, rewind, and match creation
- Conversations and messaging
- Reports and blocks
- Private profile photo upload/display via signed URLs
- Account deletion flow (with server-only secret key)

## Technology stack

- **Frontend/App:** Next.js 16, React 19, TypeScript
- **Auth + Data:** Supabase Auth, Postgres, Row-Level Security (RLS)
- **Realtime + Storage:** Supabase Realtime + private Storage bucket
- **Tooling:** ESLint, TypeScript checks, Node test runner

## Prerequisites

- Node.js and npm
- A Supabase project you control
- A Google Cloud project for OAuth client setup

## Local installation

```sh
npm install
npm run dev
```

## Environment variables

Create `/home/runner/work/ishqyaraa/ishqyaraa/.env.local` with:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

> [!WARNING]
> `.env.local` must never be committed. It is intended to stay local/private.

`SUPABASE_SECRET_KEY` is optional for normal login/profile/discovery/match/chat flows, but required for the account deletion API:

```dotenv
SUPABASE_SECRET_KEY=sb_secret_...
```

> [!IMPORTANT]
> `SUPABASE_SECRET_KEY` is **server-only**. Never prefix it with `NEXT_PUBLIC_`, never expose it to client code, and never commit it.
> If this key is missing, the account deletion flow returns a configuration error.

## Supabase setup

1. Create/select a Supabase project.
2. In **Project Settings → API**, copy the project URL and publishable key into `.env.local`.
3. In **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Add `http://localhost:3000/**` to **Redirect URLs**

The app callback used by auth flows is:

```text
http://localhost:3000/auth/callback?next=%2F
```

Account reauthentication uses the same callback with an encoded `next` query; the wildcard redirect covers these variants.

## Google OAuth setup

1. In Google Cloud Console → **Google Auth Platform → Clients**, create a **Web application** OAuth Client ID.
2. Add `http://localhost:3000` as an Authorized JavaScript origin.
3. Add this exact Authorized redirect URI (currently documented for the configured Supabase project):

```text
https://xnnwezpjfogauysdayfk.supabase.co/auth/v1/callback
```

4. In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and set the client ID/secret.

Google redirects to Supabase first, and Supabase returns users to IshqYara `/auth/callback` for PKCE code exchange.

## Database migration

Apply this SQL file to your intended Supabase project after review:

- `/home/runner/work/ishqyaraa/ishqyaraa/supabase/migrations/20261009000000_ishqyara_core.sql`

Recommended flow:

1. Open the target Supabase project
2. Go to **SQL Editor → New query**
3. Paste the full migration content
4. Click **Run**

This migration creates tables, RLS policies, signed-in-only RPC functions, private `profile-photos` bucket, and Realtime publication entries.
It is **not** applied automatically by this repository or migration work.

> [!CAUTION]
> Do **not** make profile or Storage policies public.

## Development commands

```sh
npm run dev
npm run lint
npm run test:unit
npm run build
```

## Verification

Run local checks:

```sh
npx next typegen
npx tsc --noEmit
npm run lint
npm run test:unit
npm run build
```

Safe environment-variable presence check (prints only `set`/`missing`, never values):

```sh
for name in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SECRET_KEY; do
  if grep -q "^${name}=.*[^[:space:]]" .env.local 2>/dev/null; then
    printf '%s: set\n' "$name"
  else
    printf '%s: missing\n' "$name"
  fi
done
```

> [!NOTE]
> These checks are local only. Live Supabase policies, Google OAuth, Storage access, and Realtime behavior require a configured Supabase project.
> Firebase rules files and emulator-related test dependencies are retained for reference/rollback; the Next.js app no longer imports the Firebase client or Admin SDK.

Manual flow to verify after setup:

1. Sign in with Google
2. Complete onboarding with one JPEG/PNG/WebP photo under 5 MB
3. Confirm profile appears in discovery
4. Use two signed-in accounts to test like/match/chat/block
5. Test account deletion only with disposable accounts after setting `SUPABASE_SECRET_KEY`

## Privacy and security notes

- Supabase Auth UUIDs are primary user IDs.
- Firebase users/data are not automatically migrated; keep old Firebase infra intact until separate migration planning/verification is complete.
- `profiles` contains signed-in discovery fields; `profile_private` stores date of birth and is owner-readable only.
- Profile writes go through `save_my_profile`, deriving user identity from `auth.uid()` and calculating public age.
- Likes, passes, blocks, matches, conversations, and messages use RLS.
- Trusted mutations rely on narrowly granted database functions derived from `auth.uid()`.
- Photos are stored in a private bucket and served via short-lived signed URLs.
- Account deletion requires typing `DELETE`, recent Google sign-in, valid Supabase session, and `SUPABASE_SECRET_KEY`.
- Deletion flow removes Storage objects before deleting the Auth user; related rows are removed by foreign-key cascades.

## Known limitations

- No college verification is implemented.
- Age is self-declared.
- Reports are stored, but there is no moderation queue or configured support destination.
- Discovery reads at most the **200 newest complete profiles**, then filters locally.
- Discovery pagination is not implemented.
- Compatibility scoring is heuristic and not a validated prediction.

## Legacy backend

`/home/runner/work/ishqyaraa/ishqyaraa/backend/` is a separate legacy Express/Postgres prototype and is not used by the Next.js app.
