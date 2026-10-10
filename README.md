# IshqYara

IshqYara is a Next.js 16 app with Supabase Auth, Postgres, Realtime, and private Storage. The existing branded login, profile onboarding/editing, discovery, likes/passes/rewind, matches, messaging, reports/blocks, photo upload, and account-removal UI use Supabase. Groups and the Puja planner are not part of this migration.

## Configure a Supabase project

1. Create or select a Supabase project. In **Project Settings → API**, copy the Project URL and publishable key into the root `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   These two values are intended for the browser. Keep `.env.local` private; it is ignored by Git.

2. In Google Cloud Console → **Google Auth Platform → Clients**, create an OAuth Client ID of type **Web application**. Add `http://localhost:3000` as an Authorized JavaScript origin. Add this exact Authorized redirect URI for the Supabase project currently configured in `.env.local`:

   ```text
   https://xnnwezpjfogauysdayfk.supabase.co/auth/v1/callback
   ```

   In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and enter that OAuth client ID and client secret. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/**` to Redirect URLs. The app's normal callback is `http://localhost:3000/auth/callback?next=%2F`; account reauthentication returns to the same callback with an encoded `next` query. The wildcard covers those callback query variants. If you use another host or port, add its matching origin and `/**` redirect pattern. Google redirects back to Supabase first; Supabase then returns the user to IshqYara's `/auth/callback` for the PKCE code exchange.

3. Apply [`supabase/migrations/20261009000000_ishqyara_core.sql`](./supabase/migrations/20261009000000_ishqyara_core.sql) to the *intended* Supabase project after reviewing it: open that project in Supabase Dashboard → **SQL Editor** → **New query**, paste the complete file contents, and click **Run**. This creates the tables, row-level security policies, signed-in-only RPC functions, private `profile-photos` bucket, and Realtime publication entries. It has not been applied by this repository or migration work. Do not make profile or Storage policies public.

4. Restart the dev server after changing `.env.local`:

   ```sh
   npm install
   npm run dev
   ```

5. `SUPABASE_SECRET_KEY` is optional for normal login, profile, discovery, match, and chat flows. It is required only for the account deletion API, which uses the server-only key to remove a user's private Storage objects and Auth account. If you enable that UI, create a Supabase secret key in **Project Settings → API Keys** and add it to `.env.local`:

   ```dotenv
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

   Never prefix this value with `NEXT_PUBLIC_`, add it to client code, or commit it. The app returns a configuration error for account deletion when this key is absent.

## Database and privacy notes

- Supabase Auth user UUIDs are the primary user IDs. Firebase users and their data are not automatically copied or mapped. Keep the old Firebase project intact until you separately plan and verify any data migration.
- `profiles` stores fields intended for signed-in discovery. `profile_private` stores date of birth, is readable only by its owner, and is never selected into public profile responses. Profile updates go through `save_my_profile`, which derives the user ID from `auth.uid()` and calculates public age.
- Likes, passes, blocks, matches, conversations, and messages have RLS enabled. Mutating trusted flows use narrowly granted database functions that derive the caller from `auth.uid()`.
- Profile photos are stored in a private bucket. The app requests short-lived signed URLs for display. The SQL migration limits upload MIME types and size and scopes writes to the caller's folder.
- Account removal requires typing `DELETE`, recent Google sign-in, a valid Supabase session, and `SUPABASE_SECRET_KEY`. Foreign-key cascades remove the user's rows; the server removes their Storage objects before deleting their Auth user.
- College verification is not implemented, and Google sign-in does not establish student status. Age is self-declared. Reports are stored, but the app has no moderation queue or configured support delivery destination.
- Discovery currently reads at most the 200 newest complete profiles and filters locally; pagination is not implemented. Compatibility is a heuristic based on profile preferences, not a validated prediction.

## Verify locally

```sh
npx next typegen
npx tsc --noEmit
npm run lint
npm run test:unit
npm run build
```

The app checks are local only. Live Google OAuth, database policy behavior, Storage access, and Realtime require a configured Supabase project and were not verified by this migration. The old Firebase rules files and emulator test dependencies are retained for reference/rollback; the Next.js app no longer imports the Firebase client or Admin SDK.

To check local configuration without printing values, use:

```sh
for name in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SECRET_KEY; do
  if grep -q "^${name}=.*[^[:space:]]" .env.local 2>/dev/null; then
    printf '%s: set\n' "$name"
  else
    printf '%s: missing\n' "$name"
  fi
done
```

Then sign in with Google, complete onboarding with one JPEG/PNG/WebP photo under 5 MB, verify the profile appears in discovery, and use two separately signed-in accounts to exercise like/match/chat/block flows. Test account deletion only on a disposable account after configuring the secret key.

`backend/` is a separate legacy Express/Postgres prototype and is not used by the Next.js app.
