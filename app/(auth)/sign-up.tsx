import { useRouter } from "expo-router";
import { Link } from "lucide-react-native";
import * as React from "react";
import { View, TextInput, Alert, Button } from "react-native";
import { signUpWithEmail } from "~/lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSignUp() {
    setLoading(true);
    try {
      const { data, error } = await signUpWithEmail(email.trim(), password);
      if (error) {
        Alert.alert("Sign up error", error.message ?? String(error));
      } else if (data) {
        // Signed in — navigate to home
        router.replace("/(tabs)/");
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
        <Text className="text-2xl font-bold mb-4">Sign up</Text>
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
        <Button onPress={handleSignUp} disabled={loading}>
          <Text>{loading ? "Signing up..." : "Sign up"}</Text>
        </Button>
        <Link href="/(auth)/login" className="mt-4 text-center">
          <Text className="text-sm text-muted-foreground">
            Already have an account? Sign in
          </Text>
        </Link>
      </View>
    </View>
  );
}
