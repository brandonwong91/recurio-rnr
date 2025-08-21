import * as React from "react";
import { View, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmail } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const { data, error } = await signInWithEmail(email.trim(), password);
      if (error) {
        Alert.alert("Sign in error", error.message ?? String(error));
      } else if (data) {
        // Signed in — navigate to home
        router.replace("/");
      }
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
      </View>
    </View>
  );
}
