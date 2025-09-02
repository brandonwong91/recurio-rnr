import { Tabs, useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { signOut, supabase } from "~/lib/supabase";
import {
  Settings,
  DollarSign,
  HeartPulse,
  Apple,
  CalendarDays,
} from "lucide-react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useColorScheme } from "~/lib/useColorScheme";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function TabsLayout() {
  const router = useRouter();
  const { toggleColorScheme } = useColorScheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    const initials = names.map((name) => name.charAt(0)).join("");
    return initials.toUpperCase();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="mr-2">
                <Avatar alt={""}>
                  <AvatarImage
                    source={{ uri: user?.user_metadata.avatar_url }}
                  />
                  <AvatarFallback>
                    {getInitials(user?.user_metadata.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onPress={toggleColorScheme}>
                <Text>Toggle Theme</Text>
              </DropdownMenuItem>
              <DropdownMenuItem onPress={handleSignOut}>
                <Text>Sign Out</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        headerTitle: "Recurio",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => (
            <DollarSign color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: "Groceries",
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => (
            <HeartPulse color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
