Login screen and Supabase setup

Files added:

- lib/supabase.ts — Supabase client using AsyncStorage for RN.
- app/login.tsx — Simple email/password login screen wired to Supabase.

Environment

Set the following environment variables (for local dev put them in `.env.local`):

- SUPABASE_URL — your Supabase project URL (example: https://xyzcompany.supabase.co)
- SUPABASE_ANON_KEY — your public anon key

How to test

1. Add the env vars to `.env.local` (or your chosen env loader).
2. Start Expo: `pnpm dev` or `pnpm run dev`.
3. Open the app and tap "Login" in the header.
4. Enter an email/password for a user in your Supabase Auth users table.

Notes

- The client uses `@react-native-async-storage/async-storage` to persist sessions.
- For social login or magic links, follow Supabase docs and extend `lib/supabase.ts` accordingly.
