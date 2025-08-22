import { Tabs, useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { signOut } from "~/lib/supabase";
import { User, Settings } from "lucide-react-native";

export default function TabsLayout() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Button onPress={handleSignOut} variant="ghost">
            <Text>Sign Out</Text>
          </Button>
        ),
      }}
    >
      <Tabs.Screen
        name="(user)"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
