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


// ****************************************************************************
// Grocery Item CRUD operations
// ****************************************************************************

export async function getGroceryItems() {
  const { data, error } = await supabase
    .from('grocery_items')
    .select(`
      id,
      name,
      quantity,
      done,
      checked_at,
      frequency,
      tags (id, name)
    `);

  if (error) {
    console.error('Error fetching grocery items:', error);
    return [];
  }

  // The tags are returned as an array of objects. We need to flatten them to an array of strings.
  return data.map(item => ({
    ...item,
    checkedAt: item.checked_at,
    tags: item.tags.map((tag: any) => tag.name),
  }));
}

export async function addGroceryItem(item: { name: string, quantity?: number, tags?: string[], frequency?: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  // 1. Add the tags to the tags table (if they don't exist)
  const tagsToAdd = item.tags || [];
  const { data: existingTags, error: tagsError } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', tagsToAdd);

  if (tagsError) {
    console.error('Error fetching tags:', tagsError);
    return null;
  }

  const newTags = tagsToAdd.filter(tagName => !existingTags.some(t => t.name === tagName));
  const { data: addedTags, error: addTagsError } = await supabase
    .from('tags')
    .insert(newTags.map(name => ({ name })))
    .select('id, name');

  if (addTagsError) {
    console.error('Error adding tags:', addTagsError);
    return null;
  }

  const allTags = [...existingTags, ...addedTags];

  // 2. Add the grocery item
  const { data: newItem, error: addItemError } = await supabase
    .from('grocery_items')
    .insert({
      name: item.name,
      quantity: item.quantity,
      user_id: user.id,
      frequency: item.frequency,
    })
    .select('id')
    .single();

  if (addItemError) {
    console.error('Error adding grocery item:', addItemError);
    return null;
  }

  // 3. Add the associations in the join table
  const tagIds = allTags.map(t => t.id);
  const { error: joinError } = await supabase
    .from('grocery_item_tags')
    .insert(tagIds.map(tag_id => ({
      grocery_item_id: newItem.id,
      tag_id,
    })));

  if (joinError) {
    console.error('Error adding grocery item tags:', joinError);
    return null;
  }

  return { ...item, id: newItem.id, done: false, checkedAt: null };
}

export async function updateGroceryItem(item: { id: number, name: string, quantity?: number, tags?: string[], done: boolean, checkedAt: Date | null, frequency?: number }) {
  // 1. Update the item itself
  const { error: updateError } = await supabase
    .from('grocery_items')
    .update({
      name: item.name,
      quantity: item.quantity,
      done: item.done,
      checked_at: item.checkedAt,
      frequency: item.frequency,
    })
    .eq('id', item.id);

  if (updateError) {
    console.error('Error updating grocery item:', updateError);
    return null;
  }

  // 2. Update the tags (this is more complex, for simplicity we will delete all tags and re-add them)
  const { error: deleteTagsError } = await supabase
    .from('grocery_item_tags')
    .delete()
    .eq('grocery_item_id', item.id);

  if (deleteTagsError) {
    console.error('Error deleting grocery item tags:', deleteTagsError);
    return null;
  }

  const tagsToAdd = item.tags || [];
  const { data: existingTags, error: tagsError } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', tagsToAdd);

  if (tagsError) {
    console.error('Error fetching tags:', tagsError);
    return null;
  }

  const newTags = tagsToAdd.filter(tagName => !existingTags.some(t => t.name === tagName));
  const { data: addedTags, error: addTagsError } = await supabase
    .from('tags')
    .insert(newTags.map(name => ({ name })))
    .select('id, name');

  if (addTagsError) {
    console.error('Error adding tags:', addTagsError);
    return null;
  }

  const allTags = [...existingTags, ...addedTags];
  const tagIds = allTags.map(t => t.id);

  const { error: joinError } = await supabase
    .from('grocery_item_tags')
    .insert(tagIds.map(tag_id => ({
      grocery_item_id: item.id,
      tag_id,
    })));

  if (joinError) {
    console.error('Error adding grocery item tags:', joinError);
    return null;
  }

  return item;
}

export async function deleteGroceryItem(id: number) {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting grocery item:', error);
  }
}

// ****************************************************************************
// Payment Item CRUD operations
// ****************************************************************************

import { PaymentItemType } from "./types";

export async function getPaymentItems() {
  const { data, error } = await supabase
    .from('payments')
    .select('*');

  if (error) {
    console.error('Error fetching payment items:', error);
    return [];
  }
  return data as PaymentItemType[];
}

export async function addPaymentItem(item: Omit<PaymentItemType, 'id' | 'created_at' | 'user_id' | 'done_status' | 'paid_date'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data: newItem, error } = await supabase
    .from('payments')
    .insert({ ...item, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding payment item:', error);
    return null;
  }

  return newItem as PaymentItemType;
}

export async function updatePaymentItem(item: Partial<PaymentItemType> & { id: string }) {
  const { error, data } = await supabase
    .from('payments')
    .update(item)
    .eq('id', item.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment item:', error);
    return null;
  }

  return data as PaymentItemType;
}

export async function deletePaymentItem(id: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment item:', error);
  }
}