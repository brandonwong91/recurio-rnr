import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Ensure you set these in your environment (for example .env.local)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Intentionally not throwing so the app can still run while devs add env vars.
  // The login page will surface a helpful error if keys are missing.
  console.warn(
    "Supabase keys are not set. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment."
  );
}

// Only use AsyncStorage for native platforms. On web / Node, avoid passing
// AsyncStorage since the package accesses `window` and will crash during SSR/bundling.
const authOptions: any = {
  detectSessionInUrl: false,
};

if (Platform && Platform.OS && Platform.OS !== "web") {
  authOptions.storage = AsyncStorage;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: authOptions,
});

export async function signInWithEmail(email: string, password: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      error: new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in env"),
    } as any;
  }

  const result = await supabase.auth.signInWithPassword({ email, password });
  return result;
}
