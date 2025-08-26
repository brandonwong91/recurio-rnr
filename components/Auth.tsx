import React from "react";
import { Platform, Button, Alert } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

// This is required for Expo's web browser to close the auth session properly
WebBrowser.maybeCompleteAuthSession();

export function Auth() {
  const signInWithGoogleWeb = async () => {
    try {
      // Create a redirect URI that works for your environment
      const redirectUri = Linking.createURL("/auth/callback");

      // Sign in with Supabase using the OAuth provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        Alert.alert("Error logging in", error.message);
      }
    } catch (error) {
      console.error("Web Sign-In Error:", error);
      Alert.alert(
        "Sign-In Error",
        "An unexpected error occurred during sign-in."
      );
    }
  };

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: "YOUR_WEB_CLIENT_ID", // Get this from Google Cloud Console
    });
  }, []);

  const signInWithGoogleAndroid = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { data: signInData } = await GoogleSignin.signIn();
      const idToken = signInData?.idToken;
      if (!idToken) {
        throw new Error("No ID token present!");
      }

      // Use the idToken to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        Alert.alert("Sign-in failed", error.message);
      } else {
        Alert.alert(
          "Signed in!",
          "You are now signed in with Google and Supabase."
        );
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          "Google Play Services not available",
          "Please install or update Google Play Services."
        );
      } else {
        console.error("Android Sign-In Error:", error);
        Alert.alert(
          "Sign-In Error",
          error.message || "An unexpected error occurred."
        );
      }
    }
  };

  const handleSignIn = () => {
    if (Platform.OS === "web") {
      signInWithGoogleWeb();
    } else {
      signInWithGoogleAndroid();
    }
  };

  return (
    <>
      {Platform.OS === "android" ? (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleSignIn}
        />
      ) : (
        <Button title="Sign in with Google" onPress={handleSignIn} />
      )}
    </>
  );
}
