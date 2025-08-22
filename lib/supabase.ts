import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";

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
  auth: {
    ...authOptions,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
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

export async function signUpWithEmail(email: string, password: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      error: new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in env"),
    } as any;
  }

  const result = await supabase.auth.signUp({ email, password });
  return result;
}

// This is required for web platforms to handle the auth redirect
// WebBrowser.maybeCompleteAuthSession();

// This generates the correct redirect URI based on the environment
const redirectTo = makeRedirectUri();

// Function to extract tokens from the redirect URL and set the session
const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    Alert.alert("Authentication Error", errorCode);
    return;
  }

  const { access_token, refresh_token } = params;

  if (!access_token || !refresh_token) {
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    Alert.alert("Session Error", error.message);
  }
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true, // This is important to handle the redirect manually
    },
  });

  if (error) {
    Alert.alert("Sign In Error", error.message);
    return;
  }

  // Open the authentication URL in a web browser
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  // Handle the redirect back to the app
  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }
};

// You also need to listen for incoming deep links when the app is already open
Linking.addEventListener("url", (event) => {
  createSessionFromUrl(event.url);
});

export async function signOut() {
  await supabase.auth.signOut();
}
