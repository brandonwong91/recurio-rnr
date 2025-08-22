import * as React from "react";
import { View, TextInput, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { signInWithEmail, supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        setLoading(true);
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ error }) => {
            if (error) {
              Alert.alert("Login error", error.message);
            } else {
              router.replace("/(tabs)");
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [router]);

  async function handleSignIn() {
    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email.trim(), password);
      console.log("Sign in with email result:", { data, error });
      if (error) {
        Alert.alert("Sign in error", error.message ?? String(error));
      } else if (data) {
        // Signed in — navigate to home
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Unexpected error", err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignInWithGoogle() {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // redirectTo: `${window.location.origin}`,
          redirectTo: `${window.location.origin}/(auth)/login`, // Adjust redirect URL as needed
        },
      });
    } catch (err: any) {
      Alert.alert("Unexpected error", err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
      <View className="w-full max-w-sm p-6 rounded-2xl bg-card/80">
        <Text className="text-2xl font-bold mb-4">Sign in</Text>
        <Text className="text-sm text-muted-foreground mb-1">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          className="border border-border rounded px-3 py-2 mb-3"
        />
        <Text className="text-sm text-muted-foreground mb-1">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          className="border border-border rounded px-3 py-2 mb-4"
        />
        <Button onPress={handleSignIn} disabled={loading}>
          <Text>{loading ? "Signing in..." : "Sign in"}</Text>
        </Button>
        <Button
          onPress={handleSignInWithGoogle}
          disabled={loading}
          className="mt-4"
        >
          <Text>{loading ? "Signing in..." : "Sign in with Google"}</Text>
        </Button>
        <Link href="/(auth)/sign-up" className="mt-4 text-center">
          <Text className="text-sm text-muted-foreground">
            Don't have an account? Sign up
          </Text>
        </Link>
      </View>
    </View>
  );
}
