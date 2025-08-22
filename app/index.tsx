import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      console.log("Session fetched:", session?.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    console.log("Index: Loading...");
    return null; // Or a loading indicator
  }
  if (session) {
    console.log("Index: Session found, redirecting to (tabs)/");
    return <Redirect href="/(tabs)" />;
  } else {
    console.log("Index: No session, redirecting to (auth)/login");
    return <Redirect href="/(auth)/login" />;
  }
}
