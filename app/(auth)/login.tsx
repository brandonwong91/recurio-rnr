import { LogIn } from "lucide-react-native";
import * as React from "react";
import { View, Alert, Platform } from "react-native";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as QueryParams from "expo-auth-session/build/QueryParams";

WebBrowser.maybeCompleteAuthSession();

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

export default function LoginScreen() {
  const [loading, setLoading] = React.useState(false);
  const url = Linking.useURL();

  React.useEffect(() => {
    GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    });

    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  const signInWithGoogleWeb = async () => {
    try {
      const redirectUri = Linking.createURL("/auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true, // This is important to handle the redirect manually
        },
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
        return;
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (res.type === "success") {
        const { url } = res;
        await createSessionFromUrl(url);
      }
    } catch (error) {
      Alert.alert(
        "Sign-In Error",
        "An unexpected error occurred during sign-in."
      );
    }
  };

  const signInWithGoogleAndroid = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { data: signInData } = await GoogleSignin.signIn();
      if (signInData && signInData?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: signInData?.idToken,
        });

        if (error) {
          Alert.alert("Sign in error", error.message);
        }
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log("user cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("operation (e.g. sign in) is in progress already");
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("play services not available or outdated");
        // play services not available or outdated
      } else {
        Alert.alert("Sign in error", error.message);
      }
    }
  };

  async function handleSignInWithGoogle() {
    setLoading(true);
    try {
      if (Platform.OS === "web") {
        await signInWithGoogleWeb();
      } else {
        await signInWithGoogleAndroid();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <View className="w-full max-w-sm p-8 rounded-2xl bg-card shadow-lg">
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-3xl font-bold ml-2 text-foreground">
            Recurio
          </Text>
        </View>
        <Text className="text-2xl font-bold mb-2 text-center text-foreground">
          Welcome back
        </Text>
        <Text className="text-muted-foreground text-center mb-8">
          Sign in to continue your journey
        </Text>
        <Button
          onPress={handleSignInWithGoogle}
          disabled={loading}
          className="mt-4 bg-primary rounded-full flex-row items-center justify-center h-12"
        >
          <LogIn className="text-primary-foreground mr-2" size={20} />
          <Text className="text-primary-foreground font-bold">
            {loading ? "Signing in..." : "Sign in with Google"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
