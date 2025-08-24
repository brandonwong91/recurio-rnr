import * as React from "react";
import { View, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const url = Linking.useURL();

  React.useEffect(() => {
    GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      webClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID ?? "",
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
      console.error("Web Sign-In Error:", error);
      Alert.alert(
        "Sign-In Error",
        "An unexpected error occurred during sign-in."
      );
    }
  };

  const signInWithGoogleAndroid = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });
        console.log(data);
        if (error) {
          Alert.alert("Sign in error", error.message);
        }
        // onAuthStateChange in _layout.tsx will handle the redirect
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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
    <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
      <View className="w-full max-w-sm p-6 rounded-2xl bg-card/80">
        <Text className="text-2xl font-bold mb-4">Sign in</Text>
        <Button
          onPress={handleSignInWithGoogle}
          disabled={loading}
          className="mt-4"
        >
          <Text>{loading ? "Signing in..." : "Sign in with Google"}</Text>
        </Button>
      </View>
    </View>
  );
}
