import * as React from "react";
import { View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { supabase } from "~/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { useColorScheme } from "~/lib/useColorScheme";

export default function Screen() {
  const [session, setSession] = React.useState<Session | null>(null);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const user = session?.user;
  const metadata = user?.user_metadata;

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-secondary/30">
      <Card className="w-full max-w-sm p-6 rounded-2xl">
        <CardHeader className="items-center">
          <Avatar
            alt={metadata?.full_name || "User Avatar"}
            className="w-24 h-24"
          >
            <AvatarImage source={{ uri: metadata?.avatar_url }} />
            <AvatarFallback>
              <Text>
                {metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </Text>
            </AvatarFallback>
          </Avatar>
          <View className="p-3" />
          <CardTitle className="pb-2 text-center">
            {metadata?.full_name || "New User"}
          </CardTitle>
          <CardDescription className="text-base font-semibold">
            {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-lg font-bold mb-2">User Details</Text>
          <Text>ID: {user.id}</Text>
          <Text>
            Created At: {new Date(user.created_at).toLocaleDateString()}
          </Text>
          <Text>Email Confirmed: {String(user.email_confirmed_at)}</Text>
          <Text>Phone: {user.phone || "N/A"}</Text>
        </CardContent>
        <CardFooter className="flex-row justify-between">
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={() => supabase.auth.signOut()}
          >
            <Text>Sign Out</Text>
          </Button>
          <Button
            variant="outline"
            className="shadow shadow-foreground/5 ml-2"
            onPress={toggleColorScheme}
          >
            <Text>Toggle {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
}
